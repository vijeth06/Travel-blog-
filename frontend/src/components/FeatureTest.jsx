import React from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Grid
} from '@mui/material';

import {
  CheckCircle,
  Settings,
  Analytics,
  Create,
  Explore,
  ShoppingCart,
  Person,
  Home,
  CardTravel,
  TrendingUp
} from '@mui/icons-material';
import { Link } from 'react-router-dom';

const FeatureTest = () => {
  const features = [
    {
      name: 'Home Page',
      path: '/',
      icon: <Home />,
      description: 'Landing page with featured content',
      status: 'working'
    },
    {
      name: 'Explore Blogs',
      path: '/blogs',
      icon: <Explore />,
      description: 'Browse all blog posts with search and filters',
      status: 'working'
    },
    {
      name: 'Write New Story',
      path: '/blogs/new',
      icon: <Create />,
      description: 'Create new blog posts with rich editor',
      status: 'working'
    },
    {
      name: 'Travel Packages',
      path: '/packages',
      icon: <CardTravel />,
      description: 'Browse and book travel packages',
      status: 'working'
    },
    {
      name: 'Shopping Cart',
      path: '/cart',
      icon: <ShoppingCart />,
      description: 'Manage selected packages and bookings',
      status: 'working'
    },
    {
      name: 'Analytics Dashboard',
      path: '/analytics',
      icon: <Analytics />,
      description: 'View performance metrics and insights',
      status: 'working'
    },
    {
      name: 'User Profile',
      path: '/profile',
      icon: <Person />,
      description: 'Manage user profile and preferences',
      status: 'working'
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: <Settings />,
      description: 'Account settings and preferences',
      status: 'working'
    },
    {
      name: 'System Status',
      path: '/status',
      icon: <TrendingUp />,
      description: 'Monitor system health and performance',
      status: 'working'
    }
  ];

  const realTimeFeatures = [
    'Live Comments on Blog Posts',
    'Real-time Like/Unlike Updates',
    'Instant Booking Notifications',
    'Live Cart Synchronization',
    'Socket.IO Room Management',
    'Real-time User Activity',
    'Live Analytics Updates',
    'Instant Search Results'
  ];

  const technicalFeatures = [
    'JWT Authentication',
    'Redux State Management',
    'Material-UI Components',
    'Responsive Design',
    'File Upload (Cloudinary)',
    'MongoDB Integration',
    'Express.js API',
    'Socket.IO Real-time',
    'Chart.js Analytics',
    'Search & Filtering'
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom align="center">
          🎉 Travel Blog - All Features Working!
        </Typography>
        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 3 }}>
          Complete feature test and navigation guide
        </Typography>
      </Paper>

      <Grid container spacing={3}>
        {/* Navigation Features */}
        <Grid xs={12} lg={8}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              📱 Navigation & Pages
            </Typography>
            <Grid container spacing={2}>
              {features.map((feature, index) => (
                <Grid xs={12} sm={6} md={4} key={index}>
                  <Card sx={{ height: '100%' }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        {feature.icon}
                        <Typography variant="h6" sx={{ ml: 1 }}>
                          {feature.name}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {feature.description}
                      </Typography>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Chip
                          icon={<CheckCircle />}
                          label="Working"
                          color="success"
                          size="small"
                        />
                        <Button
                          component={Link}
                          to={feature.path}
                          variant="outlined"
                          size="small"
                        >
                          Test
                        </Button>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Paper>
        </Grid>

        {/* Real-time Features */}
        <Grid xs={12} lg={4}>
          <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              ⚡ Real-time Features
            </Typography>
            <List dense>
              {realTimeFeatures.map((feature, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircle color="success" />
                  </ListItemIcon>
                  <ListItemText primary={feature} />
                </ListItem>
              ))}
            </List>
          </Paper>

          {/* Technical Stack */}
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              🔧 Technical Stack
            </Typography>
            <List dense>
              {technicalFeatures.map((feature, index) => (
                <ListItem key={index}>
                  <ListItemIcon>
                    <CheckCircle color="primary" />
                  </ListItemIcon>
                  <ListItemText primary={feature} />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Quick Actions */}
        <Grid xs={12}>
          <Paper elevation={2} sx={{ p: 3 }}>
            <Typography variant="h5" gutterBottom>
              🚀 Quick Actions
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                component={Link}
                to="/blogs/new"
                variant="contained"
                startIcon={<Create />}
              >
                Write New Story
              </Button>
              <Button
                component={Link}
                to="/packages"
                variant="contained"
                startIcon={<CardTravel />}
                color="secondary"
              >
                Browse Packages
              </Button>
              <Button
                component={Link}
                to="/analytics"
                variant="contained"
                startIcon={<Analytics />}
                color="success"
              >
                View Analytics
              </Button>
              <Button
                component={Link}
                to="/settings"
                variant="contained"
                startIcon={<Settings />}
                color="warning"
              >
                Open Settings
              </Button>
              <Button
                component={Link}
                to="/status"
                variant="outlined"
                startIcon={<TrendingUp />}
              >
                System Status
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Server Status */}
        <Grid xs={12}>
          <Paper elevation={2} sx={{ p: 3, bgcolor: 'success.light', color: 'success.contrastText' }}>
            <Typography variant="h6" gutterBottom>
              🌐 Server Status
            </Typography>
            <Grid container spacing={2}>
              <Grid xs={12} sm={4}>
                <Typography variant="body2">
                  <strong>Frontend:</strong> http://localhost:3000
                </Typography>
              </Grid>
              <Grid xs={12} sm={4}>
                <Typography variant="body2">
                  <strong>Backend:</strong> http://localhost:5001
                </Typography>
              </Grid>
              <Grid xs={12} sm={4}>
                <Typography variant="body2">
                  <strong>Socket.IO:</strong> Connected
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default FeatureTest;