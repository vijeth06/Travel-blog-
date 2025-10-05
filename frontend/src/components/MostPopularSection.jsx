import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Chip,
  Skeleton,
  useTheme,
  useMediaQuery,
  Container
} from '@mui/material';
import { Link } from 'react-router-dom';
import { Star, Favorite } from '@mui/icons-material';
import { getMostPopularByContinent } from '../api/favoritePlaces';

const MostPopularSection = () => {
  const [popularPlaces, setPopularPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    const fetchPopularPlaces = async () => {
      try {
        setLoading(true);
        const response = await getMostPopularByContinent();
        if (response.success) {
          setPopularPlaces(response.data);
        }
      } catch (error) {
        console.error('Error fetching popular places:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularPlaces();
  }, []);

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Typography variant="h5" component="h2" gutterBottom>
          Most Popular Places
        </Typography>
        <Grid container spacing={3}>
          {[1, 2, 3, 4].map((item) => (
            <Grid item xs={12} sm={6} md={3} key={item}>
              <Skeleton variant="rectangular" height={200} />
              <Skeleton variant="text" width="80%" />
              <Skeleton variant="text" width="60%" />
            </Grid>
          ))}
        </Grid>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography 
        variant="h5" 
        component="h2" 
        gutterBottom 
        sx={{ 
          fontWeight: 'bold',
          mb: 4,
          position: 'relative',
          '&:after': {
            content: '""',
            position: 'absolute',
            bottom: -8,
            left: 0,
            width: 60,
            height: 4,
            backgroundColor: 'primary.main',
            borderRadius: 2
          }
        }}
      >
        Most Popular Places
      </Typography>
      
      {popularPlaces.map(({ continent, places }) => (
        <Box key={continent} sx={{ mb: 6 }}>
          <Typography 
            variant="h6" 
            component="h3" 
            sx={{ 
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              color: 'text.secondary'
            }}
          >
            {continent}
            <Chip 
              label={`${places.length} places`} 
              size="small" 
              sx={{ ml: 2, fontWeight: 'medium' }}
            />
          </Typography>
          
          <Grid container spacing={3}>
            {places.map((place) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={place._id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.3s, box-shadow 0.3s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 6
                    }
                  }}
                >
                  <CardActionArea 
                    component={Link} 
                    to={`/favorite-places/${place.slug}`}
                    sx={{ 
                      flexGrow: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'stretch'
                    }}
                  >
                    <Box sx={{ position: 'relative', pt: '75%' }}>
                      <CardMedia
                        component="img"
                        image={place.images?.[0] || '/placeholder-place.jpg'}
                        alt={place.placeName}
                        sx={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover'
                        }}
                      />
                      <Box 
                        sx={{
                          position: 'absolute',
                          top: 8,
                          right: 8,
                          display: 'flex',
                          alignItems: 'center',
                          backgroundColor: 'rgba(0,0,0,0.6)',
                          color: 'white',
                          px: 1,
                          borderRadius: 1,
                          '& svg': {
                            color: 'warning.main',
                            fontSize: '1rem',
                            mr: 0.5
                          }
                        }}
                      >
                        <Star />
                        <Typography variant="caption">
                          {place.rating?.toFixed(1) || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography 
                        variant="subtitle1" 
                        component="h4" 
                        gutterBottom
                        sx={{
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          minHeight: '3em',
                          fontWeight: 'medium'
                        }}
                      >
                        {place.placeName}
                      </Typography>
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 'auto' }}>
                        <Typography 
                          variant="body2" 
                          color="text.secondary"
                          sx={{
                            display: '-webkit-box',
                            WebkitLineClamp: 1,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}
                        >
                          {place.city && `${place.city}, `}{place.country}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 1 }}>
                          <Favorite 
                            fontSize="small" 
                            color="error" 
                            sx={{ mr: 0.5, fontSize: '1rem' }} 
                          />
                          <Typography variant="body2" color="text.secondary">
                            {place.likesCount || 0}
                          </Typography>
                        </Box>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}
    </Container>
  );
};

export default MostPopularSection;
