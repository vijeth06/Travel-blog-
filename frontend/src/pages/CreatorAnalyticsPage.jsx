import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  CircularProgress,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  LinearProgress
} from '@mui/material';
import {
  Visibility,
  ThumbUp,
  Comment,
  TrendingUp,
  Star,
  Collections,
  MonetizationOn,
  People
} from '@mui/icons-material';
import { getCreatorDashboard, getEngagementFunnel, getAudienceInsights } from '../api/analytics';

const CreatorAnalyticsPage = () => {
  const [loading, setLoading] = useState(true);
  const [dashboard, setDashboard] = useState(null);
  const [funnel, setFunnel] = useState(null);
  const [audience, setAudience] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [timeRange, setTimeRange] = useState(30);

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    if (activeTab === 1) {
      loadFunnel();
    } else if (activeTab === 2) {
      loadAudience();
    }
  }, [activeTab, timeRange]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const response = await getCreatorDashboard();
      setDashboard(response.data);
    } catch (error) {
      console.error('Failed to load dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadFunnel = async () => {
    try {
      const response = await getEngagementFunnel(timeRange);
      setFunnel(response.data);
    } catch (error) {
      console.error('Failed to load funnel:', error);
    }
  };

  const loadAudience = async () => {
    try {
      const response = await getAudienceInsights();
      setAudience(response.data);
    } catch (error) {
      console.error('Failed to load audience:', error);
    }
  };

  const StatCard = ({ title, value, icon, color, subtitle, trend }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box sx={{ flex: 1 }}>
            <Typography color="textSecondary" gutterBottom variant="body2">
              {title}
            </Typography>
            <Typography variant="h4" sx={{ color, fontWeight: 'bold', mb: 1 }}>
              {value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
            {trend !== undefined && (
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUp 
                  sx={{ 
                    fontSize: 16, 
                    mr: 0.5, 
                    color: trend >= 0 ? '#4caf50' : '#f44336' 
                  }} 
                />
                <Typography 
                  variant="caption" 
                  sx={{ color: trend >= 0 ? '#4caf50' : '#f44336' }}
                >
                  {trend >= 0 ? '+' : ''}{trend}% vs last period
                </Typography>
              </Box>
            )}
          </Box>
          <Box sx={{ 
            backgroundColor: `${color}20`, 
            borderRadius: 2, 
            p: 1.5,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!dashboard) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>No analytics data available</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
        Creator Analytics
      </Typography>

      <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Overview" />
        <Tab label="Engagement Funnel" />
        <Tab label="Audience Insights" />
      </Tabs>

      {activeTab === 0 && (
        <>
          {/* Content Stats */}
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
            Content Performance
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Views"
                value={dashboard.engagement.totalViews.toLocaleString()}
                icon={<Visibility sx={{ color: '#1976d2', fontSize: 32 }} />}
                color="#1976d2"
                subtitle={`${dashboard.engagement.avgViewsPerBlog} avg per blog`}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Reactions"
                value={dashboard.engagement.totalReactions.toLocaleString()}
                icon={<ThumbUp sx={{ color: '#2e7d32', fontSize: 32 }} />}
                color="#2e7d32"
                subtitle={`${dashboard.engagement.engagementRate}% engagement rate`}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Total Comments"
                value={dashboard.engagement.totalComments.toLocaleString()}
                icon={<Comment sx={{ color: '#ed6c02', fontSize: 32 }} />}
                color="#ed6c02"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Blogs Published"
                value={dashboard.content.totalBlogs}
                icon={<Star sx={{ color: '#9c27b0', fontSize: 32 }} />}
                color="#9c27b0"
                subtitle={`${dashboard.content.recentBlogs} this month`}
                trend={dashboard.growth.blogs.percentChange}
              />
            </Grid>
          </Grid>

          {/* Community & Monetization */}
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
            Community & Revenue
          </Typography>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Followers"
                value={dashboard.community.followers}
                icon={<People sx={{ color: '#d32f2f', fontSize: 32 }} />}
                color="#d32f2f"
                subtitle={`Following ${dashboard.community.following}`}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Collections"
                value={dashboard.collections.total}
                icon={<Collections sx={{ color: '#0288d1', fontSize: 32 }} />}
                color="#0288d1"
                subtitle={`${dashboard.collections.totalFollowers} followers`}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Premium Templates"
                value={dashboard.templates.total}
                icon={<MonetizationOn sx={{ color: '#f57c00', fontSize: 32 }} />}
                color="#f57c00"
                subtitle={`${dashboard.templates.purchases} purchases`}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <StatCard
                title="Revenue"
                value={`$${dashboard.templates.revenue.toLocaleString()}`}
                icon={<TrendingUp sx={{ color: '#388e3c', fontSize: 32 }} />}
                color="#388e3c"
                subtitle="From templates"
              />
            </Grid>
          </Grid>

          {/* Top Performing Content */}
          <Paper sx={{ p: 3, mb: 4 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              Top Performing Blogs
            </Typography>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell align="right">Views</TableCell>
                    <TableCell>Published</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dashboard.topPerforming.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} align="center">
                        No blogs yet. Start creating content!
                      </TableCell>
                    </TableRow>
                  ) : (
                    dashboard.topPerforming.map((blog, index) => (
                      <TableRow key={blog.id}>
                        <TableCell>{blog.title}</TableCell>
                        <TableCell align="right">{blog.views.toLocaleString()}</TableCell>
                        <TableCell>{new Date(blog.publishedAt).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          {/* Reaction Breakdown */}
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              Reaction Breakdown
            </Typography>
            <Grid container spacing={2}>
              {Object.entries(dashboard.engagement.reactionBreakdown).map(([type, count]) => (
                <Grid item xs={6} sm={4} md={3} key={type}>
                  <Box sx={{ textAlign: 'center', p: 2 }}>
                    <Typography variant="h5" color="primary" sx={{ fontWeight: 'bold' }}>
                      {count}
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ textTransform: 'capitalize' }}>
                      {type}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </>
      )}

      {activeTab === 1 && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              Engagement Funnel
            </Typography>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                label="Time Range"
              >
                <MenuItem value={7}>Last 7 days</MenuItem>
                <MenuItem value={30}>Last 30 days</MenuItem>
                <MenuItem value={90}>Last 90 days</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {funnel && (
            <Paper sx={{ p: 4 }}>
              {funnel.funnel.map((stage, index) => (
                <Box key={stage.stage} sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="h6">{stage.stage}</Typography>
                    <Typography variant="h6" color="primary">
                      {stage.count.toLocaleString()}
                    </Typography>
                  </Box>
                  <LinearProgress 
                    variant="determinate" 
                    value={stage.percentage} 
                    sx={{ height: 10, borderRadius: 1, mb: 1 }}
                  />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2" color="textSecondary">
                      {stage.percentage}% of total views
                    </Typography>
                    {stage.conversionRate !== undefined && (
                      <Typography variant="body2" color="textSecondary">
                        {stage.conversionRate}% conversion from previous stage
                      </Typography>
                    )}
                  </Box>
                </Box>
              ))}
            </Paper>
          )}
        </>
      )}

      {activeTab === 2 && (
        <>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
            Audience Insights
          </Typography>

          {audience && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    Top Countries
                  </Typography>
                  <List>
                    {audience.topCountries.length === 0 ? (
                      <Typography color="textSecondary">No audience data yet</Typography>
                    ) : (
                      audience.topCountries.map((country, index) => (
                        <ListItem key={index} divider>
                          <ListItemText 
                            primary={country.country}
                            secondary={`${country.count} engagements`}
                          />
                        </ListItem>
                      ))
                    )}
                  </List>
                </Paper>
              </Grid>

              <Grid item xs={12} md={6}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                    Top Engagers
                  </Typography>
                  <List>
                    {audience.topEngagers.length === 0 ? (
                      <Typography color="textSecondary">No engagement data yet</Typography>
                    ) : (
                      audience.topEngagers.map((engager, index) => (
                        <ListItem key={index} divider>
                          <ListItemText 
                            primary={engager.name}
                            secondary={`${engager.engagement} interactions`}
                          />
                        </ListItem>
                      ))
                    )}
                  </List>
                </Paper>
              </Grid>

              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                          {audience.totalFollowers}
                        </Typography>
                        <Typography color="textSecondary">Total Followers</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                          {audience.totalEngagers}
                        </Typography>
                        <Typography color="textSecondary">Unique Engagers</Typography>
                      </Box>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <Box sx={{ textAlign: 'center' }}>
                        <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold' }}>
                          {audience.topCountries.length}
                        </Typography>
                        <Typography color="textSecondary">Countries Reached</Typography>
                      </Box>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            </Grid>
          )}
        </>
      )}
    </Container>
  );
};

export default CreatorAnalyticsPage;
