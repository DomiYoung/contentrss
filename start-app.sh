#!/bin/bash

# ContentRSS Local Full-Stack Startup Script

echo "🚀 Starting ContentRSS Full-Stack Environment..."

# 1. Start Backend in background
echo "📡 Starting Backend (Flask) on http://localhost:8000..."
cd backend
source venv/bin/activate 2>/dev/null || venv/Scripts/activate 2>/dev/null
python3 main.py &
BACKEND_PID=$!

# 2. Start Frontend
echo "🎨 Starting Frontend (Vite) on http://localhost:5173..."
cd ../frontend
pnpm dev &
FRONTEND_PID=$!

# Function to handle shutdown
cleanup() {
    echo ""
    echo "🛑 Shutting down services..."
    kill $BACKEND_PID
    kill $FRONTEND_PID
    exit
}

# Trap SIGINT (Ctrl+C)
trap cleanup SIGINT

echo "✅ All services are running!"
echo "- Frontend: http://localhost:5173"
echo "- Backend API: http://localhost:8000"
echo "Press Ctrl+C to stop both."

# Keep script running to wait for trap
wait
