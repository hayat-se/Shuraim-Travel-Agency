#!/bin/bash

# Airline Agency Management System - Setup Script

echo "🚀 Airline Agency Management System - Setup"
echo "============================================"

# Setup Backend
echo ""
echo "📦 Setting up Backend..."
cd server
npm install
echo "✅ Backend dependencies installed"

# Create .env if it doesn't exist
if [ ! -f .env ]; then
  cp .env.example .env
  echo "✅ Created .env file - Please update with your configuration"
else
  echo "✅ .env file already exists"
fi

# Setup Frontend
echo ""
echo "📦 Setting up Frontend..."
cd ../client
npm install
echo "✅ Frontend dependencies installed"

echo ""
echo "✅ Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Update .env file in server/ directory with your configuration"
echo "2. Start MongoDB"
echo "3. Run the database initialization script:"
echo "   cd server && node scripts/initDatabase.js"
echo "4. Start the backend: npm start (from server/)"
echo "5. Start the frontend: npm start (from client/)"
echo ""
echo "Demo credentials will be available after database initialization"
