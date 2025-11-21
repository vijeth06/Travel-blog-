import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Grid
} from '@mui/material';
import {
  CheckCircle,
  Cancel,
  Visibility,
  Email,
  Phone,
  Business,
  Badge,
  Language,
  LocationOn
} from '@mui/icons-material';
import { API_URL } from '../config/api';

const AdminProviderManagement = () => {
  const [activeTab, setActiveTab] = useState(0); // 0 = Pending, 1 = Verified, 2 = All
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProvider, setSelectedProvider] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const [actionDialog, setActionDialog] = useState({ open: false, type: '', provider: null });
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    fetchProviders();
  }, [activeTab]);

  const fetchProviders = async () => {
    setLoading(true);
    const token = localStorage.getItem('token');

    try {
      let url = `${API_URL}/providers/admin/all`;
      if (activeTab === 0) {
        url = `${API_URL}/providers/admin/pending`;
      } else if (activeTab === 1) {
        url = `${API_URL}/providers/admin/all?verified=true`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProviders(data);
      } else {
        setError('Failed to fetch providers');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = async (provider) => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_URL}/providers/admin/${provider._id}/packages`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedProvider(data);
        setDetailsDialog(true);
      }
    } catch (err) {
      setError('Failed to load provider details');
    }
  };

  const handleVerify = async (providerId) => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_URL}/providers/admin/${providerId}/verify`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        fetchProviders();
        setActionDialog({ open: false, type: '', provider: null });
        alert('Provider verified successfully!');
      } else {
        setError('Failed to verify provider');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const handleReject = async (providerId) => {
    const token = localStorage.getItem('token');

    try {
      const response = await fetch(`${API_URL}/providers/admin/${providerId}/reject`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: rejectReason })
      });

      if (response.ok) {
        fetchProviders();
        setActionDialog({ open: false, type: '', provider: null });
        setRejectReason('');
        alert('Provider verification revoked');
      } else {
        setError('Failed to reject provider');
      }
    } catch (err) {
      setError('Network error');
    }
  };

  const openActionDialog = (type, provider) => {
    setActionDialog({ open: true, type, provider });
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        <Business sx={{ verticalAlign: 'middle', mr: 1 }} />
        Package Provider Management
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}

      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, newValue) => setActiveTab(newValue)}
          variant="fullWidth"
        >
          <Tab label="Pending Approval" />
          <Tab label="Verified Providers" />
          <Tab label="All Providers" />
        </Tabs>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell><strong>Name</strong></TableCell>
              <TableCell><strong>Company</strong></TableCell>
              <TableCell><strong>Email</strong></TableCell>
              <TableCell><strong>License</strong></TableCell>
              <TableCell><strong>Status</strong></TableCell>
              <TableCell><strong>Packages</strong></TableCell>
              <TableCell align="right"><strong>Actions</strong></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">Loading...</TableCell>
              </TableRow>
            ) : providers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  No {activeTab === 0 ? 'pending' : activeTab === 1 ? 'verified' : ''} providers found
                </TableCell>
              </TableRow>
            ) : (
              providers.map((provider) => (
                <TableRow key={provider._id}>
                  <TableCell>{provider.name}</TableCell>
                  <TableCell>{provider.providerInfo?.companyName || '-'}</TableCell>
                  <TableCell>{provider.email}</TableCell>
                  <TableCell>{provider.providerInfo?.businessLicense || '-'}</TableCell>
                  <TableCell>
                    <Chip
                      label={provider.providerInfo?.verified ? 'Verified' : 'Pending'}
                      color={provider.providerInfo?.verified ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{provider.providerInfo?.totalPackages || 0}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => handleViewDetails(provider)}
                      >
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                    {!provider.providerInfo?.verified && (
                      <Tooltip title="Verify Provider">
                        <IconButton
                          size="small"
                          color="success"
                          onClick={() => openActionDialog('verify', provider)}
                        >
                          <CheckCircle />
                        </IconButton>
                      </Tooltip>
                    )}
                    {provider.providerInfo?.verified && (
                      <Tooltip title="Revoke Verification">
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => openActionDialog('reject', provider)}
                        >
                          <Cancel />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Provider Details Dialog */}
      <Dialog
        open={detailsDialog}
        onClose={() => setDetailsDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          <Business sx={{ verticalAlign: 'middle', mr: 1 }} />
          Provider Details
        </DialogTitle>
        <DialogContent>
          {selectedProvider && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Name</Typography>
                  <Typography variant="body1">{selectedProvider.provider.name}</Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Email</Typography>
                  <Typography variant="body1">
                    <Email sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                    {selectedProvider.provider.email}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Company</Typography>
                  <Typography variant="body1">
                    <Business sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                    {selectedProvider.provider.providerInfo?.companyName}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Business License</Typography>
                  <Typography variant="body1">
                    <Badge sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                    {selectedProvider.provider.providerInfo?.businessLicense}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Contact</Typography>
                  <Typography variant="body1">
                    <Phone sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                    {selectedProvider.provider.providerInfo?.contactNumber || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="text.secondary">Website</Typography>
                  <Typography variant="body1">
                    <Language sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                    {selectedProvider.provider.providerInfo?.website || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Address</Typography>
                  <Typography variant="body1">
                    <LocationOn sx={{ fontSize: 16, verticalAlign: 'middle', mr: 0.5 }} />
                    {selectedProvider.provider.providerInfo?.address || '-'}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="text.secondary">Description</Typography>
                  <Typography variant="body1">
                    {selectedProvider.provider.providerInfo?.description || '-'}
                  </Typography>
                </Grid>
              </Grid>

              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Packages ({selectedProvider.packages.length})
              </Typography>
              {selectedProvider.packages.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  No packages created yet
                </Typography>
              ) : (
                selectedProvider.packages.map((pkg) => (
                  <Card key={pkg._id} sx={{ mb: 1 }}>
                    <CardContent>
                      <Typography variant="body1" fontWeight="bold">{pkg.name}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        ${pkg.price} • {pkg.duration} days • {pkg.status || 'Active'}
                      </Typography>
                    </CardContent>
                  </Card>
                ))
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Verify/Reject Dialog */}
      <Dialog
        open={actionDialog.open}
        onClose={() => setActionDialog({ open: false, type: '', provider: null })}
      >
        <DialogTitle>
          {actionDialog.type === 'verify' ? 'Verify Provider' : 'Revoke Verification'}
        </DialogTitle>
        <DialogContent>
          {actionDialog.provider && (
            <Box>
              <Typography variant="body1" sx={{ mb: 2 }}>
                <strong>Provider:</strong> {actionDialog.provider.name}<br />
                <strong>Company:</strong> {actionDialog.provider.providerInfo?.companyName}
              </Typography>

              {actionDialog.type === 'verify' ? (
                <Alert severity="info">
                  This will allow the provider to create and manage travel packages on the platform.
                </Alert>
              ) : (
                <>
                  <Alert severity="warning" sx={{ mb: 2 }}>
                    This will prevent the provider from creating new packages. Existing packages will remain visible.
                  </Alert>
                  <TextField
                    fullWidth
                    label="Reason for rejection (optional)"
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    multiline
                    rows={3}
                  />
                </>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setActionDialog({ open: false, type: '', provider: null })}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              if (actionDialog.type === 'verify') {
                handleVerify(actionDialog.provider._id);
              } else {
                handleReject(actionDialog.provider._id);
              }
            }}
            color={actionDialog.type === 'verify' ? 'success' : 'error'}
            variant="contained"
          >
            {actionDialog.type === 'verify' ? 'Verify' : 'Revoke'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default AdminProviderManagement;
