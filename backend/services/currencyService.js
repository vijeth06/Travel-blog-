const Country = require('../models/Country');

class CurrencyService {
  constructor() {
    this.currencyCache = new Map();
    this.exchangeRates = new Map();
    this.lastUpdated = null;
  }

  // Get currency information for a country
  async getCurrencyByCountry(countryCode) {
    try {
      if (this.currencyCache.has(countryCode)) {
        return this.currencyCache.get(countryCode);
      }

      const country = await Country.findOne({ 
        code: countryCode.toUpperCase() 
      }).select('currency');

      if (country && country.currency) {
        this.currencyCache.set(countryCode, country.currency);
        return country.currency;
      }

      return null;
    } catch (error) {
      console.error('Error getting currency by country:', error);
      return null;
    }
  }

  // Format price with currency symbol
  formatPrice(amount, currencyInfo, locale = 'en-US') {
    if (!currencyInfo || !amount) return amount;

    const { symbol, code, symbolPosition } = currencyInfo;
    
    try {
      // Use Intl.NumberFormat for proper formatting
      const formatter = new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: code,
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
      });

      return formatter.format(amount);
    } catch (error) {
      // Fallback to manual formatting
      const formattedAmount = new Intl.NumberFormat(locale).format(amount);
      
      if (symbolPosition === 'after') {
        return `${formattedAmount} ${symbol}`;
      } else {
        return `${symbol}${formattedAmount}`;
      }
    }
  }

  // Get all supported currencies
  async getAllCurrencies() {
    try {
      const currencies = await Country.find({ isActive: true })
        .select('name code currency')
        .sort({ name: 1 });

      const uniqueCurrencies = new Map();
      
      currencies.forEach(country => {
        if (country.currency && country.currency.code) {
          const key = country.currency.code;
          if (!uniqueCurrencies.has(key)) {
            uniqueCurrencies.set(key, {
              ...country.currency,
              countries: [country.name]
            });
          } else {
            uniqueCurrencies.get(key).countries.push(country.name);
          }
        }
      });

      return Array.from(uniqueCurrencies.values());
    } catch (error) {
      console.error('Error getting all currencies:', error);
      return [];
    }
  }

  // Convert price between currencies (basic implementation)
  async convertPrice(amount, fromCurrency, toCurrency) {
    try {
      // This is a basic implementation
      // In production, you would integrate with a real exchange rate API
      
      if (fromCurrency === toCurrency) {
        return amount;
      }

      // Mock exchange rates (you should replace with real API)
      const mockRates = {
        'USD': { 'INR': 83.0, 'EUR': 0.85, 'GBP': 0.73, 'JPY': 110.0 },
        'INR': { 'USD': 0.012, 'EUR': 0.010, 'GBP': 0.009, 'JPY': 1.33 },
        'EUR': { 'USD': 1.18, 'INR': 98.0, 'GBP': 0.86, 'JPY': 130.0 },
        'GBP': { 'USD': 1.37, 'INR': 114.0, 'EUR': 1.16, 'JPY': 151.0 },
        'JPY': { 'USD': 0.009, 'INR': 0.75, 'EUR': 0.008, 'GBP': 0.007 }
      };

      const rate = mockRates[fromCurrency]?.[toCurrency];
      if (rate) {
        return Math.round(amount * rate * 100) / 100;
      }

      return amount; // Return original if no rate found
    } catch (error) {
      console.error('Error converting price:', error);
      return amount;
    }
  }

  // Get currency symbol by code
  getCurrencySymbol(currencyCode) {
    const symbols = {
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
      'LBP': '£',
      'SYP': '£',
      'IQD': 'ع.د',
      'IRR': '﷼',
      'AFN': '؋',
      'PKR': '₨',
      'BDT': '৳',
      'LKR': '₨',
      'NPR': '₨',
      'BTN': 'Nu.',
      'MVR': '.ރ',
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
      'PGK': 'K',
      'SBD': 'SI$',
      'VUV': 'VT',
      'WST': 'WS$',
      'TOP': 'T$'
    };

    return symbols[currencyCode] || currencyCode;
  }

  // Get popular currencies
  getPopularCurrencies() {
    return [
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
  }
}

module.exports = new CurrencyService();