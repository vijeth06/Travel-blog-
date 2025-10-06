import React, { useState } from 'react';
import {
  IconButton,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Box,
  Typography
} from '@mui/material';
import {
  Share,
  Facebook,
  Twitter,
  LinkedIn,
  WhatsApp,
  Email,
  Link,
  ContentCopy,
  QrCode
} from '@mui/icons-material';
import { useSocket } from '../../hooks/useSocket';
import api from '../../api/api';

const ShareButton = ({ 
  targetType = 'Blog', 
  targetId, 
  title = '', 
  description = '',
  imageUrl = '',
  url = '',
  size = 'medium',
  variant = 'icon' // 'icon' or 'button'
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);
  const [emailForm, setEmailForm] = useState({ to: '', message: '' });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const socket = useSocket();

  const shareUrl = url || `${window.location.origin}/blogs/${targetId}`;
  const shareTitle = title || 'Check out this amazing travel story!';
  const shareDescription = description || 'Discover incredible travel experiences and destinations.';

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const recordShare = async (platform) => {
    try {
      await api.post('/social/share', {
        targetType,
        targetId,
        platform
      });

      // Emit socket event for analytics
      if (socket.isSocketConnected()) {
        socket.emit('content-shared', {
          targetType,
          targetId,
          platform
        });
      }
    } catch (error) {
      console.error('Error recording share:', error);
    }
  };

  const handleShare = async (platform) => {
    handleMenuClose();
    await recordShare(platform);

    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedTitle = encodeURIComponent(shareTitle);
    const encodedDescription = encodeURIComponent(shareDescription);

    let shareUrlToOpen = '';

    switch (platform) {
      case 'facebook':
        shareUrlToOpen = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case 'twitter':
        shareUrlToOpen = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`;
        break;
      case 'linkedin':
        shareUrlToOpen = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
      case 'whatsapp':
        shareUrlToOpen = `https://wa.me/?text=${encodedTitle} ${encodedUrl}`;
        break;
      case 'email':
        setEmailDialogOpen(true);
        return;
      case 'copy':
        handleCopyLink();
        return;
      default:
        return;
    }

    if (shareUrlToOpen) {
      window.open(shareUrlToOpen, '_blank', 'width=600,height=400');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setSnackbar({
        open: true,
        message: 'Link copied to clipboard!',
        severity: 'success'
      });
    } catch (error) {
      console.error('Error copying link:', error);
      setSnackbar({
        open: true,
        message: 'Failed to copy link',
        severity: 'error'
      });
    }
  };

  const handleEmailShare = async () => {
    try {
      const subject = encodeURIComponent(shareTitle);
      const body = encodeURIComponent(
        `${emailForm.message}\n\n${shareDescription}\n\n${shareUrl}`
      );
      
      if (emailForm.to) {
        // Send via backend API
        await api.post('/social/email-share', {
          to: emailForm.to,
          subject: shareTitle,
          message: emailForm.message,
          url: shareUrl,
          targetType,
          targetId
        });
        
        setSnackbar({
          open: true,
          message: 'Email sent successfully!',
          severity: 'success'
        });
      } else {
        // Open default email client
        window.location.href = `mailto:?subject=${subject}&body=${body}`;
      }
      
      setEmailDialogOpen(false);
      setEmailForm({ to: '', message: '' });
      await recordShare('email');
    } catch (error) {
      console.error('Error sending email:', error);
      setSnackbar({
        open: true,
        message: 'Failed to send email',
        severity: 'error'
      });
    }
  };

  const shareOptions = [
    { platform: 'facebook', label: 'Facebook', icon: <Facebook />, color: '#1877F2' },
    { platform: 'twitter', label: 'Twitter', icon: <Twitter />, color: '#1DA1F2' },
    { platform: 'linkedin', label: 'LinkedIn', icon: <LinkedIn />, color: '#0A66C2' },
    { platform: 'whatsapp', label: 'WhatsApp', icon: <WhatsApp />, color: '#25D366' },
    { platform: 'email', label: 'Email', icon: <Email />, color: '#EA4335' },
    { platform: 'copy', label: 'Copy Link', icon: <ContentCopy />, color: '#666666' }
  ];

  const ShareIcon = variant === 'button' ? (
    <Button
      startIcon={<Share />}
      onClick={handleMenuOpen}
      size={size}
      variant="outlined"
    >
      Share
    </Button>
  ) : (
    <Tooltip title="Share">
      <IconButton onClick={handleMenuOpen} size={size}>
        <Share />
      </IconButton>
    </Tooltip>
  );

  return (
    <Box>
      {ShareIcon}
      
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        {shareOptions.map((option) => (
          <MenuItem
            key={option.platform}
            onClick={() => handleShare(option.platform)}
            sx={{ minWidth: 150 }}
          >
            <ListItemIcon sx={{ color: option.color }}>
              {option.icon}
            </ListItemIcon>
            <ListItemText>{option.label}</ListItemText>
          </MenuItem>
        ))}
      </Menu>

      {/* Email Share Dialog */}
      <Dialog open={emailDialogOpen} onClose={() => setEmailDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Share via Email</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address (optional)"
            type="email"
            fullWidth
            variant="outlined"
            value={emailForm.to}
            onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })}
            helperText="Leave empty to open your default email client"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            label="Personal Message (optional)"
            multiline
            rows={3}
            fullWidth
            variant="outlined"
            value={emailForm.message}
            onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })}
            placeholder="Add a personal message..."
          />
          <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Preview:
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              <strong>{shareTitle}</strong>
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {shareDescription}
            </Typography>
            <Typography variant="body2" color="primary" sx={{ wordBreak: 'break-all' }}>
              {shareUrl}
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEmailDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleEmailShare} variant="contained">
            Send
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ShareButton;
