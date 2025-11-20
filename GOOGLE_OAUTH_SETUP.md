# Google OAuth Setup for Render Deployment

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable **Google+ API**:
   - Click "Enable APIs and Services"
   - Search for "Google+ API"
   - Click "Enable"

4. Create OAuth 2.0 Credentials:
   - Go to "Credentials" in left sidebar
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Configure consent screen if prompted:
     - User Type: External
     - App name: Travel Blog
     - User support email: your email
     - Developer contact: your email
     - Save and continue through all steps

5. Create OAuth Client:
   - Application type: **Web application**
   - Name: Travel Blog Production
   
   - **Authorized JavaScript origins**:
     ```
     https://travel-blog-na4y.onrender.com
     ```
   
   - **Authorized redirect URIs**:
     ```
     https://travel-blog-na4y.onrender.com/api/auth/google/callback
     https://travel-blog-na4y.onrender.com/api/auth/v2/google/callback
     ```
   
   - Click "Create"
   - **Copy your Client ID and Client Secret**

## Step 2: Add Environment Variables to Render

Go to your Render service dashboard → Environment tab → Add these variables:

```bash
# Google OAuth
GOOGLE_CLIENT_ID=your_client_id_from_google_console.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_client_secret_here
GOOGLE_CALLBACK_URL=https://travel-blog-na4y.onrender.com/api/auth/v2/google/callback
```

## Step 3: Required Environment Variables

Make sure all these are set in Render:

```bash
# Required
NODE_ENV=production
PORT=5000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=generated_secret_key
SESSION_SECRET=generated_secret_key

# Google OAuth (from Step 1)
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_secret
GOOGLE_CALLBACK_URL=https://travel-blog-na4y.onrender.com/api/auth/v2/google/callback

# Optional but recommended
FRONTEND_URL=https://travel-blog-na4y.onrender.com
SOCKET_IO_CORS_ORIGIN=https://travel-blog-na4y.onrender.com

# Optional - for image uploads
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Step 4: After Adding Variables

1. Click "Save Changes" in Render
2. Render will automatically redeploy with new environment variables
3. Wait for deployment to complete (~5 minutes)

## Step 5: Test Google Login

1. Go to https://travel-blog-na4y.onrender.com/login
2. Click "Sign in with Google" button
3. Should redirect to Google login
4. After authentication, redirects back to your app

## Troubleshooting

### "Redirect URI mismatch" error
- Make sure the callback URL in Google Console exactly matches your Render URL
- Check for http vs https
- No trailing slashes

### Google login button doesn't appear
- Check browser console for errors
- Verify GOOGLE_CLIENT_ID is set in Render environment variables
- Redeploy if you just added the variables

### "OAuth not configured" warning
- This is normal if you haven't set up Google OAuth yet
- Users can still login with email/password
- Add the environment variables and redeploy to enable Google login

## Current Status

Your app is deployed at: **https://travel-blog-na4y.onrender.com**

Without Google OAuth (current):
- ✅ Email/Password login works
- ✅ User registration works
- ❌ Google Sign-In disabled

With Google OAuth configured:
- ✅ Email/Password login works
- ✅ User registration works
- ✅ Google Sign-In enabled
- ✅ One-click authentication

## Demo Account

Email: demo@travelapp.com
Password: Demo@123

(Run `npm run seed:demo` in Render Shell to create demo data)
