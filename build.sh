#!/bin/bash
# Build script for Render deployment

echo "Current directory: $(pwd)"
echo "Directory contents:"
ls -la

echo "Starting build process..."

# Check if frontend directory exists
if [ -d "frontend" ]; then
    echo "Frontend directory found"
    cd frontend
    echo "Changed to frontend directory: $(pwd)"
    
    # Install dependencies
    echo "Installing dependencies..."
    npm install
    
    # Build the project
    echo "Building React app..."
    npm run build
    
    echo "Build completed successfully!"
    echo "Build directory contents:"
    ls -la build/
else
    echo "ERROR: Frontend directory not found!"
    echo "Available directories:"
    ls -la
    exit 1
fi