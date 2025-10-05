import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Button,
  IconButton,
  Tooltip
} from '@mui/material';
import {
  LocationOn,
  Language,
  AttachMoney,
  TrendingUp,
  Article,
  LocalOffer,
  Favorite,
  FavoriteBorder
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const CountryCard = ({ country, onFavorite, isFavorite = false, showStats = true }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate(`/countries/${country.slug || country._id}`);
  };

  const handleFavoriteClick = (e) => {
    e.stopPropagation();
    if (onFavorite) {
      onFavorite(country._id);
    }
  };

  const formatCurrency = (currency) => {
    if (!currency) return '';
    return `${currency.symbol} ${currency.name} (${currency.code})`;
  };

  return (
    <Card 
      sx={{ 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
      onClick={handleCardClick}
    >
      {/* Country Flag/Image */}
      <CardMedia
        component="img"
        height="160"
        image={
          country.flagUrl || 
          country.images?.[0]?.url || 
          `https://flagcdn.com/w320/${country.code?.toLowerCase()}.png` ||
          '/api/placeholder/320/160'
        }
        alt={`${country.name} flag`}
        sx={{ objectFit: 'cover' }}
      />

      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold', flex: 1 }}>
            {country.name}
          </Typography>
          
          {onFavorite && (
            <IconButton 
              size="small" 
              onClick={handleFavoriteClick}
              sx={{ color: isFavorite ? 'error.main' : 'grey.400' }}
            >
              {isFavorite ? <Favorite /> : <FavoriteBorder />}
            </IconButton>
          )}
        </Box>

        {/* Location Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary' }}>
          <LocationOn sx={{ fontSize: 16, mr: 0.5 }} />
          <Typography variant="body2">
            {country.continent}
            {country.region && ` • ${country.region}`}
          </Typography>
        </Box>

        {/* Currency */}
        {country.currency && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1, color: 'text.secondary' }}>
            <AttachMoney sx={{ fontSize: 16, mr: 0.5 }} />
            <Typography variant="body2">
              {formatCurrency(country.currency)}
            </Typography>
          </Box>
        )}

        {/* Capital */}
        {country.capital && (
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            <strong>Capital:</strong> {country.capital}
          </Typography>
        )}

        {/* Description */}
        {country.description && (
          <Typography 
            variant="body2" 
            color="text.secondary" 
            sx={{ 
              mb: 2,
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}
          >
            {country.description}
          </Typography>
        )}

        {/* Tags */}
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 2 }}>
          {country.featured && (
            <Chip 
              label="Featured" 
              size="small" 
              color="primary" 
              variant="outlined"
            />
          )}
          {country.isIndia && (
            <Chip 
              label="India" 
              size="small" 
              color="secondary" 
              variant="outlined"
            />
          )}
          {country.bestTimeToVisit && (
            <Chip 
              label={`Best: ${country.bestTimeToVisit.split(' ')[0]}-${country.bestTimeToVisit.split(' ')[2] || ''}`}
              size="small" 
              variant="outlined"
            />
          )}
        </Box>

        {/* Stats */}
        {showStats && (
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 'auto' }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {country.blogsCount > 0 && (
                <Tooltip title="Blog Posts">
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                    <Article sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="caption">{country.blogsCount}</Typography>
                  </Box>
                </Tooltip>
              )}
              
              {country.packagesCount > 0 && (
                <Tooltip title="Travel Packages">
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                    <LocalOffer sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="caption">{country.packagesCount}</Typography>
                  </Box>
                </Tooltip>
              )}
              
              {country.popularity > 0 && (
                <Tooltip title="Popularity Score">
                  <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                    <TrendingUp sx={{ fontSize: 16, mr: 0.5 }} />
                    <Typography variant="caption">{country.popularity}</Typography>
                  </Box>
                </Tooltip>
              )}
            </Box>

            <Button 
              size="small" 
              variant="outlined"
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
            >
              Explore
            </Button>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default CountryCard;