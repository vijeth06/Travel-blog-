import React, { useState, useEffect, useRef } from 'react';
import {
  IconButton,
  Badge,
  Menu,
  MenuItem,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Typography,
  Box,
  Divider,
  Button,
  CircularProgress
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  Comment as CommentIcon,
  Favorite as FavoriteIcon,
  PersonAdd as PersonAddIcon,
  Message as MessageIcon,
  RateReview as ReviewIcon,
  EmojiEvents as AchievementIcon,
  Visibility as ViewIcon,
  PhotoLibrary as GalleryIcon
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { getSocketUrl } from '../config/api';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getUnreadCount
} from '../api/notifications';

const NotificationBell = () => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const navigate = useNavigate();
  const audioRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  // Initialize Socket.IO for real-time notifications
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const newSocket = io(getSocketUrl(), {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Notification socket connected');
      if (currentUser && currentUser._id) {
        newSocket.emit('join-user-room', currentUser._id);
      }
    });

    newSocket.on('notification', (data) => {
      // Play notification sound
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log('Audio play failed:', e));
      }

      // Update unread count
      loadUnreadCount();
      
      // Refresh notifications if menu is open
      if (anchorEl) {
        loadNotifications();
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [currentUser._id]);

  // Load notifications and unread count on mount
  useEffect(() => {
    loadUnreadCount();
  }, []);

  const loadNotifications = async () => {
    setLoading(true);
    try {
      const data = await getNotifications({ page: 1, limit: 15 });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch (error) {
      console.error('Load notifications error:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const data = await getUnreadCount();
      setUnreadCount(data.unreadCount || data.count || 0);
    } catch (error) {
      console.error('Load unread count error:', error);
    }
  };

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
    loadNotifications();
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = async (notification) => {
    try {
      // Mark as read
      if (!notification.read) {
        await markNotificationRead(notification._id);
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

      // Navigate to link
      if (notification.link) {
        navigate(notification.link);
      }

      handleClose();
    } catch (error) {
      console.error('Handle notification click error:', error);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead();
      setUnreadCount(0);
      loadNotifications();
    } catch (error) {
      console.error('Mark all read error:', error);
    }
  };

  const getNotificationIcon = (type) => {
    const iconProps = { fontSize: 'small' };
    
    switch (type) {
      case 'comment':
      case 'reply':
        return <CommentIcon {...iconProps} color="primary" />;
      case 'like':
      case 'gallery_like':
        return <FavoriteIcon {...iconProps} color="error" />;
      case 'follow':
        return <PersonAddIcon {...iconProps} color="secondary" />;
      case 'message':
        return <MessageIcon {...iconProps} color="info" />;
      case 'review':
        return <ReviewIcon {...iconProps} color="warning" />;
      case 'achievement':
        return <AchievementIcon {...iconProps} color="success" />;
      case 'story_view':
        return <ViewIcon {...iconProps} color="action" />;
      default:
        return <NotificationsIcon {...iconProps} />;
    }
  };

  return (
    <>
      <IconButton color="inherit" onClick={handleOpen}>
        <Badge badgeContent={unreadCount} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: {
            width: 400,
            maxHeight: 600
          }
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Button size="small" onClick={handleMarkAllRead}>
              Mark all read
            </Button>
          )}
        </Box>
        <Divider />

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress size={30} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <NotificationsIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        ) : (
          <List sx={{ maxHeight: 480, overflow: 'auto', p: 0 }}>
            {notifications.map((notification) => (
              <ListItem
                key={notification._id}
                button
                onClick={() => handleNotificationClick(notification)}
                sx={{
                  backgroundColor: notification.read ? 'transparent' : 'action.hover',
                  '&:hover': {
                    backgroundColor: 'action.selected'
                  }
                }}
              >
                <ListItemAvatar>
                  {notification.sender?.avatar ? (
                    <Avatar src={notification.sender.avatar} alt={notification.sender.name}>
                      {notification.sender.name[0]}
                    </Avatar>
                  ) : (
                    <Avatar>
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  )}
                </ListItemAvatar>
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
                {!notification.read && (
                  <Box
                    sx={{
                      width: 8,
                      height: 8,
                      borderRadius: '50%',
                      backgroundColor: 'primary.main'
                    }}
                  />
                )}
              </ListItem>
            ))}
          </List>
        )}

        {notifications.length > 0 && (
          <>
            <Divider />
            <Box sx={{ p: 1, textAlign: 'center' }}>
              <Button
                size="small"
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

      {/* Notification sound */}
      <audio ref={audioRef} src="/notification.mp3" />
    </>
  );
};

export default NotificationBell;
