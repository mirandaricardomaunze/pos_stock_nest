import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({ cors: {
    origin: '*', // Or specify your frontend URL
    methods: ['GET', 'POST'],
    credentials: true
  },
  namespace: '/notifications' // Add a namespace to isolate these connections
})
export class NotificationsGateway implements OnGatewayConnection {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId;
    if (userId) {
      client.join(`user_${userId}`);
    }
  }

  notifyUpdate(userId: number, notification: Notification) {
    this.server.to(`user_${userId}`).emit('notification:new', notification);
  }

  notifyCountUpdate(userId: number, count: number) {
    this.server.to(`user_${userId}`).emit('notification:count', count);
  }
}
