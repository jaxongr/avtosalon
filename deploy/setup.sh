#!/bin/bash
set -e

echo "=== AVTOSALON DEPLOY SCRIPT ==="
echo "Boshqa loyihalarga tegmaymiz!"

# 1. Database yaratish
echo ">>> PostgreSQL database yaratish..."
sudo -u postgres psql -c "CREATE USER avtosalon WITH PASSWORD 'avtosalon_secret_2024';" 2>/dev/null || echo "User mavjud"
sudo -u postgres psql -c "CREATE DATABASE avtosalon_db OWNER avtosalon;" 2>/dev/null || echo "DB mavjud"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE avtosalon_db TO avtosalon;" 2>/dev/null
echo "DB tayyor"

# 2. Loyihani clone qilish
echo ">>> Git clone..."
mkdir -p /var/www
cd /var/www
if [ -d "avtosalon" ]; then
  cd avtosalon
  git pull origin main
else
  git clone https://github.com/jaxongr/avtosalon.git
  cd avtosalon
fi

# 3. Backend setup
echo ">>> Backend setup..."
cd /var/www/avtosalon/backend
npm install --production=false

# .env yaratish
cat > .env << 'ENVEOF'
DATABASE_URL="postgresql://avtosalon:avtosalon_secret_2024@localhost:5432/avtosalon_db"
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

JWT_ACCESS_SECRET=avtosalon-jwt-access-prod-x7k9m2
JWT_REFRESH_SECRET=avtosalon-jwt-refresh-prod-q8w4n1
JWT_ACCESS_EXPIRY=15m
JWT_REFRESH_EXPIRY=7d

TELEGRAM_BOT_TOKEN=8649772315:AAEt9XY-hLH3P5l8f1NW2PYg6-XqvM7sZWw
TELEGRAM_ADMIN_GROUP_ID=
TELEGRAM_SESSION_STRING=
TELEGRAM_API_ID=37640919
TELEGRAM_API_HASH=8bab0de95e9830858e6040621dd1b4a7

SEMYSMS_TOKEN=
SEMYSMS_DEVICE=

UPLOAD_DIR=./uploads
PORT=4010
MINI_APP_URL=
ENVEOF

# Prisma migrate va build
npx prisma generate
npx prisma migrate deploy 2>/dev/null || npx prisma db push --accept-data-loss
npx prisma db seed 2>/dev/null || echo "Seed already done or skipped"
npm run build

# uploads papka
mkdir -p uploads/photos uploads/videos

# 4. Admin dashboard build
echo ">>> Admin build..."
cd /var/www/avtosalon/admin
npm install

# Admin .env - serverga mos
cat > .env << 'ENVEOF'
VITE_API_URL=http://5.189.141.151:4010/api
ENVEOF

npx vite build

# 5. Mini App build
echo ">>> Mini App build..."
cd /var/www/avtosalon/mini-app
npm install --legacy-peer-deps

cat > .env << 'ENVEOF'
VITE_API_URL=http://5.189.141.151:4010/api
ENVEOF

npx vite build

# 6. PM2 bilan backend ishga tushirish
echo ">>> PM2 start..."
cd /var/www/avtosalon/backend
pm2 delete avtosalon-api 2>/dev/null || true
pm2 start dist/main.js --name avtosalon-api
pm2 save

# 7. Nginx config
echo ">>> Nginx config..."
cat > /etc/nginx/sites-available/avtosalon << 'NGINXEOF'
server {
    listen 8082;
    server_name 5.189.141.151;

    # Admin Dashboard (static)
    root /var/www/avtosalon/admin/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:4010/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Uploads
    location /uploads/ {
        alias /var/www/avtosalon/backend/uploads/;
    }
}

server {
    listen 8083;
    server_name 5.189.141.151;

    # Mini App (static)
    root /var/www/avtosalon/mini-app/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
NGINXEOF

ln -sf /etc/nginx/sites-available/avtosalon /etc/nginx/sites-enabled/avtosalon
nginx -t && systemctl reload nginx

echo ""
echo "=== DEPLOY TUGADI ==="
echo "Admin Panel: http://5.189.141.151:8082"
echo "Mini App:    http://5.189.141.151:8083"
echo "API Docs:    http://5.189.141.151:4010/api/docs"
echo "Login:       admin / admin123"
echo ""
