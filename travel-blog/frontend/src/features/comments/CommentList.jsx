import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Avatar,
  IconButton,
  Menu,
  MenuItem,
  Button,
  Chip,
  Stack,
  Collapse,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  MoreVert,
  Reply,
  Flag,
  Delete,
  ThumbUp,
  ThumbUpOutlined,
  ExpandMore,
  ExpandLess,
  Verified
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { formatDistanceToNow } from 'date-fns';
import { getCommentsByBlog, deleteComment, flagComment } from '../../api/comments';
import AddComment from './AddComment';

const CommentList = ({ blogId, socket }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedComment, setSelectedComment] = useState(null);
  const [expandedReplies, setExpandedReplies] = useState(new Set());
  const [replyingTo, setReplyingTo] = useState(null);

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

  // Listen for real-time comment updates
  useEffect(() => {
    if (socket) {
      socket.on('comment-added', (data) => {
        if (data.blogId === blogId) {
          if (data.comment.parentComment) {
            // It's a reply
            setComments(prev => prev.map(comment => {
              if (comment._id === data.comment.parentComment) {
                return {
                  ...comment,
                  replies: [...(comment.replies || []), data.comment]
                };
              }
              return comment;
            }));
          } else {
            // It's a top-level comment
            setComments(prev => [data.comment, ...prev]);
          }
        }
      });

      return () => {
        socket.off('comment-added');
      };
    }
  }, [socket, blogId]);

  const handleDeleteComment = async (commentId) => {
    try {
      await deleteComment(commentId);
      setComments(prev => prev.filter(comment => comment._id !== commentId));
      setAnchorEl(null);
    } catch (error) {
      console.error('Error deleting comment:', error);
      setError('Failed to delete comment');
    }
  };

  const handleFlagComment = async (commentId) => {
    try {
      await flagComment(commentId);
      setAnchorEl(null);
    } catch (error) {
      console.error('Error flagging comment:', error);
      setError('Failed to flag comment');
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

  const handleCommentAdded = (newComment) => {
    if (newComment.parentComment) {
      // It's a reply
      setComments(prev => prev.map(comment => {
        if (comment._id === newComment.parentComment) {
          return {
            ...comment,
            replies: [...(comment.replies || []), newComment]
          };
        }
        return comment;
      }));
      setExpandedReplies(prev => new Set([...prev, newComment.parentComment]));
    } else {
      // It's a top-level comment
      setComments(prev => [newComment, ...prev]);
    }
    setReplyingTo(null);
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
                  label="Pending" 
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
                  onClick={() => setReplyingTo(comment._id)}
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

        {/* Reply Form */}
        {replyingTo === comment._id && (
          <Box sx={{ mt: 2 }}>
            <AddComment
              blogId={blogId}
              parentComment={comment._id}
              onCommentAdded={handleCommentAdded}
              onCancel={() => setReplyingTo(null)}
            />
          </Box>
        )}

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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {comments.length === 0 ? (
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
            onClick={() => handleDeleteComment(selectedComment._id)}
          >
            <Delete sx={{ mr: 1 }} />
            Delete
          </MenuItem>
        )}
        {selectedComment && user && selectedComment.user._id !== user.id && (
          <MenuItem
            onClick={() => handleFlagComment(selectedComment._id)}
          >
            <Flag sx={{ mr: 1 }} />
            Report
          </MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default CommentList;