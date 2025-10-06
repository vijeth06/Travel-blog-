import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.isConnected = false;
  }

  connect(userId = null) {
    if (this.socket) {
      return this.socket;
    }

    const serverUrl = process.env.REACT_APP_API_URL?.replace('/api', '') || 'http://localhost:5001';
    
    this.socket = io(serverUrl, {
      transports: ['websocket', 'polling'],
      upgrade: true,
      rememberUpgrade: true,
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;
      
      // Join user room for personal notifications
      if (userId) {
        this.socket.emit('join-user-room', userId);
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

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
    }
  }

  // Blog-related real-time features
  joinBlogRoom(blogId) {
    if (this.socket) {
      this.socket.emit('join-blog', blogId);
    }
  }

  leaveBlogRoom(blogId) {
    if (this.socket) {
      this.socket.emit('leave-blog', blogId);
    }
  }

  // Listen for new comments
  onNewComment(callback) {
    if (this.socket) {
      this.socket.on('comment-added', callback);
    }
  }

  // Listen for like updates
  onLikeUpdate(callback) {
    if (this.socket) {
      this.socket.on('like-updated', callback);
    }
  }

  // Emit new comment
  emitNewComment(data) {
    if (this.socket) {
      this.socket.emit('new-comment', data);
    }
  }

  // Emit new like
  emitNewLike(data) {
    if (this.socket) {
      this.socket.emit('new-like', data);
    }
  }

  // Booking-related real-time features
  onBookingUpdate(callback) {
    if (this.socket) {
      this.socket.on('booking-status-changed', callback);
    }
  }

  emitBookingUpdate(data) {
    if (this.socket) {
      this.socket.emit('booking-update', data);
    }
  }

  // Cart-related real-time features
  onCartUpdate(callback) {
    if (this.socket) {
      this.socket.on('cart-updated', callback);
    }
  }

  emitCartUpdate(data) {
    if (this.socket) {
      this.socket.emit('cart-update', data);
    }
  }

  // General event listeners
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

  getSocket() {
    return this.socket;
  }

  isSocketConnected() {
    return this.isConnected && this.socket?.connected;
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService;