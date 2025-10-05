import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Chip,
  Tooltip,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  AttachMoney,
  SwapHoriz,
  Info,
  TrendingUp
} from '@mui/icons-material';
import { getCountryCurrency } from '../api/countries';

const CurrencyDisplay = ({ 
  amount, 
  countryCode, 
  currency, 
  showConverter = false, 
  size = 'medium',
  variant = 'default' 
}) => {
  const [currencyInfo, setCurrencyInfo] = useState(currency);
  const [convertedAmounts, setConvertedAmounts] = useState({});
  const [anchorEl, setAnchorEl] = useState(null);
  const [loading, setLoading] = useState(false);

  // Popular currencies for conversion
  const popularCurrencies = [
    { code: 'USD', name: 'US Dollar', symbol: '$', rate: 1 },
    { code: 'EUR', name: 'Euro', symbol: '€', rate: 0.85 },
    { code: 'GBP', name: 'British Pound', symbol: '£', rate: 0.73 },
    { code: 'INR', name: 'Indian Rupee', symbol: '₹', rate: 83.0 },
    { code: 'JPY', name: 'Japanese Yen', symbol: '¥', rate: 110.0 },
    { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', rate: 1.35 },
    { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', rate: 1.25 },
    { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', rate: 1.35 }
  ];

  useEffect(() => {
    if (countryCode && !currency) {
      fetchCurrencyInfo();
    }
  }, [countryCode, currency]);

  const fetchCurrencyInfo = async () => {
    try {
      setLoading(true);
      const data = await getCountryCurrency(countryCode);
      setCurrencyInfo(data.currency);
    } catch (error) {
      console.error('Error fetching currency info:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (value, currencyData = currencyInfo) => {
    if (!value || !currencyData) return value;

    const { symbol, symbolPosition = 'before' } = currencyData;
    const formattedValue = new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(value);

    return symbolPosition === 'after' 
      ? `${formattedValue} ${symbol}`
      : `${symbol}${formattedValue}`;
  };

  const convertCurrency = (fromAmount, fromCurrency, toCurrency) => {
    // Mock conversion rates (in production, use real API)
    const baseRates = {
      'USD': 1,
      'EUR': 0.85,
      'GBP': 0.73,
      'INR': 83.0,
      'JPY': 110.0,
      'AUD': 1.35,
      'CAD': 1.25,
      'SGD': 1.35,
      'THB': 33.0,
      'MYR': 4.2,
      'IDR': 15000
    };

    const fromRate = baseRates[fromCurrency] || 1;
    const toRate = baseRates[toCurrency] || 1;
    
    // Convert to USD first, then to target currency
    const usdAmount = fromAmount / fromRate;
    return usdAmount * toRate;
  };

  const handleConverterClick = (event) => {
    setAnchorEl(event.currentTarget);
    
    // Calculate conversions
    if (currencyInfo && amount) {
      const conversions = {};
      popularCurrencies.forEach(targetCurrency => {
        if (targetCurrency.code !== currencyInfo.code) {
          conversions[targetCurrency.code] = {
            amount: convertCurrency(amount, currencyInfo.code, targetCurrency.code),
            currency: targetCurrency
          };
        }
      });
      setConvertedAmounts(conversions);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <AttachMoney sx={{ fontSize: size === 'small' ? 16 : 20, mr: 0.5 }} />
        <Typography variant={size === 'small' ? 'caption' : 'body2'}>
          Loading...
        </Typography>
      </Box>
    );
  }

  if (!currencyInfo) {
    return null;
  }

  const displayAmount = formatAmount(amount);

  // Different variants
  if (variant === 'chip') {
    return (
      <Chip
        icon={<AttachMoney />}
        label={displayAmount || `${currencyInfo.symbol} ${currencyInfo.name}`}
        size={size}
        variant="outlined"
        onClick={showConverter ? handleConverterClick : undefined}
        clickable={showConverter}
      />
    );
  }

  if (variant === 'minimal') {
    return (
      <Typography 
        variant={size === 'small' ? 'caption' : 'body2'}
        sx={{ 
          display: 'flex', 
          alignItems: 'center',
          fontWeight: amount ? 'bold' : 'normal'
        }}
      >
        {displayAmount || currencyInfo.symbol}
      </Typography>
    );
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <AttachMoney sx={{ 
          fontSize: size === 'small' ? 16 : 20, 
          mr: 0.5,
          color: 'primary.main'
        }} />
        <Typography 
          variant={size === 'small' ? 'body2' : 'h6'}
          sx={{ fontWeight: amount ? 'bold' : 'normal' }}
        >
          {displayAmount || `${currencyInfo.symbol} ${currencyInfo.name}`}
        </Typography>
      </Box>

      {currencyInfo.code && (
        <Chip 
          label={currencyInfo.code} 
          size="small" 
          variant="outlined"
          sx={{ fontSize: '0.75rem' }}
        />
      )}

      {showConverter && amount && (
        <Tooltip title="Convert Currency">
          <IconButton size="small" onClick={handleConverterClick}>
            <SwapHoriz />
          </IconButton>
        </Tooltip>
      )}

      {/* Currency Info Tooltip */}
      <Tooltip 
        title={
          <Box>
            <Typography variant="subtitle2">{currencyInfo.name}</Typography>
            <Typography variant="caption">Code: {currencyInfo.code}</Typography>
            <Typography variant="caption" display="block">
              Symbol: {currencyInfo.symbol}
            </Typography>
          </Box>
        }
      >
        <IconButton size="small">
          <Info sx={{ fontSize: 16 }} />
        </IconButton>
      </Tooltip>

      {/* Currency Converter Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleClose}
        PaperProps={{
          sx: { minWidth: 250, maxHeight: 400 }
        }}
      >
        <MenuItem disabled>
          <ListItemIcon>
            <SwapHoriz />
          </ListItemIcon>
          <ListItemText 
            primary="Currency Converter"
            secondary={`From ${currencyInfo.code}`}
          />
        </MenuItem>
        <Divider />
        
        {Object.entries(convertedAmounts).map(([code, data]) => (
          <MenuItem key={code} onClick={handleClose}>
            <ListItemIcon>
              <Typography variant="h6">{data.currency.symbol}</Typography>
            </ListItemIcon>
            <ListItemText
              primary={formatAmount(data.amount, data.currency)}
              secondary={`${data.currency.name} (${code})`}
            />
          </MenuItem>
        ))}
        
        <Divider />
        <MenuItem onClick={handleClose} disabled>
          <ListItemIcon>
            <TrendingUp />
          </ListItemIcon>
          <ListItemText 
            primary="Rates are approximate"
            secondary="For exact rates, check financial sources"
          />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default CurrencyDisplay;