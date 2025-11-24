import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Switch,
  FormControlLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemSecondaryAction,
  Avatar,
  Chip,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  Divider,
  Link,
} from '@mui/material';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  YouTube,
  CloudSync,
  CalendarToday,
  WbSunny,
  Map,
  Flight,
  Hotel,
  CurrencyExchange,
  Language,
  Security,
  Settings,
  Check,
  Close,
  Link as LinkIcon,
  Refresh,
  Warning,
  AccessTime,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { getUserIntegrations, connectIntegration, disconnectIntegration, updateIntegrationSettings, syncIntegration } from '../api/integrations';

const IntegrationsPage = () => {
  const [integrations, setIntegrations] = useState([]);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [configDialog, setConfigDialog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessionTime, setSessionTime] = useState(0);
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      fetchIntegrations();
    }
  }, [token]);

  // Session time tracker
  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startTime) / 1000);
      setSessionTime(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    } else if (minutes > 0) {
      return `${minutes}m ${secs}s`;
    } else {
      return `${secs}s`;
    }
  };

  const fetchIntegrations = async () => {
    setLoading(true);
    try {
      const response = await getUserIntegrations();
      const integrationsData = response.integrations || [];
      setIntegrations(integrationsData);
      
      // Calculate real-time integration stats
      const connected = integrationsData.filter(i => i.connected).length;
      const active = integrationsData.filter(i => i.enabled).length;
      const totalSyncs = integrationsData.reduce((sum, i) => sum + (i.syncCount || 0), 0);
      const lastSyncTimes = integrationsData
        .filter(i => i.lastSync)
        .map(i => new Date(i.lastSync).getTime());
      
      const mostRecentSync = lastSyncTimes.length > 0 
        ? new Date(Math.max(...lastSyncTimes))
        : null;

      // Store integration analytics
      window.integrationStats = {
        connected,
        active,
        total: integrationsData.length,
        totalSyncs,
        mostRecentSync,
        dataTransferred: integrationsData.reduce((sum, i) => sum + (i.dataTransferred || 0), 0)
      };
    } catch (error) {
      console.error('Error fetching integrations:', error);
      // Set empty array instead of demo data
      setIntegrations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleIntegration = async (integrationId, enabled) => {
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/integrations/${integrationId}/toggle`,
        { enabled },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setIntegrations(integrations.map(integration =>
        integration.id === integrationId
          ? { ...integration, enabled }
          : integration
      ));
    } catch (error) {
      console.error('Error toggling integration:', error);
    }
  };

  const handleConnectIntegration = async (integrationId) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/integrations/${integrationId}/connect`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.authUrl) {
        window.open(response.data.authUrl, '_blank');
      }
    } catch (error) {
      console.error('Error connecting integration:', error);
    }
  };

  const handleDisconnectIntegration = async (integrationId) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/integrations/${integrationId}/disconnect`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setIntegrations(integrations.map(integration =>
        integration.id === integrationId
          ? { ...integration, connected: false, enabled: false, status: 'disconnected' }
          : integration
      ));
    } catch (error) {
      console.error('Error disconnecting integration:', error);
    }
  };

  const handleSyncNow = async (integrationId) => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/integrations/${integrationId}/sync`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      fetchIntegrations(); // Refresh data
    } catch (error) {
      console.error('Error syncing integration:', error);
    }
  };

  const getIntegrationIcon = (iconName) => {
    const icons = {
      Facebook: <Facebook />,
      Instagram: <Instagram />,
      Twitter: <Twitter />,
      LinkedIn: <LinkedIn />,
      YouTube: <YouTube />,
      CalendarToday: <CalendarToday />,
      WbSunny: <WbSunny />,
      Map: <Map />,
      Hotel: <Hotel />,
      CurrencyExchange: <CurrencyExchange />,
      Language: <Language />,
    };
    return icons[iconName] || <LinkIcon />;
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'disconnected': return 'error';
      case 'warning': return 'warning';
      case 'available': return 'default';
      default: return 'default';
    }
  };

  const groupedIntegrations = integrations.reduce((groups, integration) => {
    const category = integration.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(integration);
    return groups;
  }, {});

  const IntegrationCard = ({ integration }) => (
    <Card
      elevation={2}
      sx={{
        height: '100%',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            {getIntegrationIcon(integration.icon)}
          </Avatar>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6">{integration.name}</Typography>
            <Chip
              label={integration.status}
              size="small"
              color={getStatusColor(integration.status)}
            />
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" paragraph>
          {integration.description}
        </Typography>

        {integration.lastSync && (
          <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
            Last sync: {new Date(integration.lastSync).toLocaleString()}
          </Typography>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <FormControlLabel
            control={
              <Switch
                checked={integration.enabled}
                onChange={(e) => handleToggleIntegration(integration.id, e.target.checked)}
                disabled={!integration.connected}
              />
            }
            label="Enabled"
          />
          
          <Box>
            {integration.connected ? (
              <>
                <IconButton
                  size="small"
                  onClick={() => handleSyncNow(integration.id)}
                  title="Sync Now"
                >
                  <Refresh />
                </IconButton>
                <Button
                  size="small"
                  onClick={() => {
                    setSelectedIntegration(integration);
                    setConfigDialog(true);
                  }}
                >
                  Configure
                </Button>
              </>
            ) : (
              <Button
                size="small"
                variant="outlined"
                onClick={() => handleConnectIntegration(integration.id)}
              >
                Connect
              </Button>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading integrations...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
        🔌 Integrations & Connections
      </Typography>

      {/* Overview Stats */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="success.main">
              {integrations.filter(i => i.connected).length}
            </Typography>
            <Typography variant="body1">Connected</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="primary">
              {integrations.filter(i => i.enabled).length}
            </Typography>
            <Typography variant="body1">Active</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="secondary">
              {integrations.length}
            </Typography>
            <Typography variant="body1">Available</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Paper sx={{ p: 3, textAlign: 'center', bgcolor: 'primary.light', color: 'white' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1, mb: 1 }}>
              <AccessTime />
              <Typography variant="h5" fontWeight="bold">
                {formatTime(sessionTime)}
              </Typography>
            </Box>
            <Typography variant="body2">Session Time</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Real-Time Integration Usage Analytics */}
      {integrations.length > 0 && window.integrationStats && (
        <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: 'success.light', color: 'white' }}>
          <Typography variant="h6" gutterBottom fontWeight="bold">
            🔄 Integration Usage Analytics
          </Typography>
          <Grid container spacing={3} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={4}>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Total Syncs Completed
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {window.integrationStats.totalSyncs || 0}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Data Transferred
                </Typography>
                <Typography variant="h4" fontWeight="bold">
                  {window.integrationStats.dataTransferred 
                    ? `${(window.integrationStats.dataTransferred / 1024 / 1024).toFixed(2)} MB`
                    : '0 MB'}
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box>
                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                  Last Sync
                </Typography>
                <Typography variant="h6" fontWeight="bold">
                  {window.integrationStats.mostRecentSync 
                    ? window.integrationStats.mostRecentSync.toLocaleString()
                    : 'No syncs yet'}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>
      )}

      {/* Integration Categories */}
      {Object.entries(groupedIntegrations).map(([category, categoryIntegrations]) => (
        <Box key={category} sx={{ mb: 4 }}>
          <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
            {category}
          </Typography>
          <Grid container spacing={3}>
            {categoryIntegrations.map((integration) => (
              <Grid item xs={12} sm={6} md={4} key={integration.id}>
                <IntegrationCard integration={integration} />
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}

      {/* Configuration Dialog */}
      <Dialog
        open={configDialog}
        onClose={() => setConfigDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedIntegration && (
          <>
            <DialogTitle>
              Configure {selectedIntegration.name}
              <IconButton
                onClick={() => setConfigDialog(false)}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <Close />
              </IconButton>
            </DialogTitle>
            <DialogContent>
              <Alert severity="info" sx={{ mb: 2 }}>
                Configure settings for {selectedIntegration.name} integration
              </Alert>

              {selectedIntegration.id === 'facebook' && (
                <Box>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Auto-post new blog posts"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Include featured images"
                  />
                  <TextField
                    fullWidth
                    label="Post prefix"
                    placeholder="Check out my latest blog post:"
                    sx={{ mt: 2 }}
                  />
                </Box>
              )}

              {selectedIntegration.id === 'google-calendar' && (
                <Box>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Sync trip dates"
                  />
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Create travel reminders"
                  />
                  <TextField
                    fullWidth
                    select
                    label="Default calendar"
                    defaultValue="travel"
                    sx={{ mt: 2 }}
                  />
                </Box>
              )}

              {selectedIntegration.id === 'weather-api' && (
                <Box>
                  <FormControlLabel
                    control={<Switch defaultChecked />}
                    label="Include weather in posts"
                  />
                  <TextField
                    fullWidth
                    type="number"
                    label="Forecast days"
                    defaultValue={7}
                    sx={{ mt: 2 }}
                  />
                </Box>
              )}

              <Box sx={{ mt: 3 }}>
                <Button
                  color="error"
                  onClick={() => handleDisconnectIntegration(selectedIntegration.id)}
                  startIcon={<Close />}
                >
                  Disconnect
                </Button>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setConfigDialog(false)}>Cancel</Button>
              <Button variant="contained">Save Settings</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Help Section */}
      <Card elevation={3} sx={{ mt: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            ❓ Need Help?
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Having trouble with integrations? Check out our help documentation or contact support.
          </Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button variant="outlined" startIcon={<LinkIcon />}>
              View Documentation
            </Button>
            <Button variant="outlined" startIcon={<Security />}>
              Privacy & Security
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Container>
  );
};

export default IntegrationsPage;