# Free Tier Deployment with External Database

Since Render's free tier doesn't include PostgreSQL, you'll need to use a free external database service.

## Recommended Free PostgreSQL Providers

### Option 1: Neon (Recommended) ⭐
- **Free tier**: 500 MB storage, auto-suspend after inactivity
- **Setup**: https://neon.tech
- **Steps**:
  1. Sign up at neon.tech
  2. Create a new project
  3. Copy the connection string
  4. Add to Render as `DATABASE_URL` environment variable

### Option 2: Supabase
- **Free tier**: 500 MB database, unlimited requests
- **Setup**: https://supabase.com
- **Steps**:
  1. Create account at supabase.com
  2. Create new project
  3. Go to Settings → Database
  4. Copy "Connection string" (URI mode)
  5. Add to Render as `DATABASE_URL`

### Option 3: ElephantSQL
- **Free tier**: 20 MB storage (Tiny Turtle plan)
- **Setup**: https://elephantsql.com
- **Steps**:
  1. Sign up at elephantsql.com
  2. Create new instance (Tiny Turtle - free)
  3. Copy the URL
  4. Add to Render as `DATABASE_URL`

## Adding Database URL to Render

After getting your free database connection string:

1. **Go to Render Dashboard**
2. **Navigate to your service**: `anime-snake-arena`
3. **Go to Environment tab**
4. **Add environment variable**:
   - Key: `DATABASE_URL`
   - Value: `postgresql://user:password@host:5432/database`
5. **Save Changes**

Render will automatically redeploy with the new database connection.

## Free Tier Limitations

**Render Free Web Service:**
- ✅ 750 hours/month free
- ✅ Auto-deploy from GitHub
- ✅ Free SSL certificates
- ⚠️ Spins down after 15 minutes of inactivity
- ⚠️ Cold start ~30 seconds on first request

**External Database (Neon/Supabase):**
- ✅ Fully managed
- ✅ Generous free tier
- ✅ Daily backups
- ⚠️ Storage limits (500 MB)

## Cost

- **Web Service**: FREE (with limitations)
- **Database**: FREE (with external provider)
- **Total**: $0/month 🎉

## Upgrading Later

When ready for production:
1. Change `plan: free` to `plan: starter` in render.yaml
2. Add managed PostgreSQL database back
3. Push changes
4. Total cost: $14/month for production-ready setup
