import React, { useState, useEffect, createContext, useContext } from 'react';
import { Sun, Moon, Monitor, Palette, Type, Eye, Zap, RefreshCw } from 'lucide-react';

// Theme Context
const ThemeContext = createContext();

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState('auto');
    const [preferences, setPreferences] = useState({
        theme: 'auto',
        colorScheme: {
            primary: '#667eea',
            secondary: '#764ba2',
            accent: '#f093fb'
        },
        customizations: {
            fontSize: 'medium',
            fontFamily: 'system',
            borderRadius: 'medium',
            animations: true,
            reducedMotion: false,
            highContrast: false
        },
        autoSchedule: {
            enabled: false,
            lightModeStart: '06:00',
            darkModeStart: '18:00'
        }
    });

    useEffect(() => {
        loadThemePreferences();
        
        // Listen for system theme changes
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const handleChange = () => {
            if (preferences.theme === 'auto') {
                applyTheme(mediaQuery.matches ? 'dark' : 'light');
            }
        };

        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);

    useEffect(() => {
        applyTheme(getEffectiveTheme());
        updateCSSVariables();
    }, [preferences]);

    const loadThemePreferences = async () => {
        try {
            const response = await fetch('/api/ux/theme', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setPreferences(data);
            }
        } catch (error) {
            console.error('Failed to load theme preferences:', error);
        }
    };

    const updateThemePreferences = async (updates) => {
        try {
            const newPreferences = { ...preferences, ...updates };
            setPreferences(newPreferences);

            await fetch('/api/ux/theme', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(newPreferences)
            });
        } catch (error) {
            console.error('Failed to update theme preferences:', error);
        }
    };

    const getEffectiveTheme = () => {
        if (preferences.theme === 'auto') {
            if (preferences.autoSchedule.enabled) {
                const now = new Date();
                const currentTime = now.getHours() * 100 + now.getMinutes();
                const lightStart = parseInt(preferences.autoSchedule.lightModeStart.replace(':', ''));
                const darkStart = parseInt(preferences.autoSchedule.darkModeStart.replace(':', ''));
                
                return currentTime >= darkStart || currentTime < lightStart ? 'dark' : 'light';
            } else {
                return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }
        }
        return preferences.theme;
    };

    const applyTheme = (effectiveTheme) => {
        setTheme(effectiveTheme);
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(effectiveTheme);
    };

    const updateCSSVariables = () => {
        const root = document.documentElement;
        const { colorScheme, customizations } = preferences;

        // Color variables
        root.style.setProperty('--color-primary', colorScheme.primary);
        root.style.setProperty('--color-secondary', colorScheme.secondary);
        root.style.setProperty('--color-accent', colorScheme.accent);

        // Font size
        const fontSizeMap = {
            small: '14px',
            medium: '16px',
            large: '18px'
        };
        root.style.setProperty('--font-size-base', fontSizeMap[customizations.fontSize]);

        // Border radius
        const borderRadiusMap = {
            none: '0px',
            small: '4px',
            medium: '8px',
            large: '12px'
        };
        root.style.setProperty('--border-radius', borderRadiusMap[customizations.borderRadius]);

        // Animations
        if (customizations.reducedMotion) {
            root.style.setProperty('--animation-duration', '0.01ms');
            root.style.setProperty('--transition-duration', '0.01ms');
        } else {
            root.style.setProperty('--animation-duration', '0.3s');
            root.style.setProperty('--transition-duration', '0.2s');
        }

        // High contrast
        if (customizations.highContrast) {
            root.classList.add('high-contrast');
        } else {
            root.classList.remove('high-contrast');
        }
    };

    const value = {
        theme,
        preferences,
        updateThemePreferences,
        getEffectiveTheme
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

const ThemeSettings = () => {
    const { preferences, updateThemePreferences } = useTheme();
    const [isCustomizing, setIsCustomizing] = useState(false);

    const handleThemeChange = (newTheme) => {
        updateThemePreferences({ theme: newTheme });
    };

    const handleColorChange = (colorType, color) => {
        updateThemePreferences({
            colorScheme: {
                ...preferences.colorScheme,
                [colorType]: color
            }
        });
    };

    const handleCustomizationChange = (key, value) => {
        updateThemePreferences({
            customizations: {
                ...preferences.customizations,
                [key]: value
            }
        });
    };

    const handleAutoScheduleChange = (key, value) => {
        updateThemePreferences({
            autoSchedule: {
                ...preferences.autoSchedule,
                [key]: value
            }
        });
    };

    const resetToDefaults = () => {
        updateThemePreferences({
            theme: 'auto',
            colorScheme: {
                primary: '#667eea',
                secondary: '#764ba2',
                accent: '#f093fb'
            },
            customizations: {
                fontSize: 'medium',
                fontFamily: 'system',
                borderRadius: 'medium',
                animations: true,
                reducedMotion: false,
                highContrast: false
            },
            autoSchedule: {
                enabled: false,
                lightModeStart: '06:00',
                darkModeStart: '18:00'
            }
        });
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8">
            {/* Header */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Palette className="text-purple-500" size={28} />
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                                Theme & Appearance
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                Customize your visual experience
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={resetToDefaults}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    >
                        <RefreshCw size={16} />
                        Reset to Defaults
                    </button>
                </div>
            </div>

            {/* Theme Selection */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Sun className="text-yellow-500" size={20} />
                    Theme Mode
                </h2>
                
                <div className="grid grid-cols-3 gap-4">
                    {[
                        { key: 'light', label: 'Light', icon: Sun, description: 'Light theme for bright environments' },
                        { key: 'dark', label: 'Dark', icon: Moon, description: 'Dark theme for low-light environments' },
                        { key: 'auto', label: 'Auto', icon: Monitor, description: 'Follow system preference' }
                    ].map(({ key, label, icon: Icon, description }) => (
                        <button
                            key={key}
                            onClick={() => handleThemeChange(key)}
                            className={`p-4 rounded-lg border-2 transition-all ${
                                preferences.theme === key
                                    ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                            }`}
                        >
                            <Icon className={`mx-auto mb-2 ${
                                preferences.theme === key ? 'text-purple-500' : 'text-gray-400'
                            }`} size={24} />
                            <div className="text-sm font-medium text-gray-900 dark:text-white">{label}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</div>
                        </button>
                    ))}
                </div>

                {/* Auto Schedule */}
                {preferences.theme === 'auto' && (
                    <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Automatic Schedule
                            </label>
                            <button
                                onClick={() => handleAutoScheduleChange('enabled', !preferences.autoSchedule.enabled)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    preferences.autoSchedule.enabled ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        preferences.autoSchedule.enabled ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                        
                        {preferences.autoSchedule.enabled && (
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                        Light Mode Start
                                    </label>
                                    <input
                                        type="time"
                                        value={preferences.autoSchedule.lightModeStart}
                                        onChange={(e) => handleAutoScheduleChange('lightModeStart', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
                                        Dark Mode Start
                                    </label>
                                    <input
                                        type="time"
                                        value={preferences.autoSchedule.darkModeStart}
                                        onChange={(e) => handleAutoScheduleChange('darkModeStart', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                    />
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Color Customization */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Palette className="text-pink-500" size={20} />
                    Color Scheme
                </h2>
                
                <div className="grid grid-cols-3 gap-6">
                    {[
                        { key: 'primary', label: 'Primary Color', description: 'Main brand color' },
                        { key: 'secondary', label: 'Secondary Color', description: 'Accent color' },
                        { key: 'accent', label: 'Accent Color', description: 'Highlight color' }
                    ].map(({ key, label, description }) => (
                        <div key={key} className="space-y-2">
                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                {label}
                            </label>
                            <div className="flex items-center gap-2">
                                <input
                                    type="color"
                                    value={preferences.colorScheme[key]}
                                    onChange={(e) => handleColorChange(key, e.target.value)}
                                    className="w-12 h-12 rounded-lg border-2 border-gray-200 dark:border-gray-600 cursor-pointer"
                                />
                                <div>
                                    <div className="text-sm font-mono text-gray-600 dark:text-gray-400">
                                        {preferences.colorScheme[key]}
                                    </div>
                                    <div className="text-xs text-gray-500 dark:text-gray-500">
                                        {description}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Typography & Layout */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Type className="text-blue-500" size={20} />
                    Typography & Layout
                </h2>
                
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Font Size
                        </label>
                        <select
                            value={preferences.customizations.fontSize}
                            onChange={(e) => handleCustomizationChange('fontSize', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                            <option value="small">Small (14px)</option>
                            <option value="medium">Medium (16px)</option>
                            <option value="large">Large (18px)</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Border Radius
                        </label>
                        <select
                            value={preferences.customizations.borderRadius}
                            onChange={(e) => handleCustomizationChange('borderRadius', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        >
                            <option value="none">None (0px)</option>
                            <option value="small">Small (4px)</option>
                            <option value="medium">Medium (8px)</option>
                            <option value="large">Large (12px)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Accessibility */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Eye className="text-green-500" size={20} />
                    Accessibility
                </h2>
                
                <div className="space-y-4">
                    {[
                        {
                            key: 'highContrast',
                            label: 'High Contrast',
                            description: 'Increase contrast for better readability'
                        },
                        {
                            key: 'reducedMotion',
                            label: 'Reduced Motion',
                            description: 'Minimize animations and transitions'
                        },
                        {
                            key: 'animations',
                            label: 'Enable Animations',
                            description: 'Show smooth transitions and effects'
                        }
                    ].map(({ key, label, description }) => (
                        <div key={key} className="flex items-center justify-between">
                            <div>
                                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                    {label}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                    {description}
                                </div>
                            </div>
                            <button
                                onClick={() => handleCustomizationChange(key, !preferences.customizations[key])}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                                    preferences.customizations[key] ? 'bg-purple-500' : 'bg-gray-300 dark:bg-gray-600'
                                }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                                        preferences.customizations[key] ? 'translate-x-6' : 'translate-x-1'
                                    }`}
                                />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Performance */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                    <Zap className="text-yellow-500" size={20} />
                    Performance
                </h2>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Preload Images
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Load images in advance for faster browsing
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            checked={true}
                            onChange={() => {}}
                            className="h-4 w-4 text-purple-600 rounded border-gray-300 dark:border-gray-600"
                        />
                    </div>
                    
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Lazy Loading
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                                Load content as you scroll to save bandwidth
                            </div>
                        </div>
                        <input
                            type="checkbox"
                            checked={true}
                            onChange={() => {}}
                            className="h-4 w-4 text-purple-600 rounded border-gray-300 dark:border-gray-600"
                        />
                    </div>
                </div>
            </div>

            {/* Preview */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                    Preview
                </h2>
                
                <div className="space-y-4 p-4 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                        <div 
                            className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                            style={{ backgroundColor: preferences.colorScheme.primary }}
                        >
                            TB
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                                Travel Blog Preview
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                This is how your theme will look
                            </p>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        <button 
                            className="px-4 py-2 rounded text-white font-medium"
                            style={{ backgroundColor: preferences.colorScheme.primary }}
                        >
                            Primary Button
                        </button>
                        <button 
                            className="px-4 py-2 rounded text-white font-medium"
                            style={{ backgroundColor: preferences.colorScheme.secondary }}
                        >
                            Secondary Button
                        </button>
                        <button 
                            className="px-4 py-2 rounded text-white font-medium"
                            style={{ backgroundColor: preferences.colorScheme.accent }}
                        >
                            Accent Button
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ThemeSettings;