// Formatting utility functions for the travel blog

export const formatDate = (date, options = {}) => {
  if (!date) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options
  };
  
  try {
    const dateObj = new Date(date);
    return dateObj.toLocaleDateString('en-US', defaultOptions);
  } catch (error) {
    console.error('Error formatting date:', error);
    return date.toString();
  }
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  
  try {
    const now = new Date();
    const dateObj = new Date(date);
    const diffInSeconds = Math.floor((now - dateObj) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 2592000) {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 31536000) {
      const months = Math.floor(diffInSeconds / 2592000);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffInSeconds / 31536000);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  } catch (error) {
    console.error('Error formatting relative time:', error);
    return formatDate(date);
  }
};

export const formatDuration = (duration) => {
  if (!duration) return '';
  
  // Handle different duration formats
  if (typeof duration === 'string') {
    return duration;
  }
  
  if (typeof duration === 'number') {
    // Assume duration is in days
    if (duration === 1) {
      return '1 day';
    } else if (duration < 7) {
      return `${duration} days`;
    } else if (duration < 30) {
      const weeks = Math.floor(duration / 7);
      const remainingDays = duration % 7;
      let result = `${weeks} week${weeks > 1 ? 's' : ''}`;
      if (remainingDays > 0) {
        result += ` ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
      }
      return result;
    } else {
      const months = Math.floor(duration / 30);
      const remainingDays = duration % 30;
      let result = `${months} month${months > 1 ? 's' : ''}`;
      if (remainingDays > 0) {
        result += ` ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
      }
      return result;
    }
  }
  
  return duration.toString();
};

export const formatNumber = (number, options = {}) => {
  if (number === null || number === undefined) return '0';
  
  const defaultOptions = {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options
  };
  
  try {
    return new Intl.NumberFormat('en-US', defaultOptions).format(number);
  } catch (error) {
    console.error('Error formatting number:', error);
    return number.toString();
  }
};

export const formatCompactNumber = (number) => {
  if (number === null || number === undefined) return '0';
  
  try {
    return new Intl.NumberFormat('en-US', {
      notation: 'compact',
      maximumFractionDigits: 1
    }).format(number);
  } catch (error) {
    console.error('Error formatting compact number:', error);
    return formatNumber(number);
  }
};

export const formatPercentage = (value, total) => {
  if (!value || !total || total === 0) return '0%';
  
  const percentage = (value / total) * 100;
  return `${Math.round(percentage)}%`;
};

export const formatRating = (rating, maxRating = 5) => {
  if (!rating) return '0.0';
  
  const numRating = parseFloat(rating);
  if (isNaN(numRating)) return '0.0';
  
  return Math.min(numRating, maxRating).toFixed(1);
};

export const formatReadTime = (content) => {
  if (!content) return '1 min read';
  
  // Average reading speed is 200-250 words per minute
  const wordsPerMinute = 225;
  const wordCount = content.split(/\s+/).length;
  const readTime = Math.ceil(wordCount / wordsPerMinute);
  
  return `${readTime} min read`;
};

export const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 B';
  
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${sizes[i]}`;
};

export const formatDistance = (distance, unit = 'km') => {
  if (!distance) return '';
  
  const numDistance = parseFloat(distance);
  if (isNaN(numDistance)) return distance.toString();
  
  if (unit === 'km') {
    if (numDistance < 1) {
      return `${Math.round(numDistance * 1000)} m`;
    } else {
      return `${numDistance.toFixed(1)} km`;
    }
  } else if (unit === 'miles') {
    return `${numDistance.toFixed(1)} miles`;
  }
  
  return `${numDistance.toFixed(1)} ${unit}`;
};

export const formatTemperature = (temp, unit = 'C') => {
  if (temp === null || temp === undefined) return '';
  
  const numTemp = parseFloat(temp);
  if (isNaN(numTemp)) return temp.toString();
  
  return `${Math.round(numTemp)}°${unit}`;
};

export const formatCoordinates = (lat, lng, precision = 4) => {
  if (!lat || !lng) return '';
  
  const numLat = parseFloat(lat);
  const numLng = parseFloat(lng);
  
  if (isNaN(numLat) || isNaN(numLng)) return '';
  
  const latDir = numLat >= 0 ? 'N' : 'S';
  const lngDir = numLng >= 0 ? 'E' : 'W';
  
  return `${Math.abs(numLat).toFixed(precision)}°${latDir}, ${Math.abs(numLng).toFixed(precision)}°${lngDir}`;
};

export const formatPhoneNumber = (phone, countryCode = '') => {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  if (countryCode === 'IN' || countryCode === 'India') {
    // Indian phone number format
    if (cleaned.length === 10) {
      return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    } else if (cleaned.length === 12 && cleaned.startsWith('91')) {
      return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
    }
  } else if (countryCode === 'US' || countryCode === 'United States') {
    // US phone number format
    if (cleaned.length === 10) {
      return `+1 (${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned.slice(0, 1)} (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
    }
  }
  
  // Default formatting
  return phone;
};

export const formatAddress = (address) => {
  if (!address) return '';
  
  if (typeof address === 'string') {
    return address;
  }
  
  if (typeof address === 'object') {
    const parts = [];
    
    if (address.street) parts.push(address.street);
    if (address.city) parts.push(address.city);
    if (address.state) parts.push(address.state);
    if (address.country) parts.push(address.country);
    if (address.zipCode) parts.push(address.zipCode);
    
    return parts.join(', ');
  }
  
  return address.toString();
};

export const formatHashtags = (text) => {
  if (!text) return '';
  
  return text.replace(/#(\w+)/g, '<span class="hashtag">#$1</span>');
};

export const formatMentions = (text) => {
  if (!text) return '';
  
  return text.replace(/@(\w+)/g, '<span class="mention">@$1</span>');
};

export const truncateText = (text, maxLength = 100, suffix = '...') => {
  if (!text) return '';
  
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength).trim() + suffix;
};

export const capitalizeFirst = (text) => {
  if (!text) return '';
  
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
};

export const capitalizeWords = (text) => {
  if (!text) return '';
  
  return text.split(' ')
    .map(word => capitalizeFirst(word))
    .join(' ');
};

export const slugify = (text) => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

export const formatSocialHandle = (handle, platform) => {
  if (!handle) return '';
  
  // Remove @ symbol if present
  const cleanHandle = handle.replace(/^@/, '');
  
  const baseUrls = {
    twitter: 'https://twitter.com/',
    instagram: 'https://instagram.com/',
    facebook: 'https://facebook.com/',
    linkedin: 'https://linkedin.com/in/',
    youtube: 'https://youtube.com/@',
    tiktok: 'https://tiktok.com/@'
  };
  
  const baseUrl = baseUrls[platform?.toLowerCase()];
  
  if (baseUrl) {
    return {
      handle: `@${cleanHandle}`,
      url: `${baseUrl}${cleanHandle}`
    };
  }
  
  return {
    handle: `@${cleanHandle}`,
    url: cleanHandle
  };
};