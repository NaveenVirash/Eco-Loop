#!/bin/bash

echo "===================================="
echo "EcoLoop - Quick Start"
echo "===================================="
echo ""

# Check if Node is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

echo "[1/4] Starting MongoDB..."
echo "Please ensure MongoDB is running in another terminal"
echo "If using local MongoDB, run: mongod"
sleep 2

echo ""
echo "[2/4] Installing backend dependencies..."
cd backend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "Backend dependencies already installed"
fi

echo ""
echo "[3/4] Installing frontend dependencies..."
cd ../frontend
if [ ! -d "node_modules" ]; then
    npm install
else
    echo "Frontend dependencies already installed"
fi

cd ..

echo ""
echo "===================================="
echo "Starting EcoLoop Application"
echo "===================================="
echo ""
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""

# Start backend in background
cd backend
npm run dev &
BACKEND_PID=$!
sleep 3

# Start frontend
cd ../frontend
npm start &
FRONTEND_PID=$!

echo ""
echo "EcoLoop is running!"
echo "Backend PID: $BACKEND_PID"
echo "Frontend PID: $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for processes
wait
