#!/bin/bash

# Kill any existing Next.js processes
pkill -f 'next dev' || true

# Start Next.js dev server in the background with setsid to detach
setsid npm run dev > /tmp/nextjs.log 2>&1 < /dev/null &

echo "Next.js dev server starting..."
sleep 5

# Check if server started
if curl -s http://localhost:3000 > /dev/null; then
    echo "✅ Next.js dev server is running on port 3000"
    echo "📱 Access at: https://english-tracker-app.ddev.site"
else
    echo "❌ Failed to start Next.js dev server"
    echo "Check logs: tail -f /tmp/nextjs.log"
    tail -20 /tmp/nextjs.log
    exit 1
fi
