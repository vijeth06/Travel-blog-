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
  FlightTakeoff
} from '@mui/icons-material';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logout, getUserProfile } from '../redux/authSlice';
import { styled, alpha, keyframes } from '@mui/material/styles';
import NotificationCenter from './NotificationCenter';

// Custom animations
const float = keyframes`
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-5px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const SearchWrapper = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: 25,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  backdropFilter: 'blur(10px)',
  border: '1px solid rgba(255,255,255,0.2)',
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
    transform: 'scale(1.02)',
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  transition: 'all 0.3s ease',
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
    padding: theme.spacing(1.5, 1, 1.5, 0),
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '25ch',
    },
  },
}));

const FloatingIcon = styled(Box)(({ theme }) => ({
  animation: `${float} 3s ease-in-out infinite`,
  position: 'relative',
  '&::before': {
    content: '""',
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: '100%',
    height: '100%',
    background: 'radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%)',
    borderRadius: '50%',
    transform: 'translate(-50%, -50%)',
    animation: `${pulse} 2s ease-in-out infinite`,
  }
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(45deg, #FF6B35 30%, #F7931E 90%)',
  border: 0,
  borderRadius: 25,
  boxShadow: '0 3px 15px 2px rgba(255, 107, 53, 0.3)',
  color: 'white',
  padding: '10px 24px',
  fontWeight: 600,
  textTransform: 'none',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'linear-gradient(45deg, #F7931E 30%, #FF6B35 90%)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 20px 4px rgba(255, 107, 53, 0.4)',
  },
}));

export default function Navbar() {
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { user, isAuthenticated, token } = useSelector((state) => state.auth);

  useEffect(() => {
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

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/blogs?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery('');
    }
  };

  const drawer = (
    <Box sx={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      height: '100%',
      color: 'white'
    }}>
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <FloatingIcon>
          <FlightTakeoff sx={{ fontSize: 50, color: 'white', mb: 2 }} />
        </FloatingIcon>
        <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 1 }}>
          TravelBlog
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          Explore • Share • Inspire
        </Typography>
      </Box>
      <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)' }} />
      <List sx={{ pt: 2 }}>
        <ListItem component={Link} to="/" onClick={handleDrawerToggle} sx={{ 
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
          borderRadius: 2,
          mx: 1,
          mb: 1
        }}>
          <ListItemIcon><Home sx={{ color: 'white' }} /></ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem component={Link} to="/blogs" onClick={handleDrawerToggle} sx={{
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
          borderRadius: 2,
          mx: 1,
          mb: 1
        }}>
          <ListItemIcon><Explore sx={{ color: 'white' }} /></ListItemIcon>
          <ListItemText primary="Explore" />
        </ListItem>
        <ListItem component={Link} to="/packages" onClick={handleDrawerToggle} sx={{
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
          borderRadius: 2,
          mx: 1,
          mb: 1
        }}>
          <ListItemIcon><TravelExplore sx={{ color: 'white' }} /></ListItemIcon>
          <ListItemText primary="Packages" />
        </ListItem>
        <ListItem component={Link} to="/map" onClick={handleDrawerToggle} sx={{
          '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
          borderRadius: 2,
          mx: 1,
          mb: 1
        }}>
          <ListItemIcon><Map sx={{ color: 'white' }} /></ListItemIcon>
          <ListItemText primary="Map" />
        </ListItem>
        {user && (
          <>
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.2)', my: 2 }} />
            <ListItem component={Link} to="/blogs/new" onClick={handleDrawerToggle} sx={{ 
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
              borderRadius: 2,
              mx: 1,
              mb: 1
            }}>
              <ListItemIcon><Create sx={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary="Write Story" />
            </ListItem>
            <ListItem component={Link} to="/dashboard" onClick={handleDrawerToggle} sx={{ 
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
              borderRadius: 2,
              mx: 1,
              mb: 1
            }}>
              <ListItemIcon><Dashboard sx={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem component={Link} to="/saved" onClick={handleDrawerToggle} sx={{ 
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
              borderRadius: 2,
              mx: 1,
              mb: 1
            }}>
              <ListItemIcon><Bookmark sx={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary="Saved" />
            </ListItem>
            <ListItem component={Link} to="/cart" onClick={handleDrawerToggle} sx={{ 
              '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
              borderRadius: 2,
              mx: 1,
              mb: 1
            }}>
              <ListItemIcon><ShoppingCart sx={{ color: 'white' }} /></ListItemIcon>
              <ListItemText primary="Cart" />
            </ListItem>
            {user.role === 'admin' && (
              <ListItem component={Link} to="/admin" onClick={handleDrawerToggle} sx={{ 
                '&:hover': { backgroundColor: 'rgba(255,255,255,0.1)' },
                borderRadius: 2,
                mx: 1,
                mb: 1
              }}>
                <ListItemIcon><AdminPanelSettings sx={{ color: 'white' }} /></ListItemIcon>
                <ListItemText primary="Admin" />
              </ListItem>
            )}
          </>
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
            ? 'rgba(30, 136, 229, 0.95)' 
            : 'linear-gradient(135deg, #1E88E5 0%, #1565C0 100%)',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          transition: 'all 0.3s ease',
          boxShadow: scrolled ? '0 8px 32px rgba(0,0,0,0.12)' : '0 2px 20px rgba(0,0,0,0.1)'
        }}
      >
        <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
          {isMobile && (
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2 }}
            >
              <MenuIcon />
            </IconButton>
          )}

          <Box 
            component={Link} 
            to="/" 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              textDecoration: 'none', 
              color: 'inherit',
              '&:hover': { opacity: 0.8 }
            }}
          >
            <FloatingIcon sx={{ mr: 1 }}>
              <FlightTakeoff sx={{ fontSize: 32 }} />
            </FloatingIcon>
            <Typography
              variant="h6"
              component="div"
              sx={{
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #FFF 30%, #E3F2FD 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: { xs: 'none', sm: 'block' }
              }}
            >
              TravelBlog
            </Typography>
          </Box>

          {!isMobile && (
            <Box sx={{ display: 'flex', ml: 4, gap: 1 }}>
              <Button color="inherit" component={Link} to="/" sx={{ textTransform: 'none' }}>
                Home
              </Button>
              <Button color="inherit" component={Link} to="/blogs" sx={{ textTransform: 'none' }}>
                Explore
              </Button>
              <Button color="inherit" component={Link} to="/packages" sx={{ textTransform: 'none' }}>
                Packages
              </Button>
              <Button color="inherit" component={Link} to="/map" sx={{ textTransform: 'none' }}>
                Map
              </Button>
            </Box>
          )}

          <Box sx={{ flexGrow: 1 }} />

          {/* Search Bar */}
          <SearchWrapper>
            <SearchIconWrapper>
              <Search />
            </SearchIconWrapper>
            <form onSubmit={handleSearch}>
              <StyledInputBase
                placeholder="Search destinations, stories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                inputProps={{ 'aria-label': 'search' }}
              />
            </form>
          </SearchWrapper>

          {isAuthenticated && user ? (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {/* Notification Center */}
              <NotificationCenter />

              {/* Cart Icon */}
              <IconButton color="inherit" component={Link} to="/cart">
                <Badge badgeContent={0} color="error">
                  <ShoppingCart />
                </Badge>
              </IconButton>

              {/* User Menu */}
              <IconButton onClick={handleMenuOpen} sx={{ p: 0, ml: 1 }}>
                <Avatar 
                  src={user.profilePicture} 
                  alt={user.name}
                  sx={{ 
                    width: 40, 
                    height: 40,
                    border: '2px solid rgba(255,255,255,0.3)',
                    '&:hover': { 
                      border: '2px solid rgba(255,255,255,0.8)',
                      transform: 'scale(1.05)'
                    },
                    transition: 'all 0.2s ease'
                  }}
                >
                  {user.name?.charAt(0)}
                </Avatar>
              </IconButton>

              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: {
                    mt: 1.5,
                    minWidth: 200,
                    borderRadius: 2,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.12)'
                  }
                }}
              >
                <MenuItem onClick={() => { navigate('/profile'); handleMenuClose(); }}>
                  <Person sx={{ mr: 2 }} />
                  Profile
                </MenuItem>
                <MenuItem onClick={() => { navigate('/dashboard'); handleMenuClose(); }}>
                  <Dashboard sx={{ mr: 2 }} />
                  Dashboard
                </MenuItem>
                <MenuItem onClick={() => { navigate('/settings'); handleMenuClose(); }}>
                  <Settings sx={{ mr: 2 }} />
                  Settings
                </MenuItem>
                {user.role === 'admin' && (
                  <MenuItem onClick={() => { navigate('/admin'); handleMenuClose(); }}>
                    <AdminPanelSettings sx={{ mr: 2 }} />
                    Admin Panel
                  </MenuItem>
                )}
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <Logout sx={{ mr: 2 }} />
                  Logout
                </MenuItem>
              </Menu>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button 
                color="inherit" 
                component={Link} 
                to="/login"
                sx={{ textTransform: 'none' }}
              >
                Login
              </Button>
              <GradientButton 
                component={Link} 
                to="/register"
                size="small"
              >
                Sign Up
              </GradientButton>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true,
        }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 280 },
        }}
      >
        {drawer}
      </Drawer>
    </>
  );
}
