# Travel Blog & Package Booking System

A comprehensive MERN stack application for travel blogging and package booking, inspired by the travel-agency-master project. This application combines the functionality of a travel blog with a complete travel package booking system.

## Features

### Travel Blog Features
- User authentication and profiles
- Create, edit, and share travel stories
- Image uploads and galleries
- Location tagging and maps
- Comments and social interactions
- Categories and search functionality

### Travel Package Features
- Browse and search travel packages
- Detailed package information with itineraries
- Shopping cart functionality
- Booking system with traveler details
- Package reviews and ratings
- Admin panel for package management
- Category-based filtering
- Price range filtering

### User Management
- User registration and login
- Enhanced user profiles with travel preferences
- Passport and nationality information
- Emergency contact details
- Booking history and management

## Technology Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **bcryptjs** for password hashing
- **CORS** for cross-origin requests
- **Multer** for file uploads
- **Cloudinary** for image storage

### Frontend
- **React** with functional components and hooks
- **Material-UI (MUI)** for UI components
- **React Router** for navigation
- **Axios** for API calls
- **Redux** for state management
- **Date-fns** for date handling

## Project Structure

```
travel-blog/
├── backend/
│   ├── config/
│   │   ├── db.js
│   │   └── cloudinary.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── packageController.js
│   │   ├── bookingController.js
│   │   ├── cartController.js
│   │   └── ...
│   ├── middleware/
│   │   ├── auth.js
│   │   └── errorHandler.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Package.js
│   │   ├── Booking.js
│   │   ├── Cart.js
│   │   └── ...
│   ├── routes/
│   │   ├── auth.js
│   │   ├── packages.js
│   │   ├── bookings.js
│   │   ├── cart.js
│   │   └── ...
│   ├── uploads/
│   ├── app.js
│   └── server.js
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   │   ├── PackageCard.jsx
│   │   │   ├── BookingForm.jsx
│   │   │   ├── CartItem.jsx
│   │   │   └── ...
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Packages.jsx
│   │   │   ├── PackageDetails.jsx
│   │   │   ├── Cart.jsx
│   │   │   └── ...
│   │   ├── features/
│   │   ├── hooks/
│   │   ├── redux/
│   │   └── App.js
│   └── package.json
└── README.md
```

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file based on `.env.example`:
   ```bash
   cp .env.example .env
   ```

4. Update the `.env` file with your configuration:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/travel-blog
   JWT_SECRET=your_jwt_secret_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

5. Start the backend server:
   ```bash
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file:
   ```
   REACT_APP_API_URL=http://localhost:5000/api
   ```

4. Start the frontend development server:
   ```bash
   npm start
   ```

### Database Setup

The application will automatically create the necessary collections when you start using it. For sample data, you can:

1. Register as a user
2. Create some travel packages (admin functionality)
3. Add some blog posts
4. Test the booking system

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/profile` - Get user profile

### Packages
- `GET /api/packages` - Get all packages with filters
- `GET /api/packages/:id` - Get package by ID
- `GET /api/packages/search` - Search packages
- `GET /api/packages/featured` - Get featured packages
- `POST /api/packages` - Create package (admin)
- `PUT /api/packages/:id` - Update package (admin)
- `DELETE /api/packages/:id` - Delete package (admin)

### Bookings
- `POST /api/bookings` - Create booking
- `GET /api/bookings/my-bookings` - Get user bookings
- `GET /api/bookings/:id` - Get booking by ID
- `PUT /api/bookings/:id/cancel` - Cancel booking

### Cart
- `GET /api/cart` - Get user cart
- `POST /api/cart/add` - Add item to cart
- `PUT /api/cart/items/:id` - Update cart item
- `DELETE /api/cart/items/:id` - Remove cart item
- `DELETE /api/cart` - Clear cart

## Key Features Implemented

1. **Complete Package Management System**
   - Package CRUD operations
   - Image galleries
   - Detailed itineraries
   - Pricing with discounts
   - Availability tracking

2. **Advanced Booking System**
   - Multi-traveler bookings
   - Travel date selection
   - Contact information collection
   - Payment method selection
   - Booking status management

3. **Shopping Cart Functionality**
   - Add/remove packages
   - Quantity management
   - Travel date customization
   - Cart validation

4. **Enhanced User Experience**
   - Responsive design
   - Material-UI components
   - Search and filtering
   - Real-time cart updates
   - Loading states and error handling

5. **Admin Features**
   - Package management
   - Booking oversight
   - User management
   - Analytics dashboard

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support, please open an issue in the GitHub repository or contact the development team.
