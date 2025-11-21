import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Avatar,
  Stack,
  Divider
} from '@mui/material';
import {
  Dashboard,
  People,
  Article,
  Comment,
  Analytics,
  Settings,
  Edit,
  Delete,
  Visibility,
  Block,
  CheckCircle,
  Cancel,
  Warning,
  TrendingUp,
  PersonAdd,
  BookmarkAdd,
  BarChart,
  PieChart,
  Timeline,
  Star
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { getAllUsers, updateUser, deleteUser } from '../api/users';
import { getBlogs, deleteBlog } from '../api/blogs';
import { getPendingComments, moderateComment } from '../api/comments';
import { 
  getAnalytics, 
  getSystemHealth, 
  getUserActivity, 
  getAllBlogsAdmin, 
  updateBlogAdmin, 
  deleteBlogAdmin, 
  toggleBlogFeatured, 
  getAllCommentsAdmin, 
  bulkModerateComments 
} from '../api/admin';

const AdminPanel = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  const [currentTab, setCurrentTab] = useState(0);
  const [selectedComments, setSelectedComments] = useState([]);
  const [bulkAction, setBulkAction] = useState('');
  const [editBlogDialog, setEditBlogDialog] = useState(false);
  const [userActivity, setUserActivity] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Data states
  const [users, setUsers] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [comments, setComments] = useState([]);
  const [analytics, setAnalytics] = useState({
    totalUsers: 0,
    totalBlogs: 0,
    totalComments: 0,
    pendingComments: 0,
    totalPackages: 0,
    totalOrders: 0,
    systemHealth: 'Unknown'
  });

  // Dialog states
  const [editUserDialog, setEditUserDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [moderationDialog, setModerationDialog] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');

  // Check admin access
  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }
  }, [user, navigate]);

  // Fetch data based on current tab
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        switch (currentTab) {
          case 1: // Users
            const usersResponse = await getAllUsers();
            setUsers(usersResponse.users || []);
            break;
          case 2: // Blogs
            const blogsResponse = await getAllBlogsAdmin({ status: 'all' });
            setBlogs(blogsResponse.data?.blogs || []);
            break;
          case 3: // Comments
            const commentsResponse = await getAllCommentsAdmin({ status: 'all' });
            setComments(commentsResponse.data?.comments || []);
            break;
          case 4: // Analytics
            const activityResponse = await getUserActivity();
            setUserActivity(activityResponse.data?.activities || []);
            break;
          default:
            // Dashboard - fetch analytics
            try {
              // Fetch comprehensive analytics
              const analyticsRes = await getAnalytics();
              const healthRes = await getSystemHealth();
              
              setAnalytics({
                totalUsers: analyticsRes.data?.overview?.totalUsers || 0,
                totalBlogs: analyticsRes.data?.overview?.totalBlogs || 0,
                totalComments: analyticsRes.data?.overview?.totalComments || 0,
                pendingComments: analyticsRes.data?.overview?.pendingComments || 0,
                totalPackages: analyticsRes.data?.overview?.totalPackages || 0,
                totalOrders: analyticsRes.data?.overview?.totalBookings || 0,
                totalRevenue: analyticsRes.data?.overview?.totalRevenue || 0,
                growth: analyticsRes.data?.growth || {},
                distributions: analyticsRes.data?.distributions || {},
                systemHealth: healthRes.data?.status === 'healthy' ? 'Connected' : 'Disconnected'
              });
            } catch (error) {
              console.error('Analytics fetch error:', error);
              setAnalytics(prev => ({ 
                ...prev, 
                systemHealth: 'Disconnected',
                totalUsers: 0,
                totalBlogs: 0,
                totalComments: 0,
                pendingComments: 0
              }));
              setError('Backend server is not running. Please start the server.');
            }
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentTab]);

  const handleUserUpdate = async (userData) => {
    try {
      await updateUser(selectedItem._id, userData);
      setSuccess('User updated successfully');
      setEditUserDialog(false);
      // Refresh users list
      const response = await getAllUsers();
      setUsers(response.data?.users || []);
    } catch (error) {
      setError('Failed to update user');
    }
  };

  const handleDelete = async () => {
    try {
      if (selectedItem.type === 'user') {
        await deleteUser(selectedItem._id);
        setUsers(prev => prev.filter(u => u._id !== selectedItem._id));
      } else if (selectedItem.type === 'blog') {
        await deleteBlogAdmin(selectedItem._id);
        setBlogs(prev => prev.filter(b => b._id !== selectedItem._id));
      }
      setSuccess(`${selectedItem.type} deleted successfully`);
      setDeleteDialog(false);
    } catch (error) {
      setError(`Failed to delete ${selectedItem.type}`);
    }
  };

  const handleBlogUpdate = async (blogData) => {
    try {
      await updateBlogAdmin(selectedItem._id, blogData);
      setSuccess('Blog updated successfully');
      setEditBlogDialog(false);
      // Refresh blogs list
      const response = await getAllBlogsAdmin({ status: 'all' });
      setBlogs(response.data?.blogs || []);
    } catch (error) {
      setError('Failed to update blog');
    }
  };

  const handleToggleFeatured = async (blogId) => {
    try {
      await toggleBlogFeatured(blogId);
      setSuccess('Blog featured status updated');
      // Refresh blogs list
      const response = await getAllBlogsAdmin({ status: 'all' });
      setBlogs(response.data?.blogs || []);
    } catch (error) {
      setError('Failed to update featured status');
    }
  };

  const handleBulkCommentModeration = async () => {
    try {
      if (selectedComments.length === 0) {
        setError('Please select comments to moderate');
        return;
      }
      
      await bulkModerateComments({
        commentIds: selectedComments,
        action: bulkAction
      });
      
      setSuccess(`${selectedComments.length} comments ${bulkAction} successfully`);
      setSelectedComments([]);
      setBulkAction('');
      
      // Refresh comments list
      const response = await getAllCommentsAdmin({ status: 'all' });
      setComments(response.data?.comments || []);
    } catch (error) {
      console.error('Bulk moderation error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to moderate comments';
      setError(errorMsg);
    }
  };

  const handleCommentModeration = async (comment, status, reason = '') => {
    try {
      if (!comment || !comment._id) {
        setError('No comment selected');
        return;
      }
      
      await moderateComment(comment._id, { status, reason });
      setComments(prev => prev.filter(c => c._id !== comment._id));
      setSuccess(`Comment ${status} successfully`);
      setModerationDialog(false);
      setSelectedItem(null);
      setRejectionReason('');
    } catch (error) {
      console.error('Comment moderation error:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Failed to moderate comment';
      setError(errorMsg);
    }
  };

  const DashboardTab = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
          <CardContent sx={{ color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <People sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {analytics.totalUsers}
                </Typography>
                <Typography variant="body2">Total Users</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
          <CardContent sx={{ color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Article sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {analytics.totalBlogs}
                </Typography>
                <Typography variant="body2">Total Blogs</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
          <CardContent sx={{ color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Comment sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {analytics.totalComments}
                </Typography>
                <Typography variant="body2">Total Comments</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' }}>
          <CardContent sx={{ color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Warning sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {analytics.pendingComments}
                </Typography>
                <Typography variant="body2">Pending Comments</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Additional Management Cards */}
      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }}>
          <CardContent sx={{ color: '#333' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <BookmarkAdd sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {analytics.totalPackages}
                </Typography>
                <Typography variant="body2">Travel Packages</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' }}>
          <CardContent sx={{ color: '#333' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <TrendingUp sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                  {analytics.totalOrders}
                </Typography>
                <Typography variant="body2">Total Orders</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card sx={{ background: analytics.systemHealth === 'Connected' ? 'linear-gradient(135deg, #a8e6cf 0%, #88d8a3 100%)' : 'linear-gradient(135deg, #ff8a80 0%, #ff5722 100%)' }}>
          <CardContent sx={{ color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
              <Settings sx={{ fontSize: 40, mr: 2 }} />
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  {analytics.systemHealth}
                </Typography>
                <Typography variant="body2">System Status</Typography>
              </Box>
            </Box>
          </CardContent>
        </Card>
      </Grid>

      {/* Quick Actions Section */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
              <Button
                variant="contained"
                startIcon={<PersonAdd />}
                onClick={() => navigate('/register')}
                sx={{ background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)' }}
              >
                Add New User
              </Button>
              <Button
                variant="contained"
                startIcon={<Article />}
                onClick={() => navigate('/create-blog')}
                sx={{ background: 'linear-gradient(45deg, #FF6B6B 30%, #4ECDC4 90%)' }}
              >
                Create Blog Post
              </Button>
              <Button
                variant="contained"
                startIcon={<BookmarkAdd />}
                onClick={() => navigate('/packages')}
                sx={{ background: 'linear-gradient(45deg, #A8E6CF 30%, #88D8A3 90%)' }}
              >
                Manage Packages
              </Button>
              <Button
                variant="contained"
                startIcon={<Analytics />}
                onClick={() => setCurrentTab(4)}
                sx={{ background: 'linear-gradient(45deg, #FFD93D 30%, #FF6B6B 90%)' }}
              >
                View Analytics
              </Button>
              <Button
                variant="contained"
                startIcon={<Settings />}
                onClick={() => navigate('/settings')}
                sx={{ background: 'linear-gradient(45deg, #6C5CE7 30%, #A29BFE 90%)' }}
              >
                System Settings
              </Button>
            </Stack>
          </CardContent>
        </Card>
      </Grid>

      {/* System Health & Recent Activity */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              System Health Monitor
            </Typography>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Backend Connection:
              </Typography>
              <Chip 
                label={analytics.systemHealth} 
                color={analytics.systemHealth === 'Connected' ? 'success' : 'error'}
                size="small"
              />
            </Box>
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Database Status:
              </Typography>
              <Chip 
                label={analytics.totalUsers > 0 ? 'Active' : 'Checking...'} 
                color={analytics.totalUsers > 0 ? 'success' : 'warning'}
                size="small"
              />
            </Box>
            <Button
              variant="outlined"
              size="small"
              onClick={() => window.location.reload()}
            >
              Refresh Status
            </Button>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Platform Overview
            </Typography>
            <Stack spacing={1}>
              <Typography variant="body2">
                • Total registered users: {analytics.totalUsers}
              </Typography>
              <Typography variant="body2">
                • Published blog posts: {analytics.totalBlogs}
              </Typography>
              <Typography variant="body2">
                • Comments awaiting moderation: {analytics.pendingComments}
              </Typography>
              <Typography variant="body2">
                • Travel packages available: {analytics.totalPackages}
              </Typography>
              <Typography variant="body2">
                • Orders processed: {analytics.totalOrders}
              </Typography>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  const UsersTab = () => (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>User</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Role</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Joined</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Avatar src={user.avatar} sx={{ mr: 2 }}>
                    {user.name?.charAt(0)?.toUpperCase()}
                  </Avatar>
                  <Typography>{user.name}</Typography>
                </Box>
              </TableCell>
              <TableCell>{user.email}</TableCell>
              <TableCell>
                <Chip 
                  label={user.role} 
                  color={user.role === 'admin' ? 'error' : user.role === 'author' ? 'primary' : 'default'}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <Chip 
                  label={user.isActive ? 'Active' : 'Inactive'} 
                  color={user.isActive ? 'success' : 'error'}
                  size="small"
                />
              </TableCell>
              <TableCell>
                {formatDistanceToNow(new Date(user.createdAt), { addSuffix: true })}
              </TableCell>
              <TableCell>
                <IconButton
                  onClick={() => {
                    setSelectedItem({ ...user, type: 'user' });
                    setEditUserDialog(true);
                  }}
                >
                  <Edit />
                </IconButton>
                {user.role !== 'admin' && (
                  <IconButton
                    onClick={() => {
                      setSelectedItem({ ...user, type: 'user' });
                      setDeleteDialog(true);
                    }}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

  const BlogsTab = () => (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
        <Typography variant="h6">Blog Management</Typography>
        <Button
          variant="contained"
          startIcon={<Article />}
          onClick={() => navigate('/create-blog')}
          size="small"
        >
          Create New Blog
        </Button>
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Author</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Featured</TableCell>
              <TableCell>Views</TableCell>
              <TableCell>Published</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {blogs.map((blog) => (
              <TableRow key={blog._id}>
                <TableCell>
                  <Typography variant="subtitle2">{blog.title}</Typography>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar src={blog.author?.avatar} sx={{ mr: 1, width: 24, height: 24 }}>
                      {blog.author?.name?.charAt(0)}
                    </Avatar>
                    {blog.author?.name}
                  </Box>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={blog.status} 
                    color={blog.status === 'published' ? 'success' : blog.status === 'draft' ? 'warning' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <IconButton
                    onClick={() => handleToggleFeatured(blog._id)}
                    color={blog.featured ? 'primary' : 'default'}
                  >
                    {blog.featured ? <CheckCircle /> : <Cancel />}
                  </IconButton>
                </TableCell>
                <TableCell>{blog.views || 0}</TableCell>
                <TableCell>
                  {blog.publishedAt ? formatDistanceToNow(new Date(blog.publishedAt), { addSuffix: true }) : 'Not published'}
                </TableCell>
                <TableCell>
                  <IconButton onClick={() => navigate(`/blogs/${blog._id}`)}>
                    <Visibility />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      setSelectedItem({ ...blog, type: 'blog' });
                      setEditBlogDialog(true);
                    }}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    onClick={() => {
                      setSelectedItem({ ...blog, type: 'blog' });
                      setDeleteDialog(true);
                    }}
                    color="error"
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const CommentsTab = () => (
    <Box>
      <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
        <Typography variant="h6">Comment Moderation</Typography>
        {selectedComments.length > 0 && (
          <>
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel>Bulk Action</InputLabel>
              <Select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                label="Bulk Action"
              >
                <MenuItem value="approved">Approve</MenuItem>
                <MenuItem value="rejected">Reject</MenuItem>
                <MenuItem value="pending">Mark Pending</MenuItem>
              </Select>
            </FormControl>
            <Button
              variant="contained"
              onClick={handleBulkCommentModeration}
              disabled={!bulkAction}
              size="small"
            >
              Apply to {selectedComments.length} comments
            </Button>
            <Button
              variant="outlined"
              onClick={() => setSelectedComments([])}
              size="small"
            >
              Clear Selection
            </Button>
          </>
        )}
      </Box>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setSelectedComments(comments.map(c => c._id));
                    } else {
                      setSelectedComments([]);
                    }
                  }}
                  checked={selectedComments.length === comments.length && comments.length > 0}
                />
              </TableCell>
              <TableCell>User</TableCell>
              <TableCell>Comment</TableCell>
              <TableCell>Blog</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {comments.map((comment) => (
              <TableRow key={comment._id}>
                <TableCell padding="checkbox">
                  <input
                    type="checkbox"
                    checked={selectedComments.includes(comment._id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedComments(prev => [...prev, comment._id]);
                      } else {
                        setSelectedComments(prev => prev.filter(id => id !== comment._id));
                      }
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Avatar src={comment.user?.avatar} sx={{ mr: 2, width: 32, height: 32 }}>
                      {comment.user?.name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                    <Box>
                      <Typography variant="body2">{comment.user?.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {comment.user?.email}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ maxWidth: 300 }}>
                    {comment.content.substring(0, 100)}
                    {comment.content.length > 100 && '...'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2">{comment.blog?.title}</Typography>
                </TableCell>
                <TableCell>
                  <Chip 
                    label={comment.status} 
                    color={comment.status === 'approved' ? 'success' : comment.status === 'rejected' ? 'error' : 'warning'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  <Button
                    size="small"
                    color="success"
                    onClick={() => handleCommentModeration(comment, 'approved')}
                    sx={{ mr: 1 }}
                    disabled={comment.status === 'approved'}
                  >
                    Approve
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => {
                      setSelectedItem(comment);
                      setModerationDialog(true);
                    }}
                    disabled={comment.status === 'rejected'}
                  >
                    Reject
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );

  const AnalyticsTab = () => (
    <Grid container spacing={3}>
      {/* Growth Metrics */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Growth Metrics (Last 30 Days)
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <PersonAdd sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {analytics.growth?.newUsersThisMonth || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    New Users
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Article sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {analytics.growth?.newBlogsThisMonth || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    New Blogs
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <Comment sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {analytics.growth?.newCommentsThisMonth || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    New Comments
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Box sx={{ textAlign: 'center', p: 2 }}>
                  <BookmarkAdd sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                    {analytics.growth?.newBookingsThisMonth || 0}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    New Bookings
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

      {/* User Role Distribution */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              User Role Distribution
            </Typography>
            {analytics.distributions?.userRoles?.map((role, index) => (
              <Box key={role._id} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                    {role._id}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {role.count}
                  </Typography>
                </Box>
                <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1 }}>
                  <Box
                    sx={{
                      width: `${(role.count / analytics.totalUsers) * 100}%`,
                      height: 8,
                      bgcolor: ['primary.main', 'success.main', 'warning.main'][index % 3],
                      borderRadius: 1
                    }}
                  />
                </Box>
              </Box>
            )) || (
              <Typography variant="body2" color="text.secondary">
                No data available
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Blog Status Distribution */}
      <Grid item xs={12} md={6}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Blog Status Distribution
            </Typography>
            {analytics.distributions?.blogStatuses?.map((status, index) => (
              <Box key={status._id} sx={{ mb: 2 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                    {status._id}
                  </Typography>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {status.count}
                  </Typography>
                </Box>
                <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1 }}>
                  <Box
                    sx={{
                      width: `${(status.count / analytics.totalBlogs) * 100}%`,
                      height: 8,
                      bgcolor: status._id === 'published' ? 'success.main' : 
                               status._id === 'draft' ? 'warning.main' : 'error.main',
                      borderRadius: 1
                    }}
                  />
                </Box>
              </Box>
            )) || (
              <Typography variant="body2" color="text.secondary">
                No data available
              </Typography>
            )}
          </CardContent>
        </Card>
      </Grid>

      {/* Recent Activity */}
      <Grid item xs={12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Recent Platform Activity
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Action</TableCell>
                    <TableCell>Target</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {userActivity.slice(0, 10).map((activity, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Chip
                          label={activity.type}
                          color={activity.type === 'blog' ? 'primary' : 
                                activity.type === 'comment' ? 'secondary' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <Avatar src={activity.user?.avatar} sx={{ mr: 1, width: 24, height: 24 }}>
                            {activity.user?.name?.charAt(0)}
                          </Avatar>
                          {activity.user?.name}
                        </Box>
                      </TableCell>
                      <TableCell>{activity.action}</TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {activity.target}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={activity.status}
                          color={activity.status === 'published' || activity.status === 'approved' ? 'success' :
                                activity.status === 'pending' ? 'warning' : 'default'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Revenue Overview */}
      {analytics.totalRevenue > 0 && (
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Revenue Overview
              </Typography>
              <Box sx={{ textAlign: 'center', py: 3 }}>
                <TrendingUp sx={{ fontSize: 60, color: 'success.main', mb: 2 }} />
                <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'success.main' }}>
                  ${analytics.totalRevenue?.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Total Revenue Generated
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      )}

      {/* Quick Stats */}
      <Grid item xs={12} md={analytics.totalRevenue > 0 ? 6 : 12}>
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Platform Statistics
            </Typography>
            <Stack spacing={2}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Average blogs per user:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {analytics.totalUsers > 0 ? (analytics.totalBlogs / analytics.totalUsers).toFixed(1) : 0}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Average comments per blog:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {analytics.totalBlogs > 0 ? (analytics.totalComments / analytics.totalBlogs).toFixed(1) : 0}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">Comments requiring moderation:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold', color: analytics.pendingComments > 0 ? 'warning.main' : 'success.main' }}>
                  {analytics.pendingComments}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography variant="body2">System uptime:</Typography>
                <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                  {analytics.systemHealth === 'Connected' ? 'Online' : 'Offline'}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );

  if (!user || user.role !== 'admin') {
    return null;
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Typography variant="h3" gutterBottom sx={{ fontWeight: 'bold', mb: 4 }}>
        Admin Panel
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

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={currentTab} onChange={(e, newValue) => setCurrentTab(newValue)}>
          <Tab icon={<Dashboard />} label="Dashboard" />
          <Tab icon={<People />} label="Users" />
          <Tab icon={<Article />} label="Blogs" />
          <Tab icon={<Comment />} label="Comments" />
          <Tab icon={<Analytics />} label="Analytics" />
        </Tabs>
      </Box>

      {/* Add Provider Management Link */}
      <Box sx={{ mb: 2 }}>
        <Button 
          variant="outlined" 
          color="primary"
          onClick={() => navigate('/admin/providers')}
          startIcon={<People />}
        >
          Manage Package Providers
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {currentTab === 0 && <DashboardTab />}
          {currentTab === 1 && <UsersTab />}
          {currentTab === 2 && <BlogsTab />}
          {currentTab === 3 && <CommentsTab />}
          {currentTab === 4 && <AnalyticsTab />}
        </>
      )}

      {/* Edit Blog Dialog */}
      <Dialog open={editBlogDialog} onClose={() => setEditBlogDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Edit Blog Post</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Title"
            defaultValue={selectedItem?.title}
            sx={{ mb: 2, mt: 1 }}
            id="blog-title"
          />
          <TextField
            fullWidth
            label="Excerpt"
            defaultValue={selectedItem?.excerpt}
            multiline
            rows={2}
            sx={{ mb: 2 }}
            id="blog-excerpt"
          />
          <TextField
            fullWidth
            label="Content"
            defaultValue={selectedItem?.content}
            multiline
            rows={6}
            sx={{ mb: 2 }}
            id="blog-content"
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Status</InputLabel>
            <Select defaultValue={selectedItem?.status} id="blog-status">
              <MenuItem value="draft">Draft</MenuItem>
              <MenuItem value="published">Published</MenuItem>
              <MenuItem value="archived">Archived</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Featured</InputLabel>
            <Select defaultValue={selectedItem?.featured || false} id="blog-featured">
              <MenuItem value={true}>Yes</MenuItem>
              <MenuItem value={false}>No</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditBlogDialog(false)}>Cancel</Button>
          <Button 
            onClick={() => {
              const title = document.getElementById('blog-title').value;
              const excerpt = document.getElementById('blog-excerpt').value;
              const content = document.getElementById('blog-content').value;
              const status = document.getElementById('blog-status').value;
              const featured = document.getElementById('blog-featured').value === 'true';
              handleBlogUpdate({ title, excerpt, content, status, featured });
            }} 
            variant="contained"
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={editUserDialog} onClose={() => setEditUserDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit User</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Name"
            defaultValue={selectedItem?.name}
            sx={{ mb: 2, mt: 1 }}
          />
          <TextField
            fullWidth
            label="Email"
            defaultValue={selectedItem?.email}
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Role</InputLabel>
            <Select defaultValue={selectedItem?.role}>
              <MenuItem value="visitor">Visitor</MenuItem>
              <MenuItem value="author">Author</MenuItem>
              <MenuItem value="admin">Admin</MenuItem>
            </Select>
          </FormControl>
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select defaultValue={selectedItem?.isActive}>
              <MenuItem value={true}>Active</MenuItem>
              <MenuItem value={false}>Inactive</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditUserDialog(false)}>Cancel</Button>
          <Button onClick={() => handleUserUpdate({})} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this {selectedItem?.type}? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>

      {/* Comment Moderation Dialog */}
      <Dialog open={moderationDialog} onClose={() => {
        setModerationDialog(false);
        setSelectedItem(null);
        setRejectionReason('');
      }}>
        <DialogTitle>Reject Comment</DialogTitle>
        <DialogContent>
          <Typography sx={{ mb: 2 }}>
            Why are you rejecting this comment?
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={3}
            placeholder="Reason for rejection..."
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setModerationDialog(false);
            setSelectedItem(null);
            setRejectionReason('');
          }}>Cancel</Button>
          <Button 
            onClick={() => handleCommentModeration(selectedItem, 'rejected', rejectionReason)} 
            color="error" 
            variant="contained"
            disabled={!selectedItem}
          >
            Reject
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminPanel;
