# Production Deployment Guide

## 📋 Overview

EasyShop uses two separate Docker setups:
- **Development**: `docker-compose.yml` (dev образ с volume mounts, hot reload)
- **Production**: `docker-compose.prod.yml` (prod образ с кодом внутри, оптимизации)

## 🏗️ Architecture Differences

### Development (`easyshop-php:dev`)
- ✅ Xdebug enabled
- 📂 Code mounted as volume (live reload)
- 🔧 Dev dependencies installed
- 🎨 Assets built by Node container on-the-fly
- 🗄️ Fixtures load automatically (if DB empty)

### Production (`easyshop-php:prod`)
- ❌ No Xdebug (faster)
- 📦 Code baked into image (immutable)
- ⚡ OPcache aggressive mode
- 🗜️ Only production dependencies
- 📦 Pre-built, optimized assets included
- ❌ Fixtures never load automatically

## 🚀 Deployment Workflow

### Local Production Testing
```bash
# 1. Set environment to prod in .env
APP_ENV=prod

# 2. Build and deploy
make deploy-prod

# 3. Verify
docker ps
# Should see easyshop-php:prod image

# 4. Check logs
docker compose -f docker-compose.prod.yml logs -f php
```

### Production Server
```bash
# 1. Clone repository
git clone <repo-url>
cd EasyShop

# 2. Create production .env
cp .env.example .env
# Edit .env with production values:
#   APP_ENV=prod
#   APP_SECRET=<random-string>
#   MYSQL_PASSWORD=<strong-password>
#   DATABASE_URL=mysql://...
#   ADMIN_HOST=admin.easy-shop.by
#   MAIN_HOST=easy-shop.by

# 3. Build production image
make build-prod

# 4. Start services
make deploy-prod

# 5. Run migrations manually (first time only)
docker compose -f docker-compose.prod.yml exec php bin/console doctrine:migrations:migrate

# 6. Verify
curl http://localhost
```

## 🔄 Updates

When you push code changes:

```bash
# Development (instant)
git pull
# Changes visible immediately (volume mount)

# Production (rebuild required)
git pull
make build-prod
docker compose -f docker-compose.prod.yml up -d --force-recreate
```

## 🛠️ Makefile Commands

| Command | Description |
|---------|-------------|
| `make build-prod` | Build production image (with assets) |
| `make deploy-prod` | Build + start production containers |
| `make stop-prod` | Stop production containers |

## 🔐 Security Checklist

- [ ] `APP_ENV=prod` in `.env`
- [ ] Strong `APP_SECRET` (32+ random chars)
- [ ] Strong database passwords
- [ ] Database ports NOT exposed (already done in docker-compose.prod.yml)
- [ ] HTTPS configured (use reverse proxy like Nginx/Caddy)
- [ ] Firewall allows only 80/443

## ⚠️ Important Notes

1. **Fixtures**: Never loaded in `APP_ENV=prod`
2. **Assets**: Must be built before `make build-prod`
3. **Migrations**: Run automatically on container start
4. **Cache**: OPcache aggressive - restart container after code changes
5. **Logs**: Check with `docker compose -f docker-compose.prod.yml logs`
