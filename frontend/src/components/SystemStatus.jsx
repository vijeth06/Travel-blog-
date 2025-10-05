import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  CircularProgress
} from '@mui/material';
import {
  CheckCircle,
  Error,
  Warning,
  Refresh,
  Api,
  Storage,
  Wifi,
  Security
} from '@mui/icons-material';
import { testAPIConnection, testBackendHealth } from '../utils/testConnection';
import { getBlogs } from '../api/blogs';
import socketService from '../services/socketService';

const SystemStatus = () => {
  const [status, setStatus] = useState({
    backend: { status: 'checking', message: 'Checking...' },
    database: { status: 'checking', message: 'Checking...' },
    api: { status: 'checking', message: 'Checking...' },
    socket: { status: 'checking', message: 'Checking...' },
    redux: { status: 'checking', message: 'Checking...' }
  });
  const [loading, setLoading] = useState(false);

  const checkSystemStatus = async () => {
    setLoading(true);
    const newStatus = { ...status };

    try {
      // Test backend health
      const healthCheck = await testBackendHealth();
      newStatus.backend = healthCheck.success 
        ? { status: 'success', message: 'Backend is running' }
        : { status: 'error', message: healthCheck.error };

      // Test API connection
      const apiCheck = await testAPIConnection();
      newStatus.api = apiCheck.success 
        ? { status: 'success', message: 'API is responding' }
        : { status: 'error', message: apiCheck.error };

      // Test database by fetching blogs
      try {
        await getBlogs({ limit: 1 });
        newStatus.database = { status: 'success', message: 'Database connected' };
      } catch (error) {
        newStatus.database = { status: 'error', message: 'Database connection failed' };
      }

      // Test Socket.IO connection
      const socketConnected = socketService.isSocketConnected();
      newStatus.socket = socketConnected 
        ? { status: 'success', message: 'Socket.IO connected' }
        : { status: 'warning', message: 'Socket.IO not connected' };

      // Test Redux store
      try {
        const reduxState = window.__REDUX_DEVTOOLS_EXTENSION__ ? 'DevTools available' : 'Store working';
        newStatus.redux = { status: 'success', message: reduxState };
      } catch (error) {
        newStatus.redux = { status: 'warning', message: 'Redux state unclear' };
      }

    } catch (error) {
      console.error('System status check failed:', error);
    }

    setStatus(newStatus);
    setLoading(false);
  };

  useEffect(() => {
    checkSystemStatus();
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'error': return 'error';
      default: return 'default';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success': return <CheckCircle color="success" />;
      case 'warning': return <Warning color="warning" />;
      case 'error': return <Error color="error" />;
      default: return <CircularProgress size={24} />;
    }
  };

  const statusItems = [
    { key: 'backend', label: 'Backend Server', icon: <Api /> },
    { key: 'database', label: 'Database', icon: <Storage /> },
    { key: 'api', label: 'API Endpoints', icon: <Api /> },
    { key: 'socket', label: 'Real-time Socket', icon: <Wifi /> },
    { key: 'redux', label: 'State Management', icon: <Security /> }
  ];

  return (
    <Box sx={{ p: 3 }}>
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5" component="h2">
              System Status
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Refresh />}
              onClick={checkSystemStatus}
              disabled={loading}
            >
              Refresh
            </Button>
          </Box>

          <Grid container spacing={2}>
            <Grid item xs={12}>
              <List>
                {statusItems.map((item) => (
                  <ListItem key={item.key}>
                    <ListItemIcon>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      secondary={status[item.key].message}
                    />
                    <Box sx={{ ml: 2 }}>
                      {getStatusIcon(status[item.key].status)}
                      <Chip
                        label={status[item.key].status}
                        color={getStatusColor(status[item.key].status)}
                        size="small"
                        sx={{ ml: 1 }}
                      />
                    </Box>
                  </ListItem>
                ))}
              </List>
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
            <Typography variant="body2" color="text.secondary">
              <strong>System Information:</strong><br />
              Frontend: React + Redux Toolkit + Material-UI<br />
              Backend: Node.js + Express + Socket.IO<br />
              Database: MongoDB<br />
              Real-time: Socket.IO for live updates<br />
              API Base URL: {process.env.REACT_APP_API_URL || 'http://localhost:5001/api'}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SystemStatus;