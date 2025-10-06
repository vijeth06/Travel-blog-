import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(userId = null) {
    if (this.socket?.connected) {
      return this.socket;
    }

    const serverUrl = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    
    this.socket = io(serverUrl, {
      withCredentials: true,
      transports: ['websocket', 'polling']
    });

    this.socket.on('connect', () => {
      console.log('Connected to server:', this.socket.id);
      this.isConnected = true;
      
      // Join user room for notifications if userId provided
      if (userId) {
        this.joinUserRoom(userId);
      }
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
    });

    return this.socket;
  }

  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }

  // Join user room for notifications
  joinUserRoom(userId) {
    if (this.socket) {
      this.socket.emit('join-user-room', userId);
    }
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // User room management
  joinUserRoom(userId) {
    if (this.socket && userId) {
      this.socket.emit('join-user-room', userId);
    }
  }

  // Blog room management
  joinBlogRoom(blogId) {
    if (this.socket && blogId) {
      this.socket.emit('join-blog', blogId);
    }
  }

  leaveBlogRoom(blogId) {
    if (this.socket && blogId) {
      this.socket.emit('leave-blog', blogId);
    }
  }

  // Comment events
  emitNewComment(data) {
    if (this.socket) {
      this.socket.emit('new-comment', data);
    }
  }

  onCommentAdded(callback) {
    if (this.socket) {
      this.socket.on('comment-added', callback);
    }
  }

  offCommentAdded(callback) {
    if (this.socket) {
      this.socket.off('comment-added', callback);
    }
  }

  // Like events
  emitNewLike(data) {
    if (this.socket) {
      this.socket.emit('new-like', data);
    }
  }

  onLikeUpdated(callback) {
    if (this.socket) {
      this.socket.on('like-updated', callback);
    }
  }

  offLikeUpdated(callback) {
    if (this.socket) {
      this.socket.off('like-updated', callback);
    }
  }

  // Booking events
  emitBookingUpdate(data) {
    if (this.socket) {
      this.socket.emit('booking-update', data);
    }
  }

  onBookingStatusChanged(callback) {
    if (this.socket) {
      this.socket.on('booking-status-changed', callback);
    }
  }

  offBookingStatusChanged(callback) {
    if (this.socket) {
      this.socket.off('booking-status-changed', callback);
    }
  }

  // Cart events
  emitCartUpdate(data) {
    if (this.socket) {
      this.socket.emit('cart-update', data);
    }
  }

  onCartUpdated(callback) {
    if (this.socket) {
      this.socket.on('cart-updated', callback);
    }
  }

  offCartUpdated(callback) {
    if (this.socket) {
      this.socket.off('cart-updated', callback);
    }
  }

  // Generic event listeners
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  getSocket() {
    return this.socket;
  }

  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }

  // Join user room for notifications
  joinUserRoom(userId) {
    if (this.socket) {
      this.socket.emit('join-user-room', userId);
    }
  }

  // Generic event listeners
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }
}

// Create and export a singleton instance
const socketService = new SocketService();
export default socketService;
