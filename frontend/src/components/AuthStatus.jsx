import React from 'react';
import { useSelector } from 'react-redux';
import { 
  Paper, 
  Typography, 
  Box, 
  Chip, 
  Avatar,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import { 
  CheckCircle, 
  Cancel, 
  Person, 
  Email, 
  Token,
  Dashboard
} from '@mui/icons-material';

const AuthStatus = () => {
  const { user, isAuthenticated, token, loading, error } = useSelector((state) => state.auth);

  return (
    <Paper elevation={3} sx={{ p: 3, m: 2, maxWidth: 600 }}>
      <Typography variant="h6" gutterBottom>
        🔐 Authentication Status
      </Typography>
      
      <List>
        <ListItem>
          <ListItemIcon>
            {isAuthenticated ? <CheckCircle color="success" /> : <Cancel color="error" />}
          </ListItemIcon>
          <ListItemText 
            primary="Authentication Status"
            secondary={
              <Chip 
                label={isAuthenticated ? 'Authenticated' : 'Not Authenticated'} 
                color={isAuthenticated ? 'success' : 'error'}
                size="small"
              />
            }
          />
        </ListItem>

        <ListItem>
          <ListItemIcon>
            <Token />
          </ListItemIcon>
          <ListItemText 
            primary="Token Status"
            secondary={
              <Chip 
                label={token ? 'Token Present' : 'No Token'} 
                color={token ? 'success' : 'error'}
                size="small"
              />
            }
          />
        </ListItem>

        <ListItem>
          <ListItemIcon>
            <Person />
          </ListItemIcon>
          <ListItemText 
            primary="User Data"
            secondary={
              user ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
                  <Avatar src={user.avatar} sx={{ width: 24, height: 24 }}>
                    {user.name?.charAt(0)}
                  </Avatar>
                  <Typography variant="body2">{user.name}</Typography>
                </Box>
              ) : (
                <Chip label="No User Data" color="error" size="small" />
              )
            }
          />
        </ListItem>

        {user && (
          <ListItem>
            <ListItemIcon>
              <Email />
            </ListItemIcon>
            <ListItemText 
              primary="Email"
              secondary={user.email}
            />
          </ListItem>
        )}

        <ListItem>
          <ListItemIcon>
            <Dashboard />
          </ListItemIcon>
          <ListItemText 
            primary="Loading State"
            secondary={
              <Chip 
                label={loading ? 'Loading...' : 'Ready'} 
                color={loading ? 'warning' : 'success'}
                size="small"
              />
            }
          />
        </ListItem>

        {error && (
          <ListItem>
            <ListItemIcon>
              <Cancel color="error" />
            </ListItemIcon>
            <ListItemText 
              primary="Error"
              secondary={
                <Chip label={error} color="error" size="small" />
              }
            />
          </ListItem>
        )}
      </List>

      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
        <Typography variant="caption" color="text.secondary">
          <strong>Debug Info:</strong><br />
          • Redux State: {JSON.stringify({ isAuthenticated, hasUser: !!user, hasToken: !!token }, null, 2)}
        </Typography>
      </Box>
    </Paper>
  );
};

export default AuthStatus;