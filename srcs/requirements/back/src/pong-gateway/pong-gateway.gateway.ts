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

@WebSocketGateway(9090, {
	cors: {
		origin: '*',
	}
})

// @WebSocketGateway(9090)
export class PongGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  // clientSocket connections list

  //There is no need to havbe an array of sockets since it will never contain more than one element.
  clientSocketInQueue: Socket | null = null;
  userDbIdInQueue: number = -1
  // clientSocketsQueue: Socket[] = [];
  gameSessions: GameSession[] = []
  nextDebugSessionId: number = 0

  constructor() {
    setInterval(() => this.update(), interval)
  }

  handleConnection(clientSocket: Socket) {
    console.log(`Pong client CONNECTED: ${clientSocket.id}`)
    // // When a new clientSocket connects, add them to the list of clientSockets
    // this.clientSocketsQueue.push(clientSocket);
    // // console.log('clientSocket connected:', clientSocket.id, ", clientScokets.length: ", this.clientSocketsQueue.length, ", clientScokets: ", this.clientSocketsQueue.map(cs => cs.id));

    // // If we have two players, start the game
    // if (this.clientSocketsQueue.length >= 2) {
    //   let clientSocket1 = this.clientSocketsQueue.pop()
    //   let clientSocket2 = this.clientSocketsQueue.pop()
    //   console.log(`Client CONNECTED, creating game session ${this.nextDebugSessionId}`)
    //   this.gameSessions.push(new GameSession(clientSocket1, clientSocket2, this.nextDebugSessionId))
    //   this.nextDebugSessionId += 1
    //   console.log(`Sessions count: ${this.gameSessions.length}, [${this.gameSessions.map(session => session.debugId)}]`)
    // }
    // else{
    //   console.log(`Client CONNECTED, added to queue, queue.length = ${this.clientSocketsQueue.length}`)
    //   clientSocket.emit('in-queue')
    // }
  }
  
  @SubscribeMessage('enter-queue')
  async handleEnterQueueRequest(clientSocket: Socket, userDbId)
  {
    //dubious way of checking if userDbId exists
    let userCount = await prisma.user.count({where: {id: userDbId}})
    if (userCount) {
      if (this.clientSocketInQueue){ // if there is already a user waiting in the queue create a game session
        this.gameSessions.push(new GameSession(this.clientSocketInQueue, clientSocket, this.userDbIdInQueue, userDbId, this.nextDebugSessionId))
        this.nextDebugSessionId += 1//no ++ overload -_-
        this.clientSocketInQueue = null
        this.userDbIdInQueue = -1
      } else {//otherwise, set this.clientSocketInQueue to clientSocket
        this.clientSocketInQueue = clientSocket
        this.userDbIdInQueue = userDbId
      }
    } else {
      console.error(`Reiceved enter-queue request with userDbId ${userDbId}, but the user ID does not exist in the DB. Closing socket.`)
      clientSocket.disconnect(true)
    }
  }

  

  handleDisconnect(clientSocket: Socket) {
    // this.clientSocketsQueue = this.clientSocketsQueue.filter(cs => cs !== clientScoket)
    console.log(`Pong client DISCONNECTED: ${clientSocket.id}`)
  }



  update() {
    let nbSessions = this.gameSessions.length
    this.gameSessions = this.gameSessions.filter(session => {
      session.update()
      return session.gameIsOver === false
    })
    if (nbSessions != this.gameSessions.length)
      console.log(`New session count: ${this.gameSessions.length}, sessions: [${this.gameSessions}]`)
  }
}
