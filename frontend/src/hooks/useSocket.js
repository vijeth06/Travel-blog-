import { useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import socketService from '../services/socket';

export const useSocket = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const socketRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated && user) {
      // Connect to socket when user is authenticated
      socketRef.current = socketService.connect(user._id);
    } else {
      // Disconnect when user logs out
      socketService.disconnect();
      socketRef.current = null;
    }

    return () => {
      // Cleanup on unmount
      if (!isAuthenticated) {
        socketService.disconnect();
      }
    };
  }, [isAuthenticated, user]);

  return socketService;
};

export const useBlogSocket = (blogId) => {
  const socket = useSocket();

  useEffect(() => {
    if (blogId && socket.isSocketConnected()) {
      socket.joinBlogRoom(blogId);
      
      return () => {
        socket.leaveBlogRoom(blogId);
      };
    }
  }, [blogId, socket]);

  return socket;
};

export default useSocket;
