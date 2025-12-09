# Deploying to Render.com

This guide walks you through deploying the Anime Snake Arena to Render.com.

## Prerequisites

- [ ] GitHub account
- [ ] Render account (sign up at [render.com](https://render.com))
- [ ] Your code pushed to a GitHub repository

## Deployment Steps

### Step 1: Push Code to GitHub

Ensure all files are committed and pushed to your GitHub repository:

```bash
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

### Step 2: Connect to Render

1. Go to [dashboard.render.com](https://dashboard.render.com)
2. Click **"New"** → **"Blueprint"**
3. Connect your GitHub account (if not already connected)
4. Select your repository: `anime-snake-arena`
5. Click **"Connect"**

### Step 3: Review & Deploy

Render will automatically detect the `render.yaml` file and show you:

- **Database**: `anime-snake-arena-db` (PostgreSQL)
- **Web Service**: `anime-snake-arena` (Docker-based)

Click **"Apply"** to start the deployment.

### Step 4: Monitor Deployment

The deployment will:

1. ✅ Provision PostgreSQL database (~2 minutes)
2. ✅ Build Docker image (~3-5 minutes)
3. ✅ Deploy web service (~1 minute)
4. ✅ Run health checks

**Total time**: ~5-8 minutes for first deployment

### Step 5: Access Your Application

Once deployed, Render provides a URL:

```
https://anime-snake-arena.onrender.com
```

You can:
- Click the URL to open your application
- Access API docs at: `https://your-url.onrender.com/docs`
- View logs in the Render dashboard

---

## Configuration

### Environment Variables

The following environment variables are automatically configured via `render.yaml`:

| Variable | Value | Source |
|----------|-------|--------|
| `DATABASE_URL` | PostgreSQL connection string | Auto-injected from database |
| `PORT` | 80 | Defined in render.yaml |

To add custom environment variables:
1. Go to your service in Render dashboard
2. Navigate to **Environment** tab
3. Click **"Add Environment Variable"**

### Database Access

Your PostgreSQL database is automatically provisioned with:
- **Daily backups** (retained for 7 days on Starter plan)
- **Connection pooling** enabled
- **SSL connections** enforced

To access the database directly:
1. Go to the database service in Render dashboard
2. Click **"Connect"** 
3. Use provided connection details with `psql` or database client

---

## Custom Domain (Optional)

### Adding a Custom Domain

1. Go to your web service in Render dashboard
2. Navigate to **Settings** tab
3. Scroll to **Custom Domain** section
4. Click **"Add Custom Domain"**
5. Enter your domain (e.g., `snakearena.com`)
6. Add the provided DNS records to your domain registrar:
   - **CNAME**: `www` → `your-app.onrender.com`
   - **A**: `@` → Render's IP address

### SSL Certificate

Render automatically provisions and renews SSL certificates for:
- Default `.onrender.com` subdomain
- Custom domains

**No configuration needed!** ✅

---

## Automatic Deployments

### Auto-Deploy on Push

Render automatically deploys when you push to your main branch:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Render will:
1. Detect the push
2. Build new Docker image
3. Deploy with zero-downtime rollout
4. Run health checks

### Deploy from Specific Branch

To deploy from a different branch, update `render.yaml`:

```yaml
services:
  - type: web
    name: anime-snake-arena
    branch: production  # Change from 'main'
```

### Manual Deployments

You can also trigger manual deployments:
1. Go to your service dashboard
2. Click **"Manual Deploy"** → **"Deploy latest commit"**

---

## Monitoring & Logs

### Viewing Logs

**Via Dashboard:**
1. Go to your service
2. Click **"Logs"** tab
3. View real-time logs from nginx, backend, and supervisord

**Via CLI (Optional):**
```bash
# Install Render CLI
npm install -g render-cli

# Login
render login

# View logs
render logs anime-snake-arena
```

### Health Checks

Render performs automatic health checks at:
- **Path**: `/api/leaderboard`
- **Interval**: Every 30 seconds
- **Timeout**: 10 seconds

If health checks fail, Render will:
- Keep old version running
- Alert you via email
- Show failure in dashboard

### Metrics

Available in the dashboard:
- **CPU usage**
- **Memory usage**
- **Request count**
- **Response times**
- **Error rates**

---

## Troubleshooting

### Deployment Fails

**Check build logs:**
1. Go to your service
2. Click **"Events"** tab
3. Find the failed deployment
4. Click **"View Logs"**

**Common issues:**
- **Docker build fails**: Check Dockerfile syntax
- **Port binding issues**: Ensure supervisord/nginx use PORT env var
- **Database connection fails**: Verify DATABASE_URL is set

### Application Not Responding

1. **Check health check endpoint**:
   ```bash
   curl https://your-app.onrender.com/api/leaderboard
   ```

2. **Review service logs** for errors from nginx or backend

3. **Verify database connectivity**:
   - Check database is running
   - Verify DATABASE_URL is correct

### Cold Starts (Free Tier)

Free tier services spin down after 15 minutes of inactivity:
- **First request**: ~30 second delay (cold start)
- **Subsequent requests**: Normal speed

**Solution**: Upgrade to Starter plan ($7/month) for always-on service

### Database Connection Errors

1. **Verify DATABASE_URL** format:
   ```
   postgresql://username:password@host:port/database
   ```

2. **Check database is healthy**:
   - Go to database service
   - Verify status is "Available"

3. **Review connection pool settings** in backend code

---

## Costs

### Free Tier (Testing)
- **Web Service**: Free (with limitations)
  - Spins down after 15min inactivity
  - 750 hours/month
  - Shared resources
- **Database**: ❌ Not available on free tier

### Starter Plan (Recommended)
- **Web Service**: $7/month
  - Always on
  - 512 MB RAM
  - 0.5 CPU
- **Database**: $7/month
  - 1 GB RAM
  - 1 GB storage
  - Daily backups (7 day retention)

**Total**: $14/month for production setup

### Scaling Up

As your app grows, you can upgrade plans in the dashboard:
- **Standard**: $25/month (2 GB RAM, 1 CPU)
- **Pro**: $85/month (4 GB RAM, 2 CPU)
- **Pro Plus**: $150/month (8 GB RAM, 4 CPU)

Database scales independently with storage and performance tiers.

---

## Next Steps

### Recommended Enhancements

1. **Set up monitoring alerts**
   - Configure email/Slack notifications for failures
   - Set up uptime monitoring (e.g., UptimeRobot)

2. **Add staging environment**
   - Duplicate `render.yaml` with different service names
   - Deploy from `develop` branch

3. **Configure backups**
   - Enable daily database backups
   - Export backup to external storage (S3)

4. **Performance optimization**
   - Add caching layer (Redis)
   - Enable CDN for static assets
   - Monitor and optimize database queries

5. **Security hardening**
   - Rotate database credentials
   - Add rate limiting
   - Enable Web Application Firewall (WAF)

---

## Support

### Render Support
- **Documentation**: [render.com/docs](https://render.com/docs)
- **Community**: [community.render.com](https://community.render.com)
- **Support**: Available via dashboard (paid plans get priority)

### Application Issues
- Check application logs in Render dashboard
- Review [DEPLOYMENT.md](./DEPLOYMENT.md) for local testing
- Verify environment variables are set correctly

---

## Quick Reference

### Useful Commands

```bash
# Build and test locally
docker build -t anime-snake-arena:combined .
docker-compose -f docker-compose.deploy.yml up

# Push to trigger deployment
git push origin main

# Check deployment status
# Visit: https://dashboard.render.com
```

### Important URLs

- **Dashboard**: https://dashboard.render.com
- **Your App**: https://anime-snake-arena.onrender.com (or your custom domain)
- **API Docs**: https://anime-snake-arena.onrender.com/docs
- **Render Status**: https://status.render.com

### Configuration Files

- [render.yaml](./render.yaml) - Infrastructure definition
- [Dockerfile](./Dockerfile) - Container build
- [supervisord.conf](./supervisord.conf) - Process management
- [nginx-deployment.conf](./nginx-deployment.conf) - Web server config
