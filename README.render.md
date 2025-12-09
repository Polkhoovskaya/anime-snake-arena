# Anime Snake Arena - Render Deployment

This project is configured for easy deployment to [Render.com](https://render.com).

## Quick Deploy

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

Or manually:

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Deploy via Render Dashboard**
   - Go to [dashboard.render.com](https://dashboard.render.com)
   - Click "New" → "Blueprint"
   - Connect your repository
   - Click "Apply"

3. **Wait for Deployment** (~5-8 minutes)
   - Database provisioning
   - Docker image build
   - Service deployment

4. **Access Your App**
   - Your app will be at: `https://anime-snake-arena.onrender.com`
   - API docs: `https://anime-snake-arena.onrender.com/docs`

## What's Deployed

- **Web Service**: Combined frontend (React) + backend (FastAPI)
- **Database**: Managed PostgreSQL with daily backups
- **SSL**: Automatic HTTPS certificates
- **Auto-Deploy**: Deploys on every push to main branch

## Cost

- **Starter Plan**: $14/month ($7 web + $7 database)
- **Free Tier**: Available for testing (spins down after 15min inactivity)

## Documentation

- **Detailed Guide**: [RENDER_DEPLOY.md](./RENDER_DEPLOY.md)
- **Deployment Options**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Local Development**: [README.md](./README.md)

## Files

- `render.yaml` - Infrastructure-as-Code definition
- `Dockerfile` - Container build configuration
- `docker-compose.deploy.yml` - Local deployment testing
- `supervisord.conf` - Process management
- `nginx-deployment.conf` - Web server configuration

## Support

See [RENDER_DEPLOY.md](./RENDER_DEPLOY.md) for:
- Troubleshooting
- Custom domains
- Environment variables
- Monitoring & logs
- Scaling options
