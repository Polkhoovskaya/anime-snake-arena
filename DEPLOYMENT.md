# Deployment Guide

This guide explains how to deploy the Anime Snake Arena application.

## Deployment Options

### 1. Render.com (Recommended) ⭐

**Best for**: Quick setup, managed infrastructure, auto-deployments

See the complete guide: **[RENDER_DEPLOY.md](./RENDER_DEPLOY.md)**

**Quick Start:**
```bash
# 1. Push to GitHub
git push origin main

# 2. Go to https://dashboard.render.com
# 3. Click "New" → "Blueprint"
# 4. Connect your repository
# 5. Click "Apply"
```

**Cost**: ~$14/month (Starter plan) or free tier for testing

---

### 2. Docker Compose (Local/VPS)

**Best for**: Self-hosted deployments, full control

## Files

- `Dockerfile` - Multi-stage build combining frontend and backend
- `docker-compose.deploy.yml` - Production deployment configuration
- `nginx-deployment.conf` - Nginx reverse proxy configuration
- `supervisord.conf` - Process manager configuration
- `render.yaml` - Render.com infrastructure definition

## Architecture

The deployment uses a single container running:
- Nginx (serves frontend, proxies API requests)
- FastAPI backend (handles API requests)
- Supervisord (manages both processes)

## Commands

```bash
# Build image
docker build -t anime-snake-arena:combined .

# Start services
docker-compose -f docker-compose.deploy.yml up -d

# View logs
docker-compose -f docker-compose.deploy.yml logs -f

# Stop services
docker-compose -f docker-compose.deploy.yml down
```

## Endpoints

- Frontend: http://localhost:8080
- API Docs: http://localhost:8080/docs
- API: http://localhost:8080/api/*
