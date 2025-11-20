import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Button,
  Paper,
  Chip,
  Avatar,
  LinearProgress,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  EmojiEvents,
  Verified,
  Download,
  Share,
  CheckCircle,
  Lock,
  ArrowBack,
  School,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { getUserCertificates, verifyCertificate } from '../api/certifications';

const CertificationPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [detailsDialog, setDetailsDialog] = useState(false);
  const { user, token, isAuthenticated } = useSelector((state) => state.auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    if (token) {
      fetchCertificates();
    }
  }, [token, isAuthenticated, navigate]);

  const fetchCertificates = async () => {
    setLoading(true);
    try {
      const response = await getUserCertificates();
      setCertificates(response.certificates || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      setCertificates([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (certificate) => {
    setSelectedCertificate(certificate);
    setDetailsDialog(true);
  };

  const handleVerify = async (certificateId) => {
    try {
      await verifyCertificate(certificateId);
      alert('Certificate verified successfully!');
    } catch (error) {
      console.error('Error verifying certificate:', error);
      alert('Failed to verify certificate');
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <LinearProgress />
        <Typography sx={{ mt: 2 }}>Loading certifications...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, bgcolor: 'primary.main', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <IconButton component={Link} to="/dashboard" sx={{ color: 'white' }}>
            <ArrowBack />
          </IconButton>
          <School sx={{ fontSize: 40 }} />
          <Box>
            <Typography variant="h4" component="h1">
              My Certifications
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Your earned travel and blogging certifications
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Chip
            label={`${certificates.length} Certificates Earned`}
            variant="outlined"
            sx={{ color: 'white', borderColor: 'white' }}
          />
        </Box>
      </Paper>

      {/* Certificates Grid */}
      {certificates.length === 0 ? (
        <Paper sx={{ p: 6, textAlign: 'center' }}>
          <School sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h5" gutterBottom>
            No Certificates Yet
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
            Complete achievements and milestones to earn certifications!
          </Typography>
          <Button
            component={Link}
            to="/gamification"
            variant="contained"
            startIcon={<EmojiEvents />}
          >
            View Achievements
          </Button>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {certificates.map((certificate) => (
            <Grid item xs={12} md={6} lg={4} key={certificate._id}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  '&:hover': {
                    boxShadow: 6,
                    transform: 'translateY(-4px)',
                    transition: 'all 0.3s',
                  },
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                    <Avatar
                      sx={{
                        bgcolor: 'primary.main',
                        width: 56,
                        height: 56,
                      }}
                    >
                      {certificate.verified ? <Verified /> : <School />}
                    </Avatar>
                    {certificate.verified && (
                      <Chip
                        label="Verified"
                        color="success"
                        size="small"
                        icon={<CheckCircle />}
                      />
                    )}
                  </Box>

                  <Typography variant="h6" gutterBottom>
                    {certificate.name || 'Certificate'}
                  </Typography>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    {certificate.description || 'Achievement certification'}
                  </Typography>

                  <Divider sx={{ my: 2 }} />

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="caption" color="text.secondary">
                      Issued:
                    </Typography>
                    <Typography variant="caption">
                      {new Date(certificate.issuedAt || certificate.createdAt).toLocaleDateString()}
                    </Typography>
                  </Box>

                  {certificate.expiresAt && (
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Expires:
                      </Typography>
                      <Typography variant="caption">
                        {new Date(certificate.expiresAt).toLocaleDateString()}
                      </Typography>
                    </Box>
                  )}

                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="caption" color="text.secondary">
                      Certificate ID:
                    </Typography>
                    <Typography variant="caption" sx={{ fontFamily: 'monospace' }}>
                      {certificate.certificateId?.substring(0, 8) || certificate._id.substring(0, 8)}
                    </Typography>
                  </Box>
                </CardContent>

                <Box sx={{ p: 2, pt: 0 }}>
                  <Button
                    fullWidth
                    variant="outlined"
                    onClick={() => handleViewDetails(certificate)}
                    sx={{ mb: 1 }}
                  >
                    View Details
                  </Button>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      variant="text"
                      size="small"
                      startIcon={<Download />}
                      sx={{ flex: 1 }}
                    >
                      Download
                    </Button>
                    <Button
                      variant="text"
                      size="small"
                      startIcon={<Share />}
                      sx={{ flex: 1 }}
                    >
                      Share
                    </Button>
                  </Box>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Certificate Details Dialog */}
      <Dialog
        open={detailsDialog}
        onClose={() => setDetailsDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Verified color="primary" />
            <Typography variant="h6">Certificate Details</Typography>
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedCertificate && (
            <Box>
              <Typography variant="h6" gutterBottom>
                {selectedCertificate.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {selectedCertificate.description}
              </Typography>

              <Divider sx={{ my: 2 }} />

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Recipient
                </Typography>
                <Typography variant="body2">{user?.name || 'User'}</Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Certificate ID
                </Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                  {selectedCertificate.certificateId || selectedCertificate._id}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Issued Date
                </Typography>
                <Typography variant="body2">
                  {new Date(selectedCertificate.issuedAt || selectedCertificate.createdAt).toLocaleString()}
                </Typography>
              </Box>

              {selectedCertificate.verified && (
                <Chip
                  label="Verified Certificate"
                  color="success"
                  icon={<CheckCircle />}
                  sx={{ mt: 2 }}
                />
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsDialog(false)}>Close</Button>
          {selectedCertificate && !selectedCertificate.verified && (
            <Button
              variant="contained"
              onClick={() => handleVerify(selectedCertificate._id)}
            >
              Verify Certificate
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default CertificationPage;
