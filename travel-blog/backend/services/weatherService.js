const axios = require('axios');
const { WeatherIntegration } = require('../models/Integrations');

class WeatherService {
    constructor() {
        this.providers = {
            openweather: {
                baseUrl: 'https://api.openweathermap.org/data/2.5',
                key: process.env.OPENWEATHER_API_KEY,
                endpoints: {
                    current: '/weather',
                    forecast: '/forecast',
                    alerts: '/onecall'
                }
            },
            weatherapi: {
                baseUrl: 'https://api.weatherapi.com/v1',
                key: process.env.WEATHERAPI_KEY,
                endpoints: {
                    current: '/current.json',
                    forecast: '/forecast.json',
                    alerts: '/alerts.json'
                }
            },
            accuweather: {
                baseUrl: 'https://dataservice.accuweather.com',
                key: process.env.ACCUWEATHER_API_KEY,
                endpoints: {
                    current: '/currentconditions/v1',
                    forecast: '/forecasts/v1/daily/5day',
                    alerts: '/alerts/v1'
                }
            }
        };

        this.defaultProvider = 'openweather';
    }

    // Get Current Weather
    async getCurrentWeather(location, provider = this.defaultProvider) {
        try {
            let coordinates;
            
            // If location is a string, geocode it first
            if (typeof location === 'string') {
                coordinates = await this.geocodeLocation(location, provider);
            } else {
                coordinates = location;
            }

            // Check cache first
            const cached = await this.getCachedWeather(coordinates);
            if (cached && this.isCacheValid(cached)) {
                return cached;
            }

            let weatherData;
            
            switch (provider) {
                case 'openweather':
                    weatherData = await this.getOpenWeatherCurrent(coordinates);
                    break;
                case 'weatherapi':
                    weatherData = await this.getWeatherApiCurrent(coordinates);
                    break;
                case 'accuweather':
                    weatherData = await this.getAccuWeatherCurrent(coordinates);
                    break;
                default:
                    throw new Error('Unsupported weather provider');
            }

            // Cache the result
            await this.cacheWeatherData(weatherData);

            return weatherData;
        } catch (error) {
            console.error('Get current weather error:', error);
            throw new Error('Failed to get current weather data');
        }
    }

    // Get Weather Forecast
    async getWeatherForecast(location, days = 5, provider = this.defaultProvider) {
        try {
            let coordinates;
            
            if (typeof location === 'string') {
                coordinates = await this.geocodeLocation(location, provider);
            } else {
                coordinates = location;
            }

            let forecastData;
            
            switch (provider) {
                case 'openweather':
                    forecastData = await this.getOpenWeatherForecast(coordinates, days);
                    break;
                case 'weatherapi':
                    forecastData = await this.getWeatherApiForecast(coordinates, days);
                    break;
                case 'accuweather':
                    forecastData = await this.getAccuWeatherForecast(coordinates, days);
                    break;
                default:
                    throw new Error('Unsupported weather provider');
            }

            return forecastData;
        } catch (error) {
            console.error('Get weather forecast error:', error);
            throw new Error('Failed to get weather forecast');
        }
    }

    // OpenWeatherMap Integration
    async getOpenWeatherCurrent(coordinates) {
        const response = await axios.get(
            `${this.providers.openweather.baseUrl}/weather`,
            {
                params: {
                    lat: coordinates.lat,
                    lon: coordinates.lng,
                    appid: this.providers.openweather.key,
                    units: 'metric'
                }
            }
        );

        const data = response.data;
        
        return {
            location: {
                city: data.name,
                country: data.sys.country,
                coordinates: {
                    lat: data.coord.lat,
                    lng: data.coord.lon
                }
            },
            provider: 'openweather',
            current: {
                temperature: Math.round(data.main.temp),
                feelsLike: Math.round(data.main.feels_like),
                humidity: data.main.humidity,
                windSpeed: data.wind.speed,
                windDirection: data.wind.deg,
                visibility: data.visibility / 1000, // Convert to km
                uvIndex: 0, // Not available in current weather API
                condition: data.weather[0].description,
                icon: this.mapOpenWeatherIcon(data.weather[0].icon),
                pressure: data.main.pressure,
                cloudCover: data.clouds.all
            },
            lastUpdated: new Date(),
            expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        };
    }

    async getOpenWeatherForecast(coordinates, days) {
        const response = await axios.get(
            `${this.providers.openweather.baseUrl}/forecast`,
            {
                params: {
                    lat: coordinates.lat,
                    lon: coordinates.lng,
                    appid: this.providers.openweather.key,
                    units: 'metric',
                    cnt: days * 8 // 8 forecasts per day (3-hour intervals)
                }
            }
        );

        const data = response.data;
        const dailyForecasts = {};

        // Group forecasts by day
        data.list.forEach(item => {
            const date = new Date(item.dt * 1000).toDateString();
            if (!dailyForecasts[date]) {
                dailyForecasts[date] = {
                    date: new Date(item.dt * 1000),
                    temperatures: [],
                    conditions: [],
                    humidity: [],
                    windSpeed: [],
                    rain: []
                };
            }
            
            dailyForecasts[date].temperatures.push(item.main.temp);
            dailyForecasts[date].conditions.push(item.weather[0]);
            dailyForecasts[date].humidity.push(item.main.humidity);
            dailyForecasts[date].windSpeed.push(item.wind.speed);
            dailyForecasts[date].rain.push(item.pop * 100); // Probability of precipitation
        });

        // Process daily forecasts
        const forecast = Object.values(dailyForecasts).map(day => ({
            date: day.date,
            tempHigh: Math.round(Math.max(...day.temperatures)),
            tempLow: Math.round(Math.min(...day.temperatures)),
            condition: day.conditions[0].description,
            icon: this.mapOpenWeatherIcon(day.conditions[0].icon),
            chanceOfRain: Math.round(Math.max(...day.rain)),
            windSpeed: Math.round(day.windSpeed.reduce((a, b) => a + b) / day.windSpeed.length),
            humidity: Math.round(day.humidity.reduce((a, b) => a + b) / day.humidity.length)
        }));

        return forecast;
    }

    // WeatherAPI Integration
    async getWeatherApiCurrent(coordinates) {
        const response = await axios.get(
            `${this.providers.weatherapi.baseUrl}/current.json`,
            {
                params: {
                    key: this.providers.weatherapi.key,
                    q: `${coordinates.lat},${coordinates.lng}`,
                    aqi: 'yes'
                }
            }
        );

        const data = response.data;
        
        return {
            location: {
                city: data.location.name,
                country: data.location.country,
                coordinates: {
                    lat: data.location.lat,
                    lng: data.location.lon
                }
            },
            provider: 'weatherapi',
            current: {
                temperature: Math.round(data.current.temp_c),
                feelsLike: Math.round(data.current.feelslike_c),
                humidity: data.current.humidity,
                windSpeed: data.current.wind_kph / 3.6, // Convert to m/s
                windDirection: data.current.wind_degree,
                visibility: data.current.vis_km,
                uvIndex: data.current.uv,
                condition: data.current.condition.text,
                icon: this.mapWeatherApiIcon(data.current.condition.icon),
                pressure: data.current.pressure_mb,
                cloudCover: data.current.cloud
            },
            lastUpdated: new Date(),
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        };
    }

    async getWeatherApiForecast(coordinates, days) {
        const response = await axios.get(
            `${this.providers.weatherapi.baseUrl}/forecast.json`,
            {
                params: {
                    key: this.providers.weatherapi.key,
                    q: `${coordinates.lat},${coordinates.lng}`,
                    days: Math.min(days, 10) // API limit
                }
            }
        );

        const data = response.data;
        
        return data.forecast.forecastday.map(day => ({
            date: new Date(day.date),
            tempHigh: Math.round(day.day.maxtemp_c),
            tempLow: Math.round(day.day.mintemp_c),
            condition: day.day.condition.text,
            icon: this.mapWeatherApiIcon(day.day.condition.icon),
            chanceOfRain: day.day.daily_chance_of_rain,
            windSpeed: Math.round(day.day.maxwind_kph / 3.6), // Convert to m/s
            humidity: day.day.avghumidity
        }));
    }

    // AccuWeather Integration (requires location key)
    async getAccuWeatherCurrent(coordinates) {
        // First, get location key
        const locationResponse = await axios.get(
            `${this.providers.accuweather.baseUrl}/locations/v1/cities/geoposition/search`,
            {
                params: {
                    apikey: this.providers.accuweather.key,
                    q: `${coordinates.lat},${coordinates.lng}`
                }
            }
        );

        const locationKey = locationResponse.data.Key;

        const response = await axios.get(
            `${this.providers.accuweather.baseUrl}/currentconditions/v1/${locationKey}`,
            {
                params: {
                    apikey: this.providers.accuweather.key,
                    details: true
                }
            }
        );

        const data = response.data[0];
        
        return {
            location: {
                city: locationResponse.data.LocalizedName,
                country: locationResponse.data.Country.LocalizedName,
                coordinates: {
                    lat: locationResponse.data.GeoPosition.Latitude,
                    lng: locationResponse.data.GeoPosition.Longitude
                }
            },
            provider: 'accuweather',
            current: {
                temperature: Math.round(data.Temperature.Metric.Value),
                feelsLike: Math.round(data.RealFeelTemperature.Metric.Value),
                humidity: data.RelativeHumidity,
                windSpeed: data.Wind.Speed.Metric.Value / 3.6, // Convert to m/s
                windDirection: data.Wind.Direction.Degrees,
                visibility: data.Visibility.Metric.Value,
                uvIndex: data.UVIndex,
                condition: data.WeatherText,
                icon: this.mapAccuWeatherIcon(data.WeatherIcon),
                pressure: data.Pressure.Metric.Value,
                cloudCover: data.CloudCover
            },
            lastUpdated: new Date(),
            expiresAt: new Date(Date.now() + 10 * 60 * 1000)
        };
    }

    // Geocoding
    async geocodeLocation(location, provider = this.defaultProvider) {
        try {
            let response;
            
            if (provider === 'openweather') {
                response = await axios.get(
                    'https://api.openweathermap.org/geo/1.0/direct',
                    {
                        params: {
                            q: location,
                            limit: 1,
                            appid: this.providers.openweather.key
                        }
                    }
                );
                
                if (response.data.length === 0) {
                    throw new Error('Location not found');
                }
                
                return {
                    lat: response.data[0].lat,
                    lng: response.data[0].lon
                };
            }
            
            throw new Error('Geocoding not implemented for this provider');
        } catch (error) {
            console.error('Geocoding error:', error);
            throw new Error('Failed to geocode location');
        }
    }

    // Weather Alerts
    async getWeatherAlerts(coordinates, provider = this.defaultProvider) {
        try {
            let alertsData = [];
            
            if (provider === 'openweather') {
                const response = await axios.get(
                    'https://api.openweathermap.org/data/3.0/onecall',
                    {
                        params: {
                            lat: coordinates.lat,
                            lon: coordinates.lng,
                            appid: this.providers.openweather.key,
                            exclude: 'minutely,hourly,daily'
                        }
                    }
                );
                
                if (response.data.alerts) {
                    alertsData = response.data.alerts.map(alert => ({
                        type: alert.event,
                        title: alert.event,
                        description: alert.description,
                        severity: this.mapAlertSeverity(alert.tags),
                        startTime: new Date(alert.start * 1000),
                        endTime: new Date(alert.end * 1000)
                    }));
                }
            }
            
            return alertsData;
        } catch (error) {
            console.error('Get weather alerts error:', error);
            return [];
        }
    }

    // Cache Management
    async getCachedWeather(coordinates) {
        try {
            const cached = await WeatherIntegration.findOne({
                'location.coordinates.lat': { $near: coordinates.lat, $maxDistance: 0.01 },
                'location.coordinates.lng': { $near: coordinates.lng, $maxDistance: 0.01 },
                expiresAt: { $gt: new Date() }
            });
            
            return cached;
        } catch (error) {
            console.error('Get cached weather error:', error);
            return null;
        }
    }

    async cacheWeatherData(weatherData) {
        try {
            await WeatherIntegration.findOneAndUpdate(
                {
                    'location.city': weatherData.location.city,
                    'location.country': weatherData.location.country
                },
                weatherData,
                { upsert: true, new: true }
            );
        } catch (error) {
            console.error('Cache weather data error:', error);
        }
    }

    isCacheValid(cached) {
        return cached && cached.expiresAt > new Date();
    }

    // Travel Weather Insights
    async getTravelWeatherInsights(destination, departureDate, returnDate) {
        try {
            const coordinates = await this.geocodeLocation(destination);
            
            // Get historical weather data for the dates (if available)
            const insights = {
                destination,
                coordinates,
                travelDates: {
                    departure: departureDate,
                    return: returnDate
                },
                recommendations: [],
                packingList: [],
                warnings: []
            };

            // Get current weather and forecast
            const currentWeather = await this.getCurrentWeather(coordinates);
            const forecast = await this.getWeatherForecast(coordinates, 14);
            
            // Generate recommendations based on weather
            insights.recommendations = this.generateTravelRecommendations(currentWeather, forecast);
            insights.packingList = this.generatePackingList(currentWeather, forecast);
            insights.warnings = await this.getWeatherAlerts(coordinates);

            return insights;
        } catch (error) {
            console.error('Get travel weather insights error:', error);
            throw new Error('Failed to get travel weather insights');
        }
    }

    generateTravelRecommendations(currentWeather, forecast) {
        const recommendations = [];
        const avgTemp = forecast.reduce((sum, day) => sum + (day.tempHigh + day.tempLow) / 2, 0) / forecast.length;
        const rainDays = forecast.filter(day => day.chanceOfRain > 50).length;

        if (avgTemp > 25) {
            recommendations.push({
                type: 'hot',
                message: 'Hot weather expected. Stay hydrated and seek shade during midday.',
                icon: '☀️'
            });
        } else if (avgTemp < 10) {
            recommendations.push({
                type: 'cold',
                message: 'Cold weather expected. Pack warm clothing and layers.',
                icon: '🧥'
            });
        }

        if (rainDays > forecast.length / 2) {
            recommendations.push({
                type: 'rainy',
                message: 'Frequent rain expected. Pack waterproof gear and plan indoor activities.',
                icon: '🌧️'
            });
        }

        if (currentWeather.current.windSpeed > 10) {
            recommendations.push({
                type: 'windy',
                message: 'Strong winds expected. Secure loose items and be cautious outdoors.',
                icon: '💨'
            });
        }

        return recommendations;
    }

    generatePackingList(currentWeather, forecast) {
        const packingList = [];
        const maxTemp = Math.max(...forecast.map(day => day.tempHigh));
        const minTemp = Math.min(...forecast.map(day => day.tempLow));
        const rainProbability = Math.max(...forecast.map(day => day.chanceOfRain));

        // Temperature-based items
        if (maxTemp > 25) {
            packingList.push('Light, breathable clothing', 'Sunscreen', 'Hat', 'Sunglasses');
        }
        if (minTemp < 15) {
            packingList.push('Warm jacket', 'Long pants', 'Closed shoes');
        }
        if (maxTemp - minTemp > 15) {
            packingList.push('Layered clothing', 'Light sweater');
        }

        // Weather condition items
        if (rainProbability > 30) {
            packingList.push('Umbrella', 'Rain jacket', 'Waterproof bag');
        }
        if (currentWeather.current.uvIndex > 6) {
            packingList.push('Strong sunscreen (SPF 30+)', 'UV protection clothing');
        }

        return [...new Set(packingList)]; // Remove duplicates
    }

    // Utility Methods
    mapOpenWeatherIcon(icon) {
        const iconMap = {
            '01d': 'clear-day', '01n': 'clear-night',
            '02d': 'partly-cloudy-day', '02n': 'partly-cloudy-night',
            '03d': 'cloudy', '03n': 'cloudy',
            '04d': 'cloudy', '04n': 'cloudy',
            '09d': 'rain', '09n': 'rain',
            '10d': 'rain', '10n': 'rain',
            '11d': 'thunderstorm', '11n': 'thunderstorm',
            '13d': 'snow', '13n': 'snow',
            '50d': 'fog', '50n': 'fog'
        };
        return iconMap[icon] || 'unknown';
    }

    mapWeatherApiIcon(iconUrl) {
        if (iconUrl.includes('sun')) return 'clear-day';
        if (iconUrl.includes('moon')) return 'clear-night';
        if (iconUrl.includes('cloud')) return 'cloudy';
        if (iconUrl.includes('rain')) return 'rain';
        if (iconUrl.includes('storm')) return 'thunderstorm';
        if (iconUrl.includes('snow')) return 'snow';
        if (iconUrl.includes('fog')) return 'fog';
        return 'unknown';
    }

    mapAccuWeatherIcon(iconCode) {
        const iconMap = {
            1: 'clear-day', 2: 'clear-day', 3: 'partly-cloudy-day',
            4: 'partly-cloudy-day', 5: 'partly-cloudy-day', 6: 'cloudy',
            7: 'cloudy', 8: 'cloudy', 11: 'fog', 12: 'rain',
            13: 'rain', 14: 'rain', 15: 'thunderstorm', 16: 'thunderstorm',
            17: 'thunderstorm', 18: 'rain', 19: 'snow', 20: 'snow',
            21: 'snow', 22: 'snow', 23: 'snow', 24: 'snow',
            25: 'snow', 26: 'rain', 29: 'rain', 30: 'hot',
            31: 'cold', 32: 'windy', 33: 'clear-night', 34: 'clear-night',
            35: 'partly-cloudy-night', 36: 'partly-cloudy-night',
            37: 'partly-cloudy-night', 38: 'cloudy'
        };
        return iconMap[iconCode] || 'unknown';
    }

    mapAlertSeverity(tags) {
        if (tags.includes('Extreme')) return 'extreme';
        if (tags.includes('Severe')) return 'severe';
        if (tags.includes('Moderate')) return 'moderate';
        return 'minor';
    }

    // Clean up expired cache
    async cleanupExpiredCache() {
        try {
            await WeatherIntegration.deleteMany({
                expiresAt: { $lt: new Date() }
            });
        } catch (error) {
            console.error('Cleanup expired cache error:', error);
        }
    }
}

module.exports = new WeatherService();