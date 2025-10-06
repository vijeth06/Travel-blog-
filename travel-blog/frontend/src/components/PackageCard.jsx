import React from 'react';
import {
  Card,
  CardMedia,
  CardContent,
  CardActions,
  Typography,
  Button,
  Chip,
  Box,
  Rating,
  IconButton
} from '@mui/material';
import {
  LocationOn,
  AccessTime,
  People,
  FavoriteBorder,
  Favorite,
  ShoppingCart
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import CurrencyDisplay from './CurrencyDisplay';

const PackageCard = ({ 
  package: pkg, 
  onAddToCart, 
  onToggleFavorite, 
  isFavorite = false,
  showActions = true 
}) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate(`/packages/${pkg._id}`);
  };

  const handleAddToCart = (e) => {
    e.stopPropagation();
    onAddToCart && onAddToCart(pkg);
  };

  const handleToggleFavorite = (e) => {
    e.stopPropagation();
    onToggleFavorite && onToggleFavorite(pkg._id);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getDiscountedPrice = () => {
    if (pkg.discount && pkg.discount.percentage > 0) {
      const discountedPrice = pkg.price * (1 - pkg.discount.percentage / 100);
      return discountedPrice;
    }
    return pkg.price;
  };

  const hasDiscount = pkg.discount && pkg.discount.percentage > 0 && 
    (!pkg.discount.validUntil || new Date() <= new Date(pkg.discount.validUntil));

  return (
    <Card 
      sx={{ 
        maxWidth: 345, 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
      onClick={handleViewDetails}
    >
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="200"
          image={pkg.images && pkg.images.length > 0 
            ? pkg.images[0] 
            : '/placeholder-image.jpg'
          }
          alt={pkg.title}
        />
        
        {/* Featured badge */}
        {pkg.featured && (
          <Chip
            label="Featured"
            color="primary"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              left: 8,
              fontWeight: 'bold'
            }}
          />
        )}

        {/* Discount badge */}
        {hasDiscount && (
          <Chip
            label={`${pkg.discount.percentage}% OFF`}
            color="error"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              fontWeight: 'bold'
            }}
          />
        )}

        {/* Favorite button */}
        {showActions && (
          <IconButton
            sx={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)'
              }
            }}
            onClick={handleToggleFavorite}
          >
            {isFavorite ? (
              <Favorite color="error" />
            ) : (
              <FavoriteBorder />
            )}
          </IconButton>
        )}
      </Box>

      <CardContent sx={{ flexGrow: 1 }}>
        <Typography gutterBottom variant="h6" component="h2" noWrap>
          {pkg.title}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <LocationOn color="action" fontSize="small" />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
            {pkg.location}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <AccessTime color="action" fontSize="small" />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
            {pkg.duration}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <People color="action" fontSize="small" />
          <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
            {pkg.type}
          </Typography>
        </Box>

        {/* Rating */}
        {pkg.rating && pkg.rating.count > 0 && (
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Rating 
              value={pkg.rating.average} 
              precision={0.1} 
              size="small" 
              readOnly 
            />
            <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
              ({pkg.rating.count})
            </Typography>
          </Box>
        )}

        <Typography 
          variant="body2" 
          color="text.secondary" 
          sx={{ 
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            mb: 2
          }}
        >
          {pkg.description}
        </Typography>

        {/* Price */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {hasDiscount ? (
            <>
              <CurrencyDisplay 
                amount={getDiscountedPrice()}
                currency={pkg.currency}
                variant="minimal"
                size="large"
              />
              <CurrencyDisplay 
                amount={pkg.price}
                currency={pkg.currency}
                variant="minimal"
                size="small"
                sx={{ textDecoration: 'line-through', color: 'text.secondary' }}
              />
            </>
          ) : (
            <CurrencyDisplay 
              amount={pkg.price}
              currency={pkg.currency}
              variant="minimal"
              size="large"
              showConverter={true}
            />
          )}
        </Box>
      </CardContent>

      {showActions && (
        <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
          <Button 
            size="small" 
            variant="outlined"
            onClick={handleViewDetails}
          >
            View Details
          </Button>
          <Button 
            size="small" 
            variant="contained"
            startIcon={<ShoppingCart />}
            onClick={handleAddToCart}
            disabled={!pkg.availability}
          >
            {pkg.availability ? 'Add to Cart' : 'Unavailable'}
          </Button>
        </CardActions>
      )}
    </Card>
  );
};

export default PackageCard;
