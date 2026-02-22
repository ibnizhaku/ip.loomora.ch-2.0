#!/bin/bash
# Run this on the live server: cd /var/www/loomora && ./scripts/deploy.sh

set -e

echo "=== Loomora deployment ==="

cd /var/www/loomora

echo "1. Pulling latest code..."
git pull origin main

echo "2. Installing frontend dependencies..."
npm install

echo "3. Building frontend..."
npm run build

echo "4. Installing backend dependencies..."
cd backend
npm install

echo "5. Running database migrations..."
npx prisma db push

cd ..

echo "6. Restarting backend..."
pm2 restart loomora-api

echo "=== Deployment complete ==="
echo "Frontend: https://app.loomora.ch"
echo "Backend: curl https://app.loomora.ch/api/health"
