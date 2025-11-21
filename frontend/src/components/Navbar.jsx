import React, { useState, useEffect } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Box,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  InputBase,
  Badge
} from '@mui/material';
import {
  Menu as MenuIcon,
  Home,
  Article,
  Dashboard,
  Person,
  Settings,
  Logout,
  Login,
  PersonAdd,
  TravelExplore,
  ShoppingCart,
  Map,
  Analytics,
  AdminPanelSettings,
  Search,
  Explore,
  Create,
  Bookmark,
  FlightTakeoff,
  Notifications,
  Star,
  CardTravel,
  Dashboard as DashboardIcon,
  BookOnline,
  Favorite,
  EmojiEvents,
  SmartToy,
  School,
  Diamond,
  Extension,
  PhoneAndroid,
  Map as MapIcon,
  CollectionsBookmark,
  ChatBubble,
  PhotoLibrary,
  EventNote,
  RateReview
} from '@mui/icons-material';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, getUserProfile } from '../redux/authSlice';
import { styled, alpha } from '@mui/material/styles';
import NotificationBell from './NotificationBell';

// Simplified search component
const SearchWrapper = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 25,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.2)',
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

// Simplified button styles
const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #FF6B35 30%, #F7931E 90%)',
  border: 0,
  borderRadius: 25,
  color: 'white',
  padding: '8px 16px',
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.2s ease',
  '&:hover': {
    background: 'linear-gradient(45deg, #F7931E 30%, #FF6B35 90%)',
    transform: 'translateY(-1px)',
  },
}));

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { user, isAuthenticated, token } = useSelector((state) => state.auth);

  useEffect(() => {
    // Check if user is authenticated and fetch profile if token exists
    if (token && !user) {
      dispatch(getUserProfile());
    }

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dispatch, token, user]);

  const handleLogout = () => {
    dispatch(logout());
    setAnchorEl(null);
    navigate('/');
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      height: '100%',
      color: 'white'
    }}>
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <FlightTakeoff sx={{ fontSize: 40, color: 'white', mb: 1 }} />
        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
          TravelBlog
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Explore • Share • Inspire
        </Typography>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
      <List sx={{ pt: 1 }}>
        <ListItem component={Link} to="/" onClick={handleDrawerToggle} sx={{
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
          borderRadius: 1,
          mx: 1,
          mb: 0.5
        }}>
          <ListItemIcon><Home sx={{ color: 'white' }} /></ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>
        {isAuthenticated && (
          <ListItem component={Link} to="/feed" onClick={handleDrawerToggle} sx={{
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
            borderRadius: 1,
            mx: 1,
            mb: 0.5
          }}>
            <ListItemIcon><DashboardIcon sx={{ color: 'white' }} /></ListItemIcon>
            <ListItemText primary="Social Feed" />
          </ListItem>
        )}
        <ListItem component={Link} to="/blogs" onClick={handleDrawerToggle} sx={{
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
          borderRadius: 1,
          mx: 1,
          mb: 0.5
        }}>
          <ListItemIcon><Explore sx={{ color: 'white' }} /></ListItemIcon>
          <ListItemText primary="Explore" />
        </ListItem>
        <ListItem component={Link} to="/packages" onClick={handleDrawerToggle} sx={{
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
          borderRadius: 1,
          mx: 1,
          mb: 0.5
        }}>
          <ListItemIcon><CardTravel sx={{ color: 'white' }} /></ListItemIcon>
          <ListItemText primary="Packages" />
        </ListItem>
        <ListItem component={Link} to="/continents" onClick={handleDrawerToggle} sx={{
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
          borderRadius: 1,
          mx: 1,
          mb: 0.5
        }}>
          <ListItemIcon><TravelExplore sx={{ color: 'white' }} /></ListItemIcon>
          <ListItemText primary="Continents" />
        </ListItem>
        <ListItem component={Link} to="/favorite-places" onClick={handleDrawerToggle} sx={{
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
          borderRadius: 1,
          mx: 1,
          mb: 0.5
        }}>
          <ListItemIcon><Favorite sx={{ color: 'white' }} /></ListItemIcon>
          <ListItemText primary="Favorite Places" />
        </ListItem>
        {user && (
          <ListItem component={Link} to="/trips" onClick={handleDrawerToggle} sx={{
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
            borderRadius: 1,
            mx: 1,
            mb: 0.5
          }}>
            <ListItemIcon><MapIcon sx={{ color: 'white' }} /></ListItemIcon>
            <ListItemText primary="My Trips" />
          </ListItem>
        )}
        {user && (
          <ListItem component={Link} to="/collections" onClick={handleDrawerToggle} sx={{
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
            borderRadius: 1,
            mx: 1,
            mb: 0.5
          }}>
            <ListItemIcon><CollectionsBookmark sx={{ color: 'white' }} /></ListItemIcon>
            <ListItemText primary="Collections" />
          </ListItem>
        )}
        {user && (
          <ListItem component={Link} to="/chat" onClick={handleDrawerToggle} sx={{
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
            borderRadius: 1,
            mx: 1,
            mb: 0.5
          }}>
            <ListItemIcon><ChatBubble sx={{ color: 'white' }} /></ListItemIcon>
            <ListItemText primary="Messages" />
          </ListItem>
        )}
        {user && (
          <ListItem component={Link} to="/gallery" onClick={handleDrawerToggle} sx={{
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
            borderRadius: 1,
            mx: 1,
            mb: 0.5
          }}>
            <ListItemIcon><PhotoLibrary sx={{ color: 'white' }} /></ListItemIcon>
            <ListItemText primary="Gallery & Stories" />
          </ListItem>
        )}
        {user && (
          <ListItem component={Link} to="/itinerary" onClick={handleDrawerToggle} sx={{
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
            borderRadius: 1,
            mx: 1,
            mb: 0.5
          }}>
            <ListItemIcon><EventNote sx={{ color: 'white' }} /></ListItemIcon>
            <ListItemText primary="Itineraries" />
          </ListItem>
        )}
        {user && (
          <ListItem component={Link} to="/reviews" onClick={handleDrawerToggle} sx={{
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
            borderRadius: 1,
            mx: 1,
            mb: 0.5
          }}>
            <ListItemIcon><RateReview sx={{ color: 'white' }} /></ListItemIcon>
            <ListItemText primary="My Reviews" />
          </ListItem>
        )}
        {user && (
          <ListItem component={Link} to="/premium-templates" onClick={handleDrawerToggle} sx={{
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
            borderRadius: 1,
            mx: 1,
            mb: 0.5
          }}>
            <ListItemIcon><Diamond sx={{ color: 'white' }} /></ListItemIcon>
            <ListItemText primary="Premium Templates" />
          </ListItem>
        )}
        {user && (
          <ListItem component={Link} to="/topics" onClick={handleDrawerToggle} sx={{
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
            borderRadius: 1,
            mx: 1,
            mb: 0.5
          }}>
            <ListItemIcon><Explore sx={{ color: 'white' }} /></ListItemIcon>
            <ListItemText primary="Topics" />
          </ListItem>
        )}
        {user && (
          <ListItem component={Link} to="/badges" onClick={handleDrawerToggle} sx={{
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
            borderRadius: 1,
            mx: 1,
            mb: 0.5
          }}>
            <ListItemIcon><EmojiEvents sx={{ color: 'white' }} /></ListItemIcon>
            <ListItemText primary="My Badges" />
          </ListItem>
        )}
        {user && (
          <ListItem component={Link} to="/traveler-dashboard" onClick={handleDrawerToggle} sx={{
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
            borderRadius: 1,
            mx: 1,
            mb: 0.5
          }}>
            <ListItemIcon><DashboardIcon sx={{ color: 'white' }} /></ListItemIcon>
            <ListItemText primary="My Dashboard" />
          </ListItem>
        )}
        {user && (
          <ListItem component={Link} to="/creator-analytics" onClick={handleDrawerToggle} sx={{
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
            borderRadius: 1,
            mx: 1,
            mb: 0.5
          }}>
            <ListItemIcon><Analytics sx={{ color: 'white' }} /></ListItemIcon>
            <ListItemText primary="Creator Analytics" />
          </ListItem>
        )}
        {user && (
          <>
            <ListItem component={Link} to="/blogs/new" onClick={handleDrawerToggle} sx={{ 
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
              borderRadius: 1,
              mx: 1,
              mb: 0.5
            }}>
              <ListItemIcon><Create sx={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary="Write Story" />
            </ListItem>
            <ListItem component={Link} to="/dashboard" onClick={handleDrawerToggle} sx={{ 
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
              borderRadius: 1,
              mx: 1,
              mb: 0.5
            }}>
              <ListItemIcon><DashboardIcon sx={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            {user?.role === 'package_provider' && (
              <ListItem component={Link} to="/provider/dashboard" onClick={handleDrawerToggle} sx={{ 
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                borderRadius: 1,
                mx: 1,
                mb: 0.5
              }}>
                <ListItemIcon><Business sx={{ color: 'white' }} /></ListItemIcon>
                <ListItemText primary="Provider Dashboard" />
              </ListItem>
            )}
            <ListItem component={Link} to="/analytics" onClick={handleDrawerToggle} sx={{ 
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
              borderRadius: 1,
              mx: 1,
              mb: 0.5
            }}>
              <ListItemIcon><Analytics sx={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary="Analytics" />
            </ListItem>
            <ListItem component={Link} to="/admin/bookings" onClick={handleDrawerToggle} sx={{ 
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
              borderRadius: 1,
              mx: 1,
              mb: 0.5
            }}>
              <ListItemIcon><BookOnline sx={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary="Manage Bookings" />
            </ListItem>
          </>
        )}
        <ListItem component={Link} to="/profile" onClick={handleDrawerToggle} sx={{ 
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
          borderRadius: 1,
          mx: 1,
          mb: 0.5
        }}>
          <ListItemIcon><Person sx={{ color: 'white' }} /></ListItemIcon>
          <ListItemText primary="Profile" />
        </ListItem>
        <ListItem component={Link} to="/status" onClick={handleDrawerToggle} sx={{ 
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
          borderRadius: 1,
          mx: 1,
          mb: 0.5
        }}>
          <ListItemIcon><Settings sx={{ color: 'white' }} /></ListItemIcon>
          <ListItemText primary="System Status" />
        </ListItem>
        {user && (
          <ListItem component={Link} to="/settings" onClick={handleDrawerToggle} sx={{ 
            '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
            borderRadius: 1,
            mx: 1,
            mb: 0.5
          }}>
            <ListItemIcon><Settings sx={{ color: 'white' }} /></ListItemIcon>
            <ListItemText primary="Settings" />
          </ListItem>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="fixed" 
        sx={{ 
          background: scrolled 
            ? 'linear-gradient(135deg, rgba(30, 136, 229, 0.95) 0%, rgba(66, 165, 245, 0.95) 100%)'
            : 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
          backdropFilter: scrolled ? 'blur(10px)' : 'none',
          boxShadow: scrolled 
            ? '0 4px 20px rgba(0,0,0,0.1)'
            : '0 2px 10px rgba(102, 126, 234, 0.3)',
          transition: 'all 0.3s ease',
          zIndex: 1200
        }}
      >
        <Toolbar sx={{ minHeight: scrolled ? 60 : 70, transition: 'all 0.3s ease' }}>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ 
              mr: 2, 
              display: { sm: 'none' },
              color: 'rgba(255,255,255,0.9)',
              '&:hover': { 
                backgroundColor: 'rgba(255,255,255,0.1)',
                color: 'white'
              }
            }}
          >
            <MenuIcon sx={{ fontSize: 20 }} />
          </IconButton>

          <Box sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <FlightTakeoff sx={{ 
              fontSize: scrolled ? 28 : 32, 
              color: 'white',
              display: { xs: 'none', sm: 'block' },
              transition: 'all 0.3s ease'
            }} />
            <Box sx={{ ml: 1 }}>
              <Typography 
                variant={scrolled ? "h6" : "h5"} 
                component={Link} 
                to="/" 
                sx={{ 
                  textDecoration: 'none', 
                  color: 'white',
                  fontWeight: 'bold',
                  display: { xs: 'none', sm: 'block' },
                  transition: 'all 0.3s ease'
                }}
              >
                TravelBlog
              </Typography>
            </Box>
          </Box>

          <SearchWrapper>
            <SearchIconWrapper>
              <Search sx={{ color: 'rgba(255,255,255,0.8)', fontSize: 18 }} />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search destinations, stories..."
              inputProps={{ 'aria-label': 'search' }}
              sx={{ 
                color: 'rgba(255,255,255,0.9)',
                '& .MuiInputBase-input::placeholder': {
                  color: 'rgba(255,255,255,0.7)',
                  opacity: 1
                }
              }}
            />
          </SearchWrapper>
          
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', ml: 'auto' }}>
            {/* Navigation Links */}
            <Box sx={{ display: 'flex', gap: 0.5, mr: 2 }}>
              {isAuthenticated && (
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/feed"
                  sx={{ 
                    color: 'rgba(255,255,255,0.9)',
                    '&:hover': { color: 'white' },
                    fontSize: '0.85rem',
                    minWidth: 'auto',
                    px: 1
                  }}
                >
                  <DashboardIcon sx={{ mr: 0.5, fontSize: 18 }} />
                  Feed
                </Button>
              )}
              
              <Button 
                color="inherit" 
                component={Link} 
                to="/blogs"
                sx={{ 
                  color: 'rgba(255,255,255,0.9)',
                  '&:hover': { color: 'white' },
                  fontSize: '0.85rem',
                  minWidth: 'auto',
                  px: 1
                }}
              >
                <Explore sx={{ mr: 0.5, fontSize: 18 }} />
                Explore
              </Button>

              <Button 
                color="inherit" 
                component={Link} 
                to="/packages"
                sx={{ 
                  color: 'rgba(255,255,255,0.9)',
                  '&:hover': { color: 'white' },
                  fontSize: '0.85rem',
                  minWidth: 'auto',
                  px: 1
                }}
              >
                <CardTravel sx={{ mr: 0.5, fontSize: 18 }} />
                Packages
              </Button>

              <Button 
                color="inherit" 
                component={Link} 
                to="/continents"
                sx={{ 
                  color: 'rgba(255,255,255,0.9)',
                  '&:hover': { color: 'white' },
                  fontSize: '0.85rem',
                  minWidth: 'auto',
                  px: 1
                }}
              >
                <TravelExplore sx={{ mr: 0.5, fontSize: 18 }} />
                Continents
              </Button>

              {user && (
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/trips"
                  sx={{ 
                    color: 'rgba(255,255,255,0.9)',
                    '&:hover': { color: 'white' },
                  fontSize: '0.85rem',
                  minWidth: 'auto',
                  px: 1
                }}
              >
                <MapIcon sx={{ mr: 0.5, fontSize: 18 }} />
                My Trips
              </Button>
              )}
              {user && (
                <Button
                  component={Link}
                  to="/collections"
                  color="inherit"
                  size="small"
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.85rem',
                    minWidth: 'auto',
                    px: 1,
                    color: 'rgba(255,255,255,0.9)',
                    '&:hover': { color: 'white' }
                  }}
                >
                  <CollectionsBookmark sx={{ mr: 0.5, fontSize: 18 }} />
                  Collections
                </Button>
              )}
              {user && (
                <Button
                  component={Link}
                  to="/chat"
                  color="inherit"
                  size="small"
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.85rem',
                    minWidth: 'auto',
                    px: 1,
                    color: 'rgba(255,255,255,0.9)',
                    '&:hover': { color: 'white' }
                  }}
                >
                  <ChatBubble sx={{ mr: 0.5, fontSize: 18 }} />
                  Chat
                </Button>
              )}
              {user && (
                <Button
                  component={Link}
                  to="/gallery"
                  color="inherit"
                  size="small"
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.85rem',
                    minWidth: 'auto',
                    px: 1,
                    color: 'rgba(255,255,255,0.9)',
                    '&:hover': { color: 'white' }
                  }}
                >
                  <PhotoLibrary sx={{ mr: 0.5, fontSize: 18 }} />
                  Gallery
                </Button>
              )}
              {user && (
                <Button
                  component={Link}
                  to="/itinerary"
                  color="inherit"
                  size="small"
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.85rem',
                    minWidth: 'auto',
                    px: 1,
                    color: 'rgba(255,255,255,0.9)',
                    '&:hover': { color: 'white' }
                  }}
                >
                  <EventNote sx={{ mr: 0.5, fontSize: 18 }} />
                  Itinerary
                </Button>
              )}
              {user && (
                <Button
                  component={Link}
                  to="/reviews"
                  color="inherit"
                  size="small"
                  sx={{
                    textTransform: 'none',
                    fontSize: '0.85rem',
                    minWidth: 'auto',
                    px: 1,
                    color: 'rgba(255,255,255,0.9)',
                    '&:hover': { color: 'white' }
                  }}
                >
                  <RateReview sx={{ mr: 0.5, fontSize: 18 }} />
                  Reviews
                </Button>
              )}
            </Box>
            
            {user ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {/* Write Story Button */}
                <GradientButton component={Link} to="/blogs/new" size="small">
                  <Create sx={{ mr: 0.5, fontSize: 18 }} />
                  Write Story
                </GradientButton>
                
                {/* Action Icons */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mx: 1 }}>
                  <NotificationBell />

                  <IconButton 
                    color="inherit" 
                    component={Link} 
                    to="/cart"
                    aria-label="Open cart"
                    sx={{ 
                      color: 'rgba(255,255,255,0.9)',
                      '&:hover': { 
                        backgroundColor: 'rgba(255,255,255,0.1)',
                        color: 'white'
                      }
                    }}
                  >
                    <Badge badgeContent={0} color="error">
                      <ShoppingCart sx={{ fontSize: 20 }} />
                    </Badge>
                  </IconButton>
                </Box>
                
                {/* User Profile Button */}
                <Button
                  color="inherit"
                  onClick={handleMenuOpen}
                  startIcon={
                    <Avatar sx={{ 
                      width: 28, 
                      height: 28, 
                      fontSize: '0.8rem',
                      background: 'linear-gradient(45deg, #FF6B35, #F7931E)',
                      border: '2px solid rgba(255,255,255,0.3)'
                    }}>
                      {user.name?.charAt(0)?.toUpperCase()}
                    </Avatar>
                  }
                  sx={{ 
                    borderRadius: 25,
                    color: 'rgba(255,255,255,0.9)',
                    textTransform: 'none',
                    fontWeight: 500,
                    px: 1.5,
                    '&:hover': { 
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      color: 'white'
                    }
                  }}
                >
                  {user.name}
                </Button>
                
                <Menu
                  anchorEl={anchorEl}
                  open={Boolean(anchorEl)}
                  onClose={handleMenuClose}
                  anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'right',
                  }}
                  transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                  }}
                  PaperProps={{
                    sx: {
                      borderRadius: 2,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                      border: '1px solid rgba(0,0,0,0.05)',
                      background: 'linear-gradient(135deg, #fff 0%, #f8f9fa 100%)',
                    }
                  }}
                >
                  <MenuItem 
                    component={Link} 
                    to="/profile" 
                    onClick={handleMenuClose}
                    sx={{ py: 1, '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }}
                  >
                    <Person sx={{ mr: 1.5, fontSize: 18, color: '#666' }} />
                    Profile
                  </MenuItem>
                  <MenuItem 
                    component={Link} 
                    to="/dashboard" 
                    onClick={handleMenuClose}
                    sx={{ py: 1, '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }}
                  >
                    <DashboardIcon sx={{ mr: 1.5, fontSize: 18, color: '#666' }} />
                    Dashboard
                  </MenuItem>
                  <MenuItem 
                    component={Link} 
                    to="/analytics" 
                    onClick={handleMenuClose}
                    sx={{ py: 1, '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }}
                  >
                    <Analytics sx={{ mr: 1.5, fontSize: 18, color: '#666' }} />
                    Analytics
                  </MenuItem>
                  <MenuItem 
                    component={Link} 
                    to="/saved" 
                    onClick={handleMenuClose}
                    sx={{ py: 1, '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }}
                  >
                    <Bookmark sx={{ mr: 1.5, fontSize: 18, color: '#666' }} />
                    Saved Stories
                  </MenuItem>
                  <MenuItem 
                    component={Link} 
                    to="/gamification" 
                    onClick={handleMenuClose}
                    sx={{ py: 1, '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }}
                  >
                    <EmojiEvents sx={{ mr: 1.5, fontSize: 18, color: '#FFD700' }} />
                    Achievements
                  </MenuItem>
                  <MenuItem 
                    component={Link} 
                    to="/ai-recommendations" 
                    onClick={handleMenuClose}
                    sx={{ py: 1, '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }}
                  >
                    <SmartToy sx={{ mr: 1.5, fontSize: 18, color: '#2196F3' }} />
                    AI Recommendations
                  </MenuItem>
                  <MenuItem 
                    component={Link} 
                    to="/certificates" 
                    onClick={handleMenuClose}
                    sx={{ py: 1, '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }}
                  >
                    <School sx={{ mr: 1.5, fontSize: 18, color: '#4CAF50' }} />
                    Certificates
                  </MenuItem>
                  <MenuItem 
                    component={Link} 
                    to="/premium" 
                    onClick={handleMenuClose}
                    sx={{ py: 1, '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }}
                  >
                    <Diamond sx={{ mr: 1.5, fontSize: 18, color: '#9C27B0' }} />
                    Premium
                  </MenuItem>
                  <MenuItem 
                    component={Link} 
                    to="/integrations" 
                    onClick={handleMenuClose}
                    sx={{ py: 1, '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }}
                  >
                    <Extension sx={{ mr: 1.5, fontSize: 18, color: '#FF5722' }} />
                    Integrations
                  </MenuItem>
                  <MenuItem 
                    component={Link} 
                    to="/mobile" 
                    onClick={handleMenuClose}
                    sx={{ py: 1, '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }}
                  >
                    <PhoneAndroid sx={{ mr: 1.5, fontSize: 18, color: '#607D8B' }} />
                    Mobile
                  </MenuItem>
                  <MenuItem 
                    component={Link} 
                    to="/settings" 
                    onClick={handleMenuClose}
                    sx={{ py: 1, '&:hover': { backgroundColor: 'rgba(0,0,0,0.04)' } }}
                  >
                    <Settings sx={{ mr: 1.5, fontSize: 18, color: '#666' }} />
                    Settings
                  </MenuItem>
                  <Divider sx={{ my: 0.5 }} />
                  <MenuItem 
                    onClick={handleLogout}
                    sx={{ 
                      py: 1, 
                      color: '#d32f2f',
                      '&:hover': { backgroundColor: 'rgba(211, 47, 47, 0.04)' } 
                    }}
                  >
                    <Logout sx={{ mr: 1.5, fontSize: 18, color: '#d32f2f' }} />
                    Logout
                  </MenuItem>
                </Menu>
              </Box>
            ) : (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Button 
                  color="inherit" 
                  component={Link} 
                  to="/login"
                  sx={{ 
                    color: 'rgba(255,255,255,0.9)',
                    '&:hover': { color: 'white' },
                    fontSize: '0.85rem',
                    minWidth: 'auto',
                    px: 1
                  }}
                >
                  <Login sx={{ mr: 0.5, fontSize: 18 }} />
                  Login
                </Button>
                <GradientButton component={Link} to="/register" size="small">
                  <Star sx={{ mr: 0.5, fontSize: 18 }} />
                  Join Now
                </GradientButton>
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* Spacer for fixed navbar */}
      <Box sx={{ height: scrolled ? 60 : 70, transition: 'all 0.3s ease' }} />

      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { 
            boxSizing: 'border-box', 
            width: 250,
            borderRadius: '0 16px 16px 0',
            border: 'none',
            boxShadow: '0 4px 16px rgba(0,0,0,0.2)'
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}