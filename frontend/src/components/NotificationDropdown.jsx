import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  Box,
  Typography,
  Avatar,
  Divider,
  Button,
  ListItemIcon,
  ListItemText,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Favorite,
  Comment,
  PersonAdd,
  CheckCircle,
  Delete,
  DoneAll
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { io } from 'socket.io-client';
import { formatDistanceToNow } from 'date-fns';
import {
  getNotifications,
  getUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification
} from '../api/notifications';

const NotificationDropdown = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const open = Boolean(anchorEl);

  // Initialize WebSocket connection
  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const socketInstance = io(getSocketUrl(), {
      transports: ['websocket'],
      reconnection: true
    });

    socketInstance.on('connect', () => {
      console.log('✅ Notifications WebSocket connected');
      if (user && (user.id || user._id)) {
        socketInstance.emit('join-user-room', user.id || user._id);
      }
    });

    // Listen for real-time notifications
    socketInstance.on('new-notification', (notification) => {
      console.log('🔔 New notification received:', notification);
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
      
      // Show browser notification if permission granted
      if (Notification.permission === 'granted') {
        new Notification('Travel Blog', {
          body: notification.message,
          icon: '/logo192.png'
        });
      }
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [isAuthenticated, user]);

  // Load initial data
  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
      loadUnreadCount();
      
      // Request browser notification permission
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [isAuthenticated]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const data = await getNotifications(1, 10);
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const data = await getUnreadCount();
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      if (!notification.read) {
        await markNotificationRead(notification._id);
        setNotifications(prev =>
          prev.map(n => n._id === notification._id ? { ...n, read: true } : n)
        );
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // Navigate to link
      if (notification.link) {
        navigate(notification.link);
      }

      handleClose();
    } catch (error) {
      console.error('Error handling notification click:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDelete = async (notificationId, event) => {
    event.stopPropagation();
    try {
      await deleteNotification(notificationId);
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      loadUnreadCount();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return <Favorite sx={{ color: 'error.main', fontSize: 20 }} />;
      case 'comment':
        return <Comment sx={{ color: 'primary.main', fontSize: 20 }} />;
      case 'follow':
        return <PersonAdd sx={{ color: 'success.main', fontSize: 20 }} />;
      default:
        return <NotificationsIcon sx={{ fontSize: 20 }} />;
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
      <Tooltip title="Notifications">
        <IconButton
          onClick={handleClick}
          color="inherit"
          aria-label="notifications"
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 380,
            maxHeight: 500,
            mt: 1.5
          }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {/* Header */}
        <Box sx={{ px: 2, py: 1.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Notifications
          </Typography>
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<DoneAll />}
              onClick={handleMarkAllRead}
            >
              Mark all read
            </Button>
          )}
        </Box>

        <Divider />

        {/* Notifications List */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
            {notifications.map((notification, index) => (
              <React.Fragment key={notification._id}>
                <MenuItem
                  onClick={() => handleNotificationClick(notification)}
                  sx={{
                    py: 1.5,
                    px: 2,
                    bgcolor: notification.read ? 'transparent' : 'action.hover',
                    '&:hover': {
                      bgcolor: notification.read ? 'action.hover' : 'action.selected'
                    }
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>
                    {notification.sender?.avatar ? (
                      <Avatar
                        src={notification.sender.avatar}
                        sx={{ width: 36, height: 36 }}
                      >
                        {notification.sender.name?.charAt(0)}
                      </Avatar>
                    ) : (
                      getNotificationIcon(notification.type)
                    )}
                  </ListItemIcon>

                  <ListItemText
                    primary={
                      <Typography variant="body2" sx={{ fontWeight: notification.read ? 400 : 600 }}>
                        {notification.message}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </Typography>
                    }
                  />

                  <IconButton
                    size="small"
                    onClick={(e) => handleDelete(notification._id, e)}
                    sx={{ ml: 1 }}
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </MenuItem>
                {index < notifications.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </Box>
        )}

        {/* Footer */}
        {notifications.length > 0 && (
          <>
            <Divider />
            <Box sx={{ px: 2, py: 1, textAlign: 'center' }}>
              <Button
                size="small"
                fullWidth
                onClick={() => {
                  navigate('/notifications');
                  handleClose();
                }}
              >
                View All Notifications
              </Button>
            </Box>
          </>
        )}
      </Menu>
    </>
  );
};

export default NotificationDropdown;
