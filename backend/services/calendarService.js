const { google } = require('googleapis');
const { Client } = require('@microsoft/microsoft-graph-client');
const ical = require('ical-generator');
const axios = require('axios');
const { CalendarIntegration } = require('../models/Integrations');

class CalendarService {
    constructor() {
        this.googleAuth = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_REDIRECT_URI
        );
    }

    // Google Calendar Integration
    async connectGoogleCalendar(userId, authCode) {
        try {
            const { tokens } = await this.googleAuth.getToken(authCode);
            this.googleAuth.setCredentials(tokens);

            const calendar = google.calendar({ version: 'v3', auth: this.googleAuth });
            const calendars = await calendar.calendarList.list();
            
            const primaryCalendar = calendars.data.items.find(cal => cal.primary) || calendars.data.items[0];

            const integration = await CalendarIntegration.findOneAndUpdate(
                { user: userId, provider: 'google' },
                {
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                    expiresAt: new Date(tokens.expiry_date),
                    calendarId: primaryCalendar.id,
                    lastSync: new Date(),
                    isActive: true
                },
                { upsert: true, new: true }
            );

            return {
                success: true,
                integration,
                calendars: calendars.data.items
            };
        } catch (error) {
            console.error('Google Calendar connection error:', error);
            throw new Error('Failed to connect Google Calendar');
        }
    }

    // Microsoft Outlook Integration
    async connectOutlookCalendar(userId, accessToken) {
        try {
            const graphClient = Client.init({
                authProvider: (done) => {
                    done(null, accessToken);
                }
            });

            const user = await graphClient.api('/me').get();
            const calendars = await graphClient.api('/me/calendars').get();
            
            const primaryCalendar = calendars.value.find(cal => cal.isDefaultCalendar) || calendars.value[0];

            const integration = await CalendarIntegration.findOneAndUpdate(
                { user: userId, provider: 'outlook' },
                {
                    accessToken,
                    calendarId: primaryCalendar.id,
                    lastSync: new Date(),
                    isActive: true
                },
                { upsert: true, new: true }
            );

            return {
                success: true,
                integration,
                calendars: calendars.value
            };
        } catch (error) {
            console.error('Outlook Calendar connection error:', error);
            throw new Error('Failed to connect Outlook Calendar');
        }
    }

    // Create Trip Event
    async createTripEvent(userId, tripData) {
        try {
            const integrations = await CalendarIntegration.find({ 
                user: userId, 
                isActive: true,
                'settings.syncTripEvents': true 
            });

            const results = [];

            for (const integration of integrations) {
                try {
                    let eventResult;
                    
                    if (integration.provider === 'google') {
                        eventResult = await this.createGoogleEvent(integration, tripData);
                    } else if (integration.provider === 'outlook') {
                        eventResult = await this.createOutlookEvent(integration, tripData);
                    }
                    
                    results.push({
                        provider: integration.provider,
                        success: true,
                        eventId: eventResult.id
                    });
                } catch (error) {
                    console.error(`Failed to create event in ${integration.provider}:`, error);
                    results.push({
                        provider: integration.provider,
                        success: false,
                        error: error.message
                    });
                }
            }

            return results;
        } catch (error) {
            console.error('Create trip event error:', error);
            throw new Error('Failed to create trip events');
        }
    }

    async createGoogleEvent(integration, tripData) {
        this.googleAuth.setCredentials({
            access_token: integration.accessToken,
            refresh_token: integration.refreshToken
        });

        const calendar = google.calendar({ version: 'v3', auth: this.googleAuth });

        const event = {
            summary: `Trip to ${tripData.destination}`,
            description: tripData.description || `Travel blog trip to ${tripData.destination}`,
            location: tripData.destination,
            start: {
                dateTime: tripData.startDate.toISOString(),
                timeZone: integration.settings.timezone || 'UTC'
            },
            end: {
                dateTime: tripData.endDate.toISOString(),
                timeZone: integration.settings.timezone || 'UTC'
            },
            colorId: this.getGoogleColorId(integration.settings.eventColor),
            reminders: {
                useDefault: false,
                overrides: [
                    { method: 'popup', minutes: integration.settings.reminderMinutes }
                ]
            },
            extendedProperties: {
                private: {
                    travelBlogId: tripData.blogId?.toString(),
                    tripId: tripData.tripId?.toString()
                }
            }
        };

        const response = await calendar.events.insert({
            calendarId: integration.calendarId,
            resource: event
        });

        return response.data;
    }

    async createOutlookEvent(integration, tripData) {
        const graphClient = Client.init({
            authProvider: (done) => {
                done(null, integration.accessToken);
            }
        });

        const event = {
            subject: `Trip to ${tripData.destination}`,
            body: {
                contentType: 'text',
                content: tripData.description || `Travel blog trip to ${tripData.destination}`
            },
            location: {
                displayName: tripData.destination
            },
            start: {
                dateTime: tripData.startDate.toISOString(),
                timeZone: integration.settings.timezone || 'UTC'
            },
            end: {
                dateTime: tripData.endDate.toISOString(),
                timeZone: integration.settings.timezone || 'UTC'
            },
            reminderMinutesBeforeStart: integration.settings.reminderMinutes,
            singleValueExtendedProperties: [
                {
                    id: 'String {66f5a359-4659-4830-9070-00047ec6ac6e} Name travelBlogId',
                    value: tripData.blogId?.toString()
                },
                {
                    id: 'String {66f5a359-4659-4830-9070-00047ec6ac6e} Name tripId',
                    value: tripData.tripId?.toString()
                }
            ]
        };

        const response = await graphClient
            .api(`/me/calendars/${integration.calendarId}/events`)
            .post(event);

        return response;
    }

    // Create Flight Event
    async createFlightEvent(userId, flightData) {
        try {
            const integrations = await CalendarIntegration.find({ 
                user: userId, 
                isActive: true,
                'settings.syncFlights': true 
            });

            const results = [];

            for (const integration of integrations) {
                try {
                    const eventData = {
                        summary: `Flight ${flightData.flightNumber} - ${flightData.origin.city} to ${flightData.destination.city}`,
                        description: `${flightData.airline} Flight ${flightData.flightNumber}\nAircraft: ${flightData.aircraft}`,
                        location: `${flightData.origin.airport} (${flightData.origin.code})`,
                        startDate: flightData.departure.time,
                        endDate: flightData.arrival.time,
                        blogId: flightData.blogId,
                        tripId: flightData.tripId
                    };

                    let eventResult;
                    if (integration.provider === 'google') {
                        eventResult = await this.createGoogleEvent(integration, eventData);
                    } else if (integration.provider === 'outlook') {
                        eventResult = await this.createOutlookEvent(integration, eventData);
                    }

                    results.push({
                        provider: integration.provider,
                        success: true,
                        eventId: eventResult.id
                    });
                } catch (error) {
                    results.push({
                        provider: integration.provider,
                        success: false,
                        error: error.message
                    });
                }
            }

            return results;
        } catch (error) {
            console.error('Create flight event error:', error);
            throw new Error('Failed to create flight events');
        }
    }

    // Sync Calendar Events
    async syncCalendarEvents(userId) {
        try {
            const integrations = await CalendarIntegration.find({ 
                user: userId, 
                isActive: true 
            });

            const syncResults = [];

            for (const integration of integrations) {
                try {
                    let events;
                    if (integration.provider === 'google') {
                        events = await this.syncGoogleEvents(integration);
                    } else if (integration.provider === 'outlook') {
                        events = await this.syncOutlookEvents(integration);
                    }

                    // Update last sync time
                    integration.lastSync = new Date();
                    await integration.save();

                    syncResults.push({
                        provider: integration.provider,
                        success: true,
                        eventsCount: events?.length || 0
                    });
                } catch (error) {
                    console.error(`Sync error for ${integration.provider}:`, error);
                    syncResults.push({
                        provider: integration.provider,
                        success: false,
                        error: error.message
                    });
                }
            }

            return syncResults;
        } catch (error) {
            console.error('Sync calendar events error:', error);
            throw new Error('Failed to sync calendar events');
        }
    }

    async syncGoogleEvents(integration) {
        this.googleAuth.setCredentials({
            access_token: integration.accessToken,
            refresh_token: integration.refreshToken
        });

        const calendar = google.calendar({ version: 'v3', auth: this.googleAuth });

        const response = await calendar.events.list({
            calendarId: integration.calendarId,
            timeMin: integration.lastSync?.toISOString() || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            singleEvents: true,
            orderBy: 'startTime',
            privateExtendedProperty: 'travelBlogId'
        });

        return response.data.items;
    }

    async syncOutlookEvents(integration) {
        const graphClient = Client.init({
            authProvider: (done) => {
                done(null, integration.accessToken);
            }
        });

        const timeMin = integration.lastSync?.toISOString() || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

        const response = await graphClient
            .api(`/me/calendars/${integration.calendarId}/events`)
            .filter(`createdDateTime ge ${timeMin}`)
            .get();

        return response.value;
    }

    // Export Calendar
    async exportTravelCalendar(userId, format = 'ics') {
        try {
            const User = require('../models/User');
            const Blog = require('../models/Blog');
            
            const user = await User.findById(userId);
            const blogs = await Blog.find({ author: userId }).sort({ createdAt: -1 });

            const cal = ical({
                domain: process.env.DOMAIN || 'localhost',
                name: 'Travel Blog Calendar',
                description: `Travel calendar for ${user.name}`,
                timezone: 'UTC',
                url: `${process.env.BASE_URL}/calendar/${userId}`
            });

            // Add trip events from blogs
            blogs.forEach(blog => {
                if (blog.tripDates && blog.tripDates.start && blog.tripDates.end) {
                    cal.createEvent({
                        start: blog.tripDates.start,
                        end: blog.tripDates.end,
                        summary: `Trip: ${blog.title}`,
                        description: blog.description || blog.content?.substring(0, 200),
                        location: blog.location,
                        url: `${process.env.BASE_URL}/blogs/${blog._id}`,
                        uid: `trip-${blog._id}@travelblog.com`,
                        categories: [{ name: 'Travel' }],
                        status: 'confirmed'
                    });
                }
            });

            if (format === 'ics') {
                return cal.toString();
            } else if (format === 'json') {
                return cal.toJSON();
            }

            throw new Error('Unsupported export format');
        } catch (error) {
            console.error('Export calendar error:', error);
            throw new Error('Failed to export calendar');
        }
    }

    // Utility methods
    getGoogleColorId(hexColor) {
        const colorMap = {
            '#4285F4': '1', // Blue
            '#0F9D58': '2', // Green
            '#F4B400': '5', // Yellow
            '#DB4437': '11', // Red
            '#AB47BC': '3', // Purple
            '#FF7043': '6', // Orange
            '#00ACC1': '7', // Cyan
            '#9C27B0': '9', // Purple
            '#795548': '8'  // Brown
        };
        return colorMap[hexColor] || '1';
    }

    async refreshGoogleToken(integration) {
        try {
            this.googleAuth.setCredentials({
                refresh_token: integration.refreshToken
            });

            const { credentials } = await this.googleAuth.refreshAccessToken();
            
            integration.accessToken = credentials.access_token;
            integration.expiresAt = new Date(credentials.expiry_date);
            await integration.save();

            return credentials.access_token;
        } catch (error) {
            console.error('Google token refresh error:', error);
            integration.isActive = false;
            await integration.save();
            throw new Error('Failed to refresh Google token');
        }
    }

    // Delete Integration
    async deleteIntegration(userId, provider) {
        try {
            const integration = await CalendarIntegration.findOne({ 
                user: userId, 
                provider 
            });

            if (!integration) {
                throw new Error('Integration not found');
            }

            // Revoke tokens if possible
            if (provider === 'google' && integration.refreshToken) {
                try {
                    await this.googleAuth.revokeToken(integration.refreshToken);
                } catch (error) {
                    console.error('Failed to revoke Google token:', error);
                }
            }

            await CalendarIntegration.deleteOne({ user: userId, provider });
            
            return { success: true };
        } catch (error) {
            console.error('Delete integration error:', error);
            throw new Error('Failed to delete integration');
        }
    }
}

module.exports = new CalendarService();