import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Avatar,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Tabs,
  Tab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Analytics as AnalyticsIcon,
  TrendingUp,
  Visibility,
  ThumbUp,
  Comment,
  Share,
  People,
  Article,
  BookmarkBorder,
  MoreVert,
  CalendarToday,
  Timeline,
  Assessment,
  Speed,
  EmojiEvents,
  LocationOn,
  Flight,
  Eco,
} from '@mui/icons-material';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const Analytics = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [loading, setLoading] = useState(true);

  // Mock data - replace with real API calls
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalViews: 12543,
      totalLikes: 892,
      totalComments: 234,
      totalShares: 156,
      totalFollowers: 1205,
      totalPosts: 45
    },
    viewsData: [
      { date: '2024-01-01', views: 120, likes: 15, comments: 8 },
      { date: '2024-01-02', views: 150, likes: 22, comments: 12 },
      { date: '2024-01-03', views: 180, likes: 28, comments: 15 },
      { date: '2024-01-04', views: 220, likes: 35, comments: 18 },
      { date: '2024-01-05', views: 190, likes: 30, comments: 14 },
      { date: '2024-01-06', views: 250, likes: 42, comments: 22 },
      { date: '2024-01-07', views: 280, likes: 48, comments: 25 }
    ],
    topPosts: [
      {
        id: 1,
        title: 'Amazing Journey Through the Alps',
        views: 2543,
        likes: 189,
        comments: 45,
        shares: 23,
        date: '2024-01-05'
      },
      {
        id: 2,
        title: 'Hidden Gems of Southeast Asia',
        views: 1876,
        likes: 156,
        comments: 32,
        shares: 18,
        date: '2024-01-03'
      },
      {
        id: 3,
        title: 'Budget Travel Tips for Europe',
        views: 1654,
        likes: 134,
        comments: 28,
        shares: 15,
        date: '2024-01-01'
      }
    ],
    audienceData: [
      { name: 'Desktop', value: 65, color: '#8884d8' },
      { name: 'Mobile', value: 30, color: '#82ca9d' },
      { name: 'Tablet', value: 5, color: '#ffc658' }
    ],
    geographyData: [
      { country: 'United States', visitors: 3245, percentage: 35 },
      { country: 'United Kingdom', visitors: 2156, percentage: 23 },
      { country: 'Germany', visitors: 1876, percentage: 20 },
      { country: 'France', visitors: 1234, percentage: 13 },
      { country: 'Others', visitors: 832, percentage: 9 }
    ]
  });

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 1000);
  }, [timeRange]);

  const StatCard = ({ title, value, change, icon, color = 'primary' }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="text.secondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" component="div">
              {value.toLocaleString()}
            </Typography>
            {change && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUp sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                <Typography variant="body2" color="success.main">
                  +{change}% from last period
                </Typography>
              </Box>
            )}
          </Box>
          <Avatar sx={{ bgcolor: `${color}.main`, width: 56, height: 56 }}>
            {icon}
          </Avatar>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <LinearProgress sx={{ mb: 2 }} />
          <Typography>Loading analytics...</Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Paper elevation={3} sx={{ mb: 3, overflow: 'hidden' }}>
        <Box sx={{ bgcolor: 'primary.main', color: 'white', p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <AnalyticsIcon sx={{ fontSize: 40 }} />
              <Box>
                <Typography variant="h4" component="h1">
                  Analytics Dashboard
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.9 }}>
                  Track your blog performance and audience insights
                </Typography>
              </Box>
            </Box>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel sx={{ color: 'white' }}>Time Range</InputLabel>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                sx={{ color: 'white', '& .MuiOutlinedInput-notchedOutline': { borderColor: 'white' } }}
              >
                <MenuItem value="7d">Last 7 days</MenuItem>
                <MenuItem value="30d">Last 30 days</MenuItem>
                <MenuItem value="90d">Last 90 days</MenuItem>
                <MenuItem value="1y">Last year</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Paper>

      {/* Overview Stats */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Total Views"
            value={analyticsData.overview.totalViews}
            change={12}
            icon={<Visibility />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Total Likes"
            value={analyticsData.overview.totalLikes}
            change={8}
            icon={<ThumbUp />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Comments"
            value={analyticsData.overview.totalComments}
            change={15}
            icon={<Comment />}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Shares"
            value={analyticsData.overview.totalShares}
            change={5}
            icon={<Share />}
            color="warning"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Followers"
            value={analyticsData.overview.totalFollowers}
            change={20}
            icon={<People />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2}>
          <StatCard
            title="Posts"
            value={analyticsData.overview.totalPosts}
            change={3}
            icon={<Article />}
            color="error"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Views Chart */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Views & Engagement Over Time
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={analyticsData.viewsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <RechartsTooltip />
                <Legend />
                <Area type="monotone" dataKey="views" stackId="1" stroke="#8884d8" fill="#8884d8" />
                <Area type="monotone" dataKey="likes" stackId="1" stroke="#82ca9d" fill="#82ca9d" />
                <Area type="monotone" dataKey="comments" stackId="1" stroke="#ffc658" fill="#ffc658" />
              </AreaChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Device Breakdown */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Device Breakdown
            </Typography>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analyticsData.audienceData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}%`}
                >
                  {analyticsData.audienceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
          </Paper>
        </Grid>

        {/* Top Posts */}
        <Grid item xs={12} lg={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Performing Posts
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Post Title</TableCell>
                    <TableCell align="right">Views</TableCell>
                    <TableCell align="right">Likes</TableCell>
                    <TableCell align="right">Comments</TableCell>
                    <TableCell align="right">Shares</TableCell>
                    <TableCell align="right">Date</TableCell>
                    <TableCell align="right">Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {analyticsData.topPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell component="th" scope="row">
                        <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                          {post.title}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">{post.views.toLocaleString()}</TableCell>
                      <TableCell align="right">{post.likes}</TableCell>
                      <TableCell align="right">{post.comments}</TableCell>
                      <TableCell align="right">{post.shares}</TableCell>
                      <TableCell align="right">{post.date}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small">
                          <MoreVert />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Geography */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Top Countries
            </Typography>
            <Box sx={{ mt: 2 }}>
              {analyticsData.geographyData.map((country, index) => (
                <Box key={index} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">{country.country}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {country.visitors.toLocaleString()} ({country.percentage}%)
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={country.percentage}
                    sx={{ height: 6, borderRadius: 3 }}
                  />
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Analytics;