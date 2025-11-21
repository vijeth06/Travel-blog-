import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Container,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  TextField,
  IconButton,
  Typography,
  Badge,
  Divider,
  InputAdornment,
  Chip,
  Menu,
  MenuItem,
  CircularProgress,
  useTheme
} from '@mui/material';
import {
  Send as SendIcon,
  AttachFile as AttachFileIcon,
  MoreVert as MoreVertIcon,
  Search as SearchIcon,
  Group as GroupIcon,
  Archive as ArchiveIcon,
  VolumeOff as MuteIcon,
  VolumeUp as UnmuteIcon,
  PersonAdd as PersonAddIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { io } from 'socket.io-client';
import { getSocketUrl } from '../config/api';
import {
  getConversations,
  getMessages,
  sendMessage,
  markMessagesAsRead,
  setTyping,
  archiveConversation,
  toggleMuteConversation,
  searchUsers,
  getOrCreateConversation
} from '../api/chat';
import { formatDistanceToNow } from 'date-fns';

const ChatPage = () => {
  const theme = useTheme();
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [socket, setSocket] = useState(null);
  const [typingUsers, setTypingUsers] = useState(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [showUserSearch, setShowUserSearch] = useState(false);
  const [userSearchQuery, setUserSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const originalTitle = useRef(document.title);

  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  // Play notification sound using Web Audio API
  const playNotificationSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (e) {
      // Fallback: try to play audio file if available
      try {
        const audio = new Audio('/notification.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      } catch (err) {
        console.log('Unable to play notification sound');
      }
    }
  };

  // Initialize Socket.IO
  useEffect(() => {
    const token = localStorage.getItem('token');
    const newSocket = io(getSocketUrl(), {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Chat socket connected');
      if (currentUser && currentUser._id) {
        newSocket.emit('join-user-room', currentUser._id);
      }
    });

    newSocket.on('new-message', ({ conversationId, message }) => {
      // Check if this is a message from someone else (not from current user)
      const isReceivedMessage = message.sender._id !== currentUser._id;
      
      if (selectedConversation?._id === conversationId) {
        setMessages(prev => [...prev, message]);
        // Mark as read only if conversation is active
        markMessagesAsRead(conversationId).catch(err => {
          console.error('Mark as read error:', err);
        });
        
        // Show notification even if conversation is open (for received messages only)
        if (isReceivedMessage && Notification.permission === 'granted') {
          const notification = new Notification(`${message.sender.name}`, {
            body: message.content.substring(0, 100),
            icon: message.sender.avatar || '/default-avatar.png',
            tag: conversationId,
            badge: '/logo192.png',
            requireInteraction: false,
            silent: false
          });
          
          // Auto close notification after 4 seconds
          setTimeout(() => notification.close(), 4000);
          
          // Play notification sound
          playNotificationSound();
        }
      } else {
        // Show notification for new message in other conversations (received messages only)
        if (isReceivedMessage && Notification.permission === 'granted') {
          const notification = new Notification(`New message from ${message.sender.name}`, {
            body: message.content.substring(0, 100),
            icon: message.sender.avatar || '/default-avatar.png',
            tag: conversationId,
            badge: '/logo192.png',
            requireInteraction: true
          });
          
          // Click notification to open conversation
          notification.onclick = () => {
            window.focus();
            const conv = conversations.find(c => c._id === conversationId);
            if (conv) setSelectedConversation(conv);
            notification.close();
          };
          
          // Play notification sound
          playNotificationSound();
        }
      }
      // Update conversation list
      loadConversations();
    });

    newSocket.on('user-typing', ({ conversationId, userId, isTyping }) => {
      if (selectedConversation?._id === conversationId) {
        setTypingUsers(prev => {
          const newSet = new Set(prev);
          if (isTyping) {
            newSet.add(userId);
          } else {
            newSet.delete(userId);
          }
          return newSet;
        });
      }
    });

    newSocket.on('messages-read', ({ conversationId, readBy }) => {
      if (selectedConversation?._id === conversationId) {
        setMessages(prev =>
          prev.map(msg => ({
            ...msg,
            readBy: [...(msg.readBy || []), { user: readBy, readAt: new Date() }]
          }))
        );
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [currentUser._id, selectedConversation?._id]);

  // Load conversations
  const loadConversations = async () => {
    try {
      const data = await getConversations();
      setConversations(data.conversations);
    } catch (error) {
      console.error('Load conversations error:', error);
    }
  };

  // Search users with debounce
  useEffect(() => {
    if (userSearchQuery.trim().length === 0) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // Set new timeout for debounced search
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const data = await searchUsers(userSearchQuery);
        setSearchResults(data.users || []);
      } catch (error) {
        console.error('Search users error:', error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 500); // 500ms debounce

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [userSearchQuery]);

  const handleStartConversation = async (userId) => {
    try {
      const { conversation } = await getOrCreateConversation(userId);
      setSelectedConversation(conversation);
      setShowUserSearch(false);
      setUserSearchQuery('');
      setSearchResults([]);
      loadConversations();
    } catch (error) {
      console.error('Start conversation error:', error);
    }
  };

  useEffect(() => {
    loadConversations();
    
    // Request notification permission with better UX
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          // Show a welcome notification
          const welcomeNotification = new Notification('Notifications Enabled', {
            body: 'You will now receive message notifications',
            icon: '/logo192.png',
            badge: '/logo192.png'
          });
          setTimeout(() => welcomeNotification.close(), 3000);
        }
      });
    }
  }, []);

  // Load messages when conversation selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages();
      // Mark messages as read with error handling
      markMessagesAsRead(selectedConversation._id).catch(err => {
        console.error('Mark as read error:', err);
      });
    }
  }, [selectedConversation]);

  const loadMessages = async () => {
    if (!selectedConversation) return;
    
    setLoading(true);
    try {
      const data = await getMessages(selectedConversation._id);
      setMessages(data.messages);
      scrollToBottom();
    } catch (error) {
      console.error('Load messages error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !selectedConversation) return;

    try {
      const { message } = await sendMessage(selectedConversation._id, messageInput);
      setMessages(prev => [...prev, message]);
      setMessageInput('');
      scrollToBottom();
    } catch (error) {
      console.error('Send message error:', error);
    }
  };

  const handleTyping = () => {
    if (!selectedConversation || !socket) return;

    // Emit typing start
    setTyping(selectedConversation._id, true);

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(selectedConversation._id, false);
    }, 3000);
  };

  const handleArchive = async () => {
    if (!selectedConversation) return;
    
    try {
      await archiveConversation(selectedConversation._id);
      setSelectedConversation(null);
      loadConversations();
      setMenuAnchor(null);
    } catch (error) {
      console.error('Archive error:', error);
    }
  };

  const handleToggleMute = async () => {
    if (!selectedConversation) return;
    
    try {
      await toggleMuteConversation(selectedConversation._id);
      loadConversations();
      setMenuAnchor(null);
    } catch (error) {
      console.error('Toggle mute error:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Auto-scroll when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Update page title with unread count
  useEffect(() => {
    const totalUnread = conversations.reduce((sum, conv) => sum + (conv.unreadCount || 0), 0);
    setUnreadNotifications(totalUnread);
    
    if (totalUnread > 0) {
      document.title = `(${totalUnread}) New Messages - ${originalTitle.current}`;
    } else {
      document.title = originalTitle.current;
    }
  }, [conversations]);

  // Reset title when component unmounts
  useEffect(() => {
    return () => {
      document.title = originalTitle.current;
    };
  }, []);

  const getConversationName = (conversation) => {
    if (conversation.isGroup) {
      return conversation.groupName;
    }
    const otherUser = conversation.participants.find(p => p._id !== currentUser._id);
    return otherUser?.name || 'Unknown';
  };

  const getConversationAvatar = (conversation) => {
    if (conversation.isGroup) {
      return conversation.groupAvatar || '';
    }
    const otherUser = conversation.participants.find(p => p._id !== currentUser._id);
    return otherUser?.avatar || '';
  };

  const filteredConversations = conversations.filter(conv =>
    getConversationName(conv).toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Container maxWidth="xl" sx={{ mt: 4, mb: 4, height: 'calc(100vh - 120px)' }}>
      <style>
        {`
          @keyframes ripple {
            0% {
              transform: scale(.8);
              opacity: 1;
            }
            100% {
              transform: scale(2.4);
              opacity: 0;
            }
          }
        `}
      </style>
      <Paper elevation={3} sx={{ height: '100%', display: 'flex', overflow: 'hidden' }}>
        <Grid container sx={{ height: '100%' }}>
          {/* Conversations List */}
          <Grid item xs={12} md={4} sx={{ borderRight: 1, borderColor: 'divider', display: 'flex', flexDirection: 'column', height: '100%' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Typography variant="h6">
                    Messages
                  </Typography>
                  {unreadNotifications > 0 && (
                    <Chip 
                      label={unreadNotifications} 
                      color="error" 
                      size="small"
                      sx={{ 
                        fontWeight: 700,
                        minWidth: 24,
                        height: 24
                      }}
                    />
                  )}
                </Box>
                <IconButton 
                  color="primary" 
                  onClick={() => setShowUserSearch(!showUserSearch)}
                  sx={{ 
                    backgroundColor: showUserSearch ? 'primary.main' : 'transparent',
                    color: showUserSearch ? 'white' : 'primary.main',
                    '&:hover': {
                      backgroundColor: showUserSearch ? 'primary.dark' : 'action.hover'
                    }
                  }}
                >
                  {showUserSearch ? <CloseIcon /> : <PersonAddIcon />}
                </IconButton>
              </Box>
              
              {showUserSearch ? (
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search users to message..."
                  value={userSearchQuery}
                  onChange={(e) => setUserSearchQuery(e.target.value)}
                  autoFocus
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    )
                  }}
                />
              ) : (
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    )
                  }}
                />
              )}
            </Box>
            
            <List sx={{ flex: 1, overflowY: 'auto', p: 0, maxHeight: 'calc(100vh - 280px)' }}>
              {showUserSearch ? (
                // User search results
                searchLoading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress size={30} />
                  </Box>
                ) : searchResults.length > 0 ? (
                  searchResults.map((user) => (
                    <ListItem
                      key={user._id}
                      button
                      onClick={() => handleStartConversation(user._id)}
                      sx={{
                        borderBottom: 1,
                        borderColor: 'divider'
                      }}
                    >
                      <ListItemAvatar>
                        <Avatar src={user.avatar}>
                          {user.name[0]}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={user.name}
                        secondary={user.bio || user.email}
                      />
                    </ListItem>
                  ))
                ) : userSearchQuery.trim().length > 0 ? (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      No users found
                    </Typography>
                  </Box>
                ) : (
                  <Box sx={{ p: 4, textAlign: 'center' }}>
                    <Typography variant="body2" color="text.secondary">
                      Search for users to start a conversation
                    </Typography>
                  </Box>
                )
              ) : (
                // Conversations list
                filteredConversations.length > 0 ? (
                  filteredConversations.map((conversation) => (
                <ListItem
                  key={conversation._id}
                  button
                  selected={selectedConversation?._id === conversation._id}
                  onClick={() => setSelectedConversation(conversation)}
                  sx={{
                    borderBottom: 1,
                    borderColor: 'divider',
                    backgroundColor: conversation.unreadCount > 0 ? 'action.hover' : 'transparent',
                    '&.Mui-selected': {
                      backgroundColor: 'primary.light',
                      '&:hover': {
                        backgroundColor: 'primary.light'
                      }
                    },
                    '&:hover': {
                      backgroundColor: conversation.unreadCount > 0 ? 'action.selected' : 'action.hover'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      badgeContent={conversation.unreadCount || 0}
                      color="error"
                      max={99}
                      sx={{
                        '& .MuiBadge-badge': {
                          fontWeight: 700,
                          fontSize: '0.7rem'
                        }
                      }}
                    >
                      <Avatar 
                        src={getConversationAvatar(conversation)}
                        sx={{ 
                          width: 50, 
                          height: 50,
                          border: conversation.unreadCount > 0 ? 2 : 0,
                          borderColor: 'primary.main'
                        }}
                      >
                        {conversation.isGroup ? <GroupIcon /> : getConversationName(conversation)[0]}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'space-between' }}>
                        <Typography 
                          variant="subtitle2" 
                          sx={{ 
                            fontWeight: conversation.unreadCount > 0 ? 700 : 500,
                            color: conversation.unreadCount > 0 ? 'text.primary' : 'text.secondary'
                          }}
                        >
                          {getConversationName(conversation)}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {conversation.isMuted && <MuteIcon fontSize="small" color="action" />}
                          {conversation.lastMessageAt && (
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              sx={{ 
                                fontSize: '0.7rem',
                                fontWeight: conversation.unreadCount > 0 ? 600 : 400
                              }}
                            >
                              {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: true })}
                            </Typography>
                          )}
                        </Box>
                      </Box>
                    }
                    secondary={
                      <Typography 
                        variant="caption" 
                        color="text.secondary" 
                        noWrap
                        sx={{
                          fontWeight: conversation.unreadCount > 0 ? 600 : 400,
                          color: conversation.unreadCount > 0 ? 'text.primary' : 'text.secondary'
                        }}
                      >
                        {conversation.lastMessage ? (
                          conversation.lastMessage.sender._id === currentUser._id ? (
                            `You: ${conversation.lastMessage.content}`
                          ) : (
                            // Show sender's name for received messages (like Instagram)
                            `${conversation.lastMessage.sender.name}: ${conversation.lastMessage.content}`
                          )
                        ) : (
                          'Start a conversation'
                        )}
                      </Typography>
                    }
                  />
                </ListItem>
              ))
            ) : (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  No conversations yet. Click the + button to start chatting!
                </Typography>
              </Box>
            )
          )}
            </List>
          </Grid>

          {/* Messages Area */}
          <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column' }}>
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'background.paper' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      variant="dot"
                      sx={{
                        '& .MuiBadge-badge': {
                          backgroundColor: '#44b700',
                          color: '#44b700',
                          boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
                          '&::after': {
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            width: '100%',
                            height: '100%',
                            borderRadius: '50%',
                            animation: 'ripple 1.2s infinite ease-in-out',
                            border: '1px solid currentColor',
                            content: '""',
                          },
                        },
                      }}
                    >
                      <Avatar src={getConversationAvatar(selectedConversation)} sx={{ width: 48, height: 48 }}>
                        {selectedConversation.isGroup ? <GroupIcon /> : getConversationName(selectedConversation)[0]}
                      </Avatar>
                    </Badge>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {getConversationName(selectedConversation)}
                      </Typography>
                      {typingUsers.size > 0 ? (
                        <Typography variant="caption" color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          <CircularProgress size={10} /> Typing...
                        </Typography>
                      ) : (
                        <Typography variant="caption" color="text.secondary">
                          {selectedConversation.isGroup ? `${selectedConversation.participants.length} members` : 'Active now'}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <IconButton onClick={(e) => setMenuAnchor(e.currentTarget)}>
                    <MoreVertIcon />
                  </IconButton>
                  <Menu
                    anchorEl={menuAnchor}
                    open={Boolean(menuAnchor)}
                    onClose={() => setMenuAnchor(null)}
                  >
                    <MenuItem onClick={handleToggleMute}>
                      {selectedConversation.isMuted ? (
                        <><UnmuteIcon sx={{ mr: 1 }} /> Unmute</>
                      ) : (
                        <><MuteIcon sx={{ mr: 1 }} /> Mute</>
                      )}
                    </MenuItem>
                    <MenuItem onClick={handleArchive}>
                      <ArchiveIcon sx={{ mr: 1 }} /> Archive
                    </MenuItem>
                  </Menu>
                </Box>

                {/* Messages */}
                <Box sx={{ 
                  flex: 1, 
                  overflowY: 'auto', 
                  p: 2, 
                  backgroundColor: 'grey.50',
                  maxHeight: 'calc(100vh - 340px)',
                  minHeight: '400px',
                  display: 'flex',
                  flexDirection: 'column',
                  '&::-webkit-scrollbar': {
                    width: '8px',
                  },
                  '&::-webkit-scrollbar-track': {
                    backgroundColor: 'grey.100',
                  },
                  '&::-webkit-scrollbar-thumb': {
                    backgroundColor: 'grey.400',
                    borderRadius: '4px',
                    '&:hover': {
                      backgroundColor: 'grey.500',
                    },
                  },
                }}>
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                      <CircularProgress />
                    </Box>
                  ) : (
                    <>
                      {messages.map((message, index) => {
                        const isOwn = message.sender._id === currentUser._id;
                        const showAvatar = index === 0 || messages[index - 1].sender._id !== message.sender._id;
                        const showName = !isOwn && (index === 0 || messages[index - 1].sender._id !== message.sender._id);
                        
                        return (
                          <Box
                            key={message._id}
                            sx={{
                              display: 'flex',
                              justifyContent: isOwn ? 'flex-end' : 'flex-start',
                              mb: showAvatar ? 2 : 0.5,
                              alignItems: 'flex-end'
                            }}
                          >
                            {!isOwn && showAvatar && (
                              <Avatar 
                                src={message.sender.avatar} 
                                sx={{ mr: 1, width: 32, height: 32 }}
                                alt={message.sender.name}
                              >
                                {message.sender.name[0]}
                              </Avatar>
                            )}
                            {!isOwn && !showAvatar && (
                              <Box sx={{ width: 32, mr: 1 }} />
                            )}
                            <Box sx={{ maxWidth: '70%' }}>
                              {showName && (
                                <Typography 
                                  variant="caption" 
                                  sx={{ 
                                    fontWeight: 600, 
                                    color: 'text.secondary',
                                    display: 'block',
                                    mb: 0.5,
                                    ml: 1
                                  }}
                                >
                                  {message.sender.name}
                                </Typography>
                              )}
                              <Paper
                                elevation={1}
                                sx={{
                                  p: 1.5,
                                  backgroundColor: isOwn ? 'primary.main' : 'white',
                                  color: isOwn ? 'white' : 'text.primary',
                                  borderRadius: 2,
                                  borderTopLeftRadius: !isOwn && !showAvatar ? 2 : 12,
                                  borderTopRightRadius: isOwn && !showAvatar ? 2 : 12,
                                  borderBottomLeftRadius: !isOwn ? 2 : 12,
                                  borderBottomRightRadius: isOwn ? 2 : 12,
                                  wordBreak: 'break-word'
                                }}
                              >
                                <Typography variant="body2" sx={{ mb: 0.5 }}>
                                  {message.content}
                                </Typography>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
                                  <Typography 
                                    variant="caption" 
                                    sx={{ 
                                      opacity: 0.7,
                                      fontSize: '0.65rem'
                                    }}
                                  >
                                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                  </Typography>
                                  {isOwn && message.readBy && message.readBy.length > 0 && (
                                    <Typography variant="caption" sx={{ opacity: 0.7, fontSize: '0.65rem' }}>
                                      ✓✓
                                    </Typography>
                                  )}
                                </Box>
                              </Paper>
                            </Box>
                            {isOwn && showAvatar && (
                              <Avatar 
                                src={message.sender.avatar} 
                                sx={{ ml: 1, width: 32, height: 32 }}
                                alt="You"
                              >
                                {message.sender.name[0]}
                              </Avatar>
                            )}
                            {isOwn && !showAvatar && (
                              <Box sx={{ width: 32, ml: 1 }} />
                            )}
                          </Box>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </Box>

                {/* Message Input */}
                <Box
                  component="form"
                  onSubmit={handleSendMessage}
                  sx={{ 
                    p: 2, 
                    borderTop: 1, 
                    borderColor: 'divider', 
                    display: 'flex', 
                    gap: 1,
                    backgroundColor: 'background.paper'
                  }}
                >
                  <TextField
                    fullWidth
                    multiline
                    maxRows={4}
                    placeholder="Type a message..."
                    value={messageInput}
                    onChange={(e) => {
                      setMessageInput(e.target.value);
                      handleTyping();
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage(e);
                      }
                    }}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton size="small">
                            <AttachFileIcon />
                          </IconButton>
                        </InputAdornment>
                      )
                    }}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: 3,
                      }
                    }}
                  />
                  <IconButton 
                    type="submit" 
                    color="primary" 
                    disabled={!messageInput.trim()}
                    sx={{
                      backgroundColor: messageInput.trim() ? 'primary.main' : 'grey.300',
                      color: 'white',
                      '&:hover': {
                        backgroundColor: messageInput.trim() ? 'primary.dark' : 'grey.400',
                      },
                      '&:disabled': {
                        backgroundColor: 'grey.300',
                        color: 'grey.500'
                      }
                    }}
                  >
                    <SendIcon />
                  </IconButton>
                </Box>
              </>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <Typography variant="h6" color="text.secondary">
                  Select a conversation to start messaging
                </Typography>
              </Box>
            )}
          </Grid>
        </Grid>
      </Paper>
    </Container>
  );
};

export default ChatPage;
