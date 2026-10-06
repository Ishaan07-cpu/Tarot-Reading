import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: Date;
}

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  notifications: SocketNotification[];
  dismissNotification: (id: string) => void;
  subscribeToUpdates: (callback: (data: any) => void) => () => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [notifications, setNotifications] = useState<SocketNotification[]>([]);
  const subscribersRef = useRef<Set<(data: any) => void>>(new Set());

  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // In production (Vercel), connect directly to the Render backend.
    // In local development, '/' works via Vite's WebSocket proxy.
    const socketUrl = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_API_URL || '/';

    const socketInstance = io(socketUrl, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketInstance.on('connect', () => {
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('booking:created', (data) => {
      // Admin notification for new booking
      const newNotif: SocketNotification = {
        id: Math.random().toString(36).substring(2, 9),
        type: 'info',
        title: 'New Booking Request',
        message: `${data.clientName || 'A client'} requested a ${data.readingType || 'reading'}.`,
        timestamp: new Date(),
      };
      setNotifications((prev) => [newNotif, ...prev.slice(0, 9)]);

      // Notify any subscribers (e.g. admin dashboard tables)
      subscribersRef.current.forEach((cb) => cb(data));
    });

    socketInstance.on('booking:updated', (data) => {
      // Client or admin notification for state change
      const newNotif: SocketNotification = {
        id: Math.random().toString(36).substring(2, 9),
        type: data.status === 'APPROVED' ? 'success' : data.status === 'REJECTED' ? 'error' : 'info',
        title: 'Booking Status Updated',
        message: `Your booking status is now: ${data.status}`,
        timestamp: new Date(),
      };
      setNotifications((prev) => [newNotif, ...prev.slice(0, 9)]);

      // Notify any active page to refetch authoritative data
      subscribersRef.current.forEach((cb) => cb(data));
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token, isAuthenticated]);

  const dismissNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  const subscribeToUpdates = (callback: (data: any) => void) => {
    subscribersRef.current.add(callback);
    return () => {
      subscribersRef.current.delete(callback);
    };
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        notifications,
        dismissNotification,
        subscribeToUpdates,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
