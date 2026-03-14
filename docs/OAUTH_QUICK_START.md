# OAuth Setup Quick Start

## Current Status

✅ NextAuth.js installed and configured
✅ Google OAuth provider configured
✅ GitHub OAuth provider configured
✅ Sign-in page created at `/auth/signin`
✅ User profile component
✅ Authentication guard for protected routes
✅ Per-user data isolation  
✅ MongoDB integration for user-specific tracking

## ⚠️ Important: OAuth Credentials Required

The authentication system is fully implemented, but you need to configure OAuth credentials to actually sign in.

## Quick Setup (5 minutes)

### 1. Generate NextAuth Secret

```bash
openssl rand -base64 32
```

Copy the output and add to `.env.local`:
```env
NEXTAUTH_SECRET=paste_your_generated_secret_here
```

### 2. Google OAuth Setup

1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Create/select project → **APIs & Services** → **Credentials**
3. Click **Create Credentials** → **OAuth client ID** → **Web application**
4. Add redirect URI:
   ```
   https://english-tracker-app.ddev.site/api/auth/callback/google
   ```
5. Copy **Client ID** and **Client Secret** to `.env.local`:
   ```env
   GOOGLE_CLIENT_ID=your-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=GOCSPX-your-secret
   ```

### 3. GitHub OAuth Setup

1. Visit [GitHub OAuth Apps](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in:
   - Homepage URL: `https://english-tracker-app.ddev.site`
   - Callback URL: `https://english-tracker-app.ddev.site/api/auth/callback/github`
4. Generate client secret
5. Copy credentials to `.env.local`:
   ```env
   GITHUB_CLIENT_ID=Iv1.your-client-id
   GITHUB_CLIENT_SECRET=your-secret-key
   ```

### 4. Restart Application

```bash
ddev restart
```

## Test Authentication

1. Visit: https://english-tracker-app.ddev.site
2. You'll be redirected to `/auth/signin`
3. Click **Continue with Google** or **Continue with GitHub**
4. Authorize the app
5. You'll be redirected back and signed in!

## What You'll See After Sign In

- **User Profile** in top-right (name, email, profile picture)
- **Your personal progress** separate from other users
- **Sign Out** button
- **Data synced** to MongoDB with your email as userId

## Example .env.local

```env
AI_API_KEY=your_api_key_here
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4.1-mini

# MongoDB (already configured by DDEV)
MONGODB_URI=mongodb://root:root@mongodb:27017/english_tracker?authSource=admin

# NextAuth (YOU NEED TO ADD THESE)
NEXTAUTH_URL=https://english-tracker-app.ddev.site
NEXTAUTH_SECRET=generate-with-openssl-rand-base64-32

# Google OAuth (YOU NEED TO ADD THESE)
GOOGLE_CLIENT_ID=1234567890-abc.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xyz123

# GitHub OAuth (YOU NEED TO ADD THESE)
GITHUB_CLIENT_ID=Iv1.abc123
GITHUB_CLIENT_SECRET=abc123xyz789
```

## Files Created

### Authentication Core
- `lib/auth.ts` - NextAuth configuration
- `app/api/auth/[...nextauth]/route.ts` - Auth API routes
- `types/next-auth.d.ts` - TypeScript definitions

### UI Components
- `app/auth/signin/page.tsx` - Sign-in page
- `components/SessionProvider.tsx` - Session context
- `components/AuthGuard.tsx` - Route protection
- `components/UserProfile.tsx` - User info display

### Database Integration
- `lib/models/User.ts` - User schema
- `store/databaseSync.ts` - Updated for per-user sync

### Documentation
- `docs/AUTHENTICATION.md` - **Full setup guide**
- `docs/OAUTH_QUICK_START.md` - This file

## Default Behavior (No OAuth Configured)

Without OAuth credentials:
- App redirects to `/auth/signin`
- Sign-in buttons won't work (no credentials)
- You'll see a friendly error page

**Solution**: Follow steps above to configure OAuth!

## Troubleshooting

### "Configuration error"
- Check `.env.local` has all required OAuth variables
- Restart: `ddev restart`

### "Callback URL mismatch"
- Ensure redirect URI exactly matches:
  - Google: `https://english-tracker-app.ddev.site/api/auth/callback/google`
  - GitHub: `https://english-tracker-app.ddev.site/api/auth/callback/github`

### "Cannot read properties of undefined"
- Check `NEXTAUTH_SECRET` is set in `.env.local`

### Sign in button does nothing
- Open browser console for error details
- Verify OAuth app is enabled in provider dashboard

## Next Steps

1. **Configure OAuth** (follow steps above)
2. **Test sign-in** with both providers
3. **Verify data isolation** (sign in with 2 different accounts)
4. **Customize sign-in page** (`app/auth/signin/page.tsx`)
5. **Add additional OAuth providers** (Twitter, Facebook, etc.)

## Production Deployment

When deploying to production:

1. Create production OAuth apps
2. Update redirect URIs to production domain
3. Generate new `NEXTAUTH_SECRET` (keep it secret!)
4. Set `NEXTAUTH_URL` to production URL
5. Use environment secrets (not .env files)

## Documentation

For detailed information:
- [Full Authentication Guide](./AUTHENTICATION.md)
- [MongoDB Integration](./MONGODB_INTEGRATION.md)
- [DDEV Setup](./DDEV_SETUP.md)

---

**Ready?** Configure your OAuth credentials and start learning!
