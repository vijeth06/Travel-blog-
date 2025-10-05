import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Avatar,
  Paper,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Pagination
} from '@mui/material';
import {
  Send,
  MoreVert,
  Reply,
  Flag,
  Delete,
  ThumbUp,
  ThumbUpOutlined
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';
import LikeButton from './LikeButton';
import CommentBox from './CommentBox';
import { useBlogSocket } from '../hooks/useSocket';

const Comments = ({ blogId, commentsEnabled = true }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const [error, setError] = useState('');
  
  // Socket.IO integration for real-time comments
  const socket = useBlogSocket(blogId);

  useEffect(() => {
    fetchComments();
  }, [blogId, page, sortBy]);

  // Real-time comment updates
  useEffect(() => {
    if (socket.isSocketConnected()) {
      const handleNewComment = (data) => {
        if (data.blogId === blogId) {
          // Add new comment to the list if it's for current blog
          setComments(prev => [data.comment, ...prev]);
        }
      };

      socket.onCommentAdded(handleNewComment);

      return () => {
        socket.offCommentAdded(handleNewComment);
      };
    }
  }, [socket, blogId]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `/api/comments/blog/${blogId}?page=${page}&sort=${sortBy}&limit=10`
      );
      const data = await response.json();

      if (response.ok) {
        setComments(data.comments);
        setTotalPages(data.totalPages);
      } else {
        setError(data.message || 'Failed to load comments');
      }
    } catch (error) {
      setError('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    
    const token = localStorage.getItem('token');
    if (!token) {
      setError('Please login to comment');
      return;
    }

    if (!newComment.trim()) {
      setError('Comment cannot be empty');
      return;
    }

    try {
      setSubmitting(true);
      setError('');

      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          blog: blogId,
          content: newComment.trim(),
          parentComment: replyTo
        })
      });

      const data = await response.json();

      if (response.ok) {
        setNewComment('');
        setReplyTo(null);
        
        // Emit real-time comment event
        if (socket.isSocketConnected()) {
          socket.emitNewComment({
            blogId,
            comment: data.comment
          });
        }
        
        // Show success message
        if (data.comment.status === 'pending') {
          setError('Comment submitted for moderation');
        } else {
          // Refresh comments if auto-approved
          fetchComments();
        }
      } else {
        setError(data.message || 'Failed to post comment');
      }
    } catch (error) {
      setError('Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/comments/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchComments();
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to delete comment');
      }
    } catch (error) {
      setError('Failed to delete comment');
    }
  };

  const handleFlagComment = async (commentId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/comments/${commentId}/flag`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setError('Comment flagged for review');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to flag comment');
      }
    } catch (error) {
      setError('Failed to flag comment');
    }
  };

  const CommentItem = ({ comment, isReply = false }) => {
    const [menuAnchor, setMenuAnchor] = useState(null);
    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    const isOwner = currentUser.id === comment.user._id;
    const isAdmin = currentUser.role === 'admin';

    return (
      <Box sx={{ mb: 2, ml: isReply ? 4 : 0 }}>
        <Paper elevation={1} sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <Avatar 
              src={comment.user.avatar} 
              alt={comment.user.name}
              sx={{ width: 32, height: 32 }}
            >
              {comment.user.name.charAt(0).toUpperCase()}
            </Avatar>
            
            <Box sx={{ flexGrow: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Typography variant="subtitle2" fontWeight="bold">
                  {comment.user.name}
                </Typography>
                
                {comment.user.role === 'admin' && (
                  <Chip label="Admin" size="small" color="primary" />
                )}
                
                <Typography variant="caption" color="text.secondary">
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </Typography>
              </Box>
              
              <Typography variant="body2" sx={{ mb: 1 }}>
                {comment.content}
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LikeButton
                  targetType="Comment"
                  targetId={comment._id}
                  initialCount={comment.likesCount}
                  size="small"
                  showCount={true}
                />
                
                {!isReply && (
                  <Button
                    size="small"
                    startIcon={<Reply />}
                    onClick={() => setReplyTo(comment._id)}
                  >
                    Reply
                  </Button>
                )}
              </Box>
            </Box>
            
            <IconButton
              size="small"
              onClick={(e) => setMenuAnchor(e.currentTarget)}
            >
              <MoreVert />
            </IconButton>
            
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
            >
              {(isOwner || isAdmin) && (
                <MenuItem onClick={() => {
                  handleDeleteComment(comment._id);
                  setMenuAnchor(null);
                }}>
                  <Delete fontSize="small" sx={{ mr: 1 }} />
                  Delete
                </MenuItem>
              )}
              
              {!isOwner && (
                <MenuItem onClick={() => {
                  handleFlagComment(comment._id);
                  setMenuAnchor(null);
                }}>
                  <Flag fontSize="small" sx={{ mr: 1 }} />
                  Report
                </MenuItem>
              )}
            </Menu>
          </Box>
        </Paper>
        
        {/* Render replies */}
        {comment.replies && comment.replies.map((reply) => (
          <CommentItem key={reply._id} comment={reply} isReply={true} />
        ))}
      </Box>
    );
  };

  if (!commentsEnabled) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">
          Comments are disabled for this post.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom>
        Comments
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}
      
      {/* Comment Form */}
      <CommentBox
        onSubmit={async (content) => {
          const token = localStorage.getItem('token');
          if (!token) {
            setError('Please login to comment');
            throw new Error('Not authenticated');
          }

          const response = await fetch('/api/comments', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              blog: blogId,
              content: content,
              parentComment: replyTo
            })
          });

          const data = await response.json();

          if (response.ok) {
            setReplyTo(null);
            
            // Emit real-time comment event
            if (socket.isSocketConnected()) {
              socket.emitNewComment({
                blogId,
                comment: data.comment
              });
            }
            
            // Show success message
            if (data.comment.status === 'pending') {
              setError('Comment submitted for moderation');
            } else {
              // Refresh comments if auto-approved
              fetchComments();
            }
          } else {
            setError(data.message || 'Failed to post comment');
            throw new Error(data.message || 'Failed to post comment');
          }
        }}
        placeholder={replyTo ? "Write a reply..." : "Write a comment..."}
      />
      
      {replyTo && (
        <Box sx={{ mb: 2 }}>
          <Button
            size="small"
            onClick={() => setReplyTo(null)}
            variant="outlined"
          >
            Cancel Reply
          </Button>
        </Box>
      )}
      
      {/* Sort Options */}
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        <Button
          size="small"
          variant={sortBy === 'newest' ? 'contained' : 'outlined'}
          onClick={() => setSortBy('newest')}
        >
          Newest
        </Button>
        <Button
          size="small"
          variant={sortBy === 'oldest' ? 'contained' : 'outlined'}
          onClick={() => setSortBy('oldest')}
        >
          Oldest
        </Button>
        <Button
          size="small"
          variant={sortBy === 'popular' ? 'contained' : 'outlined'}
          onClick={() => setSortBy('popular')}
        >
          Popular
        </Button>
      </Box>
      
      {/* Comments List */}
      {loading ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : comments.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            No comments yet. Be the first to comment!
          </Typography>
        </Box>
      ) : (
        <>
          {comments.map((comment) => (
            <CommentItem key={comment._id} comment={comment} />
          ))}
          
          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                count={totalPages}
                page={page}
                onChange={(e, value) => setPage(value)}
                color="primary"
              />
            </Box>
          )}
        </>
      )}
    </Box>
  );
};

export default Comments;
