// Country-related utility functions
import { getCurrencyByCountry, getCountryFlagEmoji } from '../assets/countryFlags';

export const getCountryDisplayName = (country) => {
  if (!country) return '';
  
  if (typeof country === 'string') {
    return country;
  }
  
  return country.name || country.displayName || '';
};

export const getCountryCode = (country) => {
  if (!country) return '';
  
  if (typeof country === 'string') {
    // Try to find country code from name
    const countryMappings = {
      'India': 'IN',
      'United States': 'US',
      'United Kingdom': 'GB',
      'Thailand': 'TH',
      'Singapore': 'SG',
      'Malaysia': 'MY',
      'Indonesia': 'ID',
      'Nepal': 'NP',
      'Sri Lanka': 'LK',
      'Maldives': 'MV',
      'Bhutan': 'BT',
      'France': 'FR',
      'Italy': 'IT',
      'Spain': 'ES',
      'Germany': 'DE',
      'Australia': 'AU',
      'Japan': 'JP',
      'South Korea': 'KR',
      'China': 'CN'
    };
    return countryMappings[country] || '';
  }
  
  return country.code || country.countryCode || '';
};

export const formatCountryWithFlag = (country) => {
  const name = getCountryDisplayName(country);
  const code = getCountryCode(country);
  const flag = getCountryFlagEmoji(code);
  
  return flag ? `${flag} ${name}` : name;
};

export const getCountryRegion = (country) => {
  if (!country) return '';
  
  const regionMappings = {
    'IN': 'South Asia',
    'US': 'North America',
    'GB': 'Northern Europe',
    'TH': 'Southeast Asia',
    'SG': 'Southeast Asia',
    'MY': 'Southeast Asia',
    'ID': 'Southeast Asia',
    'NP': 'South Asia',
    'LK': 'South Asia',
    'MV': 'South Asia',
    'BT': 'South Asia',
    'FR': 'Western Europe',
    'IT': 'Southern Europe',
    'ES': 'Southern Europe',
    'DE': 'Central Europe',
    'AU': 'Australia and New Zealand',
    'JP': 'East Asia',
    'KR': 'East Asia',
    'CN': 'East Asia'
  };
  
  const code = getCountryCode(country);
  return regionMappings[code] || '';
};

export const getCountryContinent = (country) => {
  if (!country) return '';
  
  const continentMappings = {
    'IN': 'Asia',
    'US': 'North America',
    'GB': 'Europe',
    'TH': 'Asia',
    'SG': 'Asia',
    'MY': 'Asia',
    'ID': 'Asia',
    'NP': 'Asia',
    'LK': 'Asia',
    'MV': 'Asia',
    'BT': 'Asia',
    'FR': 'Europe',
    'IT': 'Europe',
    'ES': 'Europe',
    'DE': 'Europe',
    'AU': 'Oceania',
    'JP': 'Asia',
    'KR': 'Asia',
    'CN': 'Asia'
  };
  
  const code = getCountryCode(country);
  return continentMappings[code] || '';
};

export const isIndianRegion = (country) => {
  if (!country) return false;
  
  if (typeof country === 'object' && country.isIndia) {
    return true;
  }
  
  const name = getCountryDisplayName(country);
  const indianRegions = [
    'India', 'Rajasthan', 'Kerala', 'Goa', 'Himachal Pradesh', 
    'Uttarakhand', 'Maharashtra', 'Karnataka', 'Tamil Nadu',
    'Gujarat', 'Punjab', 'Haryana', 'Uttar Pradesh', 'Bihar',
    'West Bengal', 'Odisha', 'Assam', 'Meghalaya', 'Manipur',
    'Nagaland', 'Tripura', 'Mizoram', 'Arunachal Pradesh',
    'Sikkim', 'Jammu and Kashmir', 'Ladakh', 'Delhi', 'Mumbai',
    'Kolkata', 'Chennai', 'Bangalore', 'Hyderabad', 'Pune',
    'Ahmedabad', 'Jaipur', 'Lucknow', 'Kanpur', 'Nagpur'
  ];
  
  return indianRegions.includes(name);
};

export const getCountryCurrency = (country) => {
  const code = getCountryCode(country);
  return getCurrencyByCountry(code);
};

export const getCountryLanguages = (country) => {
  if (!country) return [];
  
  if (typeof country === 'object' && country.languages) {
    return country.languages;
  }
  
  const languageMappings = {
    'IN': ['Hindi', 'English'],
    'US': ['English'],
    'GB': ['English'],
    'TH': ['Thai', 'English'],
    'SG': ['English', 'Mandarin', 'Malay', 'Tamil'],
    'MY': ['Malay', 'English', 'Mandarin', 'Tamil'],
    'ID': ['Indonesian', 'English'],
    'NP': ['Nepali', 'English'],
    'LK': ['Sinhala', 'Tamil', 'English'],
    'MV': ['Dhivehi', 'English'],
    'BT': ['Dzongkha', 'English'],
    'FR': ['French'],
    'IT': ['Italian'],
    'ES': ['Spanish'],
    'DE': ['German'],
    'AU': ['English'],
    'JP': ['Japanese'],
    'KR': ['Korean'],
    'CN': ['Mandarin']
  };
  
  const code = getCountryCode(country);
  return languageMappings[code] || [];
};

export const getCountryCapital = (country) => {
  if (!country) return '';
  
  if (typeof country === 'object' && country.capital) {
    return country.capital;
  }
  
  const capitalMappings = {
    'IN': 'New Delhi',
    'US': 'Washington D.C.',
    'GB': 'London',
    'TH': 'Bangkok',
    'SG': 'Singapore',
    'MY': 'Kuala Lumpur',
    'ID': 'Jakarta',
    'NP': 'Kathmandu',
    'LK': 'Colombo',
    'MV': 'Malé',
    'BT': 'Thimphu',
    'FR': 'Paris',
    'IT': 'Rome',
    'ES': 'Madrid',
    'DE': 'Berlin',
    'AU': 'Canberra',
    'JP': 'Tokyo',
    'KR': 'Seoul',
    'CN': 'Beijing'
  };
  
  const code = getCountryCode(country);
  return capitalMappings[code] || '';
};

export const getBestTimeToVisit = (country) => {
  if (!country) return '';
  
  if (typeof country === 'object' && country.bestTimeToVisit) {
    return country.bestTimeToVisit;
  }
  
  const timeMappings = {
    'IN': 'October to March',
    'US': 'April to June, September to November',
    'GB': 'May to September',
    'TH': 'November to April',
    'SG': 'February to April',
    'MY': 'December to February',
    'ID': 'April to October',
    'NP': 'October to December, March to May',
    'LK': 'December to March, July to September',
    'MV': 'November to April',
    'BT': 'March to May, September to November',
    'FR': 'April to June, September to November',
    'IT': 'April to June, September to October',
    'ES': 'March to May, September to November',
    'DE': 'May to September',
    'AU': 'September to November, March to May',
    'JP': 'March to May, September to November',
    'KR': 'April to June, September to November',
    'CN': 'April to May, September to October'
  };
  
  const code = getCountryCode(country);
  return timeMappings[code] || '';
};

export const getPopularDestinations = (country) => {
  if (!country) return [];
  
  if (typeof country === 'object' && country.popularDestinations) {
    return country.popularDestinations;
  }
  
  const destinationMappings = {
    'IN': ['Delhi', 'Mumbai', 'Goa', 'Kerala', 'Rajasthan', 'Kashmir'],
    'US': ['New York', 'Los Angeles', 'Las Vegas', 'San Francisco', 'Miami'],
    'GB': ['London', 'Edinburgh', 'Bath', 'York', 'Cambridge'],
    'TH': ['Bangkok', 'Phuket', 'Chiang Mai', 'Pattaya', 'Krabi'],
    'SG': ['Marina Bay', 'Sentosa Island', 'Gardens by the Bay', 'Chinatown'],
    'MY': ['Kuala Lumpur', 'Penang', 'Langkawi', 'Malacca'],
    'ID': ['Bali', 'Jakarta', 'Yogyakarta', 'Lombok'],
    'NP': ['Kathmandu', 'Pokhara', 'Everest Base Camp', 'Annapurna'],
    'LK': ['Colombo', 'Kandy', 'Galle', 'Sigiriya'],
    'MV': ['Malé', 'Hulhumalé', 'Maafushi', 'Veligandu'],
    'BT': ['Thimphu', 'Paro', 'Punakha', 'Wangdue'],
    'FR': ['Paris', 'Nice', 'Lyon', 'Marseille'],
    'IT': ['Rome', 'Venice', 'Florence', 'Milan'],
    'ES': ['Madrid', 'Barcelona', 'Seville', 'Valencia'],
    'DE': ['Berlin', 'Munich', 'Hamburg', 'Cologne'],
    'AU': ['Sydney', 'Melbourne', 'Brisbane', 'Perth'],
    'JP': ['Tokyo', 'Kyoto', 'Osaka', 'Hiroshima'],
    'KR': ['Seoul', 'Busan', 'Jeju Island', 'Gyeongju'],
    'CN': ['Beijing', 'Shanghai', 'Xi\'an', 'Guilin']
  };
  
  const code = getCountryCode(country);
  return destinationMappings[code] || [];
};

export const sortCountriesByName = (countries, ascending = true) => {
  return [...countries].sort((a, b) => {
    const nameA = getCountryDisplayName(a).toLowerCase();
    const nameB = getCountryDisplayName(b).toLowerCase();
    
    if (ascending) {
      return nameA.localeCompare(nameB);
    } else {
      return nameB.localeCompare(nameA);
    }
  });
};

export const filterCountriesByContinent = (countries, continent) => {
  if (!continent) return countries;
  
  return countries.filter(country => {
    const countryContinent = getCountryContinent(country);
    return countryContinent.toLowerCase() === continent.toLowerCase();
  });
};

export const filterCountriesByRegion = (countries, region) => {
  if (!region) return countries;
  
  return countries.filter(country => {
    const countryRegion = getCountryRegion(country);
    return countryRegion.toLowerCase().includes(region.toLowerCase());
  });
};

export const searchCountries = (countries, searchTerm) => {
  if (!searchTerm) return countries;
  
  const term = searchTerm.toLowerCase();
  
  return countries.filter(country => {
    const name = getCountryDisplayName(country).toLowerCase();
    const capital = getCountryCapital(country).toLowerCase();
    const destinations = getPopularDestinations(country);
    const languages = getCountryLanguages(country);
    
    // Search in name, capital, destinations, and languages
    return name.includes(term) ||
           capital.includes(term) ||
           destinations.some(dest => dest.toLowerCase().includes(term)) ||
           languages.some(lang => lang.toLowerCase().includes(term));
  });
};

export const getCountryStats = (country, blogs = [], packages = []) => {
  const countryName = getCountryDisplayName(country);
  const countryCode = getCountryCode(country);
  
  const relatedBlogs = blogs.filter(blog => {
    return blog.location?.country === countryName ||
           blog.geotag?.country === countryName ||
           blog.geotag?.countryCode === countryCode;
  });
  
  const relatedPackages = packages.filter(pkg => {
    return pkg.location?.country === countryName ||
           pkg.location?.countryCode === countryCode;
  });
  
  return {
    blogsCount: relatedBlogs.length,
    packagesCount: relatedPackages.length,
    totalViews: relatedBlogs.reduce((sum, blog) => sum + (blog.views || 0), 0),
    averageRating: relatedPackages.length > 0 
      ? relatedPackages.reduce((sum, pkg) => sum + (pkg.rating?.average || 0), 0) / relatedPackages.length
      : 0
  };
};