import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  Alert,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  Business,
  CheckCircle,
  Pending,
  TrendingUp,
  Star,
  Inventory,
  AttachMoney,
  Edit,
  Delete,
  Add,
  Visibility
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config/api';

const ProviderDashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialog, setDeleteDialog] = useState({ open: false, packageId: null });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    try {
      // Get user info from localStorage or make API call
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const userData = JSON.parse(userStr);
        setUser(userData);

        // Check if user is package provider
        if (userData.role !== 'package_provider' && userData.role !== 'admin') {
          navigate('/');
          return;
        }
      }

      // Fetch provider stats
      const statsResponse = await fetch(`${API_URL}/api/providers/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData);
      }

      // Fetch provider's packages
      const packagesResponse = await fetch(`${API_URL}/api/providers/my-packages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (packagesResponse.ok) {
        const packagesData = await packagesResponse.json();
        setPackages(packagesData);
      }

    } catch (err) {
      setError('Failed to load dashboard data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePackage = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`${API_URL}/api/packages/${deleteDialog.packageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        setPackages(packages.filter(p => p._id !== deleteDialog.packageId));
        setDeleteDialog({ open: false, packageId: null });
        fetchDashboardData(); // Refresh stats
      } else {
        setError('Failed to delete package');
      }
    } catch (err) {
      setError('Failed to delete package');
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 4, textAlign: 'center' }}>
        <Typography>Loading dashboard...</Typography>
      </Container>
    );
  }

  const isVerified = user?.providerInfo?.verified;

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          <Business sx={{ verticalAlign: 'middle', mr: 1 }} />
          Provider Dashboard
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Welcome, {user?.providerInfo?.companyName || user?.name}
        </Typography>
      </Box>

      {/* Verification Status Alert */}
      {!isVerified && (
        <Alert severity="warning" sx={{ mb: 3 }} icon={<Pending />}>
          <Typography variant="body1" fontWeight="bold">
            Your account is pending verification
          </Typography>
          <Typography variant="body2">
            An administrator will review your business license and approve your account. 
            You cannot create packages until verified.
          </Typography>
        </Alert>
      )}

      {isVerified && (
        <Alert severity="success" sx={{ mb: 3 }} icon={<CheckCircle />}>
          <Typography variant="body1" fontWeight="bold">
            Account Verified ✓
          </Typography>
          <Typography variant="body2">
            You can create and manage travel packages.
          </Typography>
        </Alert>
      )}

      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Inventory sx={{ color: 'primary.main', mr: 1 }} />
                <Typography variant="h6">Packages</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {stats?.totalPackages || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUp sx={{ color: 'success.main', mr: 1 }} />
                <Typography variant="h6">Bookings</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {stats?.totalBookings || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <Star sx={{ color: 'warning.main', mr: 1 }} />
                <Typography variant="h6">Rating</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                {stats?.averageRating || '0.0'}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <AttachMoney sx={{ color: 'info.main', mr: 1 }} />
                <Typography variant="h6">Revenue</Typography>
              </Box>
              <Typography variant="h4" fontWeight="bold">
                ${stats?.totalRevenue || 0}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* My Packages Section */}
      <Paper sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" fontWeight="bold">
            My Packages
          </Typography>
          {isVerified && (
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => navigate('/packages/create')}
            >
              Create Package
            </Button>
          )}
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {packages.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Inventory sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary">
              No packages yet
            </Typography>
            {isVerified && (
              <Typography variant="body2" color="text.secondary">
                Create your first travel package to get started
              </Typography>
            )}
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell><strong>Package Name</strong></TableCell>
                  <TableCell><strong>Price</strong></TableCell>
                  <TableCell><strong>Duration</strong></TableCell>
                  <TableCell><strong>Status</strong></TableCell>
                  <TableCell align="right"><strong>Actions</strong></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {packages.map((pkg) => (
                  <TableRow key={pkg._id}>
                    <TableCell>{pkg.name}</TableCell>
                    <TableCell>${pkg.price}</TableCell>
                    <TableCell>{pkg.duration} days</TableCell>
                    <TableCell>
                      <Chip
                        label={pkg.isActive ? 'Active' : 'Inactive'}
                        color={pkg.isActive ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/packages/${pkg._id}`)}
                        title="View"
                      >
                        <Visibility />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => navigate(`/packages/edit/${pkg._id}`)}
                        title="Edit"
                      >
                        <Edit />
                      </IconButton>
                      <IconButton
                        size="small"
                        color="error"
                        onClick={() => setDeleteDialog({ open: true, packageId: pkg._id })}
                        title="Delete"
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, packageId: null })}>
        <DialogTitle>Delete Package</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this package? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialog({ open: false, packageId: null })}>
            Cancel
          </Button>
          <Button onClick={handleDeletePackage} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProviderDashboard;
