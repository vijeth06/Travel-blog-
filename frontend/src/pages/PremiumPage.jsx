import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Switch,
  FormControlLabel,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  LinearProgress,
  Avatar,
  Divider,
  IconButton,
} from '@mui/material';
import {
  Diamond,
  Star,
  Check,
  Close,
  Payment,
  Analytics,
  CloudUpload,
  Support,
  Security,
  Speed,
  Palette,
  CameraAlt,
  Map,
  Group,
  TrendingUp,
  Workspace,
  AutoAwesome,
  MonetizationOn,
} from '@mui/icons-material';
import { useSelector } from 'react-redux';
import axios from 'axios';

const PremiumPage = () => {
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [premiumFeatures, setPremiumFeatures] = useState([]);
  const [pricingPlans, setPricingPlans] = useState([]);
  const [paymentDialog, setPaymentDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [earnings, setEarnings] = useState(null);
  const [monetizationSettings, setMonetizationSettings] = useState({
    enableAds: false,
    enableAffiliate: false,
    enableDonations: false,
    premiumContent: false,
  });
  const { user, token } = useSelector((state) => state.auth);

  useEffect(() => {
    if (token) {
      fetchSubscriptionStatus();
      fetchPricingPlans();
      fetchEarnings();
      fetchMonetizationSettings();
    }
  }, [token]);

  const fetchSubscriptionStatus = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/monetization/subscription`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSubscriptionStatus(response.data);
    } catch (error) {
      console.error('Error fetching subscription status:', error);
      // Demo data
      setSubscriptionStatus({
        tier: 'free',
        expiresAt: null,
        features: ['Basic blogging', 'Limited storage', 'Community support'],
      });
    }
  };

  const fetchPricingPlans = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/monetization/plans`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPricingPlans(response.data.plans || []);
    } catch (error) {
      console.error('Error fetching pricing plans:', error);
      // Demo data
      setPricingPlans([
        {
          id: 'basic',
          name: 'Basic',
          price: 9.99,
          period: 'month',
          features: [
            'Unlimited blog posts',
            '10GB storage',
            'Basic analytics',
            'Email support',
            'Custom themes',
          ],
          popular: false,
        },
        {
          id: 'pro',
          name: 'Pro',
          price: 19.99,
          period: 'month',
          features: [
            'Everything in Basic',
            '100GB storage',
            'Advanced analytics',
            'Priority support',
            'Premium themes',
            'Monetization tools',
            'Social media integration',
          ],
          popular: true,
        },
        {
          id: 'enterprise',
          name: 'Enterprise',
          price: 49.99,
          period: 'month',
          features: [
            'Everything in Pro',
            'Unlimited storage',
            'White-label solution',
            'Dedicated support',
            'Custom development',
            'Advanced integrations',
            'Team collaboration',
          ],
          popular: false,
        },
      ]);
    }
  };

  const fetchEarnings = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/monetization/earnings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEarnings(response.data);
    } catch (error) {
      console.error('Error fetching earnings:', error);
      // Demo data
      setEarnings({
        totalEarnings: 245.67,
        thisMonth: 89.23,
        lastMonth: 156.44,
        adRevenue: 123.45,
        affiliateRevenue: 67.89,
        donationRevenue: 54.33,
        pendingPayout: 89.23,
      });
    }
  };

  const fetchMonetizationSettings = async () => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/monetization/settings`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMonetizationSettings(response.data.settings || monetizationSettings);
    } catch (error) {
      console.error('Error fetching monetization settings:', error);
    }
  };

  const handleSubscribe = async (planId) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_URL}/monetization/subscribe`,
        { planId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Handle payment redirect
      window.location.href = response.data.paymentUrl;
    } catch (error) {
      console.error('Error subscribing:', error);
    }
  };

  const handleMonetizationToggle = async (setting, value) => {
    const newSettings = { ...monetizationSettings, [setting]: value };
    setMonetizationSettings(newSettings);
    
    try {
      await axios.put(
        `${process.env.REACT_APP_API_URL}/monetization/settings`,
        { settings: newSettings },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (error) {
      console.error('Error updating monetization settings:', error);
    }
  };

  const PricingCard = ({ plan }) => (
    <Card
      elevation={plan.popular ? 8 : 3}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        border: plan.popular ? '2px solid #1976d2' : 'none',
        transform: plan.popular ? 'scale(1.05)' : 'none',
      }}
    >
      {plan.popular && (
        <Chip
          label="Most Popular"
          color="primary"
          sx={{ position: 'absolute', top: -10, left: '50%', transform: 'translateX(-50%)' }}
        />
      )}
      
      <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
        <Typography variant="h4" gutterBottom>
          {plan.name}
        </Typography>
        
        <Box sx={{ mb: 3 }}>
          <Typography variant="h3" color="primary" component="span">
            ${plan.price}
          </Typography>
          <Typography variant="h6" color="text.secondary" component="span">
            /{plan.period}
          </Typography>
        </Box>

        <List sx={{ mb: 3 }}>
          {plan.features.map((feature, index) => (
            <ListItem key={index} sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 36 }}>
                <Check color="primary" fontSize="small" />
              </ListItemIcon>
              <ListItemText
                primary={feature}
                primaryTypographyProps={{ variant: 'body2' }}
              />
            </ListItem>
          ))}
        </List>

        <Button
          fullWidth
          variant={plan.popular ? 'contained' : 'outlined'}
          size="large"
          onClick={() => {
            setSelectedPlan(plan);
            setPaymentDialog(true);
          }}
          disabled={subscriptionStatus?.tier === plan.id}
        >
          {subscriptionStatus?.tier === plan.id ? 'Current Plan' : 'Upgrade'}
        </Button>
      </CardContent>
    </Card>
  );

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h3" component="h1" gutterBottom sx={{ mb: 4, textAlign: 'center' }}>
        💎 Premium & Monetization
      </Typography>

      {/* Current Subscription Status */}
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
                <Diamond />
              </Avatar>
              <Box>
                <Typography variant="h6">
                  Current Plan: {subscriptionStatus?.tier?.toUpperCase() || 'FREE'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {subscriptionStatus?.expiresAt 
                    ? `Expires: ${new Date(subscriptionStatus.expiresAt).toLocaleDateString()}`
                    : 'No expiration'
                  }
                </Typography>
              </Box>
            </Box>
            {subscriptionStatus?.tier !== 'free' && (
              <Chip label="Active" color="success" icon={<Check />} />
            )}
          </Box>
        </CardContent>
      </Card>

      {/* Earnings Dashboard (for content creators) */}
      {earnings && (
        <Card elevation={3} sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center' }}>
              <MonetizationOn sx={{ mr: 1 }} />
              Earnings Dashboard
            </Typography>
            
            <Grid container spacing={3} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="success.main">
                    ${earnings.totalEarnings?.toFixed(2)}
                  </Typography>
                  <Typography variant="caption">Total Earnings</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="primary">
                    ${earnings.thisMonth?.toFixed(2)}
                  </Typography>
                  <Typography variant="caption">This Month</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="secondary">
                    ${earnings.lastMonth?.toFixed(2)}
                  </Typography>
                  <Typography variant="caption">Last Month</Typography>
                </Paper>
              </Grid>
              <Grid item xs={12} sm={3}>
                <Paper sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h4" color="warning.main">
                    ${earnings.pendingPayout?.toFixed(2)}
                  </Typography>
                  <Typography variant="caption">Pending Payout</Typography>
                </Paper>
              </Grid>
            </Grid>

            {/* Revenue Breakdown */}
            <Typography variant="h6" gutterBottom>Revenue Breakdown</Typography>
            <List>
              <ListItem>
                <ListItemText primary="Ad Revenue" secondary={`$${earnings.adRevenue?.toFixed(2)}`} />
                <LinearProgress
                  variant="determinate"
                  value={(earnings.adRevenue / earnings.totalEarnings) * 100}
                  sx={{ width: 100, mr: 2 }}
                />
              </ListItem>
              <ListItem>
                <ListItemText primary="Affiliate Revenue" secondary={`$${earnings.affiliateRevenue?.toFixed(2)}`} />
                <LinearProgress
                  variant="determinate"
                  value={(earnings.affiliateRevenue / earnings.totalEarnings) * 100}
                  sx={{ width: 100, mr: 2 }}
                />
              </ListItem>
              <ListItem>
                <ListItemText primary="Donations" secondary={`$${earnings.donationRevenue?.toFixed(2)}`} />
                <LinearProgress
                  variant="determinate"
                  value={(earnings.donationRevenue / earnings.totalEarnings) * 100}
                  sx={{ width: 100, mr: 2 }}
                />
              </ListItem>
            </List>
          </CardContent>
        </Card>
      )}

      {/* Monetization Settings */}
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom>
            💰 Monetization Settings
          </Typography>
          <List>
            <ListItem>
              <ListItemIcon>
                <TrendingUp />
              </ListItemIcon>
              <ListItemText
                primary="Enable Advertisements"
                secondary="Show ads on your blog posts to earn revenue"
              />
              <Switch
                checked={monetizationSettings.enableAds}
                onChange={(e) => handleMonetizationToggle('enableAds', e.target.checked)}
              />
            </ListItem>
            <Divider />
            
            <ListItem>
              <ListItemIcon>
                <Group />
              </ListItemIcon>
              <ListItemText
                primary="Affiliate Marketing"
                secondary="Earn commissions from product recommendations"
              />
              <Switch
                checked={monetizationSettings.enableAffiliate}
                onChange={(e) => handleMonetizationToggle('enableAffiliate', e.target.checked)}
              />
            </ListItem>
            <Divider />
            
            <ListItem>
              <ListItemIcon>
                <MonetizationOn />
              </ListItemIcon>
              <ListItemText
                primary="Accept Donations"
                secondary="Allow readers to support your content"
              />
              <Switch
                checked={monetizationSettings.enableDonations}
                onChange={(e) => handleMonetizationToggle('enableDonations', e.target.checked)}
              />
            </ListItem>
            <Divider />
            
            <ListItem>
              <ListItemIcon>
                <Diamond />
              </ListItemIcon>
              <ListItemText
                primary="Premium Content"
                secondary="Create subscriber-only content"
              />
              <Switch
                checked={monetizationSettings.premiumContent}
                onChange={(e) => handleMonetizationToggle('premiumContent', e.target.checked)}
              />
            </ListItem>
          </List>
        </CardContent>
      </Card>

      {/* Pricing Plans */}
      <Typography variant="h4" gutterBottom sx={{ mb: 3, textAlign: 'center' }}>
        Choose Your Plan
      </Typography>
      <Grid container spacing={4} sx={{ mb: 6 }}>
        {pricingPlans.map((plan) => (
          <Grid item xs={12} md={4} key={plan.id}>
            <PricingCard plan={plan} />
          </Grid>
        ))}
      </Grid>

      {/* Premium Features Showcase */}
      <Card elevation={3} sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h5" gutterBottom sx={{ textAlign: 'center' }}>
            ✨ Premium Features
          </Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 1 }}>
                  <Analytics />
                </Avatar>
                <Typography variant="h6">Advanced Analytics</Typography>
                <Typography variant="body2" color="text.secondary">
                  Detailed insights into your audience and content performance
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Avatar sx={{ bgcolor: 'secondary.main', mx: 'auto', mb: 1 }}>
                  <CloudUpload />
                </Avatar>
                <Typography variant="h6">Unlimited Storage</Typography>
                <Typography variant="body2" color="text.secondary">
                  Upload unlimited photos and videos for your travel stories
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={4}>
              <Box sx={{ textAlign: 'center', p: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 1 }}>
                  <Palette />
                </Avatar>
                <Typography variant="h6">Custom Themes</Typography>
                <Typography variant="body2" color="text.secondary">
                  Personalize your blog with premium themes and customization
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Payment Dialog */}
      <Dialog
        open={paymentDialog}
        onClose={() => setPaymentDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Upgrade to {selectedPlan?.name}
          <IconButton
            onClick={() => setPaymentDialog(false)}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <Close />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          {selectedPlan && (
            <Box>
              <Alert severity="info" sx={{ mb: 2 }}>
                You're upgrading to the {selectedPlan.name} plan for ${selectedPlan.price}/{selectedPlan.period}
              </Alert>
              
              <Typography variant="h6" gutterBottom>
                Payment Details
              </Typography>
              <TextField
                fullWidth
                label="Card Number"
                placeholder="1234 5678 9012 3456"
                sx={{ mb: 2 }}
              />
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="Expiry Date"
                    placeholder="MM/YY"
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    fullWidth
                    label="CVV"
                    placeholder="123"
                  />
                </Grid>
              </Grid>
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPaymentDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={() => selectedPlan && handleSubscribe(selectedPlan.id)}
            startIcon={<Payment />}
          >
            Subscribe Now
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default PremiumPage;