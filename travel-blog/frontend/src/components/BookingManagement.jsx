import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Box,
  Chip,
  Button,
  TextField,
  InputAdornment,
  Tab,
  Tabs,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Badge,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Grid
} from '@mui/material';

import {
  Search,
  FilterList,
  Visibility,
  Edit,
  Delete,
  CheckCircle,
  Cancel,
  Pending,
  TravelExplore,
  Person,
  Phone,
  Email,
  CalendarToday,
  AttachMoney,
  CreditCard,
  Group,
  LocationOn,
  AccessTime,
  Info,
  Warning,
  Error as ErrorIcon,
  Refresh
} from '@mui/icons-material';
import { format } from 'date-fns';
import api from '../api/api';

const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState(0);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    cancelled: 0,
    completed: 0
  });

  useEffect(() => {
    fetchBookings();
  }, []);

  useEffect(() => {
    filterBookings();
  }, [bookings, searchQuery, selectedTab]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const response = await api.get('/bookings/all'); // Admin endpoint to get all bookings
      const bookingsData = response.data.data || response.data || [];
      setBookings(bookingsData);
      calculateStats(bookingsData);
      setError(null);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again.');
      // For demo purposes, create mock data if API fails
      createMockBookings();
    } finally {
      setLoading(false);
    }
  };

  const createMockBookings = () => {
    const mockBookings = [
      {
        _id: '1',
        bookingId: 'TB17556665700250001',
        user: { name: 'John Doe', email: 'john@example.com' },
        package: { title: 'Maldives Paradise Getaway', location: { country: 'Maldives' }, price: 3999 },
        numberOfTravelers: 2,
        totalAmount: 7998,
        status: 'Confirmed',
        paymentInfo: { status: 'Paid', method: 'Credit Card' },
        travelDates: { startDate: '2024-12-01', endDate: '2024-12-07' },
        contactInfo: { phone: '+91-9876543210', email: 'john@example.com' },
        createdAt: '2024-08-20T05:04:12.064Z'
      },
      {
        _id: '2',
        bookingId: 'TB17556665700250002',
        user: { name: 'Sarah Smith', email: 'sarah@example.com' },
        package: { title: 'European Adventure', location: { country: 'France' }, price: 2499 },
        numberOfTravelers: 1,
        totalAmount: 2499,
        status: 'Pending',
        paymentInfo: { status: 'Pending', method: 'PayPal' },
        travelDates: { startDate: '2024-11-15', endDate: '2024-11-25' },
        contactInfo: { phone: '+1-555-0123', email: 'sarah@example.com' },
        createdAt: '2024-08-19T10:30:00.000Z'
      },
      {
        _id: '3',
        bookingId: 'TB17556665700250003',
        user: { name: 'Mike Johnson', email: 'mike@example.com' },
        package: { title: 'Asian Cultural Tour', location: { country: 'India' }, price: 1899 },
        numberOfTravelers: 3,
        totalAmount: 5697,
        status: 'Cancelled',
        paymentInfo: { status: 'Refunded', method: 'Credit Card' },
        travelDates: { startDate: '2024-10-10', endDate: '2024-10-20' },
        contactInfo: { phone: '+44-20-7946-0958', email: 'mike@example.com' },
        createdAt: '2024-08-18T14:15:30.000Z'
      }
    ];
    setBookings(mockBookings);
    calculateStats(mockBookings);
  };

  const calculateStats = (bookingsData) => {
    const stats = {
      total: bookingsData.length,
      pending: bookingsData.filter(b => b.status === 'Pending').length,
      confirmed: bookingsData.filter(b => b.status === 'Confirmed').length,
      cancelled: bookingsData.filter(b => b.status === 'Cancelled').length,
      completed: bookingsData.filter(b => b.status === 'Completed').length
    };
    setStats(stats);
  };

  const filterBookings = () => {
    let filtered = [...bookings];

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(booking =>
        booking.bookingId.toLowerCase().includes(query) ||
        booking.user?.name.toLowerCase().includes(query) ||
        booking.user?.email.toLowerCase().includes(query) ||
        booking.package?.title.toLowerCase().includes(query) ||
        booking.package?.location?.country.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    const statusFilters = ['All', 'Pending', 'Confirmed', 'Cancelled', 'Completed'];
    if (selectedTab > 0) {
      const status = statusFilters[selectedTab];
      filtered = filtered.filter(booking => booking.status === status);
    }

    setFilteredBookings(filtered);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Pending': 'warning',
      'Confirmed': 'success',
      'Cancelled': 'error',
      'Completed': 'info',
      'In Progress': 'primary'
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Pending': <Pending />,
      'Confirmed': <CheckCircle />,
      'Cancelled': <Cancel />,
      'Completed': <CheckCircle />,
      'In Progress': <AccessTime />
    };
    return icons[status] || <Info />;
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      'Paid': 'success',
      'Pending': 'warning',
      'Failed': 'error',
      'Refunded': 'info'
    };
    return colors[status] || 'default';
  };

  const handleViewDetails = (booking) => {
    setSelectedBooking(booking);
    setDetailsOpen(true);
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    try {
      await api.patch(`/bookings/${bookingId}/status`, { status: newStatus });
      fetchBookings(); // Refresh data
    } catch (err) {
      console.error('Error updating booking status:', err);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return format(new Date(dateString), 'MMM dd, yyyy');
  };

  const tabLabels = ['All Bookings', 'Pending', 'Confirmed', 'Cancelled', 'Completed'];

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress size={60} />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading bookings...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
          Booking Management
        </Typography>
        <Typography variant="body1" color="text.secondary">
          View and manage all travel bookings
        </Typography>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid xs={12} sm={6} md={2.4}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" color="primary" fontWeight="bold">
              {stats.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Bookings
            </Typography>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={2.4}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" color="warning.main" fontWeight="bold">
              {stats.pending}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Pending
            </Typography>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={2.4}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {stats.confirmed}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Confirmed
            </Typography>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={2.4}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" color="error.main" fontWeight="bold">
              {stats.cancelled}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cancelled
            </Typography>
          </Card>
        </Grid>
        <Grid xs={12} sm={6} md={2.4}>
          <Card sx={{ textAlign: 'center', p: 2 }}>
            <Typography variant="h4" color="info.main" fontWeight="bold">
              {stats.completed}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Completed
            </Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filters */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid xs={12} md={6}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Search by booking ID, customer name, email, or package..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search color="action" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid xs={12} md={6}>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<Refresh />}
                onClick={fetchBookings}
              >
                Refresh
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Status Tabs */}
      <Box sx={{ mb: 3 }}>
        <Tabs
          value={selectedTab}
          onChange={(e, newValue) => setSelectedTab(newValue)}
          variant="scrollable"
          scrollButtons="auto"
        >
          {tabLabels.map((label, index) => (
            <Tab key={index} label={label} />
          ))}
        </Tabs>
      </Box>

      {/* Error Message */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Bookings Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Booking ID</TableCell>
              <TableCell>Customer</TableCell>
              <TableCell>Package</TableCell>
              <TableCell>Travel Dates</TableCell>
              <TableCell>Travelers</TableCell>
              <TableCell>Amount</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Payment</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredBookings.map((booking) => (
              <TableRow key={booking._id} hover>
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {booking.bookingId}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {formatDate(booking.createdAt)}
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {booking.user?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {booking.user?.email}
                    </Typography>
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {booking.package?.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {booking.package?.location?.country}
                    </Typography>
                  </Box>
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2">
                    {formatDate(booking.travelDates?.startDate)}
                  </Typography>
                  <Typography variant="body2">
                    to {formatDate(booking.travelDates?.endDate)}
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Chip
                    icon={<Group />}
                    label={booking.numberOfTravelers}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                
                <TableCell>
                  <Typography variant="body2" fontWeight="bold">
                    {formatCurrency(booking.totalAmount)}
                  </Typography>
                </TableCell>
                
                <TableCell>
                  <Chip
                    icon={getStatusIcon(booking.status)}
                    label={booking.status}
                    color={getStatusColor(booking.status)}
                    size="small"
                  />
                </TableCell>
                
                <TableCell>
                  <Chip
                    label={booking.paymentInfo?.status}
                    color={getPaymentStatusColor(booking.paymentInfo?.status)}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                
                <TableCell>
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={() => handleViewDetails(booking)}
                    >
                      <Visibility />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {filteredBookings.length === 0 && !loading && (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No bookings found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Try adjusting your search terms or filters
          </Typography>
        </Box>
      )}

      {/* Booking Details Dialog */}
      <Dialog
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <TravelExplore color="primary" />
            <Box>
              <Typography variant="h6">
                Booking Details
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedBooking?.bookingId}
              </Typography>
            </Box>
          </Box>
        </DialogTitle>
        
        <DialogContent>
          {selectedBooking && (
            <Grid container spacing={3}>
              {/* Customer Information */}
              <Grid xs={12} md={6}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Customer Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Name"
                        secondary={selectedBooking.user?.name}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Email /></ListItemIcon>
                      <ListItemText
                        primary="Email"
                        secondary={selectedBooking.user?.email}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Phone /></ListItemIcon>
                      <ListItemText
                        primary="Phone"
                        secondary={selectedBooking.contactInfo?.phone}
                      />
                    </ListItem>
                  </List>
                </Card>
              </Grid>

              {/* Package Information */}
              <Grid xs={12} md={6}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    <TravelExplore sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Package Details
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Package"
                        secondary={selectedBooking.package?.title}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><LocationOn /></ListItemIcon>
                      <ListItemText
                        primary="Destination"
                        secondary={selectedBooking.package?.location?.country}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><Group /></ListItemIcon>
                      <ListItemText
                        primary="Travelers"
                        secondary={selectedBooking.numberOfTravelers}
                      />
                    </ListItem>
                  </List>
                </Card>
              </Grid>

              {/* Travel Information */}
              <Grid xs={12} md={6}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    <CalendarToday sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Travel Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Start Date"
                        secondary={formatDate(selectedBooking.travelDates?.startDate)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="End Date"
                        secondary={formatDate(selectedBooking.travelDates?.endDate)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Booking Date"
                        secondary={formatDate(selectedBooking.createdAt)}
                      />
                    </ListItem>
                  </List>
                </Card>
              </Grid>

              {/* Payment Information */}
              <Grid xs={12} md={6}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    <AttachMoney sx={{ mr: 1, verticalAlign: 'middle' }} />
                    Payment Details
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Total Amount"
                        secondary={formatCurrency(selectedBooking.totalAmount)}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemIcon><CreditCard /></ListItemIcon>
                      <ListItemText
                        primary="Payment Method"
                        secondary={selectedBooking.paymentInfo?.method}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Payment Status"
                        secondary={
                          <Chip
                            label={selectedBooking.paymentInfo?.status}
                            color={getPaymentStatusColor(selectedBooking.paymentInfo?.status)}
                            size="small"
                          />
                        }
                      />
                    </ListItem>
                  </List>
                </Card>
              </Grid>

              {/* Status and Actions */}
              <Grid xs={12}>
                <Card variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="h6" gutterBottom>
                    Booking Status & Actions
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                    <Typography variant="body1">Current Status:</Typography>
                    <Chip
                      icon={getStatusIcon(selectedBooking.status)}
                      label={selectedBooking.status}
                      color={getStatusColor(selectedBooking.status)}
                    />
                  </Box>
                  
                  {selectedBooking.specialRequests && (
                    <Box sx={{ mt: 2 }}>
                      <Typography variant="body2" fontWeight="medium" gutterBottom>
                        Special Requests:
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {selectedBooking.specialRequests}
                      </Typography>
                    </Box>
                  )}
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default BookingManagement;