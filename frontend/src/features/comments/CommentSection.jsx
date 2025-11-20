import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Divider,
  Alert,
  CircularProgress,
  Stack,
  Collapse
} from '@mui/material';
import {
  Send,
  MoreVert,
  Reply,
  Flag,
  Delete,
  Edit,
  ThumbUp,
  ThumbUpOutlined,
  ExpandMore,
  ExpandLess,
  Verified
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import io from 'socket.io-client';
import { getSocketUrl } from '../../config/api';
import { getCommentsByBlog, createComment, deleteComment, flagComment } from '../../api/comments';

const CommentSection = ({ blogId, commentsEnabled = true }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [flagDialog, setFlagDialog] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState(new Set());
  const [socket, setSocket] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Initialize Socket.IO connection
  useEffect(() => {
    const newSocket = io(getSocketUrl(), {
      withCredentials: true
    });

    newSocket.on('connect', () => {
      console.log('Connected to socket server');
      newSocket.emit('join-blog', blogId);
    });

    newSocket.on('comment-added', (data) => {
      if (data.blogId === blogId) {
        setComments(prev => [data.comment, ...prev]);
      }
    });

    newSocket.on('comment-updated', (data) => {
      if (data.blogId === blogId) {
        setComments(prev => prev.map(comment => 
          comment._id === data.comment._id ? data.comment : comment
        ));
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.emit('leave-blog', blogId);
      newSocket.disconnect();
    };
  }, [blogId]);

  // Fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        setLoading(true);
        const response = await getCommentsByBlog(blogId);
        setComments(response.data?.comments || response.comments || []);
      } catch (error) {
        console.error('Error fetching comments:', error);
        setError('Failed to load comments');
      } finally {
        setLoading(false);
      }
    };

    if (blogId) {
      fetchComments();
    }
  }, [blogId]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setSubmitting(true);
      setError('');
      
      const commentData = {
        blog: blogId,
        content: newComment.trim(),
        parentComment: replyTo
      };

      const response = await createComment(commentData);
      
      if (response.data?.comment?.status === 'approved') {
        // Comment was auto-approved (admin user)
        if (!replyTo) {
          setComments(prev => [response.data.comment, ...prev]);
        } else {
          // Handle reply
          setComments(prev => prev.map(comment => {
            if (comment._id === replyTo) {
              return {
                ...comment,
                replies: [...(comment.replies || []), response.data.comment]
              };
            }
            return comment;
          }));
        }
      } else {
        setSuccess('Comment submitted for moderation');
      }

      setNewComment('');
      setReplyTo(null);
      setReplyText('');
    } catch (error) {
      console.error('Error submitting comment:', error);
      setError(error.response?.data?.message || 'Failed to submit comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComment = async () => {
    try {
      await deleteComment(selectedComment._id);
      setComments(prev => prev.filter(comment => comment._id !== selectedComment._id));
      setSuccess('Comment deleted successfully');
      setDeleteDialog(false);
      setSelectedComment(null);
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError(error.response?.data?.message || 'Failed to delete comment');
    }
  };

  const handleFlagComment = async () => {
    try {
      await flagComment(selectedComment._id);
      setSuccess('Comment flagged for review');
      setFlagDialog(false);
      setSelectedComment(null);
    } catch (error) {
      console.error('Error flagging comment:', error);
      setError(error.response?.data?.message || 'Failed to flag comment');
    }
  };

  const toggleReplies = (commentId) => {
    const newExpanded = new Set(expandedReplies);
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId);
    } else {
      newExpanded.add(commentId);
    }
    setExpandedReplies(newExpanded);
  };

  const CommentItem = ({ comment, isReply = false }) => (
    <Card 
      sx={{ 
        mb: isReply ? 1 : 2, 
        ml: isReply ? 4 : 0,
        backgroundColor: isReply ? 'grey.50' : 'background.paper'
      }}
    >
      <CardContent sx={{ pb: 1 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
          <Avatar
            src={comment.user?.avatar}
            sx={{ width: 32, height: 32, mr: 2 }}
          >
            {comment.user?.name?.charAt(0)?.toUpperCase()}
          </Avatar>
          
          <Box sx={{ flexGrow: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                {comment.user?.name || 'Anonymous'}
              </Typography>
              {comment.user?.role === 'admin' && (
                <Verified sx={{ ml: 0.5, fontSize: 16, color: 'primary.main' }} />
              )}
              <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
              </Typography>
              {comment.status === 'pending' && (
                <Chip 
                  label="Pending Moderation" 
                  size="small" 
                  color="warning" 
                  sx={{ ml: 1, height: 20 }} 
                />
              )}
            </Box>
            
            <Typography variant="body2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }}>
              {comment.content}
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Button
                size="small"
                startIcon={<ThumbUpOutlined />}
                sx={{ minWidth: 'auto', px: 1 }}
              >
                {comment.likesCount || 0}
              </Button>
              
              {!isReply && isAuthenticated && (
                <Button
                  size="small"
                  startIcon={<Reply />}
                  onClick={() => {
                    setReplyTo(comment._id);
                    setReplyText(`@${comment.user?.name} `);
                  }}
                  sx={{ minWidth: 'auto', px: 1 }}
                >
                  Reply
                </Button>
              )}

              {comment.replies && comment.replies.length > 0 && (
                <Button
                  size="small"
                  startIcon={expandedReplies.has(comment._id) ? <ExpandLess /> : <ExpandMore />}
                  onClick={() => toggleReplies(comment._id)}
                  sx={{ minWidth: 'auto', px: 1 }}
                >
                  {comment.replies.length} {comment.replies.length === 1 ? 'Reply' : 'Replies'}
                </Button>
              )}
            </Box>
          </Box>

          {isAuthenticated && (
            <IconButton
              size="small"
              onClick={(e) => {
                setAnchorEl(e.currentTarget);
                setSelectedComment(comment);
              }}
            >
              <MoreVert />
            </IconButton>
          )}
        </Box>

        {/* Replies */}
        {comment.replies && comment.replies.length > 0 && (
          <Collapse in={expandedReplies.has(comment._id)}>
            <Box sx={{ mt: 2 }}>
              {comment.replies.map((reply) => (
                <CommentItem key={reply._id} comment={reply} isReply={true} />
              ))}
            </Box>
          </Collapse>
        )}
      </CardContent>
    </Card>
  );

  if (!commentsEnabled) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography color="text.secondary">
          Comments are disabled for this post
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h5" gutterBottom sx={{ fontWeight: 600 }}>
        Comments ({comments.length})
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Comment Form */}
      {isAuthenticated ? (
        <Card sx={{ mb: 3 }}>
          <CardContent>
            {replyTo && (
              <Box sx={{ mb: 2, p: 1, backgroundColor: 'grey.100', borderRadius: 1 }}>
                <Typography variant="caption" color="text.secondary">
                  Replying to comment
                </Typography>
                <Button
                  size="small"
                  onClick={() => {
                    setReplyTo(null);
                    setReplyText('');
                  }}
                  sx={{ ml: 1 }}
                >
                  Cancel
                </Button>
              </Box>
            )}
            
            <form onSubmit={handleSubmitComment}>
              <TextField
                fullWidth
                multiline
                rows={3}
                placeholder={replyTo ? "Write a reply..." : "Share your thoughts..."}
                value={replyTo ? replyText : newComment}
                onChange={(e) => {
                  if (replyTo) {
                    setReplyText(e.target.value);
                  } else {
                    setNewComment(e.target.value);
                  }
                }}
                sx={{ mb: 2 }}
              />
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<Send />}
                  disabled={submitting || (!newComment.trim() && !replyText.trim())}
                  sx={{ minWidth: 120 }}
                >
                  {submitting ? <CircularProgress size={20} /> : 'Post Comment'}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ mb: 3 }}>
          <CardContent sx={{ textAlign: 'center' }}>
            <Typography color="text.secondary">
              Please log in to leave a comment
            </Typography>
          </CardContent>
        </Card>
      )}

      {/* Comments List */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : comments.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography color="text.secondary">
            No comments yet. Be the first to share your thoughts!
          </Typography>
        </Box>
      ) : (
        <Stack spacing={2}>
          {comments.map((comment) => (
            <CommentItem key={comment._id} comment={comment} />
          ))}
        </Stack>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        {selectedComment && user && selectedComment.user._id === user.id && (
          <MenuItem
            onClick={() => {
              setDeleteDialog(true);
              setAnchorEl(null);
            }}
          >
            <Delete sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        )}
        {selectedComment && user && selectedComment.user._id !== user.id && (
          <MenuItem
            onClick={() => {
              setFlagDialog(true);
              setAnchorEl(null);
            }}
          >
            <Flag sx={{ mr: 1 }} />
            Report
          </MenuItem>
        )}
      </Menu>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Delete Comment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this comment? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDeleteComment} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Flag Dialog */}
      <Dialog open={flagDialog} onClose={() => setFlagDialog(false)}>
        <DialogTitle>Report Comment</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to report this comment for inappropriate content?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFlagDialog(false)}>Cancel</Button>
          <Button onClick={handleFlagComment} color="warning" variant="contained">
            Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommentSection;
