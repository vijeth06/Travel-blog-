import React, { useEffect } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box } from '@mui/material';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider, useDispatch } from 'react-redux';
import { store } from './redux/store';
import { getUserProfile } from './redux/authSlice';
import { useSocket } from './hooks/useSocket';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import SocialFeedPage from './pages/SocialFeedPage';
import Login from './features/auth/Login';
import Register from './features/auth/Register';
import Profile from './features/auth/Profile';
import Dashboard from './pages/Dashboard';
import BlogList from './features/blogs/BlogList';
import BlogDetail from './features/blogs/BlogDetail';
import BlogForm from './features/blogs/BlogForm';
import Packages from './pages/Packages';
import PackageDetails from './pages/PackageDetails';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import NotFound from './pages/NotFound';
import SystemStatus from './components/SystemStatus';
import Settings from './pages/Settings';
import Analytics from './pages/Analytics';
import AdminPanel from './pages/AdminPanel';
import MapPage from './pages/MapPage';
import FollowingPage from './pages/FollowingPage';
import ProfilePage from './pages/ProfilePage';
import FeatureTest from './components/FeatureTest';
import ProtectedRoute from './components/ProtectedRoute';
import SavedStories from './pages/SavedStories';
import AuthTest from './components/AuthTest';
import ConnectionTest from './components/ConnectionTest';
import BlogDisplayTest from './components/BlogDisplayTest';
import GoogleAuthCallback from './components/GoogleAuthCallback';
import SearchPage from './components/SearchPage';
import ContinentsPage from './pages/ContinentsPage';
import ContinentPage from './pages/ContinentPage';
import BookingManagement from './components/BookingManagement';
import FavoritePlacesPage from './pages/FavoritePlacesPage';
// New Feature Pages
import GamificationPage from './pages/GamificationPage';
import AIRecommendationsPage from './pages/AIRecommendationsPage';
import CertificateSystemPage from './pages/CertificateSystemPage';
import MobilePage from './pages/MobilePage';
import PremiumPage from './pages/PremiumPage';
import IntegrationsPage from './pages/IntegrationsPage';
import AdvancedSearchPage from './pages/AdvancedSearchPage';
import ChatPage from './pages/ChatPage';
import GalleryPage from './pages/GalleryPage';
import ItineraryPage from './pages/ItineraryPage';
import ReviewsPage from './pages/ReviewsPage';
import TravelCalendarPage from './pages/TravelCalendarPage';
import TripsPage from './pages/TripsPage';
import TripDetailPage from './pages/TripDetailPage';
import SharedTripPage from './pages/SharedTripPage';
import CollectionsPage from './pages/CollectionsPage';
import CollectionDetailPage from './pages/CollectionDetailPage';
import PremiumTemplatesPage from './pages/PremiumTemplatesPage';
import TopicFollowsPage from './pages/TopicFollowsPage';
import BadgesPage from './pages/BadgesPage';
import TravelerDashboardPage from './pages/TravelerDashboardPage';
import CreatorAnalyticsPage from './pages/CreatorAnalyticsPage';
import CountriesPage from './pages/CountriesPage';
import CountryPage from './pages/CountryPage';
import InteractiveMapPage from './pages/InteractiveMapPage';
import BlogPage from './pages/BlogPage';
import SocialFeed from './pages/SocialFeed';
import SimpleDashboard from './pages/SimpleDashboard';
import ProviderRegister from './pages/ProviderRegister';
import ProviderDashboard from './pages/ProviderDashboard';
import { AuthProvider } from './contexts/EnhancedAuthContext';
import './styles/themes.css';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1E88E5', // Modern blue
      light: '#42A5F5',
      dark: '#1565C0',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#FF6B35', // Vibrant orange
      light: '#FF8A65',
      dark: '#E64A19',
    },
    background: {
      default: '#fafafa',
      paper: '#ffffff',
    },
    text: {
      primary: '#2C3E50',
      secondary: '#7F8C8D',
    },
    success: {
      main: '#27AE60',
      light: '#58D68D',
      dark: '#1E8449',
    },
    warning: {
      main: '#F39C12',
      light: '#F7DC6F',
      dark: '#D68910',
    },
    error: {
      main: '#E74C3C',
      light: '#EC7063',
      dark: '#C0392B',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '3rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2.5rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.4,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.75rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.5,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.5,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.6,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 12,
          fontWeight: 600,
          fontSize: '0.875rem',
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            transform: 'translateY(-1px)',
          },
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          '&:hover': {
            boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.05)',
          '&:hover': {
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
            transform: 'translateY(-2px)',
          },
          transition: 'all 0.3s ease-in-out',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1E88E5',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: '#1E88E5',
              borderWidth: '2px',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          fontWeight: 500,
          fontSize: '0.75rem',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 20px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiAvatar: {
      styleOverrides: {
        root: {
          fontWeight: 600,
        },
      },
    },
    MuiRating: {
      styleOverrides: {
        root: {
          '& .MuiRating-iconFilled': {
            color: '#FF6B35',
          },
        },
      },
    },
  },
  shape: {
    borderRadius: 12,
  },
  shadows: [
    'none',
    '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
    '0 3px 6px rgba(0,0,0,0.16), 0 3px 6px rgba(0,0,0,0.23)',
    '0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)',
    '0 14px 28px rgba(0,0,0,0.25), 0 10px 10px rgba(0,0,0,0.22)',
    '0 19px 38px rgba(0,0,0,0.30), 0 15px 12px rgba(0,0,0,0.22)',
    '0 25px 50px rgba(0,0,0,0.25), 0 20px 20px rgba(0,0,0,0.15)',
    '0 30px 60px rgba(0,0,0,0.25), 0 25px 25px rgba(0,0,0,0.15)',
    '0 35px 70px rgba(0,0,0,0.25), 0 30px 30px rgba(0,0,0,0.15)',
    '0 40px 80px rgba(0,0,0,0.25), 0 35px 35px rgba(0,0,0,0.15)',
    '0 45px 90px rgba(0,0,0,0.25), 0 40px 40px rgba(0,0,0,0.15)',
    '0 50px 100px rgba(0,0,0,0.25), 0 45px 45px rgba(0,0,0,0.15)',
    '0 55px 110px rgba(0,0,0,0.25), 0 50px 50px rgba(0,0,0,0.15)',
    '0 60px 120px rgba(0,0,0,0.25), 0 55px 55px rgba(0,0,0,0.15)',
    '0 65px 130px rgba(0,0,0,0.25), 0 60px 60px rgba(0,0,0,0.15)',
    '0 70px 140px rgba(0,0,0,0.25), 0 65px 65px rgba(0,0,0,0.15)',
    '0 75px 150px rgba(0,0,0,0.25), 0 70px 70px rgba(0,0,0,0.15)',
    '0 80px 160px rgba(0,0,0,0.25), 0 75px 75px rgba(0,0,0,0.15)',
    '0 85px 170px rgba(0,0,0,0.25), 0 80px 80px rgba(0,0,0,0.15)',
    '0 90px 180px rgba(0,0,0,0.25), 0 85px 85px rgba(0,0,0,0.15)',
    '0 95px 190px rgba(0,0,0,0.25), 0 90px 90px rgba(0,0,0,0.15)',
    '0 100px 200px rgba(0,0,0,0.25), 0 95px 95px rgba(0,0,0,0.15)',
    '0 105px 210px rgba(0,0,0,0.25), 0 100px 100px rgba(0,0,0,0.15)',
    '0 110px 220px rgba(0,0,0,0.25), 0 105px 105px rgba(0,0,0,0.15)',
    '0 115px 230px rgba(0,0,0,0.25), 0 110px 110px rgba(0,0,0,0.15)',
    '0 120px 240px rgba(0,0,0,0.25), 0 115px 115px rgba(0,0,0,0.15)',
  ],
});

function AppContent() {
  const dispatch = useDispatch();
  
  // Initialize Socket.IO connection
  useSocket();

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(getUserProfile());
    }
  }, [dispatch]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <Box sx={{ flex: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/feed" element={<ProtectedRoute><SocialFeedPage /></ProtectedRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/provider/register" element={<ProviderRegister />} />
              <Route path="/provider/dashboard" element={<ProtectedRoute><ProviderDashboard /></ProtectedRoute>} />
              <Route path="/auth/callback" element={<GoogleAuthCallback />} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
              <Route path="/blogs" element={<BlogList />} />
              <Route path="/blogs/new" element={<ProtectedRoute><BlogForm /></ProtectedRoute>} />
              <Route path="/blogs/edit/:id" element={<ProtectedRoute><BlogForm /></ProtectedRoute>} />
              <Route path="/blogs/:id" element={<BlogDetail />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/search/advanced" element={<AdvancedSearchPage />} />
              <Route path="/continents" element={<ContinentsPage />} />
              <Route path="/continents/:identifier" element={<ContinentPage />} />
              <Route path="/favorite-places" element={<FavoritePlacesPage />} />
              <Route path="/trips" element={<ProtectedRoute><TripsPage /></ProtectedRoute>} />
              <Route path="/trips/:id" element={<ProtectedRoute><TripDetailPage /></ProtectedRoute>} />
              <Route path="/trips/shared/:token" element={<SharedTripPage />} />
              <Route path="/collections" element={<ProtectedRoute><CollectionsPage /></ProtectedRoute>} />
              <Route path="/collections/:id" element={<ProtectedRoute><CollectionDetailPage /></ProtectedRoute>} />
              <Route path="/premium-templates" element={<ProtectedRoute><PremiumTemplatesPage /></ProtectedRoute>} />
              <Route path="/topics" element={<ProtectedRoute><TopicFollowsPage /></ProtectedRoute>} />
              <Route path="/badges" element={<ProtectedRoute><BadgesPage /></ProtectedRoute>} />
              <Route path="/traveler-dashboard" element={<ProtectedRoute><TravelerDashboardPage /></ProtectedRoute>} />
              <Route path="/creator-analytics" element={<ProtectedRoute><CreatorAnalyticsPage /></ProtectedRoute>} />
              <Route path="/packages" element={<Packages />} />
              <Route path="/packages/:id" element={<PackageDetails />} />
              <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
              <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
              <Route path="/saved" element={<ProtectedRoute><SavedStories /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
              <Route path="/admin/bookings" element={<ProtectedRoute><BookingManagement /></ProtectedRoute>} />
              <Route path="/map" element={<MapPage />} />
              <Route path="/following" element={<ProtectedRoute><FollowingPage /></ProtectedRoute>} />
              <Route path="/users/:id" element={<ProfilePage />} />
              <Route path="/status" element={<SystemStatus />} />
              <Route path="/test" element={<FeatureTest />} />
              <Route path="/auth-test" element={<AuthTest />} />
              <Route path="/connection-test" element={<ConnectionTest />} />
              <Route path="/blog-test" element={<BlogDisplayTest />} />
              {/* New Feature Routes */}
              <Route path="/gamification" element={<ProtectedRoute><GamificationPage /></ProtectedRoute>} />
              <Route path="/ai-recommendations" element={<ProtectedRoute><AIRecommendationsPage /></ProtectedRoute>} />
              <Route path="/certificates" element={<ProtectedRoute><CertificateSystemPage /></ProtectedRoute>} />
              <Route path="/mobile" element={<MobilePage />} />
              <Route path="/premium" element={<PremiumPage />} />
              <Route path="/integrations" element={<ProtectedRoute><IntegrationsPage /></ProtectedRoute>} />
              <Route path="/calendar" element={<ProtectedRoute><TravelCalendarPage /></ProtectedRoute>} />
              <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
              <Route path="/gallery" element={<ProtectedRoute><GalleryPage /></ProtectedRoute>} />
              <Route path="/itinerary" element={<ProtectedRoute><ItineraryPage /></ProtectedRoute>} />
              <Route path="/itinerary/:id" element={<ProtectedRoute><ItineraryPage /></ProtectedRoute>} />
              <Route path="/reviews" element={<ProtectedRoute><ReviewsPage showUserReviews={true} /></ProtectedRoute>} />
              <Route path="/countries" element={<CountriesPage />} />
              <Route path="/countries/:identifier" element={<CountryPage />} />
              <Route path="/map/interactive" element={<InteractiveMapPage />} />
              <Route path="/blog" element={<BlogPage />} />
              <Route path="/social" element={<ProtectedRoute><SocialFeed /></ProtectedRoute>} />
              <Route path="/simple-dashboard" element={<ProtectedRoute><SimpleDashboard /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Box>
          <Footer />
        </Box>
      </BrowserRouter>
    </ThemeProvider>
  );
}

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Provider>
  );
}

export default App;
