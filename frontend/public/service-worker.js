// service-worker.js - PWA Service Worker for offline functionality
const CACHE_NAME = 'travel-blog-v1';
const STATIC_CACHE = 'travel-blog-static-v1';
const DYNAMIC_CACHE = 'travel-blog-dynamic-v1';

// Static resources to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/static/css/main.css',
  '/static/js/main.js',
  '/static/images/logo.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/offline.html'
];

// Dynamic resources patterns
const CACHE_PATTERNS = {
  API: /^\/api\/(blogs|packages|destinations)/,
  IMAGES: /\.(jpg|jpeg|png|gif|webp|svg)$/,
  FONTS: /\.(woff|woff2|ttf|eot)$/,
  DOCUMENTS: /\.(pdf|doc|docx)$/
};

// Skip waiting and claim clients immediately
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('Service Worker: Static assets cached');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Installation failed', error);
      })
  );
});

// Clean up old caches on activate
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker: Activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-HTTP requests
  if (!request.url.startsWith('http')) {
    return;
  }

  // Different strategies for different resource types
  if (CACHE_PATTERNS.API.test(url.pathname)) {
    // API requests: Network first, cache fallback
    event.respondWith(networkFirstStrategy(request));
  } else if (CACHE_PATTERNS.IMAGES.test(url.pathname)) {
    // Images: Cache first, network fallback
    event.respondWith(cacheFirstStrategy(request));
  } else if (url.pathname.startsWith('/static/')) {
    // Static assets: Cache first
    event.respondWith(cacheFirstStrategy(request));
  } else if (request.mode === 'navigate') {
    // Navigation requests: Network first with offline fallback
    event.respondWith(navigationStrategy(request));
  } else {
    // Default: Cache first
    event.respondWith(cacheFirstStrategy(request));
  }
});

// Network first strategy for API calls
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok && request.method === 'GET') {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('Network failed, trying cache:', request.url);
    const cachedResponse = await caches.match(request);
    
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline response for API calls
    return new Response(
      JSON.stringify({ 
        error: 'Offline', 
        message: 'No network connection available' 
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

// Cache first strategy for static resources
async function cacheFirstStrategy(request) {
  // Only cache GET requests
  if (request.method !== 'GET') {
    return fetch(request);
  }
  
  const cachedResponse = await caches.match(request);
  
  if (cachedResponse) {
    // Update cache in background
    fetch(request)
      .then(networkResponse => {
        if (networkResponse.ok) {
          const cache = caches.open(DYNAMIC_CACHE);
          cache.then(c => c.put(request, networkResponse.clone()));
        }
      })
      .catch(() => {
        // Silent fail for background updates
      });
    
    return cachedResponse;
  }
  
  try {
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    // Return placeholder for failed image requests
    if (CACHE_PATTERNS.IMAGES.test(request.url)) {
      return new Response(
        '<svg width="200" height="150" xmlns="http://www.w3.org/2000/svg"><rect width="100%" height="100%" fill="#f0f0f0"/><text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#999">Image Unavailable</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      );
    }
    
    throw error;
  }
}

// Navigation strategy for page requests
async function navigationStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    return networkResponse;
  } catch (error) {
    console.log('Navigation failed, showing offline page');
    
    // Try to get the offline page from cache
    const offlinePage = await caches.match('/offline.html');
    if (offlinePage) {
      return offlinePage;
    }
    
    // Fallback offline HTML
    return new Response(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Offline - Travel Blog</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { 
            font-family: Arial, sans-serif; 
            text-align: center; 
            padding: 50px; 
            background: #f5f5f5; 
          }
          .offline-container {
            max-width: 500px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          }
          .offline-icon {
            font-size: 64px;
            margin-bottom: 20px;
          }
          .offline-title {
            font-size: 24px;
            color: #333;
            margin-bottom: 15px;
          }
          .offline-message {
            color: #666;
            margin-bottom: 30px;
            line-height: 1.5;
          }
          .retry-button {
            background: #007bff;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 16px;
          }
          .retry-button:hover {
            background: #0056b3;
          }
        </style>
      </head>
      <body>
        <div class="offline-container">
          <div class="offline-icon">✈️</div>
          <h1 class="offline-title">You're Offline</h1>
          <p class="offline-message">
            It looks like you've lost your internet connection. 
            Don't worry, you can still browse your cached content or try again when you're back online.
          </p>
          <button class="retry-button" onclick="window.location.reload()">
            Try Again
          </button>
        </div>
      </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    });
  }
}

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'sync-offline-actions') {
    event.waitUntil(syncOfflineActions());
  }
});

// Process offline actions when back online
async function syncOfflineActions() {
  try {
    // Get sync queue from IndexedDB or localStorage
    const syncQueue = await getSyncQueue();
    
    for (const action of syncQueue) {
      try {
        await processOfflineAction(action);
        await removeFromSyncQueue(action.id);
        console.log('Synced offline action:', action.type);
      } catch (error) {
        console.error('Failed to sync action:', action, error);
        // Retry logic could be implemented here
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Process individual offline action
async function processOfflineAction(action) {
  const { type, data, endpoint } = action;
  
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${data.token}`
    },
    body: JSON.stringify(data.payload)
  });
  
  if (!response.ok) {
    throw new Error(`Sync failed: ${response.status}`);
  }
  
  return response.json();
}

// Push notification handling
self.addEventListener('push', event => {
  console.log('Service Worker: Push notification received');
  
  let notificationData = {
    title: 'Travel Blog',
    body: 'New notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-icon.png',
    data: {},
    actions: []
  };
  
  if (event.data) {
    try {
      notificationData = { ...notificationData, ...event.data.json() };
    } catch (error) {
      console.error('Error parsing push data:', error);
    }
  }
  
  event.waitUntil(
    self.registration.showNotification(notificationData.title, {
      body: notificationData.body,
      icon: notificationData.icon,
      badge: notificationData.badge,
      data: notificationData.data,
      actions: notificationData.actions,
      requireInteraction: notificationData.requireInteraction || false,
      silent: notificationData.silent || false,
      vibrate: notificationData.vibrate || [100, 50, 100],
      tag: notificationData.tag || 'default'
    })
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  console.log('Service Worker: Notification clicked', event.notification.data);
  
  event.notification.close();
  
  const { data } = event.notification;
  const { action } = event;
  
  event.waitUntil(
    handleNotificationClick(action, data)
  );
});

// Handle notification click actions
async function handleNotificationClick(action, data) {
  try {
    // Get all open windows
    const clients = await self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    });
    
    let targetUrl = '/';
    
    // Determine target URL based on action and data
    if (action === 'view_blog' && data.blogId) {
      targetUrl = `/blogs/${data.blogId}`;
    } else if (action === 'view_trip' && data.tripId) {
      targetUrl = `/trips/${data.tripId}`;
    } else if (action === 'view_booking' && data.bookingId) {
      targetUrl = `/bookings/${data.bookingId}`;
    } else if (data.url) {
      targetUrl = data.url;
    }
    
    // Try to focus existing window or open new one
    for (const client of clients) {
      if (client.url.includes(self.location.origin)) {
        await client.navigate(targetUrl);
        return client.focus();
      }
    }
    
    // Open new window if no existing window found
    return self.clients.openWindow(targetUrl);
    
  } catch (error) {
    console.error('Error handling notification click:', error);
  }
}

// Utility functions for IndexedDB operations
async function getSyncQueue() {
  // This would integrate with IndexedDB to get offline sync queue
  // For now, return empty array
  return [];
}

async function removeFromSyncQueue(actionId) {
  // This would remove the synced action from IndexedDB
  console.log('Removing synced action:', actionId);
}

// Periodic background sync for cache cleanup
self.addEventListener('periodicsync', event => {
  if (event.tag === 'cache-cleanup') {
    event.waitUntil(cleanupExpiredCache());
  }
});

// Clean up expired cache entries
async function cleanupExpiredCache() {
  try {
    const cache = await caches.open(DYNAMIC_CACHE);
    const requests = await cache.keys();
    
    for (const request of requests) {
      const response = await cache.match(request);
      const dateHeader = response.headers.get('date');
      
      if (dateHeader) {
        const cacheDate = new Date(dateHeader);
        const now = new Date();
        const daysSinceCache = (now - cacheDate) / (1000 * 60 * 60 * 24);
        
        // Remove entries older than 7 days
        if (daysSinceCache > 7) {
          await cache.delete(request);
          console.log('Cleaned up expired cache entry:', request.url);
        }
      }
    }
  } catch (error) {
    console.error('Cache cleanup failed:', error);
  }
}

// Handle skip waiting messages from main thread
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});