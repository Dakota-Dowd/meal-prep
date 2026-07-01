# Deployment

## Infrastructure

### Server
- **EC2 instance:** personal-projects-server, public IP `18.220.59.96`
- **OS:** Amazon Linux 2023
- **SSH:** `ssh personal-projects-server` (config in `~/.ssh/config`)
- **Web server:** Nginx, configs in `/etc/nginx/conf.d/`
- **Node version:** 20

### Database
- **RDS instance:** `personal-projects.c56y6q6smo6p.us-east-2.rds.amazonaws.com`
- **Port:** 3306
- **Database name:** `meal_prep`
- **Credentials:** stored in `backend/.env` — never commit this file

### Domains
- **Frontend:** https://mealprep.dakotadowd.com
- **Backend API:** https://mealprep-api.dakotadowd.com
- **DNS:** managed via Squarespace, TTL 30 mins

### SSL & PM2
- SSL certificates via Let's Encrypt/Certbot, auto-renewing
- PM2 configured to auto-start on server reboot (`pm2 startup` + `pm2 save`)

---

## Deploy Process

### Backend changes

```bash
cd /var/www/meal-prep
git pull
cd backend
npm install
npm run build
pm2 restart mealprep-backend
```

### Frontend changes

```bash
cd /var/www/meal-prep
git pull
cd frontend
npm install
npm run build
```

Nginx serves the `dist` folder automatically — no restart needed.

### Both changed

Run all steps above.

---

## Notes

- PM2 process name: `mealprep-backend`, runs on port `3001`
- Nginx handles HTTPS and reverse proxying automatically
- `.env` lives at `/var/www/meal-prep/backend/.env` and is gitignored — must be manually created/updated on the server
