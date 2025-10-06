import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Avatar,
  Typography,
  Alert,
  CircularProgress
} from '@mui/material';
import { Send } from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { createComment } from '../../api/comments';

const AddComment = ({ blogId, onCommentAdded, parentComment = null, onCancel = null }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;

    try {
      setSubmitting(true);
      setError('');

      const commentData = {
        blog: blogId,
        content: comment.trim(),
        parentComment: parentComment
      };

      const response = await createComment(commentData);
      
      if (onCommentAdded) {
        onCommentAdded(response.data.comment);
      }

      setComment('');
      if (onCancel) onCancel(); // Close reply form
    } catch (error) {
      console.error('Error submitting comment:', error);
      setError(error.response?.data?.message || 'Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography color="text.secondary">
            Please log in to leave a comment
          </Typography>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
            {error}
          </Alert>
        )}

        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
          <Avatar
            src={user?.avatar}
            sx={{ width: 40, height: 40 }}
          >
            {user?.name?.charAt(0)?.toUpperCase()}
          </Avatar>

          <Box sx={{ flexGrow: 1 }}>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                multiline
                rows={parentComment ? 2 : 3}
                placeholder={parentComment ? "Write a reply..." : "Share your thoughts..."}
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                variant="outlined"
                sx={{ mb: 2 }}
              />
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                {onCancel && (
                  <Button
                    onClick={onCancel}
                    disabled={submitting}
                  >
                    Cancel
                  </Button>
                )}
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={submitting ? <CircularProgress size={16} /> : <Send />}
                  disabled={submitting || !comment.trim()}
                  sx={{ minWidth: 120 }}
                >
                  {submitting ? 'Posting...' : (parentComment ? 'Reply' : 'Comment')}
                </Button>
              </Box>
            </form>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default AddComment;