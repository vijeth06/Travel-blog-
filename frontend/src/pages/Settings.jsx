import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Avatar,
  IconButton,
  Alert,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Chip,
  Slider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar,
  LinearProgress,
  RadioGroup,
  Radio,
  FormLabel,
  Stack,
  Tooltip,
  SpeedDial,
  SpeedDialAction,
  SpeedDialIcon
} from '@mui/material';
import {
  Settings as SettingsIcon,
  Person,
  Notifications,
  Security,
  Palette,
  Language,
  Storage,
  Save,
  Cancel,
  Edit,
  PhotoCamera,
  Backup,
  Download,
  Upload,
  Refresh,
  DarkMode,
  LightMode,
  VolumeUp,
  Email,
  Sms,
  NotificationsActive,
  Lock,
  Visibility,
  VisibilityOff,
  Delete,
  Remove,
  Star,
  Favorite,
  Share,
  Public
} from '@mui/icons-material';
import { useSelector, useDispatch } from 'react-redux';
import { styled, alpha, keyframes } from '@mui/material/styles';
import { updateUserProfile } from '../redux/authSlice';
import { changePassword } from '../api/auth';

// Custom animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-20px); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

// Styled components
const AnimatedCard = styled(Card)(({ theme }) => ({
  borderRadius: 20,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  animation: `${fadeIn} 0.6s ease-out`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  borderRadius: 25,
  background: 'linear-gradient(45deg, #FF6B35 30%, #F7931E 90%)',
  color: 'white',
  padding: '12px 30px',
  fontWeight: 600,
  textTransform: 'none',
  fontSize: '1rem',
  transition: 'all 0.3s ease',
  animation: `${pulse} 2s infinite`,
  '&:hover': {
    background: 'linear-gradient(45deg, #F7931E 30%, #FF6B35 90%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px 4px rgba(255, 107, 53, 0.4)',
  },
}));

const InteractiveSwitch = styled(Switch)(({ theme }) => ({
  '& .MuiSwitch-switchBase': {
    '&.Mui-checked': {
      color: '#FF6B35',
      '& + .MuiSwitch-track': {
        backgroundColor: '#FF6B35',
      },
    },
  },
  '& .MuiSwitch-track': {
    borderRadius: 26 / 2,
  },
}));

const ProfileAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  border: '4px solid #FF6B35',
  transition: 'all 0.3s ease',
  cursor: 'pointer',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: '0 8px 25px rgba(255, 107, 53, 0.4)',
  },
}));

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3, animation: `${slideIn} 0.5s ease-out` }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function Settings() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  // Profile settings
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    bio: '',
    location: '',
    website: '',
    avatar: ''
  });

  // Settings state
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: true,
      sms: false,
      marketing: false,
      volume: 70
    },
    privacy: {
      publicProfile: true,
      showEmail: false,
      showLocation: true,
      twoFactor: false
    },
    appearance: {
      theme: 'light',
      colorScheme: 'blue',
      fontSize: 'medium'
    },
    preferences: {
      language: 'en',
      timezone: 'Asia/Kolkata',
      currency: 'INR',
      dateFormat: 'DD/MM/YYYY'
    },
    data: {
      storageUsed: 2.4,
      storageLimit: 10,
      autoBackup: true,
      dataRetention: 365
    }
  });

  // Dialog states
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [photoDialog, setPhotoDialog] = useState(false);
  
  // Password change state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });

  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  // Language options with Indian languages
  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸', nativeName: 'English' },
    { code: 'hi', name: 'Hindi', flag: '🇮🇳', nativeName: 'हिन्दी' },
    { code: 'ta', name: 'Tamil', flag: '🇮🇳', nativeName: 'தமிழ்' },
    { code: 'te', name: 'Telugu', flag: '🇮🇳', nativeName: 'తెలుగు' },
    { code: 'bn', name: 'Bengali', flag: '🇮🇳', nativeName: 'বাংলা' },
    { code: 'mr', name: 'Marathi', flag: '🇮🇳', nativeName: 'मराठी' },
    { code: 'gu', name: 'Gujarati', flag: '🇮🇳', nativeName: 'ગુજરાતી' },
    { code: 'kn', name: 'Kannada', flag: '🇮🇳', nativeName: 'ಕನ್ನಡ' },
    { code: 'ml', name: 'Malayalam', flag: '🇮🇳', nativeName: 'മലയാളം' },
    { code: 'pa', name: 'Punjabi', flag: '🇮🇳', nativeName: 'ਪੰਜਾਬੀ' }
  ];

  // Currency options with Indian currencies
  const currencies = [
    { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
    { code: 'EUR', name: 'Euro', symbol: '€' },
    { code: 'GBP', name: 'British Pound', symbol: '£' },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥' }
  ];

  // Timezone options
  const timezones = [
    { code: 'Asia/Kolkata', name: 'India Standard Time (IST)' },
    { code: 'Asia/Dubai', name: 'Gulf Standard Time (GST)' },
    { code: 'Europe/London', name: 'Greenwich Mean Time (GMT)' },
    { code: 'America/New_York', name: 'Eastern Standard Time (EST)' },
    { code: 'America/Los_Angeles', name: 'Pacific Standard Time (PST)' }
  ];

  // Color schemes
  const colorSchemes = [
    { name: 'blue', color: '#1976d2', label: 'Ocean Blue' },
    { name: 'green', color: '#388e3c', label: 'Forest Green' },
    { name: 'orange', color: '#f57c00', label: 'Sunset Orange' },
    { name: 'purple', color: '#7b1fa2', label: 'Royal Purple' },
    { name: 'red', color: '#d32f2f', label: 'Crimson Red' }
  ];

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        bio: user.bio || '',
        location: user.location || '',
        website: user.website || '',
        avatar: user.avatar || ''
      });
    }
    
    // Load saved settings from localStorage
    const savedSettings = localStorage.getItem('userSettings');
    if (savedSettings) {
      const parsedSettings = JSON.parse(savedSettings);
      setSettings(prev => ({ ...prev, ...parsedSettings }));
      
      // Apply loaded settings immediately
      setTimeout(() => {
        applyThemeChanges();
        applyColorScheme();
        applyFontSize();
        document.documentElement.lang = parsedSettings.preferences?.language || 'en';
      }, 100);
    }
  }, [user]);

  // Apply settings changes in real-time
  useEffect(() => {
    applyThemeChanges();
    applyColorScheme();
    applyFontSize();
    document.documentElement.lang = settings.preferences.language;
  }, [settings.appearance.theme, settings.appearance.colorScheme, settings.appearance.fontSize, settings.preferences.language]);

  // Apply theme changes
  const applyThemeChanges = () => {
    const root = document.documentElement;
    
    if (settings.appearance.theme === 'dark') {
      root.classList.add('dark-theme');
      root.style.setProperty('--bg-color', '#121212');
      root.style.setProperty('--text-color', '#ffffff');
      root.style.setProperty('--card-bg', '#1e1e1e');
    } else if (settings.appearance.theme === 'light') {
      root.classList.remove('dark-theme');
      root.style.setProperty('--bg-color', '#ffffff');
      root.style.setProperty('--text-color', '#000000');
      root.style.setProperty('--card-bg', '#ffffff');
    } else {
      // Auto theme - detect system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark-theme');
        root.style.setProperty('--bg-color', '#121212');
        root.style.setProperty('--text-color', '#ffffff');
        root.style.setProperty('--card-bg', '#1e1e1e');
      } else {
        root.classList.remove('dark-theme');
        root.style.setProperty('--bg-color', '#ffffff');
        root.style.setProperty('--text-color', '#000000');
        root.style.setProperty('--card-bg', '#ffffff');
      }
    }
  };

  // Apply color scheme
  const applyColorScheme = () => {
    const root = document.documentElement;
    const scheme = colorSchemes.find(s => s.name === settings.appearance.colorScheme);
    if (scheme) {
      root.style.setProperty('--primary-color', scheme.color);
      root.style.setProperty('--accent-color', scheme.color);
    }
  };

  // Apply font size
  const applyFontSize = () => {
    const root = document.documentElement;
    const fontSizes = {
      small: '14px',
      medium: '16px',
      large: '18px'
    };
    root.style.setProperty('--base-font-size', fontSizes[settings.appearance.fontSize] || '16px');
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleProfileChange = (field) => (event) => {
    setProfile(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleSettingChange = (category, field) => (event) => {
    const value = event.target.type === 'checkbox' ? event.target.checked : event.target.value;
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [field]: value
      }
    }));
  };

  const handlePasswordChange = (field) => (event) => {
    setPasswordForm(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const togglePasswordVisibility = (field) => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await dispatch(updateUserProfile(profile)).unwrap();
      setSnackbar({ 
        open: true, 
        message: 'Profile updated successfully!', 
        severity: 'success' 
      });
    } catch (error) {
      console.error('Profile update error:', error);
      setSnackbar({ 
        open: true, 
        message: error.message || 'Failed to update profile', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Change password
  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setSnackbar({ 
        open: true, 
        message: 'New passwords do not match!', 
        severity: 'error' 
      });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setSnackbar({ 
        open: true, 
        message: 'Password must be at least 6 characters long!', 
        severity: 'error' 
      });
      return;
    }

    setLoading(true);
    try {
      const response = await changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      // The response should contain a message field
      setSnackbar({ 
        open: true, 
        message: response.message || 'Password changed successfully!', 
        severity: 'success' 
      });
      setPasswordDialog(false);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setShowPasswords({ current: false, new: false, confirm: false });
    } catch (error) {
      console.error('Password change error:', error);
      setSnackbar({ 
        open: true, 
        message: error.message || 'Failed to change password', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Save all settings
  const handleSaveSettings = async () => {
    setLoading(true);
    try {
      // Save to localStorage
      localStorage.setItem('userSettings', JSON.stringify(settings));
      
      // Apply theme changes immediately
      applyThemeChanges();
      
      // Apply language changes
      document.documentElement.lang = settings.preferences.language;
      
      // Apply color scheme changes
      applyColorScheme();
      
      // Apply font size changes
      applyFontSize();
      
      setSnackbar({ 
        open: true, 
        message: 'Settings saved successfully!', 
        severity: 'success' 
      });
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: 'Failed to save settings', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset settings
  const handleResetSettings = () => {
    setSettings({
      notifications: {
        email: true,
        push: true,
        sms: false,
        marketing: false,
        volume: 70
      },
      privacy: {
        publicProfile: true,
        showEmail: false,
        showLocation: true,
        twoFactor: false
      },
      appearance: {
        theme: 'light',
        colorScheme: 'blue',
        fontSize: 'medium'
      },
      preferences: {
        language: 'en',
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        dateFormat: 'DD/MM/YYYY'
      },
      data: {
        storageUsed: 2.4,
        storageLimit: 10,
        autoBackup: true,
        dataRetention: 365
      }
    });
    setSnackbar({ 
      open: true, 
      message: 'Settings reset to defaults!', 
      severity: 'info' 
    });
  };

  // Export settings
  const handleExportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'travel-blog-settings.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    
    setSnackbar({ 
      open: true, 
      message: 'Settings exported successfully!', 
      severity: 'success' 
    });
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ borderRadius: 4, overflow: 'hidden' }}>
        {/* Header */}
        <Box sx={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          p: 4,
          textAlign: 'center'
        }}>
          <SettingsIcon sx={{ fontSize: 60, mb: 2 }} />
          <Typography variant="h3" gutterBottom fontWeight={700}>
            Settings
          </Typography>
          <Typography variant="h6" sx={{ opacity: 0.9 }}>
            Customize your travel blog experience
          </Typography>
        </Box>

        {/* Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs 
            value={tabValue} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTab-root': {
                minWidth: 120,
                fontWeight: 600,
                textTransform: 'none',
                fontSize: '1rem'
              }
            }}
          >
            <Tab icon={<Person />} label="Profile" />
            <Tab icon={<Notifications />} label="Notifications" />
            <Tab icon={<Security />} label="Privacy & Security" />
            <Tab icon={<Palette />} label="Appearance" />
            <Tab icon={<Language />} label="Preferences" />
            <Tab icon={<Storage />} label="Data & Storage" />
          </Tabs>
        </Box>

        {/* Profile Tab */}
        <TabPanel value={tabValue} index={0}>
          <AnimatedCard>
            <CardContent>
              <Typography variant="h5" gutterBottom fontWeight={700}>
                Profile Information
              </Typography>
              
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
                <ProfileAvatar 
                  src={profile.avatar}
                  onClick={() => setPhotoDialog(true)}
                >
                  {profile.name?.charAt(0)?.toUpperCase()}
                </ProfileAvatar>
                <Box sx={{ ml: 3 }}>
                  <Typography variant="h6">{profile.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {profile.email}
                  </Typography>
                  <Button 
                    startIcon={<PhotoCamera />} 
                    onClick={() => setPhotoDialog(true)}
                    sx={{ mt: 1 }}
                  >
                    Change Photo
                  </Button>
                </Box>
              </Box>

              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Full Name"
                    value={profile.name}
                    onChange={handleProfileChange('name')}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Email"
                    value={profile.email}
                    onChange={handleProfileChange('email')}
                    variant="outlined"
                    type="email"
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Bio"
                    value={profile.bio}
                    onChange={handleProfileChange('bio')}
                    variant="outlined"
                    multiline
                    rows={3}
                    placeholder="Tell us about yourself..."
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Location"
                    value={profile.location}
                    onChange={handleProfileChange('location')}
                    variant="outlined"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Website"
                    value={profile.website}
                    onChange={handleProfileChange('website')}
                    variant="outlined"
                    placeholder="https://yourwebsite.com"
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                <GradientButton 
                  startIcon={<Save />} 
                  onClick={handleSaveProfile} 
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Changes'}
                </GradientButton>
                <Button variant="outlined" startIcon={<Cancel />}>
                  Cancel
                </Button>
              </Box>
            </CardContent>
          </AnimatedCard>
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel value={tabValue} index={1}>
          <AnimatedCard>
            <CardContent>
              <Typography variant="h5" gutterBottom fontWeight={700}>
                Notification Preferences
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon><Email /></ListItemIcon>
                  <ListItemText 
                    primary="Email Notifications" 
                    secondary="Receive updates via email"
                  />
                  <ListItemSecondaryAction>
                    <InteractiveSwitch
                      checked={settings.notifications.email}
                      onChange={handleSettingChange('notifications', 'email')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
                
                <ListItem>
                  <ListItemIcon><NotificationsActive /></ListItemIcon>
                  <ListItemText 
                    primary="Push Notifications" 
                    secondary="Browser push notifications"
                  />
                  <ListItemSecondaryAction>
                    <InteractiveSwitch
                      checked={settings.notifications.push}
                      onChange={handleSettingChange('notifications', 'push')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemIcon><Sms /></ListItemIcon>
                  <ListItemText 
                    primary="SMS Notifications" 
                    secondary="Text message alerts"
                  />
                  <ListItemSecondaryAction>
                    <InteractiveSwitch
                      checked={settings.notifications.sms}
                      onChange={handleSettingChange('notifications', 'sms')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemIcon><Star /></ListItemIcon>
                  <ListItemText 
                    primary="Marketing Updates" 
                    secondary="News and promotional content"
                  />
                  <ListItemSecondaryAction>
                    <InteractiveSwitch
                      checked={settings.notifications.marketing}
                      onChange={handleSettingChange('notifications', 'marketing')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Notification Volume
              </Typography>
              <Box sx={{ px: 2 }}>
                <Slider
                  value={settings.notifications.volume}
                  onChange={(e, value) => handleSettingChange('notifications', 'volume')({ target: { value } })}
                  valueLabelDisplay="auto"
                  step={10}
                  marks
                  min={0}
                  max={100}
                  sx={{
                    color: '#FF6B35',
                    '& .MuiSlider-thumb': {
                      backgroundColor: '#FF6B35',
                    },
                    '& .MuiSlider-track': {
                      backgroundColor: '#FF6B35',
                    },
                  }}
                />
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <VolumeUp sx={{ mr: 1 }} />
                  <Typography variant="body2">
                    Volume: {settings.notifications.volume}%
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </AnimatedCard>
        </TabPanel>

        {/* Privacy & Security Tab */}
        <TabPanel value={tabValue} index={2}>
          <AnimatedCard>
            <CardContent>
              <Typography variant="h5" gutterBottom fontWeight={700}>
                Privacy & Security Settings
              </Typography>
              
              <List>
                <ListItem>
                  <ListItemIcon><Public /></ListItemIcon>
                  <ListItemText 
                    primary="Public Profile" 
                    secondary="Make your profile visible to everyone"
                  />
                  <ListItemSecondaryAction>
                    <InteractiveSwitch
                      checked={settings.privacy.publicProfile}
                      onChange={handleSettingChange('privacy', 'publicProfile')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemIcon><Email /></ListItemIcon>
                  <ListItemText 
                    primary="Show Email" 
                    secondary="Display email on public profile"
                  />
                  <ListItemSecondaryAction>
                    <InteractiveSwitch
                      checked={settings.privacy.showEmail}
                      onChange={handleSettingChange('privacy', 'showEmail')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>

                <ListItem>
                  <ListItemIcon><Lock /></ListItemIcon>
                  <ListItemText 
                    primary="Two-Factor Authentication" 
                    secondary="Add extra security to your account"
                  />
                  <ListItemSecondaryAction>
                    <InteractiveSwitch
                      checked={settings.privacy.twoFactor}
                      onChange={handleSettingChange('privacy', 'twoFactor')}
                    />
                  </ListItemSecondaryAction>
                </ListItem>
              </List>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" gutterBottom>
                Account Security
              </Typography>
              
              <Stack spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<Lock />}
                  onClick={() => setPasswordDialog(true)}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Change Password
                </Button>
                
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<Delete />}
                  onClick={() => setDeleteDialog(true)}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Delete Account
                </Button>
              </Stack>
            </CardContent>
          </AnimatedCard>
        </TabPanel>

        {/* Appearance Tab */}
        <TabPanel value={tabValue} index={3}>
          <AnimatedCard>
            <CardContent>
              <Typography variant="h5" gutterBottom fontWeight={700}>
                Appearance Settings
              </Typography>
              
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Theme
                  </Typography>
                  <FormControl component="fieldset">
                    <RadioGroup
                      value={settings.appearance.theme}
                      onChange={handleSettingChange('appearance', 'theme')}
                    >
                      <FormControlLabel 
                        value="light" 
                        control={<Radio />} 
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <LightMode sx={{ mr: 1 }} />
                            Light Theme
                          </Box>
                        }
                      />
                      <FormControlLabel 
                        value="dark" 
                        control={<Radio />} 
                        label={
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <DarkMode sx={{ mr: 1 }} />
                            Dark Theme
                          </Box>
                        }
                      />
                      <FormControlLabel 
                        value="auto" 
                        control={<Radio />} 
                        label="Auto (System)"
                      />
                    </RadioGroup>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <Typography variant="h6" gutterBottom>
                    Color Scheme
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                    {colorSchemes.map((scheme) => (
                      <Tooltip key={scheme.name} title={scheme.label}>
                        <Box
                          onClick={() => handleSettingChange('appearance', 'colorScheme')({ target: { value: scheme.name } })}
                          sx={{
                            width: 50,
                            height: 50,
                            borderRadius: '50%',
                            backgroundColor: scheme.color,
                            cursor: 'pointer',
                            border: settings.appearance.colorScheme === scheme.name ? '4px solid #333' : '2px solid #ddd',
                            transition: 'all 0.3s ease',
                            '&:hover': {
                              transform: 'scale(1.1)',
                            }
                          }}
                        />
                      </Tooltip>
                    ))}
                  </Box>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Font Size
                  </Typography>
                  <FormControl fullWidth>
                    <Select
                      value={settings.appearance.fontSize}
                      onChange={handleSettingChange('appearance', 'fontSize')}
                    >
                      <MenuItem value="small">Small</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="large">Large</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            </CardContent>
          </AnimatedCard>
        </TabPanel>

        {/* Preferences Tab */}
        <TabPanel value={tabValue} index={4}>
          <AnimatedCard>
            <CardContent>
              <Typography variant="h5" gutterBottom fontWeight={700}>
                Language & Regional Preferences
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Language</InputLabel>
                    <Select
                      value={settings.preferences.language}
                      onChange={handleSettingChange('preferences', 'language')}
                      label="Language"
                    >
                      {languages.map((lang) => (
                        <MenuItem key={lang.code} value={lang.code}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span>{lang.flag}</span>
                            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                              <span>{lang.name}</span>
                              <span style={{ fontSize: '0.8em', color: '#666' }}>{lang.nativeName}</span>
                            </Box>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Currency</InputLabel>
                    <Select
                      value={settings.preferences.currency}
                      onChange={handleSettingChange('preferences', 'currency')}
                      label="Currency"
                    >
                      {currencies.map((currency) => (
                        <MenuItem key={currency.code} value={currency.code}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <span>{currency.symbol}</span>
                            <span>{currency.name} ({currency.code})</span>
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Timezone</InputLabel>
                    <Select
                      value={settings.preferences.timezone}
                      onChange={handleSettingChange('preferences', 'timezone')}
                      label="Timezone"
                    >
                      {timezones.map((tz) => (
                        <MenuItem key={tz.code} value={tz.code}>
                          {tz.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Date Format</InputLabel>
                    <Select
                      value={settings.preferences.dateFormat}
                      onChange={handleSettingChange('preferences', 'dateFormat')}
                      label="Date Format"
                    >
                      <MenuItem value="DD/MM/YYYY">DD/MM/YYYY (Indian)</MenuItem>
                      <MenuItem value="MM/DD/YYYY">MM/DD/YYYY (US)</MenuItem>
                      <MenuItem value="YYYY-MM-DD">YYYY-MM-DD (ISO)</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>

              <Box sx={{ mt: 3, p: 3, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Preview
                </Typography>
                <Typography variant="body1">
                  <strong>Language:</strong> {languages.find(l => l.code === settings.preferences.language)?.name} 
                  ({languages.find(l => l.code === settings.preferences.language)?.nativeName})
                </Typography>
                <Typography variant="body1">
                  <strong>Currency:</strong> {currencies.find(c => c.code === settings.preferences.currency)?.symbol} 
                  {currencies.find(c => c.code === settings.preferences.currency)?.name}
                </Typography>
                <Typography variant="body1">
                  <strong>Date Format:</strong> {new Date().toLocaleDateString(
                    settings.preferences.language === 'en' ? 'en-US' : 'en-IN', 
                    { 
                      day: '2-digit', 
                      month: '2-digit', 
                      year: 'numeric' 
                    }
                  )}
                </Typography>
                <Typography variant="body1">
                  <strong>Time:</strong> {new Date().toLocaleTimeString(
                    settings.preferences.language === 'en' ? 'en-US' : 'en-IN', 
                    { 
                      timeZone: settings.preferences.timezone,
                      hour12: settings.preferences.language !== 'en'
                    }
                  )}
                </Typography>
                <Typography variant="body1">
                  <strong>Timezone:</strong> {timezones.find(tz => tz.code === settings.preferences.timezone)?.name}
                </Typography>
              </Box>
            </CardContent>
          </AnimatedCard>
        </TabPanel>

        {/* Data & Storage Tab */}
        <TabPanel value={tabValue} index={5}>
          <AnimatedCard>
            <CardContent>
              <Typography variant="h5" gutterBottom fontWeight={700}>
                Data & Storage Management
              </Typography>
              
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 3, textAlign: 'center' }}>
                    <Storage sx={{ fontSize: 60, color: '#FF6B35', mb: 2 }} />
                    <Typography variant="h4" gutterBottom>
                      {settings.data.storageUsed} GB
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      of {settings.data.storageLimit} GB used
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(settings.data.storageUsed / settings.data.storageLimit) * 100}
                      sx={{ mt: 2, height: 8, borderRadius: 4 }}
                    />
                  </Paper>
                </Grid>

                <Grid item xs={12} md={6}>
                  <List>
                    <ListItem>
                      <ListItemIcon><Backup /></ListItemIcon>
                      <ListItemText 
                        primary="Auto Backup" 
                        secondary="Automatically backup your data"
                      />
                      <ListItemSecondaryAction>
                        <InteractiveSwitch
                          checked={settings.data.autoBackup}
                          onChange={handleSettingChange('data', 'autoBackup')}
                        />
                      </ListItemSecondaryAction>
                    </ListItem>
                  </List>
                </Grid>

                <Grid item xs={12}>
                  <Typography variant="h6" gutterBottom>
                    Data Management
                  </Typography>
                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    <Button
                      variant="outlined"
                      startIcon={<Download />}
                      onClick={handleExportSettings}
                    >
                      Export Data
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Upload />}
                    >
                      Import Data
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<Backup />}
                    >
                      Create Backup
                    </Button>
                    <Button
                      variant="outlined"
                      color="error"
                      startIcon={<Delete />}
                    >
                      Clear All Data
                    </Button>
                  </Stack>
                </Grid>
              </Grid>
            </CardContent>
          </AnimatedCard>
        </TabPanel>
      </Paper>

      {/* Speed Dial for Quick Actions */}
      <SpeedDial
        ariaLabel="Settings Actions"
        sx={{ position: 'fixed', bottom: 24, right: 24 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          icon={<Save />}
          tooltipTitle="Save All Settings"
          onClick={handleSaveSettings}
        />
        <SpeedDialAction
          icon={<Refresh />}
          tooltipTitle="Reset to Defaults"
          onClick={handleResetSettings}
        />
        <SpeedDialAction
          icon={<Download />}
          tooltipTitle="Export Settings"
          onClick={handleExportSettings}
        />
      </SpeedDial>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialog} onClose={() => setPasswordDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Password</DialogTitle>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Current Password"
              type={showPasswords.current ? 'text' : 'password'}
              value={passwordForm.currentPassword}
              onChange={handlePasswordChange('currentPassword')}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => togglePasswordVisibility('current')}>
                    {showPasswords.current ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                )
              }}
            />
            <TextField
              fullWidth
              label="New Password"
              type={showPasswords.new ? 'text' : 'password'}
              value={passwordForm.newPassword}
              onChange={handlePasswordChange('newPassword')}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => togglePasswordVisibility('new')}>
                    {showPasswords.new ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                )
              }}
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type={showPasswords.confirm ? 'text' : 'password'}
              value={passwordForm.confirmPassword}
              onChange={handlePasswordChange('confirmPassword')}
              InputProps={{
                endAdornment: (
                  <IconButton onClick={() => togglePasswordVisibility('confirm')}>
                    {showPasswords.confirm ? <VisibilityOff /> : <Visibility />}
                  </IconButton>
                )
              }}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPasswordDialog(false)}>Cancel</Button>
          <Button 
            onClick={handleChangePassword} 
            variant="contained" 
            disabled={loading}
          >
            {loading ? 'Changing...' : 'Change Password'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Photo Upload Dialog */}
      <Dialog open={photoDialog} onClose={() => setPhotoDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Change Profile Photo</DialogTitle>
        <DialogContent>
          <Box sx={{ textAlign: 'center', py: 3 }}>
            <ProfileAvatar 
              src={profile.avatar}
              sx={{ mx: 'auto', mb: 3 }}
            >
              {profile.name?.charAt(0)?.toUpperCase()}
            </ProfileAvatar>
            <Stack spacing={2}>
              <Button variant="outlined" startIcon={<Upload />}>
                Upload New Photo
              </Button>
              <Button variant="outlined" startIcon={<PhotoCamera />}>
                Take Photo
              </Button>
              <Button variant="outlined" color="error" startIcon={<Delete />}>
                Remove Photo
              </Button>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPhotoDialog(false)}>Cancel</Button>
          <Button variant="contained">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle color="error">Delete Account</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            This action cannot be undone. All your data will be permanently deleted.
          </Alert>
          <Typography variant="body1">
            Are you sure you want to delete your account? This will permanently remove:
          </Typography>
          <List>
            <ListItem>• All your travel stories and posts</ListItem>
            <ListItem>• Your profile and personal information</ListItem>
            <ListItem>• All comments and interactions</ListItem>
            <ListItem>• Your followers and following connections</ListItem>
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog(false)}>Cancel</Button>
          <Button variant="contained" color="error">
            Delete Account
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}