import {
  ConnectedSocket,
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer,
  OnGatewayDisconnect,
  MessageBody
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { GameSession } from './gameSession';
import prisma from '../../prisma/prisma.client'
import { MessagesGateway } from 'src/messages/messages.gateway';
import { UseGuards } from '@nestjs/common'
import { WebSocketJwtAuthGuard } from '../jwt/jwt.guard'

const interval: number = 1000 / 30

class PendingInvite 
{
  hostSocket: Socket
  hostID: number
  guestID: number
  pendingInviteID: number = -1
  constructor(hostSocket: Socket, hostID: number, guestID: number, pendingInviteID) {
    this.hostSocket = hostSocket
    this.hostID = hostID
    this.guestID = guestID
    this.pendingInviteID = pendingInviteID
  }
  containsUserID(userID: number): boolean {
    return this.guestID === userID || this.hostID === userID
  }
}

@WebSocketGateway(9090, {
	cors: {
		origin: '*',
	}
})
export class PongGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  //There is no need to havbe an array of sockets since it will never contain more than one element.
  playerSocketInQueue: Socket | null = null  
  playerIDinQueue: number | null = null
  pendingInvites: PendingInvite[] = []
  nextPendingInviteDebugID: number = 0

  gameSessions: GameSession[] = []
  nextDebugSessionId: number = 0

  constructor(private messagesGateway: MessagesGateway) { 
    setInterval(() => this.update(), interval)
  }

  @UseGuards(WebSocketJwtAuthGuard)
  handleConnection(clientSocket: Socket) {
    console.log(`\nPong client CONNECTED: ${clientSocket.id}`)
  }
  
  @SubscribeMessage('enter-queue')
  @UseGuards(WebSocketJwtAuthGuard)
  async handleEnterQueueRequest(clientSocket: Socket, userID: number)
  {
    console.log(`\nHandling enter-queue request socket: ${clientSocket.id},  userID: ${userID}...`)
    //If the player is already in a game, refuse the request
    if (this.gameSessions.some(session => session.userIDs.some(playerID => userID === playerID))) {
      console.log(`Refused user enter-queue request because he/she is already in a game session.`)
      clientSocket.emit(`request-refused`)
      return
    }
    //dubious way of checking if userID exists...
    let userCount = await prisma.user.count({where: {id: userID}})
    if (userCount) {
      if (this.playerSocketInQueue){ // if there is already a user waiting in the queue create a game session
        this.createNewGameSession(this.playerSocketInQueue, clientSocket, this.playerIDinQueue, userID)
        this.playerSocketInQueue = null
        this.playerIDinQueue = null
      } else {//otherwise, set this.playerSocketInQueue to clientSocket
        console.log(`No other client in queue, adding current client in the queue.`)
        this.playerSocketInQueue = clientSocket
        this.playerIDinQueue = userID
        clientSocket.emit(`in-queue`)
      }
    } else {
      console.error(`Reiceved enter-queue request with userID ${userID}, but the user ID does not exist in the DB. Closing socket.`)
      clientSocket.disconnect(true)
    }
  }

  handleDisconnect(disconnectedSocket: Socket) {
    console.log(`\nPong socket DISCONNECTED: ${disconnectedSocket.id}`)
    //If the client was waiting in queue, remove him from the queue.
    this.removeFromQueue(disconnectedSocket)
    //Remove every pending invites that the client was hosting.
    this.pendingInvites = this.pendingInvites.filter(invite => invite.hostSocket === disconnectedSocket)
  }

  @SubscribeMessage('invite-request')
  @UseGuards(WebSocketJwtAuthGuard)
  handleInviteRequest(@ConnectedSocket() hostSocket: Socket, @MessageBody('hostID') hostID: number, @MessageBody('guestID') guestID: number) {
    console.log(`\nHandling invite request, hostSocket: ${hostSocket.id}, hostID: [${hostID}], guestID: ${guestID}.`)
    //if the host is in the queue, remove him from the queue since the front can't handle multiple game sessions at once.
    this.removeFromQueue(hostSocket)
    //Assert that the player is not invitting himself, this is not a "gameplay" restriction, but rather a technical restriction give how the back has been implemented
    //It could be possible to implement reliable sel invitations but it is not necessary and the goal is to finish the project ASAP
    if (hostID === guestID) {
      console.log(`Request refused, hostID === guestID. Putting host in queue...`)
      this.handleEnterQueueRequest(hostSocket, hostID)
      return
    }
    //If there is already a pending invite for the same host and guest, ignore the request to avoid duplicate pending invites.
    if (this.pendingInvites.some(pendingInvite => pendingInvite.hostID === hostID && pendingInvite.guestID === guestID)) {
      console.log(`Request ignored as there is already a pending invite with the same host and guest.`)
      return
    }
    //If there is already a pending invite for the same users BUT the host and guest are switched, handle the invite request as a join request.
    let correspondingPendingInvite = this.pendingInvites.find(invite => invite.hostID === guestID && invite.guestID === hostID)
    if (correspondingPendingInvite !== undefined) {
      console.log(`Request corresponds to existing pending invite with switched host and guest IDs, handling invite request as join request...`)
      this.handleJoinRequest(hostSocket, guestID, hostID)
      return 
    }
    //Otherwise, create a new invite and add it to the pendingInvites array.
    this.pendingInvites.push(new PendingInvite(hostSocket, hostID, guestID, this.nextPendingInviteDebugID++))
    console.log(`Created pending invite with debugId ${this.nextPendingInviteDebugID - 1}, pending invites length: `, this.pendingInvites.length, `, pending invites: [${this.pendingInvites.map(invite => invite.pendingInviteID)}].`)
    //Then, transmit emit join request from messages gateway
    const inviteTransmitted = this.messagesGateway.transmitPongGameInviteProposal(hostID, guestID, this.nextPendingInviteDebugID - 1, () => {
      console.log(`\nGuest of invite ${this.nextDebugSessionId - 1} refused invitation. Adding host with ID ${hostID} and socket ${hostSocket.id} to queue...`)
      this.handleEnterQueueRequest(hostSocket, hostID)
    })

    if (inviteTransmitted)
      hostSocket.emit('waiting-for-guest-answer')
    else {
      console.log(`Could not tansmit invite to guest, adding host to queue...`)
      this.handleEnterQueueRequest(hostSocket, hostID)
    }
      
  }

  @SubscribeMessage('join-request')
  @UseGuards(WebSocketJwtAuthGuard)
  handleJoinRequest(@ConnectedSocket() guestSocket: Socket, @MessageBody('hostID') hostID: number,  @MessageBody('guestID') guestID: number) {
    console.log(`\nHandling join request, guestSocket: ${guestSocket.id}, hostID: ${hostID}, guestID: ${guestID}.`)
    //ensure that the player is not already in a game session
    if (this.gameSessions.some(session => session.userIDs.some(id => id === guestID))) {
      console.log(`Refused join request from socket ${guestSocket.id}, guestID: ${guestID} because it's already in a gameSession.`)
      guestSocket.emit('request-refused')
      return
    }
    let corresponfingPendingInvite = this.pendingInvites.find(invite => invite.hostID === hostID && invite.guestID == guestID)
    if (corresponfingPendingInvite !== undefined) {
      //Going to create a game sesssion...
      //Remove all the pending invite where the guest of this invitation is a host so he can't be in another game session.
      this.pendingInvites = this.pendingInvites.filter(invite => invite.hostID !== guestID && invite.hostID !== hostID)
      //Remove the guest from the queue.
      this.removeFromQueue(guestSocket)
      //Then, actually create the game session.
      this.createNewGameSession(corresponfingPendingInvite.hostSocket, guestSocket, corresponfingPendingInvite.hostID, guestID)
    }
  }

  createNewGameSession(playerSocket1: Socket, playerSocket2: Socket, playerID1: number, playerID2: number) {
    this.gameSessions.push(new GameSession(playerSocket1, playerSocket2, playerID1, playerID2, this.nextDebugSessionId++))
    console.log(`Created game session, game sessions length: ${this.gameSessions.length}, game sessions: [${this.gameSessions.map(session => session.debugId)}]`)
  }
  removeFromQueue(clientSocket: Socket) {
    if (this.playerSocketInQueue === clientSocket) {
      this.playerSocketInQueue = null
      this.playerIDinQueue = null
      console.log(`Removed ${clientSocket.id} from queue`)
    }
  }

  update() {
    let nbSessions = this.gameSessions.length
    this.gameSessions = this.gameSessions.filter(session => {
      session.update()
      return session.gameIsOver === false
    })
    if (nbSessions !== this.gameSessions.length)
      console.log(`Removed session(s), new session count: ${this.gameSessions.length}, game sessions: [${this.gameSessions}]`)
  }
}
