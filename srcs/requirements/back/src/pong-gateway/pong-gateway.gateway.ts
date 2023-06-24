import {
  SubscribeMessage,
  WebSocketGateway,
  OnGatewayConnection,
  WebSocketServer,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { GameSession } from './gameSession';
import prisma from '../controllers/login/prisma.client';

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
  // playerSocketInQueue: Socket | null = null;
  // playerIDinQueue: number = -1
  playerSocketInQueue: Socket | null = null  
  playerIDinQueue: number | null = null
  pendingInvites: PendingInvite[] = []
  nextPendingInviteDebugID: number = 0

  gameSessions: GameSession[] = []
  nextDebugSessionId: number = 0

  constructor() {
    setInterval(() => this.update(), interval)
  }

  handleConnection(clientSocket: Socket) {
    console.log(`\nPong client CONNECTED: ${clientSocket.id}`)
  }
  
  @SubscribeMessage('enter-queue')
  async handleEnterQueueRequest(clientSocket: Socket, userID: number)
  {
    console.log(`\nHandling enter-queue request socket: ${clientSocket},  userID: ${userID}...`)
    //If the player is already in a game, refuse the request
    if (this.gameSessions.some(session => session.userIDs.some(playerID => userID === playerID))) {
      console.log(`Refused user enter-queue request because he/she is already in a game session.`)
      clientSocket.emit(`request-refused`)
      return
    }
    //dubious way of checking if userID exists
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
  handleInviteRequest(hostSocket: Socket, hostID: number, guestID: number) {
    console.log(`\nHandling invite request, hostSocket: ${hostSocket}, hostID: ${hostID}, guestID: ${guestID}.`)
    //if the host is in the queue, remove him from the queue since the front can't handle multiple game sessions at once.
    this.removeFromQueue(hostSocket)
    //If there is already a pending invite for the same users, ignore the request to avoid duplicate pending invites.
    if (this.pendingInvites.some(pendingInvite => pendingInvite.hostID === hostID && pendingInvite.guestID === guestID)) {
      console.log(`Request ignored as there is already a pending invite with the same host and guest.`)
      return
    }
    //If there is already a pending invite for the same users BUT the host and guest are switched, handle the invite request as a join request.
    let correspondingPendingInvite = this.pendingInvites.find(invite => invite.hostID === guestID && invite.guestID === hostID)
    if (correspondingPendingInvite !== undefined) {
      console.log(`Request corresponds to existing pending invite with switched host and guest IDs, invite handling request as join request...`)
      this.handleJoinRequest(hostSocket, guestID, hostID)
      return 
    }
    //Otherwise, create a new invite and add it to the pendingInvites array.
    this.pendingInvites.push(new PendingInvite(hostSocket, hostID, guestID, this.nextPendingInviteDebugID++))
    console.log(`Created pending invite, pending invites length: `, this.pendingInvites.length, `, pending invites: [${this.pendingInvites.map(invite => invite.pendingInviteID)}].`)
  }

  @SubscribeMessage('join-request')
  handleJoinRequest(guestSocket: Socket, hostID: number, guestID: number) {
    console.log(`\nHandling join request, guestSocket: ${guestSocket}, hostID: ${hostID}, guestID: ${guestID}.`)
    //ensure that the player is not already in a game session
    if (this.gameSessions.some(session => session.userIDs.some(id => id === guestID))) {
      console.log(`Refused join request from socket ${guestSocket}, guestID: ${guestID} because it's already in a gameSession.`)
      guestSocket.emit('request-refused')
      return
    }
    let corresponfingPendingInvite = this.pendingInvites.find(invite => invite.hostID === hostID && invite.guestID == guestID)
    if (corresponfingPendingInvite !== undefined) {
      //Going to create a game sesssion
      //remove all the pending invite where the guest of this invitation is a host so he can't be in another game session
      this.pendingInvites = this.pendingInvites.filter(invite => invite.hostID !== guestID && invite.hostID !== hostID)
      //remove the guest from the queue
      this.removeFromQueue(guestSocket)
      //then, actually create the game session
      this.createNewGameSession(corresponfingPendingInvite.hostSocket, guestSocket, corresponfingPendingInvite.hostID, guestID)
    }
  }

  createNewGameSession(playerSocket1: Socket, playerSocket2: Socket, playerID1: number, playerID2: number) {
    this.gameSessions.push(new GameSession(playerSocket1, playerSocket2, playerID1, playerID2, this.nextDebugSessionId++))
    console.log(`Created game session, game sessions length: ${this.gameSessions.length}, game sessions: [${this.gameSessions.map(session => session.debugId)}]`)
  }
  removeFromQueue(clientSocket: Socket) {
    if (this.playerSocketInQueue === clientSocket)
    this.playerSocketInQueue = null
    this.playerIDinQueue = null
    console.log(`Removed ${clientSocket} from queue`)
  }

  update() {
    let nbSessions = this.gameSessions.length
    this.gameSessions = this.gameSessions.filter(session => {
      session.update()
      return session.gameIsOver === false
    })
    if (nbSessions != this.gameSessions.length)
      console.log(`Removed session(s), new session count: ${this.gameSessions.length}, game sessions: [${this.gameSessions}]`)
  }
}
