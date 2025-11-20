import React, { useEffect, useState } from 'react';
import {
  Container,
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Chip,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  EmojiEvents,
  Verified,
  LocationOn,
  CameraAlt,
  Hiking,
  Restaurant,
  School,
  Star,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import { getMyBadges, checkBadges, toggleBadgeVisibility } from '../api/badges';

const badgeIcons = {
  certified_guide: EmojiEvents,
  local_expert: LocationOn,
  top_contributor: Star,
  verified_traveler: Verified,
  photography_pro: CameraAlt,
  adventure_seeker: Hiking,
  culture_enthusiast: School,
  food_explorer: Restaurant,
};

const badgeColors = {
  bronze: '#CD7F32',
  silver: '#C0C0C0',
  gold: '#FFD700',
  platinum: '#E5E4E2',
};

const BadgesPage = () => {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      const res = await getMyBadges();
      setBadges(res.data?.data || []);
    } catch (err) {
      console.error('Failed to load badges', err);
      setError('Failed to load badges');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckBadges = async () => {
    try {
      setChecking(true);
      const res = await checkBadges();
      const newBadges = res.data?.data || [];
      if (newBadges.length > 0) {
        setError('');
        loadBadges();
      }
    } catch (err) {
      console.error('Failed to check badges', err);
      setError('Failed to check for new badges');
    } finally {
      setChecking(false);
    }
  };

  const handleToggleVisibility = async (badgeId) => {
    try {
      await toggleBadgeVisibility(badgeId);
      loadBadges();
    } catch (err) {
      console.error('Failed to toggle visibility', err);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          My Badges
        </Typography>
        <Chip
          label="Check for New Badges"
          onClick={handleCheckBadges}
          disabled={checking}
          color="primary"
          clickable
        />
      </Box>

      {error && (
        <Alert severity="info" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {badges.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8 }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No badges earned yet
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Keep creating content and engaging with the community to earn badges!
          </Typography>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {badges.map((badge) => {
            const Icon = badgeIcons[badge.badgeType] || EmojiEvents;
            const color = badgeColors[badge.level] || '#FFD700';

            return (
              <Grid item xs={12} sm={6} md={4} key={badge._id}>
                <Card sx={{ position: 'relative', border: `2px solid ${color}` }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'start', justifyContent: 'space-between' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Icon sx={{ fontSize: 48, color }} />
                        <Box>
                          <Typography variant="h6">
                            {badge.badgeType.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                          </Typography>
                          <Chip label={badge.level} size="small" sx={{ bgcolor: color, color: '#000', mt: 0.5 }} />
                        </Box>
                      </Box>
                      <Tooltip title={badge.isVisible ? 'Hide from profile' : 'Show on profile'}>
                        <IconButton
                          size="small"
                          onClick={() => handleToggleVisibility(badge._id)}
                        >
                          {badge.isVisible ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                      </Tooltip>
                    </Box>
                    {badge.criteria && (
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                        {badge.criteria}
                      </Typography>
                    )}
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mt: 1 }}>
                      Earned {new Date(badge.awardedAt).toLocaleDateString()}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      )}
    </Container>
  );
};

export default BadgesPage;
