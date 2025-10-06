// Advanced search utilities for the travel blog platform

export const createSearchQuery = (filters) => {
  const query = new URLSearchParams();
  
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== null && value !== undefined && value !== '') {
      if (Array.isArray(value)) {
        value.forEach(item => query.append(key, item));
      } else if (typeof value === 'object') {
        query.append(key, JSON.stringify(value));
      } else {
        query.append(key, value.toString());
      }
    }
  });
  
  return query.toString();
};

export const parseSearchQuery = (queryString) => {
  const params = new URLSearchParams(queryString);
  const filters = {};
  
  for (const [key, value] of params.entries()) {
    if (filters[key]) {
      // Handle multiple values for the same key
      if (Array.isArray(filters[key])) {
        filters[key].push(value);
      } else {
        filters[key] = [filters[key], value];
      }
    } else {
      // Try to parse JSON values
      try {
        filters[key] = JSON.parse(value);
      } catch {
        filters[key] = value;
      }
    }
  }
  
  return filters;
};

export const highlightSearchTerms = (text, searchTerms) => {
  if (!text || !searchTerms) return text;
  
  const terms = Array.isArray(searchTerms) ? searchTerms : [searchTerms];
  let highlightedText = text;
  
  terms.forEach(term => {
    if (term.trim()) {
      const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark>$1</mark>');
    }
  });
  
  return highlightedText;
};

export const extractSearchTerms = (query) => {
  if (!query) return [];
  
  // Split by spaces but keep quoted phrases together
  const terms = [];
  const regex = /"([^"]+)"|(\S+)/g;
  let match;
  
  while ((match = regex.exec(query)) !== null) {
    terms.push(match[1] || match[2]);
  }
  
  return terms.filter(term => term.length > 0);
};

export const calculateRelevanceScore = (item, searchTerms, weights = {}) => {
  if (!item || !searchTerms || searchTerms.length === 0) return 0;
  
  const defaultWeights = {
    title: 3,
    description: 2,
    tags: 2,
    category: 1.5,
    location: 1.5,
    content: 1,
    ...weights
  };
  
  let score = 0;
  const terms = extractSearchTerms(searchTerms.join(' '));
  
  terms.forEach(term => {
    const lowerTerm = term.toLowerCase();
    
    // Check title
    if (item.title && item.title.toLowerCase().includes(lowerTerm)) {
      score += defaultWeights.title;
      // Bonus for exact match
      if (item.title.toLowerCase() === lowerTerm) {
        score += defaultWeights.title;
      }
    }
    
    // Check description
    if (item.description && item.description.toLowerCase().includes(lowerTerm)) {
      score += defaultWeights.description;
    }
    
    // Check tags
    if (item.tags && Array.isArray(item.tags)) {
      item.tags.forEach(tag => {
        if (tag.toLowerCase().includes(lowerTerm)) {
          score += defaultWeights.tags;
        }
      });
    }
    
    // Check category
    if (item.category && typeof item.category === 'string' && 
        item.category.toLowerCase().includes(lowerTerm)) {
      score += defaultWeights.category;
    }
    
    // Check location
    if (item.location) {
      const locationText = typeof item.location === 'string' 
        ? item.location 
        : `${item.location.name || ''} ${item.location.country || ''}`;
      
      if (locationText.toLowerCase().includes(lowerTerm)) {
        score += defaultWeights.location;
      }
    }
    
    // Check content
    if (item.content && item.content.toLowerCase().includes(lowerTerm)) {
      score += defaultWeights.content;
    }
  });
  
  return score;
};

export const sortSearchResults = (results, sortBy = 'relevance', searchTerms = []) => {
  return [...results].sort((a, b) => {
    switch (sortBy) {
      case 'relevance':
        const scoreA = calculateRelevanceScore(a, searchTerms);
        const scoreB = calculateRelevanceScore(b, searchTerms);
        return scoreB - scoreA;
        
      case 'date':
      case 'newest':
        const dateA = new Date(a.createdAt || a.publishedAt || 0);
        const dateB = new Date(b.createdAt || b.publishedAt || 0);
        return dateB - dateA;
        
      case 'oldest':
        const oldDateA = new Date(a.createdAt || a.publishedAt || 0);
        const oldDateB = new Date(b.createdAt || b.publishedAt || 0);
        return oldDateA - oldDateB;
        
      case 'popular':
        const popularityA = (a.views || 0) + (a.likes || 0) * 2 + (a.comments || 0) * 3;
        const popularityB = (b.views || 0) + (b.likes || 0) * 2 + (b.comments || 0) * 3;
        return popularityB - popularityA;
        
      case 'rating':
        const ratingA = a.rating?.average || a.rating || 0;
        const ratingB = b.rating?.average || b.rating || 0;
        return ratingB - ratingA;
        
      case 'price_low':
        const priceA = a.price || 0;
        const priceB = b.price || 0;
        return priceA - priceB;
        
      case 'price_high':
        const highPriceA = a.price || 0;
        const highPriceB = b.price || 0;
        return highPriceB - highPriceA;
        
      case 'name':
      case 'title':
        const nameA = (a.title || a.name || '').toLowerCase();
        const nameB = (b.title || b.name || '').toLowerCase();
        return nameA.localeCompare(nameB);
        
      default:
        return 0;
    }
  });
};

export const filterResults = (results, filters) => {
  if (!results || !filters) return results;
  
  return results.filter(item => {
    // Category filter
    if (filters.category && filters.category !== '') {
      const itemCategory = typeof item.category === 'object' 
        ? item.category.name 
        : item.category;
      
      if (itemCategory !== filters.category) {
        return false;
      }
    }
    
    // Location filter
    if (filters.location && filters.location !== '') {
      const itemLocation = typeof item.location === 'object'
        ? `${item.location.name || ''} ${item.location.city || ''} ${item.location.country || ''}`
        : item.location || '';
      
      if (!itemLocation.toLowerCase().includes(filters.location.toLowerCase())) {
        return false;
      }
    }
    
    // Country filter
    if (filters.country && filters.country !== '') {
      const itemCountry = item.location?.country || 
                         item.geotag?.country || 
                         item.country || '';
      
      if (!itemCountry.toLowerCase().includes(filters.country.toLowerCase())) {
        return false;
      }
    }
    
    // Continent filter
    if (filters.continent && filters.continent !== '') {
      const itemContinent = item.continent || 
                           item.geotag?.continent || '';
      
      if (itemContinent !== filters.continent) {
        return false;
      }
    }
    
    // Price range filter
    if (filters.priceRange && Array.isArray(filters.priceRange)) {
      const [minPrice, maxPrice] = filters.priceRange;
      const itemPrice = item.price || 0;
      
      if (itemPrice < minPrice || itemPrice > maxPrice) {
        return false;
      }
    }
    
    // Rating filter
    if (filters.rating && filters.rating > 0) {
      const itemRating = item.rating?.average || item.rating || 0;
      
      if (itemRating < filters.rating) {
        return false;
      }
    }
    
    // Date range filter
    if (filters.dateRange && filters.dateRange.start && filters.dateRange.end) {
      const itemDate = new Date(item.createdAt || item.publishedAt || 0);
      const startDate = new Date(filters.dateRange.start);
      const endDate = new Date(filters.dateRange.end);
      
      if (itemDate < startDate || itemDate > endDate) {
        return false;
      }
    }
    
    // Featured filter
    if (filters.featured === true && !item.featured) {
      return false;
    }
    
    // Available filter (for packages)
    if (filters.available === true && item.availability === false) {
      return false;
    }
    
    // Tags filter
    if (filters.tags && Array.isArray(filters.tags) && filters.tags.length > 0) {
      const itemTags = item.tags || [];
      const hasMatchingTag = filters.tags.some(filterTag => 
        itemTags.some(itemTag => 
          itemTag.toLowerCase().includes(filterTag.toLowerCase())
        )
      );
      
      if (!hasMatchingTag) {
        return false;
      }
    }
    
    return true;
  });
};

export const getSearchSuggestions = (query, data, maxSuggestions = 5) => {
  if (!query || !data || data.length === 0) return [];
  
  const suggestions = new Set();
  const lowerQuery = query.toLowerCase();
  
  data.forEach(item => {
    // Add title suggestions
    if (item.title && item.title.toLowerCase().includes(lowerQuery)) {
      suggestions.add(item.title);
    }
    
    // Add location suggestions
    if (item.location) {
      const locationText = typeof item.location === 'string' 
        ? item.location 
        : `${item.location.name || ''} ${item.location.country || ''}`;
      
      if (locationText.toLowerCase().includes(lowerQuery)) {
        suggestions.add(locationText);
      }
    }
    
    // Add tag suggestions
    if (item.tags && Array.isArray(item.tags)) {
      item.tags.forEach(tag => {
        if (tag.toLowerCase().includes(lowerQuery)) {
          suggestions.add(tag);
        }
      });
    }
    
    // Add category suggestions
    if (item.category) {
      const categoryName = typeof item.category === 'object' 
        ? item.category.name 
        : item.category;
      
      if (categoryName && categoryName.toLowerCase().includes(lowerQuery)) {
        suggestions.add(categoryName);
      }
    }
  });
  
  return Array.from(suggestions).slice(0, maxSuggestions);
};

export const buildSearchIndex = (data) => {
  const index = new Map();
  
  data.forEach((item, itemIndex) => {
    const searchableText = [
      item.title,
      item.description,
      item.content,
      typeof item.location === 'string' ? item.location : 
        `${item.location?.name || ''} ${item.location?.city || ''} ${item.location?.country || ''}`,
      typeof item.category === 'string' ? item.category : item.category?.name,
      ...(item.tags || [])
    ].filter(Boolean).join(' ').toLowerCase();
    
    // Create word index
    const words = searchableText.split(/\s+/).filter(word => word.length > 2);
    
    words.forEach(word => {
      if (!index.has(word)) {
        index.set(word, new Set());
      }
      index.get(word).add(itemIndex);
    });
  });
  
  return index;
};

export const searchWithIndex = (query, data, searchIndex) => {
  if (!query || !searchIndex) return data;
  
  const terms = extractSearchTerms(query);
  if (terms.length === 0) return data;
  
  const matchingIndices = new Set();
  let isFirstTerm = true;
  
  terms.forEach(term => {
    const lowerTerm = term.toLowerCase();
    const termMatches = new Set();
    
    // Find all words that contain the search term
    for (const [word, indices] of searchIndex.entries()) {
      if (word.includes(lowerTerm)) {
        indices.forEach(index => termMatches.add(index));
      }
    }
    
    if (isFirstTerm) {
      termMatches.forEach(index => matchingIndices.add(index));
      isFirstTerm = false;
    } else {
      // Intersection with previous results (AND operation)
      const intersection = new Set();
      matchingIndices.forEach(index => {
        if (termMatches.has(index)) {
          intersection.add(index);
        }
      });
      matchingIndices.clear();
      intersection.forEach(index => matchingIndices.add(index));
    }
  });
  
  return Array.from(matchingIndices).map(index => data[index]);
};

export const getPopularSearches = (searchHistory = []) => {
  const searchCounts = {};
  
  searchHistory.forEach(search => {
    const query = search.query || search;
    if (query && query.trim()) {
      searchCounts[query] = (searchCounts[query] || 0) + 1;
    }
  });
  
  return Object.entries(searchCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([query]) => query);
};

export const saveSearchHistory = (query, maxHistory = 50) => {
  if (!query || !query.trim()) return;
  
  try {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    
    // Remove duplicate if exists
    const filteredHistory = history.filter(item => 
      (typeof item === 'string' ? item : item.query) !== query
    );
    
    // Add new search to beginning
    filteredHistory.unshift({
      query,
      timestamp: new Date().toISOString()
    });
    
    // Limit history size
    const limitedHistory = filteredHistory.slice(0, maxHistory);
    
    localStorage.setItem('searchHistory', JSON.stringify(limitedHistory));
  } catch (error) {
    console.error('Error saving search history:', error);
  }
};

export const getSearchHistory = () => {
  try {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    return history.map(item => typeof item === 'string' ? item : item.query);
  } catch (error) {
    console.error('Error getting search history:', error);
    return [];
  }
};

export const clearSearchHistory = () => {
  try {
    localStorage.removeItem('searchHistory');
  } catch (error) {
    console.error('Error clearing search history:', error);
  }
};