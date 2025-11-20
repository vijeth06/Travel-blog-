# Travel Blog - Full Stack Application

A comprehensive travel blogging platform with social features, trip planning, and real-time chat.

## Quick Deployment to Render.com (FREE)

### Prerequisites
- MongoDB Atlas account (free tier): https://www.mongodb.com/cloud/atlas/register
- Render.com account (free tier): https://render.com

### Step 1: Set up MongoDB Atlas
1. Create a free cluster at MongoDB Atlas
2. Create a database user with password
3. Whitelist all IP addresses (0.0.0.0/0) for Render
4. Copy your connection string (mongodb+srv://...)

### Step 2: Deploy to Render
1. Go to https://render.com and sign in
2. Click "New +" → "Web Service"
3. Connect your GitHub repository: `vijeth06/Travel-blog-`
4. Configure:
   - **Name**: travel-blog (or your choice)
   - **Environment**: Node
   - **Build Command**: `cd backend && npm install && npm run build`
   - **Start Command**: `cd backend && npm start`
   - **Plan**: Free

5. Add Environment Variables:
   - `NODE_ENV` = `production`
   - `MONGODB_URI` = your MongoDB Atlas connection string
   - `JWT_SECRET` = (click "Generate" for random value)
   - `SESSION_SECRET` = (click "Generate" for random value)
   - `PORT` = `5000`

6. Click "Create Web Service"

### Step 3: Seed Demo Data (Optional)
After deployment, you can seed demo data:
1. Go to Render Dashboard → Your Service → Shell
2. Run: `npm run seed:demo`

### Step 4: Access Your App
Your app will be available at: `https://your-app-name.onrender.com`

**Demo Login:**
- Email: demo@travelapp.com
- Password: Demo@123

---

## Alternative: Vercel (Frontend) + Render (Backend)

### Frontend on Vercel
1. Go to https://vercel.com
2. Import GitHub repo
3. Set root directory to `frontend`
4. Add environment variable: `REACT_APP_API_URL` = `https://your-backend.onrender.com/api`
5. Deploy

### Backend on Render
Follow steps above but only deploy backend

---

## Alternative: Railway.app (One-Click Deploy)

1. Go to https://railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your repo
4. Add MongoDB plugin
5. Add environment variables
6. Deploy

---

## Local Development

### Backend
```bash
cd backend
npm install
cp .env.example .env  # Edit with your values
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm start
```

---

## Environment Variables Reference

### Required
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens
- `SESSION_SECRET` - Secret for sessions
- `NODE_ENV` - Environment (development/production)

### Optional
- `CLOUDINARY_CLOUD_NAME` - For image uploads
- `CLOUDINARY_API_KEY` - Cloudinary API key
- `CLOUDINARY_API_SECRET` - Cloudinary secret
- `GOOGLE_CLIENT_ID` - Google OAuth
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret

---

## Features
- 📝 Blog posts with rich text editor
- 🗺️ Interactive maps
- 💬 Real-time chat
- 🎯 Trip planning & collections
- ⭐ Reviews & ratings
- 👥 Social features (follow, like, comment)
- 📱 Responsive design
- 🔐 JWT authentication

## Tech Stack
- **Frontend**: React, Material-UI, Socket.io-client
- **Backend**: Node.js, Express, MongoDB, Socket.io
- **Deployment**: Render.com (or Railway/Vercel)

---

## Support
For issues, please create a GitHub issue in the repository.
