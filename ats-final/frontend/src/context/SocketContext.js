import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { AuthContext } from './AuthContext';

const SocketContext = createContext();

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      // Connect to Socket.io server
      const newSocket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000', {
        withCredentials: true,
      });

      newSocket.on('connect', () => {
        console.log('Connected to Socket.io server');

        // Join user-specific room
        newSocket.emit('join', user._id);

        // If user is HR or admin, join admin room
        if (user.role === 'hr' || user.role === 'admin') {
          newSocket.emit('join-admin');
        }
      });

      newSocket.on('disconnect', () => {
        console.log('Disconnected from Socket.io server');
      });

      setSocket(newSocket);

      return () => {
        newSocket.close();
      };
    }
  }, [user]);

  const value = {
    socket,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};