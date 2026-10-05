import { Server as HttpServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyToken } from '../utils/jwt';
import { env } from '../config/env';

class RealtimeService {
  private io: SocketIOServer | null = null;

  public initialize(server: HttpServer): void {
    const allowedOrigins = [
      ...env.CLIENT_URL.split(',').map((u) => u.trim()).filter(Boolean),
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'http://localhost:5174',
      'http://127.0.0.1:5174',
    ];

    this.io = new SocketIOServer(server, {
      cors: {
        origin: allowedOrigins,
        credentials: true,
      },
    });

    // Authenticate socket connections
    this.io.use((socket: Socket, next) => {
      try {
        let token = socket.handshake.auth?.token;
        if (!token && socket.handshake.headers.cookie) {
          // Parse token from cookies if present
          const cookies = socket.handshake.headers.cookie.split(';');
          for (const c of cookies) {
            const [k, v] = c.trim().split('=');
            if (k === 'token') {
              token = v;
              break;
            }
          }
        }

        if (!token && socket.handshake.query?.token) {
          token = socket.handshake.query.token as string;
        }

        if (!token) {
          return next(new Error('Authentication required for WebSocket connection'));
        }

        const payload = verifyToken(token);
        if (!payload) {
          return next(new Error('Invalid or expired socket token'));
        }

        (socket as any).user = payload;
        next();
      } catch (err) {
        next(new Error('Socket authentication error'));
      }
    });

    this.io.on('connection', (socket: Socket) => {
      const user = (socket as any).user;
      if (!user) {
        socket.disconnect();
        return;
      }

      // Join personal room: user:<userId>
      const userRoom = `user:${user.userId}`;
      socket.join(userRoom);

      // Join admin room if user has ADMIN role
      if (user.role === 'ADMIN') {
        socket.join('admins');
      }

      socket.on('disconnect', () => {
        // Disconnected
      });
    });

    console.log('[Realtime] Socket.IO initialized successfully');
  }

  public getIO(): SocketIOServer | null {
    return this.io;
  }

  public notifyUser(userId: string, event: string, payload: any): void {
    if (!this.io) return;
    this.io.to(`user:${userId}`).emit(event, payload);
  }

  public notifyAdmins(event: string, payload: any): void {
    if (!this.io) return;
    this.io.to('admins').emit(event, payload);
  }

  public emitBookingCreated(booking: any): void {
    if (!this.io) return;
    // Admins receive notification about new booking request
    this.io.to('admins').emit('booking:created', {
      bookingId: booking._id,
      clientName: booking.userId?.name,
      readingType: booking.readingTypeId?.name,
      date: booking.slotId?.date,
      time: booking.slotId?.startTime,
      status: booking.status,
    });
  }

  public emitBookingUpdated(booking: any): void {
    if (!this.io) return;
    const payload = {
      bookingId: booking._id ? booking._id.toString() : booking.id,
      status: booking.status,
      timestamp: new Date().toISOString(),
    };

    // Send to specific user
    const userId = booking.userId?._id
      ? booking.userId._id.toString()
      : booking.userId?.toString();

    if (userId) {
      this.io.to(`user:${userId}`).emit('booking:updated', payload);
    }

    // Always inform admins
    this.io.to('admins').emit('booking:updated', payload);
  }
}

export const realtimeService = new RealtimeService();
