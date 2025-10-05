import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Avatar,
  Chip,
  Paper,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Fab,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Divider,
} from '@mui/material';
import {
  EmojiEvents,
  Download,
  Share,
  Print,
  Close,
  CardMembership,
  Star,
  Flight,
  LocationOn,
  Camera,
  Hiking,
  Restaurant,
  Museum,
  Add,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import axios from 'axios';

const CertificateSystemPage = () => {
  const [certificates, setCertificates] = useState([]);
  const [availableCertificates, setAvailableCertificates] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      fetchCertificates();
      fetchAvailableCertificates();
    }
  }, [token]);

  const fetchCertificates = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/certificates/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCertificates(response.data.certificates || []);
    } catch (error) {
      console.error('Error fetching certificates:', error);
      // Fallback data for demo
      setCertificates([
        {
          id: 1,
          title: 'Cultural Explorer',
          description: 'Awarded for visiting 5 cultural sites and writing detailed reviews',
          type: 'cultural',
          level: 'Bronze',
          earnedDate: '2024-01-15',
          country: 'Global',
          requirements: 'Visit 5 cultural sites',
          progress: 100,
          image: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?w=400',
          verified: true,
        },
        {
          id: 2,
          title: 'Adventure Seeker',
          description: 'Completed 3 adventure activities and documented the experiences',
          type: 'adventure',
          level: 'Silver',
          earnedDate: '2024-02-20',
          country: 'Nepal',
          requirements: 'Complete 3 adventure activities',
          progress: 100,
          image: 'https://images.unsplash.com/photo-1551632811-561732d1e306?w=400',
          verified: true,
        },
      ]);
    }
  };

  const fetchAvailableCertificates = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/certificates/available`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAvailableCertificates(response.data.certificates || []);
    } catch (error) {
      console.error('Error fetching available certificates:', error);
      // Fallback data for demo
      setAvailableCertificates([
        {
          id: 3,
          title: 'Food Connoisseur',
          description: 'Try local cuisines from 10 different countries',
          type: 'culinary',
          level: 'Gold',
          requirements: 'Document food experiences from 10 countries',
          progress: 60,
          totalRequired: 10,
          currentCount: 6,
          reward: '500 points + Special Badge',
        },
        {
          id: 4,
          title: 'Mountain Climber',
          description: 'Climb peaks above 3000m in 3 different countries',
          type: 'adventure',
          level: 'Platinum',
          requirements: 'Climb 3 peaks above 3000m',
          progress: 33,
          totalRequired: 3,
          currentCount: 1,
          reward: '1000 points + Premium Features',
        },
        {
          id: 5,
          title: 'Photography Master',
          description: 'Upload 100 high-quality travel photos with detailed captions',
          type: 'photography',
          level: 'Gold',
          requirements: 'Upload 100 quality photos',
          progress: 75,
          totalRequired: 100,
          currentCount: 75,
          reward: '750 points + Portfolio Feature',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadCertificate = async (certificateId) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_URL}/certificates/${certificateId}/download`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: 'blob',
        }
      );
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `certificate-${certificateId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading certificate:', error);
    }
  };

  const handleShareCertificate = async (certificate) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `I earned the ${certificate.title} certificate!`,
          text: certificate.description,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing certificate:', error);
      }
    } else {
      // Fallback to copying link
      navigator.clipboard.writeText(window.location.href);
    }
  };

  const getCertificateIcon = (type) => {
    switch (type) {
      case 'cultural':
        return <Museum color="primary" />;
      case 'adventure':
        return <Hiking color="secondary" />;
      case 'culinary':
        return <Restaurant color="warning" />;
      case 'photography':
        return <Camera color="success" />;
      default:
        return <CardMembership color="primary" />;
    }
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'Bronze':
        return '#CD7F32';
      case 'Silver':
        return '#C0C0C0';
      case 'Gold':
        return '#FFD700';
      case 'Platinum':
        return '#E5E4E2';
      default:
        return '#1976d2';
    }
  };

  const CertificateCard = ({ certificate, isEarned = false }) => (
    <Card
      elevation={3}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 8,
        },
        opacity: isEarned ? 1 : 0.8,
        border: isEarned ? `2px solid ${getLevelColor(certificate.level)}` : 'none',
      }}
    >
      {isEarned && (
        <Chip
          label="EARNED"
          color="success"
          size="small"
          sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}
        />
      )}
      
      <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            mx: 'auto',
            mb: 2,
            bgcolor: getLevelColor(certificate.level),
            border: `3px solid ${getLevelColor(certificate.level)}`,
          }}
        >
          {getCertificateIcon(certificate.type)}
        </Avatar>

        <Typography variant="h6" gutterBottom>
          {certificate.title}
        </Typography>

        <Chip
          label={certificate.level}
          sx={{
            bgcolor: getLevelColor(certificate.level),
            color: 'white',
            fontWeight: 'bold',
            mb: 2,
          }}
        />

        <Typography variant="body2" color="text.secondary" paragraph>
          {certificate.description}
        </Typography>

        {!isEarned && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" gutterBottom>
              Progress: {certificate.currentCount || 0} / {certificate.totalRequired || 0}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={certificate.progress || 0}
              sx={{ height: 8, borderRadius: 4, mb: 1 }}
            />
            <Typography variant="caption" color="text.secondary">
              {certificate.progress || 0}% Complete
            </Typography>
          </Box>
        )}

        {isEarned && (
          <Typography variant="caption" color="text.secondary" display="block">
            Earned on {new Date(certificate.earnedDate).toLocaleDateString()}
          </Typography>
        )}

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center', gap: 1 }}>
          {isEarned ? (
            <>
              <Button
                size="small"
                startIcon={<Download />}
                onClick={() => handleDownloadCertificate(certificate.id)}
              >
                Download
              </Button>
              <IconButton
                size="small"
                onClick={() => handleShareCertificate(certificate)}
              >
                <Share />
              </IconButton>
            </>
          ) : (
            <Button
              size="small"
              variant="outlined"
              onClick={() => setSelectedCertificate(certificate)}
            >
              View Details
            </Button>
          )}
        </Box>
      </CardContent>
    </Card>
  );

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography>Loading certificates...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
        🏆 Travel Certificates
      </Typography>

      {/* Stats Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="primary">
              {certificates.length}
            </Typography>
            <Typography variant="body1">Certificates Earned</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="secondary">
              {availableCertificates.length}
            </Typography>
            <Typography variant="body1">Available to Earn</Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Paper sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h3" color="success.main">
              {Math.round(certificates.length / (certificates.length + availableCertificates.length) * 100) || 0}%
            </Typography>
            <Typography variant="body1">Completion Rate</Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Earned Certificates */}
      {certificates.length > 0 && (
        <>
          <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
            ✨ Your Certificates
          </Typography>
          <Grid container spacing={3} sx={{ mb: 6 }}>
            {certificates.map((certificate) => (
              <Grid item xs={12} sm={6} md={4} key={certificate.id}>
                <CertificateCard certificate={certificate} isEarned={true} />
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Available Certificates */}
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        🎯 Certificates to Earn
      </Typography>
      <Grid container spacing={3}>
        {availableCertificates.map((certificate) => (
          <Grid item xs={12} sm={6} md={4} key={certificate.id}>
            <CertificateCard certificate={certificate} isEarned={false} />
          </Grid>
        ))}
      </Grid>

      {/* Certificate Detail Dialog */}
      <Dialog
        open={!!selectedCertificate}
        onClose={() => setSelectedCertificate(null)}
        maxWidth="sm"
        fullWidth
      >
        {selectedCertificate && (
          <>
            <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
              <IconButton
                onClick={() => setSelectedCertificate(null)}
                sx={{ position: 'absolute', right: 8, top: 8 }}
              >
                <Close />
              </IconButton>
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  mx: 'auto',
                  mb: 2,
                  bgcolor: getLevelColor(selectedCertificate.level),
                }}
              >
                {getCertificateIcon(selectedCertificate.type)}
              </Avatar>
              <Typography variant="h5">{selectedCertificate.title}</Typography>
              <Chip
                label={selectedCertificate.level}
                sx={{
                  bgcolor: getLevelColor(selectedCertificate.level),
                  color: 'white',
                  fontWeight: 'bold',
                  mt: 1,
                }}
              />
            </DialogTitle>
            <DialogContent>
              <Typography variant="body1" paragraph>
                {selectedCertificate.description}
              </Typography>
              
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Requirements:
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {selectedCertificate.requirements}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Progress: {selectedCertificate.currentCount || 0} / {selectedCertificate.totalRequired || 0}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={selectedCertificate.progress || 0}
                  sx={{ height: 8, borderRadius: 4 }}
                />
              </Box>

              {selectedCertificate.reward && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" gutterBottom>
                    Reward:
                  </Typography>
                  <Chip
                    label={selectedCertificate.reward}
                    color="primary"
                    icon={<Star />}
                  />
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedCertificate(null)}>Close</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Container>
  );
};

export default CertificateSystemPage;