import React, { useState, useEffect } from 'react';
import { 
    Smartphone, 
    Download, 
    Wifi, 
    WifiOff, 
    Bell, 
    Settings, 
    BarChart3,
    RefreshCw,
    Shield,
    Battery,
    Globe,
    Moon,
    Sun,
    Zap
} from 'lucide-react';

const MobileSettings = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [installPrompt, setInstallPrompt] = useState(null);
    const [isPWAInstalled, setIsPWAInstalled] = useState(false);
    const [notificationsEnabled, setNotificationsEnabled] = useState(false);
    const [offlineContent, setOfflineContent] = useState({
        blogs: 0,
        images: 0,
        cacheSize: '0 MB'
    });
    const [mobileConfig, setMobileConfig] = useState({
        darkMode: false,
        dataSaver: false,
        autoSync: true,
        imageCompression: true,
        offlineMode: false,
        pushNotifications: true,
        quietHours: {
            enabled: false,
            start: '22:00',
            end: '08:00'
        },
        performance: {
            reducedAnimations: false,
            lowPowerMode: false,
            preloadContent: true
        }
    });

    useEffect(() => {
        // Check PWA installation status
        const checkPWAInstalled = () => {
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
            const isInWebAppiOS = window.navigator.standalone === true;
            setIsPWAInstalled(isStandalone || isInWebAppiOS);
        };

        // Listen for PWA install prompt
        const handleBeforeInstallPrompt = (event) => {
            event.preventDefault();
            setInstallPrompt(event);
        };

        // Check notification permission
        const checkNotificationPermission = () => {
            if ('Notification' in window) {
                setNotificationsEnabled(Notification.permission === 'granted');
            }
        };

        // Monitor online/offline status
        const handleOnline = () => setIsOnline(true);
        const handleOffline = () => setIsOnline(false);

        // Load offline content info
        const loadOfflineContent = async () => {
            if ('caches' in window) {
                try {
                    const cacheNames = await caches.keys();
                    let totalSize = 0;
                    let blogCount = 0;
                    let imageCount = 0;

                    for (const cacheName of cacheNames) {
                        const cache = await caches.open(cacheName);
                        const keys = await cache.keys();
                        
                        for (const key of keys) {
                            const response = await cache.match(key);
                            if (response) {
                                const blob = await response.blob();
                                totalSize += blob.size;
                                
                                if (key.url.includes('/api/blogs')) blogCount++;
                                if (key.url.match(/\.(jpg|jpeg|png|gif|webp)$/i)) imageCount++;
                            }
                        }
                    }

                    setOfflineContent({
                        blogs: blogCount,
                        images: imageCount,
                        cacheSize: `${(totalSize / (1024 * 1024)).toFixed(1)} MB`
                    });
                } catch (error) {
                    console.error('Error loading offline content:', error);
                }
            }
        };

        // Load mobile configuration
        const loadMobileConfig = async () => {
            try {
                const response = await fetch('/api/mobile/config');
                if (response.ok) {
                    const config = await response.json();
                    setMobileConfig(prev => ({ ...prev, ...config }));
                }
            } catch (error) {
                console.error('Error loading mobile config:', error);
            }
        };

        checkPWAInstalled();
        checkNotificationPermission();
        loadOfflineContent();
        loadMobileConfig();

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const handleInstallPWA = async () => {
        if (installPrompt) {
            installPrompt.prompt();
            const result = await installPrompt.userChoice;
            
            if (result.outcome === 'accepted') {
                setInstallPrompt(null);
                setIsPWAInstalled(true);
                
                // Track installation
                await fetch('/api/mobile/pwa/install', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        platform: navigator.platform,
                        userAgent: navigator.userAgent,
                        timestamp: new Date()
                    })
                });
            }
        }
    };

    const handleNotificationToggle = async () => {
        if (!notificationsEnabled) {
            const permission = await Notification.requestPermission();
            if (permission === 'granted') {
                setNotificationsEnabled(true);
                
                // Register for push notifications
                if ('serviceWorker' in navigator && 'PushManager' in window) {
                    const registration = await navigator.serviceWorker.ready;
                    const subscription = await registration.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: process.env.REACT_APP_VAPID_PUBLIC_KEY
                    });

                    await fetch('/api/mobile/push/register', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            subscription,
                            userAgent: navigator.userAgent,
                            platform: navigator.platform
                        })
                    });
                }
            }
        } else {
            setNotificationsEnabled(false);
            // Unregister push notifications
            if ('serviceWorker' in navigator) {
                const registration = await navigator.serviceWorker.ready;
                const subscription = await registration.pushManager.getSubscription();
                if (subscription) {
                    await subscription.unsubscribe();
                    await fetch('/api/mobile/push/unregister', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ endpoint: subscription.endpoint })
                    });
                }
            }
        }
    };

    const handleConfigUpdate = async (configUpdate) => {
        const newConfig = { ...mobileConfig, ...configUpdate };
        setMobileConfig(newConfig);

        try {
            await fetch('/api/mobile/config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newConfig)
            });
        } catch (error) {
            console.error('Error updating mobile config:', error);
        }
    };

    const clearOfflineContent = async () => {
        if (confirm('Are you sure you want to clear all offline content? This will free up storage space but remove cached blogs and images.')) {
            try {
                const cacheNames = await caches.keys();
                await Promise.all(cacheNames.map(name => caches.delete(name)));
                
                setOfflineContent({
                    blogs: 0,
                    images: 0,
                    cacheSize: '0 MB'
                });

                // Refresh service worker
                if ('serviceWorker' in navigator) {
                    const registration = await navigator.serviceWorker.ready;
                    await registration.update();
                }
            } catch (error) {
                console.error('Error clearing offline content:', error);
            }
        }
    };

    const syncOfflineContent = async () => {
        try {
            // Trigger background sync
            if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
                const registration = await navigator.serviceWorker.ready;
                await registration.sync.register('background-sync');
            }

            // Manual sync for essential content
            const response = await fetch('/api/mobile/offline/sync', {
                method: 'POST'
            });
            
            if (response.ok) {
                alert('Offline content synced successfully!');
            }
        } catch (error) {
            console.error('Error syncing offline content:', error);
            alert('Sync failed. Please try again when you have a stable connection.');
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                    <Smartphone className="text-blue-500" size={28} />
                    <h1 className="text-2xl font-bold text-gray-900">Mobile & PWA Settings</h1>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                    {isOnline ? (
                        <>
                            <Wifi className="text-green-500" size={16} />
                            <span className="text-green-600">Online</span>
                        </>
                    ) : (
                        <>
                            <WifiOff className="text-red-500" size={16} />
                            <span className="text-red-600">Offline</span>
                        </>
                    )}
                </div>
            </div>

            {/* PWA Installation */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Download className="text-purple-500" size={20} />
                    Progressive Web App
                </h2>
                
                {isPWAInstalled ? (
                    <div className="flex items-center gap-3 p-4 bg-green-50 rounded-lg">
                        <Shield className="text-green-500" size={20} />
                        <div>
                            <p className="font-medium text-green-800">App Installed</p>
                            <p className="text-sm text-green-600">Travel Blog is installed and ready to use offline!</p>
                        </div>
                    </div>
                ) : installPrompt ? (
                    <div className="space-y-4">
                        <p className="text-gray-600">Install Travel Blog as an app for the best mobile experience!</p>
                        <button
                            onClick={handleInstallPWA}
                            className="bg-purple-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-purple-600 transition-colors flex items-center gap-2"
                        >
                            <Download size={18} />
                            Install App
                        </button>
                    </div>
                ) : (
                    <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-600">PWA installation is not available on this device or browser.</p>
                    </div>
                )}
            </div>

            {/* Notifications */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Bell className="text-yellow-500" size={20} />
                    Push Notifications
                </h2>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <span className="font-medium">Enable Notifications</span>
                        <button
                            onClick={handleNotificationToggle}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                notificationsEnabled ? 'bg-blue-500' : 'bg-gray-300'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>
                    
                    {notificationsEnabled && (
                        <>
                            <div className="flex items-center justify-between">
                                <span>Quiet Hours</span>
                                <button
                                    onClick={() => handleConfigUpdate({
                                        quietHours: {
                                            ...mobileConfig.quietHours,
                                            enabled: !mobileConfig.quietHours.enabled
                                        }
                                    })}
                                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                        mobileConfig.quietHours.enabled ? 'bg-blue-500' : 'bg-gray-300'
                                    }`}
                                >
                                    <span
                                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                            mobileConfig.quietHours.enabled ? 'translate-x-6' : 'translate-x-1'
                                        }`}
                                    />
                                </button>
                            </div>
                            
                            {mobileConfig.quietHours.enabled && (
                                <div className="grid grid-cols-2 gap-4 pl-4">
                                    <div>
                                        <label className="text-sm text-gray-600">Start Time</label>
                                        <input
                                            type="time"
                                            value={mobileConfig.quietHours.start}
                                            onChange={(e) => handleConfigUpdate({
                                                quietHours: {
                                                    ...mobileConfig.quietHours,
                                                    start: e.target.value
                                                }
                                            })}
                                            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-sm text-gray-600">End Time</label>
                                        <input
                                            type="time"
                                            value={mobileConfig.quietHours.end}
                                            onChange={(e) => handleConfigUpdate({
                                                quietHours: {
                                                    ...mobileConfig.quietHours,
                                                    end: e.target.value
                                                }
                                            })}
                                            className="w-full mt-1 p-2 border border-gray-300 rounded-md"
                                        />
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Offline Content */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Globe className="text-green-500" size={20} />
                    Offline Content
                </h2>
                
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">{offlineContent.blogs}</div>
                        <div className="text-sm text-blue-800">Cached Blogs</div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">{offlineContent.images}</div>
                        <div className="text-sm text-purple-800">Cached Images</div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 rounded-lg">
                        <div className="text-2xl font-bold text-orange-600">{offlineContent.cacheSize}</div>
                        <div className="text-sm text-orange-800">Storage Used</div>
                    </div>
                </div>
                
                <div className="flex gap-3">
                    <button
                        onClick={syncOfflineContent}
                        className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                    >
                        <RefreshCw size={18} />
                        Sync Content
                    </button>
                    <button
                        onClick={clearOfflineContent}
                        className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-600 transition-colors"
                    >
                        Clear Cache
                    </button>
                </div>
            </div>

            {/* Performance Settings */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <Zap className="text-yellow-500" size={20} />
                    Performance & Data
                </h2>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="font-medium">Dark Mode</span>
                            <p className="text-sm text-gray-600">Reduce battery usage on OLED screens</p>
                        </div>
                        <button
                            onClick={() => handleConfigUpdate({ darkMode: !mobileConfig.darkMode })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                mobileConfig.darkMode ? 'bg-blue-500' : 'bg-gray-300'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    mobileConfig.darkMode ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="font-medium">Data Saver</span>
                            <p className="text-sm text-gray-600">Compress images and reduce data usage</p>
                        </div>
                        <button
                            onClick={() => handleConfigUpdate({ dataSaver: !mobileConfig.dataSaver })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                mobileConfig.dataSaver ? 'bg-blue-500' : 'bg-gray-300'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    mobileConfig.dataSaver ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="font-medium">Auto Sync</span>
                            <p className="text-sm text-gray-600">Automatically sync when online</p>
                        </div>
                        <button
                            onClick={() => handleConfigUpdate({ autoSync: !mobileConfig.autoSync })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                mobileConfig.autoSync ? 'bg-blue-500' : 'bg-gray-300'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    mobileConfig.autoSync ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <span className="font-medium">Reduced Animations</span>
                            <p className="text-sm text-gray-600">Improve performance on slower devices</p>
                        </div>
                        <button
                            onClick={() => handleConfigUpdate({
                                performance: {
                                    ...mobileConfig.performance,
                                    reducedAnimations: !mobileConfig.performance.reducedAnimations
                                }
                            })}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                mobileConfig.performance.reducedAnimations ? 'bg-blue-500' : 'bg-gray-300'
                            }`}
                        >
                            <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                    mobileConfig.performance.reducedAnimations ? 'translate-x-6' : 'translate-x-1'
                                }`}
                            />
                        </button>
                    </div>
                </div>
            </div>

            {/* App Info */}
            <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <BarChart3 className="text-indigo-500" size={20} />
                    App Information
                </h2>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-gray-600">Platform:</span>
                        <span className="ml-2 font-medium">{navigator.platform}</span>
                    </div>
                    <div>
                        <span className="text-gray-600">Connection:</span>
                        <span className="ml-2 font-medium">
                            {navigator.connection ? 
                                `${navigator.connection.effectiveType?.toUpperCase()} (${navigator.connection.downlink}Mbps)` : 
                                'Unknown'
                            }
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-600">Storage:</span>
                        <span className="ml-2 font-medium">
                            {navigator.storage && navigator.storage.estimate ? 
                                'Calculating...' : 
                                'Not available'
                            }
                        </span>
                    </div>
                    <div>
                        <span className="text-gray-600">Service Worker:</span>
                        <span className="ml-2 font-medium">
                            {'serviceWorker' in navigator ? 'Supported' : 'Not supported'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MobileSettings;