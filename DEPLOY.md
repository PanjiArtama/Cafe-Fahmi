# 🚀 Panduan Deploy Cafe Fahmi ke VPS

Panduan ini menjelaskan cara deploy aplikasi Cafe Fahmi ke VPS Ubuntu menggunakan **PM2** (backend) dan **Nginx** (reverse proxy + frontend static).

---

## Arsitektur

```
Internet → Nginx (port 80/443)
              ├─ /          → Frontend static files (React build)
              ├─ /api/      → Reverse proxy ke Backend (PM2, port 5005)
              └─ /uploads/  → Static files (gambar menu/gallery)
```

**Cara kerja endpoint:**
- Frontend di-build dengan `VITE_API_URL=/api`
- Saat frontend memanggil `/api/auth/login`, Nginx meneruskan ke `http://127.0.0.1:5005/auth/login` (prefix `/api` di-strip)
- File upload diakses langsung dari `/uploads/` tanpa melalui backend

---

## Prasyarat

- VPS dengan Ubuntu 20.04+ (atau distro Linux lainnya)
- Akses SSH root atau sudo
- Git sudah terinstall
- Node.js 18+ (disarankan menggunakan NVM)

---

## 1. Install Node.js (via NVM)

```bash
# Install NVM
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.3/install.sh | bash
source ~/.bashrc

# Install Node.js LTS
nvm install --lts
nvm use --lts

# Verifikasi
node -v
npm -v
```

## 2. Install PM2

```bash
npm install -g pm2

# Setup PM2 agar auto-start saat VPS reboot
pm2 startup
# Ikuti instruksi yang muncul (copy-paste command yang diberikan)
```

## 3. Install Nginx

```bash
sudo apt update
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

## 4. Clone Repository

```bash
# Buat direktori project
sudo mkdir -p /var/www/cafe-fahmi
sudo chown -R $USER:$USER /var/www/cafe-fahmi

# Clone repo
cd /var/www
git clone https://github.com/USERNAME/Cafe-Fahmi.git cafe-fahmi
```

## 5. Setup Backend

```bash
cd /var/www/cafe-fahmi/backend

# Install dependencies
npm install --production

# Buat file .env (copy dari template, lalu edit)
cp .env.example .env
nano .env
```

**Edit file `.env` dengan nilai production:**

```env
PORT=5005
NODE_ENV=production
DB_URI=mongodb://your_actual_connection_string
JWT_SECRET=ganti_dengan_secret_yang_kuat_dan_panjang
SALT_ROUNDS=12
CORS_ORIGIN=https://yourdomain.com
```

> ⚠️ **Penting**: Ganti `yourdomain.com` dengan domain/IP VPS kamu yang sebenarnya!
> Jika belum punya domain, gunakan: `CORS_ORIGIN=http://IP_VPS_KAMU`

```bash
# Buat direktori uploads jika belum ada
mkdir -p uploads/Menu uploads/WebInfo

# Jalankan dengan PM2
cd /var/www/cafe-fahmi/backend
pm2 start index.js --name cafe-fahmi-backend
pm2 save

# Cek status
pm2 status
pm2 logs cafe-fahmi-backend
```

## 6. Setup Frontend

```bash
cd /var/www/cafe-fahmi/frontend

# Install dependencies
npm install

# File .env.production sudah ada dan berisi VITE_API_URL=/api
# Tidak perlu diubah kecuali ada kebutuhan khusus

# Build untuk production
npm run build

# Pastikan folder dist sudah terbuat
ls -la dist/
```

## 7. Setup Nginx

```bash
# Copy konfigurasi Nginx
sudo cp /var/www/cafe-fahmi/nginx/cafe-fahmi.conf /etc/nginx/sites-available/cafe-fahmi

# Edit server_name sesuai domain/IP kamu
sudo nano /etc/nginx/sites-available/cafe-fahmi
# Ganti: server_name yourdomain.com www.yourdomain.com;
# Menjadi: server_name IP_VPS_KAMU; (jika belum punya domain)

# Aktifkan site
sudo ln -s /etc/nginx/sites-available/cafe-fahmi /etc/nginx/sites-enabled/

# Hapus default config (optional, tapi disarankan)
sudo rm -f /etc/nginx/sites-enabled/default

# Test konfigurasi
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx
```

## 8. (Optional) Setup SSL dengan Certbot

Jika kamu sudah punya domain:

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Generate SSL certificate
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

# Certbot akan otomatis mengupdate konfigurasi Nginx
# Auto-renew sudah disetup secara otomatis
```

---

## Perintah Berguna

### PM2 Commands

```bash
# Lihat status
pm2 status

# Lihat logs
pm2 logs cafe-fahmi-backend

# Restart backend
pm2 restart cafe-fahmi-backend

# Monitor resource usage
pm2 monit
```

### Nginx Commands

```bash
# Test konfigurasi
sudo nginx -t

# Reload (tanpa downtime)
sudo systemctl reload nginx

# Restart
sudo systemctl restart nginx

# Lihat error log
sudo tail -f /var/log/nginx/cafe-fahmi-error.log
```

### Update/Deploy Ulang

Setelah push code baru ke repository:

```bash
cd /var/www/cafe-fahmi
bash deploy.sh
```

Atau manual:

```bash
cd /var/www/cafe-fahmi
git pull origin main

# Backend
cd backend
npm install --production
pm2 restart cafe-fahmi-backend

# Frontend (jika ada perubahan)
cd ../frontend
npm install
npm run build

sudo systemctl reload nginx
```

---

## Troubleshooting

### Backend tidak bisa connect ke MongoDB
- Pastikan IP VPS sudah di-whitelist di MongoDB Atlas (Network Access)
- Cek connection string di `.env`

### Gambar tidak muncul
- Pastikan folder `uploads/` memiliki permission yang benar:
  ```bash
  chmod -R 755 /var/www/cafe-fahmi/backend/uploads/
  ```

### Error 502 Bad Gateway
- Backend belum jalan. Cek dengan `pm2 status`
- Cek logs: `pm2 logs cafe-fahmi-backend`

### Error 413 Request Entity Too Large
- Nginx membatasi upload size. Sudah diset 10MB di config.
- Jika perlu lebih besar, edit `client_max_body_size` di Nginx config.

### Frontend menampilkan halaman blank
- Pastikan `npm run build` berhasil
- Pastikan path `root` di Nginx menunjuk ke `/var/www/cafe-fahmi/frontend/dist`
- Cek: `ls /var/www/cafe-fahmi/frontend/dist/index.html`
