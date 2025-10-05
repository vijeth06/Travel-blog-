// Country flag utilities and mappings
export const getCountryFlag = (countryCode) => {
  if (!countryCode) return null;
  return `https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`;
};

export const getCountryFlagEmoji = (countryCode) => {
  const flagEmojis = {
    'IN': '🇮🇳',
    'US': '🇺🇸',
    'GB': '🇬🇧',
    'FR': '🇫🇷',
    'DE': '🇩🇪',
    'JP': '🇯🇵',
    'CN': '🇨🇳',
    'AU': '🇦🇺',
    'CA': '🇨🇦',
    'IT': '🇮🇹',
    'ES': '🇪🇸',
    'BR': '🇧🇷',
    'RU': '🇷🇺',
    'KR': '🇰🇷',
    'TH': '🇹🇭',
    'SG': '🇸🇬',
    'MY': '🇲🇾',
    'ID': '🇮🇩',
    'PH': '🇵🇭',
    'VN': '🇻🇳',
    'NP': '🇳🇵',
    'LK': '🇱🇰',
    'BD': '🇧🇩',
    'PK': '🇵🇰',
    'MV': '🇲🇻',
    'BT': '🇧🇹',
    'AE': '🇦🇪',
    'SA': '🇸🇦',
    'EG': '🇪🇬',
    'ZA': '🇿🇦',
    'KE': '🇰🇪',
    'NG': '🇳🇬',
    'MA': '🇲🇦',
    'TN': '🇹🇳',
    'MX': '🇲🇽',
    'AR': '🇦🇷',
    'CL': '🇨🇱',
    'PE': '🇵🇪',
    'CO': '🇨🇴',
    'NZ': '🇳🇿',
    'FJ': '🇫🇯'
  };
  
  return flagEmojis[countryCode?.toUpperCase()] || '🏳️';
};

export const getContinentEmoji = (continent) => {
  const continentEmojis = {
    'Asia': '🌏',
    'Europe': '🇪🇺',
    'North America': '🌎',
    'South America': '🌎',
    'Africa': '🌍',
    'Oceania': '🏝️'
  };
  
  return continentEmojis[continent] || '🌍';
};

export const getCountryInfo = (countryCode) => {
  const countryInfo = {
    'IN': { name: 'India', continent: 'Asia', region: 'South Asia' },
    'US': { name: 'United States', continent: 'North America', region: 'North America' },
    'GB': { name: 'United Kingdom', continent: 'Europe', region: 'Northern Europe' },
    'FR': { name: 'France', continent: 'Europe', region: 'Western Europe' },
    'DE': { name: 'Germany', continent: 'Europe', region: 'Central Europe' },
    'JP': { name: 'Japan', continent: 'Asia', region: 'East Asia' },
    'CN': { name: 'China', continent: 'Asia', region: 'East Asia' },
    'AU': { name: 'Australia', continent: 'Oceania', region: 'Australia and New Zealand' },
    'CA': { name: 'Canada', continent: 'North America', region: 'North America' },
    'TH': { name: 'Thailand', continent: 'Asia', region: 'Southeast Asia' },
    'SG': { name: 'Singapore', continent: 'Asia', region: 'Southeast Asia' },
    'MY': { name: 'Malaysia', continent: 'Asia', region: 'Southeast Asia' },
    'ID': { name: 'Indonesia', continent: 'Asia', region: 'Southeast Asia' },
    'NP': { name: 'Nepal', continent: 'Asia', region: 'South Asia' },
    'LK': { name: 'Sri Lanka', continent: 'Asia', region: 'South Asia' },
    'MV': { name: 'Maldives', continent: 'Asia', region: 'South Asia' },
    'BT': { name: 'Bhutan', continent: 'Asia', region: 'South Asia' }
  };
  
  return countryInfo[countryCode?.toUpperCase()] || null;
};