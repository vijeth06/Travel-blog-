const ChatbotConversation = require('../models/ChatbotConversation');
const User = require('../models/User');
const Package = require('../models/Package');
const Blog = require('../models/Blog');

class ChatbotService {
  constructor() {
    this.intents = {
      greeting: ['hello', 'hi', 'hey', 'good morning', 'good evening'],
      booking_inquiry: ['book', 'booking', 'reserve', 'package', 'trip', 'travel'],
      destination_info: ['tell me about', 'information', 'what to do', 'attractions', 'places'],
      travel_advice: ['advice', 'tips', 'recommend', 'suggest', 'help', 'guide'],
      weather: ['weather', 'climate', 'temperature', 'rain', 'season'],
      budget: ['cost', 'price', 'budget', 'expensive', 'cheap', 'affordable'],
      transport: ['flight', 'train', 'bus', 'transport', 'how to get', 'travel to'],
      accommodation: ['hotel', 'stay', 'accommodation', 'where to stay', 'lodging'],
      food: ['food', 'restaurant', 'cuisine', 'eat', 'dining', 'local food'],
      goodbye: ['bye', 'goodbye', 'thanks', 'thank you', 'see you']
    };

    this.responses = {
      greeting: [
        "Hello! I'm your travel assistant. How can I help you plan your next adventure?",
        "Hi there! Ready to explore the world? What can I help you with today?",
        "Welcome! I'm here to help you with travel planning, bookings, and destination advice."
      ],
      booking_inquiry: [
        "I'd be happy to help you find the perfect travel package! What destination are you interested in?",
        "Great! Let me help you find amazing travel deals. Where would you like to go?",
        "I can help you book your dream trip. What's your preferred destination and travel dates?"
      ],
      destination_info: [
        "I'd love to share information about destinations! Which place are you curious about?",
        "Tell me which destination interests you, and I'll provide detailed information about attractions and activities.",
        "I have lots of destination information to share. Where are you thinking of visiting?"
      ],
      travel_advice: [
        "I'm here to provide travel tips and advice! What specific guidance are you looking for?",
        "Happy to share travel wisdom! What aspect of travel planning can I help you with?",
        "I'd be glad to offer travel advice. What would you like to know about?"
      ],
      default: [
        "I understand you're looking for travel assistance. Could you be more specific about what you need help with?",
        "I'm here to help with travel planning! Can you tell me more about what you're looking for?",
        "Let me help you with your travel needs. What specific information or assistance do you require?"
      ],
      goodbye: [
        "Have a wonderful trip! Feel free to ask if you need more travel assistance.",
        "Safe travels! Don't hesitate to reach out if you need any more help.",
        "Goodbye! I hope you have an amazing travel experience."
      ]
    };
  }

  async processMessage(sessionId, message, userId = null) {
    try {
      // Get or create conversation
      let conversation = await ChatbotConversation.findOne({ sessionId });
      
      if (!conversation) {
        conversation = new ChatbotConversation({
          sessionId,
          user: userId,
          messages: [],
          context: {
            conversationStage: 'greeting'
          }
        });
      }

      // Add user message
      conversation.messages.push({
        role: 'user',
        content: message,
        timestamp: new Date()
      });

      // Process message and generate response
      const intent = this.detectIntent(message);
      const entities = this.extractEntities(message);
      const response = await this.generateResponse(intent, entities, conversation);

      // Add assistant response
      conversation.messages.push({
        role: 'assistant',
        content: response.content,
        timestamp: new Date(),
        metadata: {
          intent,
          entities,
          confidence: response.confidence
        }
      });

      // Update context
      conversation.context.currentTopic = intent;
      conversation.context.conversationStage = this.determineStage(intent, conversation);
      
      // Extract and update user preferences from conversation
      this.updateUserPreferences(conversation, entities);

      await conversation.save();

      return {
        response: response.content,
        intent,
        entities,
        confidence: response.confidence,
        suggestions: response.suggestions || []
      };

    } catch (error) {
      console.error('Chatbot processing error:', error);
      return {
        response: "I'm sorry, I'm having trouble processing your request right now. Please try again later.",
        intent: 'error',
        entities: [],
        confidence: 0
      };
    }
  }

  detectIntent(message) {
    const lowerMessage = message.toLowerCase();
    let maxMatches = 0;
    let detectedIntent = 'default';

    for (const [intent, keywords] of Object.entries(this.intents)) {
      const matches = keywords.filter(keyword => lowerMessage.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        detectedIntent = intent;
      }
    }

    return detectedIntent;
  }

  extractEntities(message) {
    const entities = [];
    const lowerMessage = message.toLowerCase();

    // Extract dates
    const dateRegex = /\b(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}|\d{4}-\d{1,2}-\d{1,2})\b/g;
    const dates = message.match(dateRegex);
    if (dates) {
      dates.forEach(date => {
        entities.push({
          type: 'date',
          value: date,
          confidence: 0.9
        });
      });
    }

    // Extract numbers (for budget, duration)
    const numberRegex = /\b\d+\b/g;
    const numbers = message.match(numberRegex);
    if (numbers) {
      numbers.forEach(number => {
        if (parseInt(number) > 100) {
          entities.push({
            type: 'budget',
            value: number,
            confidence: 0.7
          });
        } else if (parseInt(number) <= 30) {
          entities.push({
            type: 'duration',
            value: number,
            confidence: 0.8
          });
        }
      });
    }

    // Extract common destinations (you can expand this list)
    const destinations = [
      'paris', 'london', 'tokyo', 'new york', 'rome', 'barcelona', 'amsterdam',
      'thailand', 'japan', 'italy', 'spain', 'france', 'germany', 'australia',
      'india', 'china', 'brazil', 'mexico', 'canada', 'egypt', 'greece'
    ];

    destinations.forEach(dest => {
      if (lowerMessage.includes(dest)) {
        entities.push({
          type: 'destination',
          value: dest,
          confidence: 0.85
        });
      }
    });

    return entities;
  }

  async generateResponse(intent, entities, conversation) {
    let response = '';
    let confidence = 0.8;
    let suggestions = [];

    try {
      switch (intent) {
        case 'greeting':
          response = this.getRandomResponse('greeting');
          suggestions = [
            'I want to book a trip',
            'Tell me about popular destinations',
            'I need travel advice',
            'Show me travel packages'
          ];
          break;

        case 'booking_inquiry':
          response = await this.handleBookingInquiry(entities, conversation);
          suggestions = [
            'Show me packages under $2000',
            'I prefer luxury travel',
            'Family-friendly destinations',
            'Adventure packages'
          ];
          break;

        case 'destination_info':
          response = await this.handleDestinationInfo(entities, conversation);
          suggestions = [
            'What about the weather?',
            'Best time to visit?',
            'Local cuisine recommendations',
            'Top attractions'
          ];
          break;

        case 'travel_advice':
          response = await this.handleTravelAdvice(entities, conversation);
          suggestions = [
            'Budget travel tips',
            'Packing advice',
            'Safety tips',
            'Local customs'
          ];
          break;

        case 'weather':
          response = await this.handleWeatherQuery(entities, conversation);
          break;

        case 'budget':
          response = await this.handleBudgetQuery(entities, conversation);
          break;

        case 'transport':
          response = await this.handleTransportQuery(entities, conversation);
          break;

        case 'accommodation':
          response = await this.handleAccommodationQuery(entities, conversation);
          break;

        case 'food':
          response = await this.handleFoodQuery(entities, conversation);
          break;

        case 'goodbye':
          response = this.getRandomResponse('goodbye');
          conversation.status = 'completed';
          break;

        default:
          response = this.getRandomResponse('default');
          suggestions = [
            'Book a travel package',
            'Get destination information',
            'Travel tips and advice',
            'Weather information'
          ];
      }

      // Personalize response if user is known
      if (conversation.user) {
        response = await this.personalizeResponse(response, conversation.user);
      }

    } catch (error) {
      console.error('Response generation error:', error);
      response = "I'm having trouble generating a response. Could you please rephrase your question?";
      confidence = 0.3;
    }

    return { content: response, confidence, suggestions };
  }

  async handleBookingInquiry(entities, conversation) {
    const destination = entities.find(e => e.type === 'destination');
    const budget = entities.find(e => e.type === 'budget');
    const duration = entities.find(e => e.type === 'duration');

    let response = "I'd love to help you find the perfect travel package! ";

    if (destination) {
      const packages = await Package.find({
        'location.name': new RegExp(destination.value, 'i')
      }).limit(3);

      if (packages.length > 0) {
        response += `I found ${packages.length} great packages for ${destination.value}:\n\n`;
        packages.forEach((pkg, index) => {
          response += `${index + 1}. ${pkg.title} - $${pkg.price} (${pkg.duration})\n`;
        });
        response += "\nWould you like more details about any of these packages?";
      } else {
        response += `I don't have specific packages for ${destination.value} right now, but I can help you find similar destinations or check if we have packages for nearby areas.`;
      }
    } else {
      response += "What destination are you interested in? I can show you our available packages and help you find the perfect match for your travel style and budget.";
    }

    return response;
  }

  async handleDestinationInfo(entities, conversation) {
    const destination = entities.find(e => e.type === 'destination');

    if (destination) {
      // Get related blogs for destination information
      const blogs = await Blog.find({
        'geotag.country': new RegExp(destination.value, 'i'),
        status: 'published'
      }).limit(3);

      let response = `Here's what I can tell you about ${destination.value}:\n\n`;

      if (blogs.length > 0) {
        response += "Based on our travel blogs, here are some highlights:\n";
        blogs.forEach((blog, index) => {
          response += `${index + 1}. ${blog.title}\n`;
          if (blog.excerpt) {
            response += `   ${blog.excerpt.substring(0, 100)}...\n`;
          }
        });
        response += "\nWould you like me to share more specific information about attractions, cuisine, or culture?";
      } else {
        response += this.getGenericDestinationInfo(destination.value);
      }
    } else {
      response = "Which destination would you like to know more about? I can provide information about attractions, culture, cuisine, and travel tips.";
    }

    return response;
  }

  async handleTravelAdvice(entities, conversation) {
    const responses = [
      "Here are some essential travel tips:\n\n" +
      "• Research your destination's culture and customs\n" +
      "• Pack light but bring essentials\n" +
      "• Keep digital and physical copies of important documents\n" +
      "• Stay flexible with your itinerary\n" +
      "• Try local cuisine and experiences\n\n" +
      "What specific aspect of travel would you like more advice about?",

      "Great travel advice includes:\n\n" +
      "• Book flights and accommodation in advance for better deals\n" +
      "• Learn basic phrases in the local language\n" +
      "• Get travel insurance for peace of mind\n" +
      "• Stay connected with family and friends about your plans\n" +
      "• Be open to unexpected adventures!\n\n" +
      "Is there a particular area where you need more guidance?"
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  }

  async handleWeatherQuery(entities, conversation) {
    const destination = entities.find(e => e.type === 'destination');
    
    if (destination) {
      return `For current weather information about ${destination.value}, I recommend checking a reliable weather service. Generally, the best time to visit most destinations is during their shoulder seasons (spring and fall) when the weather is pleasant and crowds are smaller. Would you like me to suggest the best time to visit ${destination.value}?`;
    } else {
      return "Which destination's weather are you curious about? I can provide general climate information and suggest the best times to visit.";
    }
  }

  async handleBudgetQuery(entities, conversation) {
    const budget = entities.find(e => e.type === 'budget');
    
    let response = "Budget planning is crucial for a great trip! ";
    
    if (budget) {
      const budgetValue = parseInt(budget.value);
      if (budgetValue < 1000) {
        response += "For budget travel under $1000, consider destinations in Southeast Asia, Eastern Europe, or Central America. Look for hostels, local transportation, and street food to maximize your budget.";
      } else if (budgetValue < 3000) {
        response += "With a mid-range budget of $1000-3000, you have great options in Europe, Japan, Australia, or premium experiences in budget destinations. Mix of hotels and unique accommodations work well.";
      } else {
        response += "With a luxury budget above $3000, you can enjoy premium experiences anywhere! Consider first-class flights, luxury resorts, private tours, and exclusive dining experiences.";
      }
    } else {
      response += "What's your approximate budget range? This helps me recommend destinations and experiences that match your spending comfort level.";
    }

    return response;
  }

  async handleTransportQuery(entities, conversation) {
    return "Transportation options vary by destination:\n\n" +
           "• Flights: Book 6-8 weeks in advance for best deals\n" +
           "• Trains: Great for scenic routes and city-to-city travel in Europe/Asia\n" +
           "• Buses: Budget-friendly option, especially for backpackers\n" +
           "• Car rentals: Perfect for road trips and exploring at your own pace\n" +
           "• Local transport: Research metro systems, taxis, and ride-sharing options\n\n" +
           "Which destination's transportation are you planning for?";
  }

  async handleAccommodationQuery(entities, conversation) {
    return "Accommodation options to consider:\n\n" +
           "• Hotels: Reliable service and amenities\n" +
           "• Hostels: Budget-friendly and social atmosphere\n" +
           "• Airbnb/Apartments: Local experience and kitchen facilities\n" +
           "• Resorts: All-inclusive relaxation\n" +
           "• Boutique properties: Unique, personalized experiences\n\n" +
           "What type of accommodation experience are you looking for?";
  }

  async handleFoodQuery(entities, conversation) {
    const destination = entities.find(e => e.type === 'destination');
    
    if (destination) {
      return `Food is one of the best parts of traveling to ${destination.value}! I recommend trying local specialties, visiting food markets, and asking locals for restaurant recommendations. Street food often offers authentic flavors at great prices. Would you like specific cuisine recommendations for ${destination.value}?`;
    } else {
      return "Food experiences can make or break a trip! Try local specialties, visit food markets, take cooking classes, and don't be afraid to eat where locals eat. Which destination's cuisine are you curious about?";
    }
  }

  getRandomResponse(category) {
    const responses = this.responses[category] || this.responses.default;
    return responses[Math.floor(Math.random() * responses.length)];
  }

  getGenericDestinationInfo(destination) {
    return `${destination} is a fascinating destination! I recommend checking our travel blogs for detailed experiences and tips from fellow travelers. You might also want to look at our available packages for ${destination} to see what attractions and activities are included.`;
  }

  determineStage(intent, conversation) {
    const messageCount = conversation.messages.length;
    
    if (messageCount <= 2) return 'greeting';
    if (['booking_inquiry', 'destination_info'].includes(intent)) return 'information_gathering';
    if (intent === 'booking_inquiry' && messageCount > 4) return 'booking_assistance';
    return 'recommendation';
  }

  updateUserPreferences(conversation, entities) {
    if (!conversation.context.userPreferences) {
      conversation.context.userPreferences = {};
    }

    entities.forEach(entity => {
      switch (entity.type) {
        case 'destination':
          conversation.context.userPreferences.destination = entity.value;
          break;
        case 'budget':
          conversation.context.userPreferences.budget = entity.value;
          break;
        case 'date':
          if (!conversation.context.userPreferences.travelDates) {
            conversation.context.userPreferences.travelDates = {};
          }
          // Simple logic - first date is start, second is end
          if (!conversation.context.userPreferences.travelDates.start) {
            conversation.context.userPreferences.travelDates.start = new Date(entity.value);
          } else if (!conversation.context.userPreferences.travelDates.end) {
            conversation.context.userPreferences.travelDates.end = new Date(entity.value);
          }
          break;
        case 'duration':
          conversation.context.userPreferences.duration = entity.value;
          break;
      }
    });
  }

  async personalizeResponse(response, userId) {
    try {
      const user = await User.findById(userId);
      if (user && user.name) {
        // Add personal touch to responses
        if (response.startsWith('Hello!') || response.startsWith('Hi there!')) {
          response = response.replace(/^(Hello!|Hi there!)/, `Hello ${user.name}!`);
        }
      }
    } catch (error) {
      console.error('Personalization error:', error);
    }
    return response;
  }

  async getConversationHistory(sessionId) {
    try {
      const conversation = await ChatbotConversation.findOne({ sessionId })
        .populate('user', 'name avatar');
      return conversation;
    } catch (error) {
      console.error('Get conversation history error:', error);
      return null;
    }
  }

  async submitFeedback(sessionId, rating, feedback) {
    try {
      const conversation = await ChatbotConversation.findOne({ sessionId });
      if (conversation) {
        conversation.satisfaction = {
          rating,
          feedback,
          resolved: rating >= 4
        };
        await conversation.save();
      }
    } catch (error) {
      console.error('Submit feedback error:', error);
    }
  }
}

module.exports = new ChatbotService();