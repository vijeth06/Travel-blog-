#!/bin/bash
# Build script for Render deployment

echo "Starting build process..."

# Navigate to frontend directory
cd frontend

# Install dependencies
echo "Installing dependencies..."
npm install

# Build the project
echo "Building React app..."
npm run build

echo "Build completed successfully!"