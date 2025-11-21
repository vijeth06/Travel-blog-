import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Box,
  Grid,
  Paper,
  Button,
  Chip,
  Rating,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  ImageList,
  ImageListItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import {
  LocationOn,
  AccessTime,
  People,
  Star,
  Check,
  Close,
  ShoppingCart,
  BookOnline,
  Share,
  Favorite,
  FavoriteBorder,
  Hotel,
  Restaurant,
  DirectionsCar,
  Flight,
  ContactMail
} from '@mui/icons-material';
import { useParams, useNavigate } from 'react-router-dom';
import BookingForm from '../components/BookingForm';
import SaveToTripButton from '../components/SaveToTripButton';
import ReviewsPage from './ReviewsPage';
import ContactProviderDialog from '../components/ContactProviderDialog';

const PackageDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [pkg, setPkg] = useState(null);
  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [contactDialogOpen, setContactDialogOpen] = useState(false);

  useEffect(() => {
    fetchPackageDetails();
  }, [id]);

  const fetchPackageDetails = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/packages/${id}`);
      const data = await response.json();

      if (response.ok) {
        setPkg(data);
        
        // Fetch provider information if package has createdBy
        if (data.createdBy) {
          const providerResponse = await fetch(`/api/users/${data.createdBy}`);
          const providerData = await providerResponse.json();
          if (providerResponse.ok && providerData.role === 'package_provider') {
            setProvider(providerData);
          }
        }
      } else {
        setError(data.message || 'Package not found');
      }
    } catch (err) {
      setError('Failed to fetch package details');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Default travel dates for cart
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() + 1);
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + parseInt(pkg.duration.split(' ')[0]) || 3);

      const response = await fetch('/api/cart/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          packageId: pkg._id,
          quantity: 1,
          travelDates: {
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString()
          },
          travelers: pkg.type === 'Family' ? 4 : pkg.type === 'Couple' ? 2 : 1
        })
      });

      if (response.ok) {
        // Show success message
        alert('Package added to cart successfully!');
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to add to cart');
      }
    } catch (err) {
      setError('Failed to add to cart');
    }
  };

  const handleBookNow = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    setShowBookingForm(true);
  };

  const handleBookingSubmit = async (bookingData) => {
    try {
      setBookingLoading(true);
      const token = localStorage.getItem('token');

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(bookingData)
      });

      if (response.ok) {
        const booking = await response.json();
        navigate(`/bookings/${booking._id}`);
      } else {
        const data = await response.json();
        setError(data.message || 'Failed to create booking');
      }
    } catch (err) {
      setError('Failed to create booking');
    } finally {
      setBookingLoading(false);
    }
  };

  const handleToggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Implement favorite API call
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const getDiscountedPrice = () => {
    if (pkg.discount && pkg.discount.percentage > 0) {
      return pkg.price * (1 - pkg.discount.percentage / 100);
    }
    return pkg.price;
  };

  const hasDiscount = pkg?.discount && pkg.discount.percentage > 0 &&
    (!pkg.discount.validUntil || new Date() <= new Date(pkg.discount.validUntil));

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  if (error || !pkg) {
    return (
      <Container maxWidth="lg" sx={{ py: 8, textAlign: 'center' }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error || 'Package not found'}
        </Alert>
        <Button variant="contained" onClick={() => navigate('/packages')}>
          Back to Packages
        </Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header Section */}
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
              {pkg.title}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <LocationOn color="action" />
                <Typography variant="h6" color="text.secondary" sx={{ ml: 0.5 }}>
                  {pkg.location}
                </Typography>
              </Box>
              {pkg.rating && pkg.rating.count > 0 && (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Rating value={pkg.rating.average} precision={0.1} readOnly />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 0.5 }}>
                    ({pkg.rating.count} reviews)
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button
              variant="outlined"
              startIcon={isFavorite ? <Favorite /> : <FavoriteBorder />}
              onClick={handleToggleFavorite}
              color={isFavorite ? "error" : "primary"}
            >
              {isFavorite ? 'Favorited' : 'Add to Favorites'}
            </Button>
            <Button variant="outlined" startIcon={<Share />}>
              Share
            </Button>
            <SaveToTripButton entityId={pkg._id} type="package" />
          </Box>
        </Box>

        {/* Package Info Chips */}
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
          <Chip icon={<AccessTime />} label={pkg.duration} />
          <Chip icon={<People />} label={pkg.type} />
          {pkg.featured && <Chip label="Featured" color="primary" />}
          {hasDiscount && (
            <Chip label={`${pkg.discount.percentage}% OFF`} color="error" />
          )}
        </Box>
      </Box>

      <Grid container spacing={4}>
        {/* Left Column - Images and Details */}
        <Grid item xs={12} md={8}>
          {/* Image Gallery */}
          {pkg.images && pkg.images.length > 0 && (
            <Paper elevation={2} sx={{ mb: 4, overflow: 'hidden', borderRadius: 2 }}>
              <ImageList variant="quilted" cols={4} rowHeight={200}>
                {pkg.images.map((image, index) => (
                  <ImageListItem
                    key={index}
                    cols={index === 0 ? 2 : 1}
                    rows={index === 0 ? 2 : 1}
                  >
                    <img
                      src={image}
                      alt={`${pkg.title} ${index + 1}`}
                      loading="lazy"
                      style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                    />
                  </ImageListItem>
                ))}
              </ImageList>
            </Paper>
          )}

          {/* Description */}
          <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
              About This Package
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8, mb: 3 }}>
              {pkg.description}
            </Typography>

            {/* Features */}
            {pkg.features && pkg.features.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  Package Features
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {pkg.features.map((feature, index) => (
                    <Chip key={index} label={feature} variant="outlined" />
                  ))}
                </Box>
              </Box>
            )}
          </Paper>

          {/* Itinerary */}
          {pkg.itinerary && pkg.itinerary.length > 0 && (
            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                Itinerary
              </Typography>
              {pkg.itinerary.map((day, index) => (
                <Box key={index} sx={{ mb: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Day {day.day}: {day.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {day.description}
                  </Typography>
                  {day.activities && day.activities.length > 0 && (
                    <List dense>
                      {day.activities.map((activity, actIndex) => (
                        <ListItem key={actIndex} sx={{ py: 0 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <Check color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primary={activity} />
                        </ListItem>
                      ))}
                    </List>
                  )}
                </Box>
              ))}
            </Paper>
          )}

          {/* Inclusions and Exclusions */}
          <Grid container spacing={2} sx={{ mb: 4 }}>
            {pkg.inclusions && pkg.inclusions.length > 0 && (
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'success.main' }}>
                    What's Included
                  </Typography>
                  <List dense>
                    {pkg.inclusions.map((item, index) => (
                      <ListItem key={index} sx={{ py: 0 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <Check color="success" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={item} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            )}

            {pkg.exclusions && pkg.exclusions.length > 0 && (
              <Grid item xs={12} md={6}>
                <Paper elevation={2} sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'error.main' }}>
                    What's Not Included
                  </Typography>
                  <List dense>
                    {pkg.exclusions.map((item, index) => (
                      <ListItem key={index} sx={{ py: 0 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <Close color="error" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primary={item} />
                      </ListItem>
                    ))}
                  </List>
                </Paper>
              </Grid>
            )}
          </Grid>

          {/* Hotel Information */}
          {pkg.hotel && pkg.hotel.name && (
            <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
              <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                <Hotel sx={{ mr: 1, verticalAlign: 'middle' }} />
                Accommodation
              </Typography>
              <Typography variant="h6" gutterBottom>
                {pkg.hotel.name}
              </Typography>
              {pkg.hotel.rating && (
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Rating value={pkg.hotel.rating} readOnly />
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 1 }}>
                    {pkg.hotel.rating} Star Hotel
                  </Typography>
                </Box>
              )}
              {pkg.hotel.amenities && pkg.hotel.amenities.length > 0 && (
                <Box>
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                    Amenities:
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {pkg.hotel.amenities.map((amenity, index) => (
                      <Chip key={index} label={amenity} size="small" variant="outlined" />
                    ))}
                  </Box>
                </Box>
              )}
            </Paper>
          )}
        </Grid>

        {/* Right Column - Booking Card */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, position: 'sticky', top: 24 }}>
            <Box sx={{ mb: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                {hasDiscount ? (
                  <>
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                      {formatPrice(getDiscountedPrice())}
                    </Typography>
                    <Typography
                      variant="h6"
                      color="text.secondary"
                      sx={{ textDecoration: 'line-through' }}
                    >
                      {formatPrice(pkg.price)}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="h4" color="primary" sx={{ fontWeight: 'bold' }}>
                    {formatPrice(pkg.price)}
                  </Typography>
                )}
              </Box>
              <Typography variant="body2" color="text.secondary">
                per person
              </Typography>
            </Box>

            <Divider sx={{ my: 2 }} />

            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Availability:
                <Chip
                  label={pkg.availability ? 'Available' : 'Unavailable'}
                  color={pkg.availability ? 'success' : 'error'}
                  size="small"
                  sx={{ ml: 1 }}
                />
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Capacity: {pkg.maxCapacity - pkg.currentBookings} spots remaining
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Button
                variant="contained"
                size="large"
                fullWidth
                startIcon={<BookOnline />}
                onClick={handleBookNow}
                disabled={!pkg.availability}
                sx={{ py: 1.5 }}
              >
                Book Now
              </Button>

              <Button
                variant="outlined"
                size="large"
                fullWidth
                startIcon={<ShoppingCart />}
                onClick={handleAddToCart}
                disabled={!pkg.availability}
              >
                Add to Cart
              </Button>

              {/* Contact Provider Button */}
              {provider && (
                <Button
                  variant="outlined"
                  size="large"
                  fullWidth
                  color="secondary"
                  startIcon={<ContactMail />}
                  onClick={() => setContactDialogOpen(true)}
                >
                  Contact Provider
                </Button>
              )}
            </Box>

            <Divider sx={{ my: 3 }}>
              <Typography variant="caption" color="text.secondary">
                OR BOOK DIRECTLY
              </Typography>
            </Divider>

            {/* Affiliate Booking Links */}
            <Box>
              <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 2 }}>
                Compare prices and book with our trusted partners:
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                <Button
                  variant="outlined"
                  size="medium"
                  fullWidth
                  startIcon={<Flight />}
                  href={`https://www.booking.com/searchresults.html?ss=${encodeURIComponent(pkg.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                >
                  <Box sx={{ flex: 1, textAlign: 'left' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Booking.com
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Hotels & Accommodation
                    </Typography>
                  </Box>
                </Button>

                <Button
                  variant="outlined"
                  size="medium"
                  fullWidth
                  startIcon={<Hotel />}
                  href={`https://www.airbnb.com/s/${encodeURIComponent(pkg.location)}/homes`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                >
                  <Box sx={{ flex: 1, textAlign: 'left' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Airbnb
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Unique Stays & Experiences
                    </Typography>
                  </Box>
                </Button>

                <Button
                  variant="outlined"
                  size="medium"
                  fullWidth
                  startIcon={<Flight />}
                  href={`https://www.skyscanner.com/transport/flights/${encodeURIComponent(pkg.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                >
                  <Box sx={{ flex: 1, textAlign: 'left' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      Skyscanner
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Flight Comparison
                    </Typography>
                  </Box>
                </Button>

                <Button
                  variant="outlined"
                  size="medium"
                  fullWidth
                  startIcon={<DirectionsCar />}
                  href={`https://www.rentalcars.com/SearchResults.do?city=${encodeURIComponent(pkg.location)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ justifyContent: 'flex-start', textTransform: 'none' }}
                >
                  <Box sx={{ flex: 1, textAlign: 'left' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      RentalCars.com
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Car Rentals
                    </Typography>
                  </Box>
                </Button>
              </Box>
              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2, fontStyle: 'italic' }}>
                * We may earn a commission from bookings made through these links at no extra cost to you.
              </Typography>
            </Box>

            {hasDiscount && (
              <Alert severity="info" sx={{ mt: 2 }}>
                <Typography variant="body2">
                  Save {pkg.discount.percentage}% on this package!
                  {pkg.discount.conditions && (
                    <><br />{pkg.discount.conditions}</>
                  )}
                </Typography>
              </Alert>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Reviews Section */}
      <Box sx={{ mt: 6 }}>
        <ReviewsPage 
          targetType="package" 
          targetId={id} 
          targetTitle={pkg?.title}
        />
      </Box>

      {/* Booking Form Dialog */}
      <Dialog 
        open={showBookingForm} 
        onClose={() => setShowBookingForm(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Book {pkg.title}
        </DialogTitle>
        <DialogContent>
          <BookingForm
            package={pkg}
            onSubmit={handleBookingSubmit}
            loading={bookingLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowBookingForm(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      {/* Contact Provider Dialog */}
      {provider && (
        <ContactProviderDialog
          open={contactDialogOpen}
          onClose={() => setContactDialogOpen(false)}
          provider={provider}
          packageInfo={pkg}
        />
      )}

      {/* Error Alert */}
      {error && (
        <Alert 
          severity="error" 
          sx={{ position: 'fixed', bottom: 24, left: 24, right: 24, zIndex: 1000 }}
          onClose={() => setError('')}
        >
          {error}
        </Alert>
      )}
    </Container>
  );
};

export default PackageDetails;
