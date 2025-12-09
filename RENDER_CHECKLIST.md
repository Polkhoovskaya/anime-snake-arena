# Render Deployment Checklist

Use this checklist when deploying to Render.com for the first time.

## Prerequisites
- [ ] GitHub repository created and code pushed
- [ ] Render account created at [render.com](https://render.com)
- [ ] GitHub account connected to Render

## Pre-Deployment
- [ ] Verify `render.yaml` exists in repository root
- [ ] Verify `Dockerfile` builds successfully locally
- [ ] Review environment variables in `.env.render.example`
- [ ] Test locally with `docker-compose -f docker-compose.deploy.yml up`

## Deployment Steps
- [ ] Push latest code to GitHub main branch
- [ ] Go to [dashboard.render.com](https://dashboard.render.com)
- [ ] Click "New" → "Blueprint"
- [ ] Connect your repository
- [ ] Review services (database + web service)
- [ ] Click "Apply" to start deployment

## Post-Deployment
- [ ] Wait for database provisioning (~2 min)
- [ ] Wait for Docker build (~3-5 min)
- [ ] Wait for service deployment (~1 min)
- [ ] Check deployment logs for errors
- [ ] Open your Render URL (e.g., https://anime-snake-arena.onrender.com)
- [ ] Test frontend loads correctly
- [ ] Test API at /docs endpoint
- [ ] Test login/registration
- [ ] Test game functionality
- [ ] Verify leaderboard works

## Optional Enhancements
- [ ] Add custom domain
- [ ] Configure DNS records
- [ ] Set up monitoring alerts
- [ ] Configure backup schedule
- [ ] Add staging environment

## Troubleshooting
If something goes wrong, refer to:
- [RENDER_DEPLOY.md](./RENDER_DEPLOY.md) - Comprehensive guide
- Render dashboard logs
- Service health check status

## Cost Confirmation
- [ ] Confirm Starter plan: $7/month for web service
- [ ] Confirm Starter plan: $7/month for database
- [ ] Total: $14/month (or free tier for testing)

---

**Need help?** See [RENDER_DEPLOY.md](./RENDER_DEPLOY.md) for detailed instructions and troubleshooting.
