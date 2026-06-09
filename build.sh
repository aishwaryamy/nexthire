#!/bin/bash
set -e

echo "Building frontend..."
cd ../frontend
npm install
npm run build

echo "Copying frontend build to backend/static..."
cd ../backend
rm -rf static
cp -r ../frontend/dist static

echo "Installing Python dependencies..."
pip install -r requirements.txt

echo "Build complete!"
