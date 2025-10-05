const axios = require('axios');
const { FlightApi, HotelApi, ApiKeys } = require('../models/Integrations');

class BookingService {
    constructor() {
        this.providers = {
            flights: {
                amadeus: 'https://api.amadeus.com/v2',
                skyscanner: 'https://partners.api.skyscanner.net/apiservices',
                kiwi: 'https://api.tequila.kiwi.com/v2'
            },
            hotels: {
                booking: 'https://distribution-xml.booking.com/2.4',
                expedia: 'https://api.ean.com/ean-services/rs/hotel',
                hotels: 'https://api.hotels.com/v4'
            }
        };
    }

    // Flight Search Methods
    async searchFlights(userId, searchParams) {
        try {
            const searchId = this.generateSearchId();
            
            // Search multiple providers in parallel
            const providers = ['amadeus', 'kiwi']; // Add more as needed
            const searchPromises = providers.map(provider => 
                this.searchFlightProvider(provider, searchParams).catch(error => ({
                    provider,
                    error: error.message,
                    results: []
                }))
            );

            const providerResults = await Promise.all(searchPromises);
            
            // Combine and deduplicate results
            const allResults = [];
            providerResults.forEach(result => {
                if (result.results && result.results.length > 0) {
                    allResults.push(...result.results.map(flight => ({
                        ...flight,
                        provider: result.provider
                    })));
                }
            });

            // Sort by price
            allResults.sort((a, b) => a.price.amount - b.price.amount);

            // Save search results
            const flightSearch = new FlightApi({
                user: userId,
                searchId,
                origin: searchParams.origin,
                destination: searchParams.destination,
                departureDate: new Date(searchParams.departureDate),
                returnDate: searchParams.returnDate ? new Date(searchParams.returnDate) : null,
                passengers: searchParams.passengers,
                class: searchParams.class,
                results: allResults.slice(0, 50) // Limit to top 50 results
            });

            await flightSearch.save();

            return {
                searchId,
                results: allResults.slice(0, 20), // Return top 20 for initial display
                totalResults: allResults.length,
                providers: providerResults.map(r => ({
                    name: r.provider,
                    success: !r.error,
                    resultCount: r.results?.length || 0,
                    error: r.error
                }))
            };
        } catch (error) {
            console.error('Search flights error:', error);
            throw new Error('Failed to search flights');
        }
    }

    async searchFlightProvider(provider, params) {
        switch (provider) {
            case 'amadeus':
                return await this.searchAmadeusFlights(params);
            case 'kiwi':
                return await this.searchKiwiFlights(params);
            case 'skyscanner':
                return await this.searchSkyscannerFlights(params);
            default:
                throw new Error('Unsupported flight provider');
        }
    }

    // Amadeus Flight Search
    async searchAmadeusFlights(params) {
        try {
            const apiKey = await this.getApiKey('amadeus');
            
            // Get access token
            const tokenResponse = await axios.post(
                'https://api.amadeus.com/v1/security/oauth2/token',
                'grant_type=client_credentials&client_id=' + apiKey.primary + '&client_secret=' + apiKey.secondary,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            const accessToken = tokenResponse.data.access_token;

            // Search flights
            const searchResponse = await axios.get(
                'https://api.amadeus.com/v2/shopping/flight-offers',
                {
                    headers: {
                        'Authorization': `Bearer ${accessToken}`
                    },
                    params: {
                        originLocationCode: params.origin.code,
                        destinationLocationCode: params.destination.code,
                        departureDate: params.departureDate,
                        returnDate: params.returnDate,
                        adults: params.passengers.adults,
                        children: params.passengers.children,
                        infants: params.passengers.infants,
                        travelClass: params.class?.toUpperCase(),
                        max: 20
                    }
                }
            );

            return {
                provider: 'amadeus',
                results: this.parseAmadeusFlights(searchResponse.data.data)
            };
        } catch (error) {
            console.error('Amadeus flight search error:', error);
            throw new Error('Amadeus flight search failed');
        }
    }

    parseAmadeusFlights(flights) {
        return flights.map(offer => {
            const outbound = offer.itineraries[0];
            const segments = outbound.segments;
            const firstSegment = segments[0];
            const lastSegment = segments[segments.length - 1];

            return {
                airline: firstSegment.carrierCode,
                flightNumber: firstSegment.number,
                aircraft: firstSegment.aircraft?.code,
                departure: {
                    time: new Date(firstSegment.departure.at),
                    airport: firstSegment.departure.iataCode,
                    terminal: firstSegment.departure.terminal
                },
                arrival: {
                    time: new Date(lastSegment.arrival.at),
                    airport: lastSegment.arrival.iataCode,
                    terminal: lastSegment.arrival.terminal
                },
                duration: this.parseDuration(outbound.duration),
                stops: segments.length - 1,
                layovers: segments.slice(0, -1).map((segment, index) => ({
                    airport: segment.arrival.iataCode,
                    duration: this.calculateLayoverDuration(segment.arrival.at, segments[index + 1].departure.at)
                })),
                price: {
                    amount: parseFloat(offer.price.total),
                    currency: offer.price.currency,
                    taxes: parseFloat(offer.price.fees?.[0]?.amount || 0),
                    fees: 0
                },
                amenities: this.extractAmenities(segments),
                bookingUrl: null // Would need to implement deep linking
            };
        });
    }

    // Kiwi.com Flight Search
    async searchKiwiFlights(params) {
        try {
            const apiKey = await this.getApiKey('kiwi');
            
            const response = await axios.get(
                'https://api.tequila.kiwi.com/v2/search',
                {
                    headers: {
                        'apikey': apiKey.primary
                    },
                    params: {
                        fly_from: params.origin.code,
                        fly_to: params.destination.code,
                        date_from: params.departureDate,
                        date_to: params.departureDate,
                        return_from: params.returnDate,
                        return_to: params.returnDate,
                        adults: params.passengers.adults,
                        children: params.passengers.children,
                        infants: params.passengers.infants,
                        selected_cabins: params.class,
                        limit: 20,
                        sort: 'price',
                        asc: 1
                    }
                }
            );

            return {
                provider: 'kiwi',
                results: this.parseKiwiFlights(response.data.data)
            };
        } catch (error) {
            console.error('Kiwi flight search error:', error);
            throw new Error('Kiwi flight search failed');
        }
    }

    parseKiwiFlights(flights) {
        return flights.map(flight => ({
            airline: flight.airlines[0],
            flightNumber: flight.route[0].flight_no?.toString(),
            aircraft: null,
            departure: {
                time: new Date(flight.route[0].dTimeUTC * 1000),
                airport: flight.route[0].flyFrom,
                terminal: null
            },
            arrival: {
                time: new Date(flight.route[flight.route.length - 1].aTimeUTC * 1000),
                airport: flight.route[flight.route.length - 1].flyTo,
                terminal: null
            },
            duration: flight.fly_duration ? parseInt(flight.fly_duration) : 0,
            stops: flight.route.length - 1,
            layovers: flight.route.slice(0, -1).map((segment, index) => ({
                airport: segment.flyTo,
                duration: flight.route[index + 1] ? 
                    (flight.route[index + 1].dTimeUTC - segment.aTimeUTC) / 60 : 0
            })),
            price: {
                amount: flight.price,
                currency: 'EUR',
                taxes: 0,
                fees: 0
            },
            amenities: [],
            bookingUrl: flight.deep_link
        }));
    }

    // Hotel Search Methods
    async searchHotels(userId, searchParams) {
        try {
            const searchId = this.generateSearchId();
            
            // Search multiple providers
            const providers = ['booking']; // Add more providers as implemented
            const searchPromises = providers.map(provider => 
                this.searchHotelProvider(provider, searchParams).catch(error => ({
                    provider,
                    error: error.message,
                    results: []
                }))
            );

            const providerResults = await Promise.all(searchPromises);
            
            // Combine results
            const allResults = [];
            providerResults.forEach(result => {
                if (result.results && result.results.length > 0) {
                    allResults.push(...result.results.map(hotel => ({
                        ...hotel,
                        provider: result.provider
                    })));
                }
            });

            // Sort by price
            allResults.sort((a, b) => a.price.amount - b.price.amount);

            // Save search results
            const hotelSearch = new HotelApi({
                user: userId,
                searchId,
                location: searchParams.location,
                checkIn: new Date(searchParams.checkIn),
                checkOut: new Date(searchParams.checkOut),
                guests: searchParams.guests,
                filters: searchParams.filters,
                results: allResults.slice(0, 50)
            });

            await hotelSearch.save();

            return {
                searchId,
                results: allResults.slice(0, 20),
                totalResults: allResults.length,
                providers: providerResults.map(r => ({
                    name: r.provider,
                    success: !r.error,
                    resultCount: r.results?.length || 0,
                    error: r.error
                }))
            };
        } catch (error) {
            console.error('Search hotels error:', error);
            throw new Error('Failed to search hotels');
        }
    }

    async searchHotelProvider(provider, params) {
        switch (provider) {
            case 'booking':
                return await this.searchBookingHotels(params);
            case 'expedia':
                return await this.searchExpediaHotels(params);
            default:
                throw new Error('Unsupported hotel provider');
        }
    }

    // Booking.com Hotel Search (Mock implementation - requires XML API access)
    async searchBookingHotels(params) {
        // This is a mock implementation
        // Real implementation would use Booking.com's XML API
        
        return {
            provider: 'booking',
            results: [
                {
                    hotelId: 'booking_123',
                    name: 'Sample Hotel',
                    starRating: 4,
                    address: '123 Sample Street, ' + params.location.city,
                    coordinates: params.location.coordinates,
                    images: ['https://example.com/hotel1.jpg'],
                    description: 'A comfortable hotel in the heart of the city.',
                    amenities: ['WiFi', 'Pool', 'Gym', 'Restaurant'],
                    rooms: [
                        {
                            type: 'Standard Room',
                            description: 'Comfortable room with city view',
                            maxOccupancy: 2,
                            price: {
                                amount: 120,
                                currency: 'USD',
                                perNight: true
                            },
                            amenities: ['WiFi', 'Air Conditioning', 'TV'],
                            images: ['https://example.com/room1.jpg']
                        }
                    ],
                    price: {
                        amount: 120,
                        currency: 'USD',
                        totalNights: this.calculateNights(params.checkIn, params.checkOut),
                        taxes: 20,
                        fees: 5
                    },
                    rating: {
                        score: 8.2,
                        reviewCount: 1247,
                        source: 'Booking.com'
                    },
                    distance: 0.5,
                    bookingUrl: 'https://booking.com/hotel/sample',
                    cancellation: {
                        freeCancellation: true,
                        deadline: new Date(Date.now() + 24 * 60 * 60 * 1000),
                        penalty: 0
                    }
                }
            ]
        };
    }

    // Price Tracking
    async trackFlightPrice(userId, flightId, searchId) {
        try {
            // Implementation for price tracking
            // This would involve setting up periodic checks
            
            const flightSearch = await FlightApi.findOne({ searchId, user: userId });
            if (!flightSearch) {
                throw new Error('Flight search not found');
            }

            const flight = flightSearch.results.id(flightId);
            if (!flight) {
                throw new Error('Flight not found');
            }

            // Create price alert (would implement PriceAlert model)
            const priceAlert = {
                user: userId,
                type: 'flight',
                itemId: flightId,
                searchId: searchId,
                currentPrice: flight.price.amount,
                targetPrice: flight.price.amount * 0.9, // Alert if price drops by 10%
                isActive: true,
                createdAt: new Date()
            };

            // Set up periodic price checks using job queue
            // await this.schedulePrice Check(priceAlert);

            return {
                success: true,
                priceAlert
            };
        } catch (error) {
            console.error('Track flight price error:', error);
            throw new Error('Failed to track flight price');
        }
    }

    // Booking Integration
    async initiateBooking(userId, bookingType, itemId, searchId) {
        try {
            let bookingData;
            
            if (bookingType === 'flight') {
                const flightSearch = await FlightApi.findOne({ searchId, user: userId });
                const flight = flightSearch.results.id(itemId);
                bookingData = this.prepareFlightBooking(flight);
            } else if (bookingType === 'hotel') {
                const hotelSearch = await HotelApi.findOne({ searchId, user: userId });
                const hotel = hotelSearch.results.id(itemId);
                bookingData = this.prepareHotelBooking(hotel);
            }

            // Generate booking session
            const bookingSession = {
                id: this.generateSearchId(),
                userId,
                type: bookingType,
                itemId,
                data: bookingData,
                expiresAt: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes
                status: 'initiated'
            };

            // Store session (implement BookingSession model)
            // await BookingSession.create(bookingSession);

            return {
                success: true,
                bookingSessionId: bookingSession.id,
                bookingUrl: bookingData.bookingUrl,
                expiresAt: bookingSession.expiresAt
            };
        } catch (error) {
            console.error('Initiate booking error:', error);
            throw new Error('Failed to initiate booking');
        }
    }

    prepareFlightBooking(flight) {
        return {
            type: 'flight',
            provider: flight.provider,
            bookingUrl: flight.bookingUrl,
            price: flight.price,
            details: {
                airline: flight.airline,
                flightNumber: flight.flightNumber,
                departure: flight.departure,
                arrival: flight.arrival,
                duration: flight.duration
            }
        };
    }

    prepareHotelBooking(hotel) {
        return {
            type: 'hotel',
            provider: hotel.provider,
            bookingUrl: hotel.bookingUrl,
            price: hotel.price,
            details: {
                name: hotel.name,
                address: hotel.address,
                starRating: hotel.starRating,
                room: hotel.rooms[0] // Default to first room
            }
        };
    }

    // Utility Methods
    generateSearchId() {
        return 'search_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    async getApiKey(service) {
        const apiKeys = await ApiKeys.findOne({ service, isActive: true });
        if (!apiKeys) {
            throw new Error(`API keys not found for ${service}`);
        }
        return apiKeys.keys;
    }

    parseDuration(duration) {
        // Parse ISO 8601 duration (PT2H30M) to minutes
        const match = duration.match(/PT(\d+H)?(\d+M)?/);
        let minutes = 0;
        if (match) {
            if (match[1]) minutes += parseInt(match[1]) * 60;
            if (match[2]) minutes += parseInt(match[2]);
        }
        return minutes;
    }

    calculateLayoverDuration(arrivalTime, departureTime) {
        return (new Date(departureTime) - new Date(arrivalTime)) / (1000 * 60); // minutes
    }

    calculateNights(checkIn, checkOut) {
        const checkInDate = new Date(checkIn);
        const checkOutDate = new Date(checkOut);
        return Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24));
    }

    extractAmenities(segments) {
        const amenities = [];
        segments.forEach(segment => {
            if (segment.amenities) {
                amenities.push(...segment.amenities);
            }
        });
        return [...new Set(amenities)]; // Remove duplicates
    }

    // Advanced Features
    async getFlightInsights(searchParams) {
        try {
            const insights = {
                priceHistory: await this.getPriceHistory(searchParams),
                bestTimeToBook: await this.getBestTimeToBook(searchParams),
                alternativeAirports: await this.getAlternativeAirports(searchParams),
                seasonalTrends: await this.getSeasonalTrends(searchParams),
                recommendations: []
            };

            // Generate recommendations based on insights
            insights.recommendations = this.generateFlightRecommendations(insights);

            return insights;
        } catch (error) {
            console.error('Get flight insights error:', error);
            throw new Error('Failed to get flight insights');
        }
    }

    async getPriceHistory(searchParams) {
        // Mock implementation - would use historical data
        return {
            prices: [
                { date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), price: 450 },
                { date: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000), price: 420 },
                { date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), price: 480 },
                { date: new Date(), price: 435 }
            ],
            trend: 'stable',
            prediction: 'prices likely to remain stable'
        };
    }

    async getBestTimeToBook(searchParams) {
        return {
            daysBeforeDeparture: 60,
            confidence: 0.75,
            reasoning: 'Historical data shows best prices 8-9 weeks before departure'
        };
    }

    async getAlternativeAirports(searchParams) {
        // Mock implementation
        return [
            {
                code: 'LGA',
                name: 'LaGuardia Airport',
                distance: 15,
                potentialSavings: 50
            },
            {
                code: 'EWR',
                name: 'Newark Liberty International',
                distance: 25,
                potentialSavings: 75
            }
        ];
    }

    async getSeasonalTrends(searchParams) {
        return {
            highSeason: { months: [6, 7, 8], avgPrice: 600 },
            lowSeason: { months: [11, 12, 1, 2], avgPrice: 350 },
            currentSeason: 'shoulder',
            avgPrice: 475
        };
    }

    generateFlightRecommendations(insights) {
        const recommendations = [];

        if (insights.priceHistory.trend === 'increasing') {
            recommendations.push({
                type: 'urgent',
                message: 'Prices are trending upward. Book soon to avoid higher costs.',
                icon: '📈'
            });
        }

        if (insights.alternativeAirports.length > 0) {
            const bestAlternative = insights.alternativeAirports[0];
            recommendations.push({
                type: 'savings',
                message: `Consider ${bestAlternative.name} to save up to $${bestAlternative.potentialSavings}`,
                icon: '💰'
            });
        }

        return recommendations;
    }
}

module.exports = new BookingService();