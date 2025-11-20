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
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemAvatar,
  ListItemSecondaryAction,
  Divider,
  Chip,
  Avatar,
  IconButton,
  Badge,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon,
  BottomNavigation,
  BottomNavigationAction,
  Fab,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Smartphone,
  Notifications,
  CloudOff,
  LocationOn,
  Sync,
  Storage,
  Settings,
  Speed,
  Accessibility,
  Article,
  DarkMode,
  LightMode,
  Home,
  Search,
  Favorite,
  Person,
  Add,
  Share,
  Download,
  Camera,
  Map,
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import { getMobileSettings, updateMobileSettings, getOfflineContent, getMobileMetrics, clearMobileCache } from '../api/mobile';

const MobilePage = () => {
  const [mobileSettings, setMobileSettings] = useState({
    offlineMode: false,
    pushNotifications: true,
    locationServices: true,
    autoSync: true,
    dataCompression: true,
    darkMode: false,
  });
  const [cacheSize, setCacheSize] = useState(0);
  const [offlineContent, setOfflineContent] = useState([]);
  const [bottomNavValue, setBottomNavValue] = useState(0);
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      fetchMobileSettings();
      fetchOfflineContent();
      calculateCacheSize();
    }
  }, [token]);

  const fetchMobileSettings = async () => {
    try {
      const response = await getMobileSettings();
      setMobileSettings({
        offlineMode: response.settings?.offlineMode || false,
        pushNotifications: response.settings?.pushNotifications !== false,
        locationServices: response.settings?.locationServices !== false,
        autoSync: response.settings?.autoSync !== false,
        dataCompression: response.settings?.dataCompression !== false,
        darkMode: response.settings?.darkMode || false
      });
    } catch (error) {
      console.error('Error fetching mobile settings:', error);
      // Keep default settings
    }
  };

  const fetchOfflineContent = async () => {
    try {
      const response = await getOfflineContent();
      setOfflineContent(response.content || []);
    } catch (error) {
      console.error('Error fetching offline content:', error);
      setOfflineContent([]);
    }
  };

  const calculateCacheSize = async () => {
    try {
      const response = await getMobileMetrics();
      setCacheSize(response.cacheSize || 0);
    } catch (error) {
      console.error('Error calculating cache size:', error);
      setCacheSize(0);
    }
  };

  const handleSettingChange = async (setting, value) => {
    const newSettings = { ...mobileSettings, [setting]: value };
    setMobileSettings(newSettings);
    
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/mobile/settings`,
        { settings: newSettings },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Error updating mobile settings:', error);
    }
  };

  const handleClearCache = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/mobile/clear-cache`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setCacheSize(0);
    } catch (error) {
      console.error('Error clearing cache:', error);
    }
  };

  const handleSyncContent = async () => {
    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/mobile/sync`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchOfflineContent();
    } catch (error) {
      console.error('Error syncing content:', error);
    }
  };

  const speedDialActions = [
    { icon: <Camera />, name: 'Quick Photo', action: () => {} },
    { icon: <Add />, name: 'New Blog', action: () => {} },
    { icon: <LocationOn />, name: 'Check In', action: () => {} },
    { icon: <Share />, name: 'Share Location', action: () => {} },
  ];

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
        📱 Mobile Experience
      </Typography>

      {/* Mobile Features Overview */}
      <Grid container spacing={4} sx={{ mb: 4 }}>
        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Smartphone color="primary" sx={{ mr: 1 }} />
                <Typography variant="h5">Mobile Optimization</Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Enhanced mobile experience with offline support, push notifications, and optimized performance.
              </Typography>
              <Chip
                label={isMobile ? "Mobile Device Detected" : "Desktop View"}
                color={isMobile ? "success" : "info"}
                icon={<Smartphone />}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={6}>
          <Card elevation={3}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Speed color="secondary" sx={{ mr: 1 }} />
                <Typography variant="h5">Performance Stats</Typography>
              </Box>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="success.main">98</Typography>
                    <Typography variant="caption">Speed Score</Typography>
                  </Paper>
                </Grid>
                <Grid item xs={6}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h4" color="primary">{cacheSize}</Typography>
                    <Typography variant="caption">Cache (MB)</Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Mobile Settings */}
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            ⚙️ Mobile Settings
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <CloudOff />
              </ListItemIcon>
              <ListItemText
                primary="Offline Mode"
                secondary="Download content for offline viewing"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={mobileSettings.offlineMode}
                  onChange={(e) => handleSettingChange('offlineMode', e.target.checked)}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            
            <ListItem>
              <ListItemIcon>
                <Notifications />
              </ListItemIcon>
              <ListItemText
                primary="Push Notifications"
                secondary="Get notified about new content and updates"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={mobileSettings.pushNotifications}
                  onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            
            <ListItem>
              <ListItemIcon>
                <LocationOn />
              </ListItemIcon>
              <ListItemText
                primary="Location Services"
                secondary="Enable location-based features and recommendations"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={mobileSettings.locationServices}
                  onChange={(e) => handleSettingChange('locationServices', e.target.checked)}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            
            <ListItem>
              <ListItemIcon>
                <Sync />
              </ListItemIcon>
              <ListItemText
                primary="Auto Sync"
                secondary="Automatically sync content when connected to WiFi"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={mobileSettings.autoSync}
                  onChange={(e) => handleSettingChange('autoSync', e.target.checked)}
                />
              </ListItemSecondaryAction>
            </ListItem>
            <Divider />
            
            <ListItem>
              <ListItemIcon>
                <Storage />
              </ListItemIcon>
              <ListItemText
                primary="Data Compression"
                secondary="Compress images and data to save bandwidth"
              />
              <ListItemSecondaryAction>
                <Switch
                  checked={mobileSettings.dataCompression}
                  onChange={(e) => handleSettingChange('dataCompression', e.target.checked)}
                />
              </ListItemSecondaryAction>
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Offline Content */}
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h5">
              📦 Offline Content
            </Typography>
            <Button
              variant="contained"
              startIcon={<Sync />}
              onClick={handleSyncContent}
            >
              Sync Now
            </Button>
          </Box>
          
          <List>
            {offlineContent.map((item) => (
              <React.Fragment key={item.id}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {item.type === 'blog' && <Article />}
                      {item.type === 'photos' && <Camera />}
                      {item.type === 'map' && <Map />}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={item.title}
                    secondary={`${item.size} • Last synced: ${item.lastSync}`}
                  />
                  <ListItemSecondaryAction>
                    <IconButton>
                      <Download />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </List>
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Total cache: {cacheSize} MB
            </Typography>
            <Button
              variant="outlined"
              size="small"
              onClick={handleClearCache}
            >
              Clear Cache
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Mobile-Specific Features Demo */}
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            📲 Mobile Features Demo
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            Experience mobile-specific features designed for travel blogging on the go.
          </Typography>
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Camera />}
                sx={{ mb: 1 }}
              >
                Quick Camera
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<LocationOn />}
                sx={{ mb: 1 }}
              >
                Location Check-in
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Share />}
                sx={{ mb: 1 }}
              >
                Quick Share
              </Button>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                fullWidth
                variant="outlined"
                startIcon={<Add />}
                sx={{ mb: 1 }}
              >
                Voice Note
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Mobile Bottom Navigation Demo */}
      {isMobile && (
        <Paper
          sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000 }}
          elevation={3}
        >
          <BottomNavigation
            value={bottomNavValue}
            onChange={(event, newValue) => setBottomNavValue(newValue)}
          >
            <BottomNavigationAction label="Home" icon={<Home />} />
            <BottomNavigationAction label="Search" icon={<Search />} />
            <BottomNavigationAction 
              label="Favorites" 
              icon={
                <Badge badgeContent={4} color="error">
                  <Favorite />
                </Badge>
              } 
            />
            <BottomNavigationAction label="Profile" icon={<Person />} />
          </BottomNavigation>
        </Paper>
      )}

      {/* Speed Dial for Mobile Actions */}
      <SpeedDial
        ariaLabel="Mobile Actions"
        sx={{ position: 'fixed', bottom: isMobile ? 80 : 16, right: 16 }}
        icon={<SpeedDialIcon />}
        open={speedDialOpen}
        onClose={() => setSpeedDialOpen(false)}
        onOpen={() => setSpeedDialOpen(true)}
      >
        {speedDialActions.map((action) => (
          <SpeedDialAction
            key={action.name}
            icon={action.icon}
            tooltipTitle={action.name}
            onClick={() => {
              action.action();
              setSpeedDialOpen(false);
            }}
          />
        ))}
      </SpeedDial>

      {/* Mobile Spacing for Bottom Navigation */}
      {isMobile && <Box sx={{ height: 80 }} />}
    </Container>
  );
};

export default MobilePage;