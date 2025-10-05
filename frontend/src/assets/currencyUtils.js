// Currency utilities and formatting functions

export const currencySymbols = {
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'INR': '₹',
  'JPY': '¥',
  'CNY': '¥',
  'AUD': 'A$',
  'CAD': 'C$',
  'CHF': 'CHF',
  'SEK': 'kr',
  'NOK': 'kr',
  'DKK': 'kr',
  'PLN': 'zł',
  'CZK': 'Kč',
  'HUF': 'Ft',
  'RUB': '₽',
  'BRL': 'R$',
  'MXN': '$',
  'ARS': '$',
  'CLP': '$',
  'COP': '$',
  'PEN': 'S/',
  'ZAR': 'R',
  'EGP': 'E£',
  'AED': 'د.إ',
  'SAR': '﷼',
  'QAR': '﷼',
  'KWD': 'د.ك',
  'BHD': '.د.ب',
  'OMR': '﷼',
  'JOD': 'د.ا',
  'THB': '฿',
  'VND': '₫',
  'KHR': '៛',
  'LAK': '₭',
  'MMK': 'Ks',
  'SGD': 'S$',
  'MYR': 'RM',
  'IDR': 'Rp',
  'PHP': '₱',
  'BND': 'B$',
  'KRW': '₩',
  'TWD': 'NT$',
  'HKD': 'HK$',
  'MOP': 'MOP$',
  'NZD': 'NZ$',
  'FJD': 'FJ$',
  'NPR': '₨',
  'LKR': '₨',
  'BDT': '৳',
  'PKR': '₨',
  'MVR': '.ރ',
  'BTN': 'Nu.'
};

export const currencyNames = {
  'USD': 'US Dollar',
  'EUR': 'Euro',
  'GBP': 'British Pound',
  'INR': 'Indian Rupee',
  'JPY': 'Japanese Yen',
  'CNY': 'Chinese Yuan',
  'AUD': 'Australian Dollar',
  'CAD': 'Canadian Dollar',
  'CHF': 'Swiss Franc',
  'THB': 'Thai Baht',
  'SGD': 'Singapore Dollar',
  'MYR': 'Malaysian Ringgit',
  'IDR': 'Indonesian Rupiah',
  'KRW': 'South Korean Won',
  'NPR': 'Nepalese Rupee',
  'LKR': 'Sri Lankan Rupee',
  'MVR': 'Maldivian Rufiyaa',
  'BTN': 'Bhutanese Ngultrum'
};

export const formatCurrency = (amount, currencyCode, locale = 'en-US') => {
  if (!amount || !currencyCode) return amount;
  
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  } catch (error) {
    // Fallback formatting
    const symbol = currencySymbols[currencyCode] || currencyCode;
    const formattedAmount = new Intl.NumberFormat(locale).format(amount);
    return `${symbol}${formattedAmount}`;
  }
};

export const formatPrice = (amount, currency, symbolPosition = 'before') => {
  if (!amount || !currency) return amount;
  
  const symbol = currency.symbol || currencySymbols[currency.code] || currency.code;
  const formattedAmount = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount);
  
  return symbolPosition === 'after' 
    ? `${formattedAmount} ${symbol}`
    : `${symbol}${formattedAmount}`;
};

export const getCurrencyByCountry = (countryCode) => {
  const countryCurrencyMap = {
    'IN': { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
    'US': { code: 'USD', symbol: '$', name: 'US Dollar' },
    'GB': { code: 'GBP', symbol: '£', name: 'British Pound' },
    'FR': { code: 'EUR', symbol: '€', name: 'Euro' },
    'DE': { code: 'EUR', symbol: '€', name: 'Euro' },
    'JP': { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
    'CN': { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
    'AU': { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
    'CA': { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
    'TH': { code: 'THB', symbol: '฿', name: 'Thai Baht' },
    'SG': { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
    'MY': { code: 'MYR', symbol: 'RM', name: 'Malaysian Ringgit' },
    'ID': { code: 'IDR', symbol: 'Rp', name: 'Indonesian Rupiah' },
    'KR': { code: 'KRW', symbol: '₩', name: 'South Korean Won' },
    'NP': { code: 'NPR', symbol: '₨', name: 'Nepalese Rupee' },
    'LK': { code: 'LKR', symbol: '₨', name: 'Sri Lankan Rupee' },
    'MV': { code: 'MVR', symbol: '.ރ', name: 'Maldivian Rufiyaa' },
    'BT': { code: 'BTN', symbol: 'Nu.', name: 'Bhutanese Ngultrum' }
  };
  
  return countryCurrencyMap[countryCode?.toUpperCase()] || null;
};

export const getPopularCurrencies = () => [
  { code: 'USD', name: 'US Dollar', symbol: '$' },
  { code: 'EUR', name: 'Euro', symbol: '€' },
  { code: 'GBP', name: 'British Pound', symbol: '£' },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$' },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$' },
  { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF' },
  { code: 'CNY', name: 'Chinese Yuan', symbol: '¥' },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$' }
];

// Mock exchange rates (in production, use real API)
export const mockExchangeRates = {
  'USD': { 'INR': 83.0, 'EUR': 0.85, 'GBP': 0.73, 'JPY': 110.0, 'AUD': 1.35, 'CAD': 1.25, 'SGD': 1.35, 'THB': 33.0 },
  'INR': { 'USD': 0.012, 'EUR': 0.010, 'GBP': 0.009, 'JPY': 1.33, 'AUD': 0.016, 'CAD': 0.015, 'SGD': 0.016, 'THB': 0.40 },
  'EUR': { 'USD': 1.18, 'INR': 98.0, 'GBP': 0.86, 'JPY': 130.0, 'AUD': 1.59, 'CAD': 1.47, 'SGD': 1.59, 'THB': 39.0 },
  'GBP': { 'USD': 1.37, 'INR': 114.0, 'EUR': 1.16, 'JPY': 151.0, 'AUD': 1.85, 'CAD': 1.71, 'SGD': 1.85, 'THB': 45.0 },
  'JPY': { 'USD': 0.009, 'INR': 0.75, 'EUR': 0.008, 'GBP': 0.007, 'AUD': 0.012, 'CAD': 0.011, 'SGD': 0.012, 'THB': 0.30 },
  'THB': { 'USD': 0.030, 'INR': 2.5, 'EUR': 0.026, 'GBP': 0.022, 'JPY': 3.3, 'AUD': 0.041, 'CAD': 0.038, 'SGD': 0.041 }
};

export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  if (fromCurrency === toCurrency) return amount;
  
  const rate = mockExchangeRates[fromCurrency]?.[toCurrency];
  if (rate) {
    return Math.round(amount * rate * 100) / 100;
  }
  
  return amount; // Return original if no rate found
};