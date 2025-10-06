import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Typography,
  Box,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import {
  Share,
  Facebook,
  Twitter,
  LinkedIn,
  WhatsApp,
  Telegram,
  Email,
  ContentCopy,
  Pinterest
} from '@mui/icons-material';

const SocialShare = ({ 
  targetType, 
  targetId, 
  title,
  size = 'medium',
  variant = 'icon' // 'icon' or 'button'
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [shareUrls, setShareUrls] = useState({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const open = Boolean(anchorEl);

  useEffect(() => {
    fetchShareUrls();
  }, [targetType, targetId]);

  const fetchShareUrls = async () => {
    try {
      const response = await fetch(`/api/social/share-urls/${targetType}/${targetId}`);
      const data = await response.json();
      
      if (response.ok) {
        setShareUrls(data.shareUrls);
      }
    } catch (error) {
      console.error('Error fetching share URLs:', error);
    }
  };

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const recordShare = async (platform) => {
    try {
      await fetch('/api/social/share', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          targetType,
          targetId,
          platform
        })
      });
    } catch (error) {
      console.error('Error recording share:', error);
    }
  };

  const handleShare = async (platform, url) => {
    handleClose();
    
    if (platform === 'copy-link') {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setSnackbar({
          open: true,
          message: 'Link copied to clipboard!',
          severity: 'success'
        });
      } catch (error) {
        setSnackbar({
          open: true,
          message: 'Failed to copy link',
          severity: 'error'
        });
      }
    } else {
      window.open(url, '_blank', 'width=600,height=400');
    }

    // Record the share
    await recordShare(platform);
  };

  const shareOptions = [
    { platform: 'facebook', icon: <Facebook />, label: 'Facebook', color: '#1877F2' },
    { platform: 'twitter', icon: <Twitter />, label: 'Twitter', color: '#1DA1F2' },
    { platform: 'linkedin', icon: <LinkedIn />, label: 'LinkedIn', color: '#0A66C2' },
    { platform: 'whatsapp', icon: <WhatsApp />, label: 'WhatsApp', color: '#25D366' },
    { platform: 'telegram', icon: <Telegram />, label: 'Telegram', color: '#0088CC' },
    { platform: 'pinterest', icon: <Pinterest />, label: 'Pinterest', color: '#E60023' },
    { platform: 'email', icon: <Email />, label: 'Email', color: '#EA4335' },
    { platform: 'copy-link', icon: <ContentCopy />, label: 'Copy Link', color: '#666666' }
  ];

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <>
      <Tooltip title="Share">
        <IconButton
          onClick={handleClick}
          size={size}
          sx={{
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              transform: 'scale(1.1)'
            }
          }}
        >
          <Share />
        </IconButton>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: {
            maxHeight: 400,
            width: '200px'
          }
        }}
      >
        <Box sx={{ p: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
            Share this {targetType.toLowerCase()}
          </Typography>
        </Box>
        
        {shareOptions.map((option) => {
          const url = shareUrls[option.platform];
          if (!url && option.platform !== 'copy-link') return null;

          return (
            <MenuItem
              key={option.platform}
              onClick={() => handleShare(option.platform, url)}
              sx={{
                '&:hover': {
                  backgroundColor: `${option.color}15`
                }
              }}
            >
              <ListItemIcon sx={{ color: option.color }}>
                {option.icon}
              </ListItemIcon>
              <ListItemText primary={option.label} />
            </MenuItem>
          );
        })}
      </Menu>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
};

export default SocialShare;
