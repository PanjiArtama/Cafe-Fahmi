#!/bin/bash
# ============================================================
# Deploy Script - Cafe Fahmi
# ============================================================
# Jalankan script ini di VPS untuk deploy/update aplikasi
# Usage: bash deploy.sh
# ============================================================

set -e  # Stop on error

APP_DIR="/var/www/cafe-fahmi"
BRANCH="main"

echo "============================================"
echo "  🚀 Deploying Cafe Fahmi..."
echo "============================================"

# ── 1. Pull latest code ──────────────────────────────────────
echo ""
echo "📦 [1/5] Pulling latest code..."
cd "$APP_DIR"
git fetch origin
git reset --hard origin/$BRANCH

# ── 2. Install backend dependencies ──────────────────────────
echo ""
echo "📦 [2/5] Installing backend dependencies..."
cd "$APP_DIR/backend"
npm ci --production

# ── 3. Install & build frontend ──────────────────────────────
echo ""
echo "🔨 [3/5] Building frontend..."
cd "$APP_DIR/frontend"
npm ci
npm run build

# ── 4. Restart backend with PM2 ──────────────────────────────
echo ""
echo "🔄 [4/5] Restarting backend (PM2)..."
cd "$APP_DIR/backend"

# Check if PM2 process exists
if pm2 describe cafe-fahmi-backend > /dev/null 2>&1; then
    pm2 restart cafe-fahmi-backend
else
    pm2 start index.js --name cafe-fahmi-backend
fi
pm2 save

# ── 5. Reload Nginx ──────────────────────────────────────────
echo ""
echo "🔄 [5/5] Reloading Nginx..."
sudo nginx -t && sudo systemctl reload nginx

# ── Done! ─────────────────────────────────────────────────────
echo ""
echo "============================================"
echo "  ✅ Deployment complete!"
echo "============================================"
echo ""
echo "  Backend:  PM2 (port 5005)"
echo "  Frontend: Nginx (static files)"
echo "  Logs:     pm2 logs cafe-fahmi-backend"
echo ""
