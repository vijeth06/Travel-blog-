import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Avatar,
  Typography,
  Paper,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  Send,
  EmojiEmotions,
  AttachFile
} from '@mui/icons-material';
import { useSelector } from 'react-redux';

const CommentBox = ({ onSubmit, placeholder = "Write a comment...", autoFocus = false }) => {
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit(comment.trim());
      setComment('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };

  if (!user) {
    return (
      <Paper 
        sx={{ 
          p: 2, 
          mt: 2, 
          backgroundColor: 'grey.50',
          textAlign: 'center'
        }}
      >
        <Typography color="text.secondary">
          Please log in to leave a comment
        </Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ p: 2, mt: 2 }}>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Avatar 
          src={user.profilePicture} 
          sx={{ width: 40, height: 40 }}
        >
          {user.name?.charAt(0)}
        </Avatar>
        
        <Box sx={{ flex: 1 }}>
          <form onSubmit={handleSubmit}>
            <TextField
              fullWidth
              multiline
              minRows={2}
              maxRows={6}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              autoFocus={autoFocus}
              variant="outlined"
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'background.paper',
                }
              }}
            />
            
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mt: 1 
            }}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Tooltip title="Add emoji">
                  <IconButton size="small" color="primary">
                    <EmojiEmotions />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Attach file">
                  <IconButton size="small" color="primary">
                    <AttachFile />
                  </IconButton>
                </Tooltip>
              </Box>
              
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                <Typography variant="caption" color="text.secondary">
                  Ctrl+Enter to post
                </Typography>
                <Button
                  type="submit"
                  variant="contained"
                  size="small"
                  disabled={!comment.trim() || isSubmitting}
                  startIcon={<Send />}
                  sx={{ minWidth: 100 }}
                >
                  {isSubmitting ? 'Posting...' : 'Post'}
                </Button>
              </Box>
            </Box>
          </form>
        </Box>
      </Box>
    </Paper>
  );
};

export default CommentBox;