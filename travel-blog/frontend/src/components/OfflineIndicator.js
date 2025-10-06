import React, { useState, useEffect } from 'react';
import { 
    Wifi, 
    WifiOff, 
    Download, 
    RefreshCw, 
    Globe, 
    AlertCircle,
    CheckCircle,
    Clock,
    Smartphone
} from 'lucide-react';

const OfflineIndicator = () => {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [syncStatus, setSyncStatus] = useState('idle'); // idle, syncing, success, error
    const [pendingActions, setPendingActions] = useState(0);
    const [lastSync, setLastSync] = useState(null);
    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            if (pendingActions > 0) {
                handleSync();
            }
        };

        const handleOffline = () => {
            setIsOnline(false);
        };

        // Check for pending sync actions
        const checkPendingActions = () => {
            const pending = localStorage.getItem('pendingSyncActions');
            if (pending) {
                try {
                    const actions = JSON.parse(pending);
                    setPendingActions(Array.isArray(actions) ? actions.length : 0);
                } catch (error) {
                    console.error('Error parsing pending actions:', error);
                    setPendingActions(0);
                }
            }
        };

        // Listen for service worker messages
        const handleServiceWorkerMessage = (event) => {
            if (event.data) {
                switch (event.data.type) {
                    case 'SYNC_START':
                        setSyncStatus('syncing');
                        break;
                    case 'SYNC_SUCCESS':
                        setSyncStatus('success');
                        setPendingActions(0);
                        setLastSync(new Date());
                        setTimeout(() => setSyncStatus('idle'), 3000);
                        break;
                    case 'SYNC_ERROR':
                        setSyncStatus('error');
                        setTimeout(() => setSyncStatus('idle'), 5000);
                        break;
                    case 'PENDING_ACTIONS_UPDATE':
                        setPendingActions(event.data.count || 0);
                        break;
                    default:
                        break;
                }
            }
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        navigator.serviceWorker?.addEventListener('message', handleServiceWorkerMessage);
        
        checkPendingActions();
        
        // Check last sync time
        const lastSyncTime = localStorage.getItem('lastSyncTime');
        if (lastSyncTime) {
            setLastSync(new Date(lastSyncTime));
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            navigator.serviceWorker?.removeEventListener('message', handleServiceWorkerMessage);
        };
    }, [pendingActions]);

    const handleSync = async () => {
        if (!isOnline) {
            alert('Cannot sync while offline. Please check your internet connection.');
            return;
        }

        setSyncStatus('syncing');

        try {
            // Trigger background sync if available
            if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
                const registration = await navigator.serviceWorker.ready;
                await registration.sync.register('background-sync');
            }

            // Manual sync as fallback
            const response = await fetch('/api/mobile/offline/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                setSyncStatus('success');
                setPendingActions(0);
                setLastSync(new Date());
                localStorage.setItem('lastSyncTime', new Date().toISOString());
                localStorage.removeItem('pendingSyncActions');
                
                setTimeout(() => setSyncStatus('idle'), 3000);
            } else {
                throw new Error('Sync failed');
            }
        } catch (error) {
            console.error('Sync error:', error);
            setSyncStatus('error');
            setTimeout(() => setSyncStatus('idle'), 5000);
        }
    };

    const getStatusColor = () => {
        if (!isOnline) return 'bg-red-500';
        if (syncStatus === 'syncing') return 'bg-yellow-500';
        if (syncStatus === 'success') return 'bg-green-500';
        if (syncStatus === 'error') return 'bg-red-500';
        if (pendingActions > 0) return 'bg-orange-500';
        return 'bg-green-500';
    };

    const getStatusText = () => {
        if (!isOnline) return 'Offline';
        if (syncStatus === 'syncing') return 'Syncing...';
        if (syncStatus === 'success') return 'Synced';
        if (syncStatus === 'error') return 'Sync Failed';
        if (pendingActions > 0) return `${pendingActions} Pending`;
        return 'Online';
    };

    const getStatusIcon = () => {
        if (!isOnline) return <WifiOff size={16} />;
        if (syncStatus === 'syncing') return <RefreshCw size={16} className="animate-spin" />;
        if (syncStatus === 'success') return <CheckCircle size={16} />;
        if (syncStatus === 'error') return <AlertCircle size={16} />;
        if (pendingActions > 0) return <Clock size={16} />;
        return <Wifi size={16} />;
    };

    const formatLastSync = () => {
        if (!lastSync) return 'Never';
        
        const now = new Date();
        const diffMs = now - lastSync;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        return `${diffDays}d ago`;
    };

    return (
        <>
            {/* Main Status Indicator */}
            <div className="fixed top-4 right-4 z-50">
                <button
                    onClick={() => setShowDetails(!showDetails)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-full text-white text-sm font-medium shadow-lg transition-all duration-300 hover:scale-105 ${getStatusColor()}`}
                >
                    {getStatusIcon()}
                    <span className="hidden sm:inline">{getStatusText()}</span>
                </button>
            </div>

            {/* Detailed Status Panel */}
            {showDetails && (
                <div className="fixed top-16 right-4 z-50 bg-white rounded-lg shadow-xl border border-gray-200 p-4 w-80 max-w-sm">
                    <div className="space-y-4">
                        {/* Header */}
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                                <Smartphone size={18} />
                                Connection Status
                            </h3>
                            <button
                                onClick={() => setShowDetails(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ×
                            </button>
                        </div>

                        {/* Status Details */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Connection:</span>
                                <div className="flex items-center gap-2">
                                    {isOnline ? (
                                        <>
                                            <Wifi className="text-green-500" size={16} />
                                            <span className="text-green-600 font-medium">Online</span>
                                        </>
                                    ) : (
                                        <>
                                            <WifiOff className="text-red-500" size={16} />
                                            <span className="text-red-600 font-medium">Offline</span>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Last Sync:</span>
                                <span className="text-gray-900 font-medium">{formatLastSync()}</span>
                            </div>

                            {pendingActions > 0 && (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Pending Actions:</span>
                                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm font-medium">
                                        {pendingActions}
                                    </span>
                                </div>
                            )}

                            {navigator.connection && (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Connection Type:</span>
                                    <span className="text-gray-900 font-medium">
                                        {navigator.connection.effectiveType?.toUpperCase() || 'Unknown'}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="border-t border-gray-200 pt-3 space-y-2">
                            {isOnline && (pendingActions > 0 || syncStatus === 'error') && (
                                <button
                                    onClick={handleSync}
                                    disabled={syncStatus === 'syncing'}
                                    className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {syncStatus === 'syncing' ? (
                                        <>
                                            <RefreshCw size={16} className="animate-spin" />
                                            Syncing...
                                        </>
                                    ) : (
                                        <>
                                            <RefreshCw size={16} />
                                            Sync Now
                                        </>
                                    )}
                                </button>
                            )}

                            {!isOnline && (
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="text-yellow-600 flex-shrink-0" size={16} />
                                        <div className="text-sm">
                                            <p className="text-yellow-800 font-medium">You're offline</p>
                                            <p className="text-yellow-700">
                                                Your changes will be saved and synced when you're back online.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {syncStatus === 'error' && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                    <div className="flex items-start gap-2">
                                        <AlertCircle className="text-red-600 flex-shrink-0" size={16} />
                                        <div className="text-sm">
                                            <p className="text-red-800 font-medium">Sync failed</p>
                                            <p className="text-red-700">
                                                Check your connection and try again.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {syncStatus === 'success' && (
                                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                    <div className="flex items-start gap-2">
                                        <CheckCircle className="text-green-600 flex-shrink-0" size={16} />
                                        <div className="text-sm">
                                            <p className="text-green-800 font-medium">Sync successful</p>
                                            <p className="text-green-700">
                                                All your changes have been saved.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* PWA Info */}
                        {window.matchMedia('(display-mode: standalone)').matches && (
                            <div className="border-t border-gray-200 pt-3">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                    <Globe size={14} />
                                    <span>Running as installed PWA</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Click outside to close */}
            {showDetails && (
                <div 
                    className="fixed inset-0 z-40"
                    onClick={() => setShowDetails(false)}
                />
            )}
        </>
    );
};

export default OfflineIndicator;