# Authentication Setup Guide

## Overview

The English Tracker App now supports Google and GitHub authentication for personalized learning. Each user's progress is tracked separately and synced to MongoDB.

## Features

- ✅ Google OAuth login
- ✅ GitHub OAuth login
- ✅ Per-user data isolation
- ✅ Automatic session management
- ✅ Secure JWT-based authentication

## Setup Instructions

### Step 1: Generate NextAuth Secret

```bash
# Generate a random secret
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

Add the generated secret to `.env.local`:
```env
NEXTAUTH_SECRET=your_generated_secret_here
```

### Step 2: Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API:
   - Navigate to **APIs & Services** → **Library**
   - Search for "Google+ API"
   - Click **Enable**

4. Create OAuth 2.0 Credentials:
   - Go to **APIs & Services** → **Credentials**
   - Click **Create Credentials** → **OAuth client ID**
   - Choose **Web application**
   - Add authorized redirect URIs:
     ```
     https://english-tracker-app.ddev.site/api/auth/callback/google
     http://localhost:3000/api/auth/callback/google
     ```
   - Click **Create**

5. Copy the credentials to `.env.local`:
   ```env
   GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   ```

### Step 3: Configure GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click **New OAuth App**
3. Fill in the details:
   - **Application name**: English Tracker App
   - **Homepage URL**: `https://english-tracker-app.ddev.site`
   - **Authorization callback URL**:
     ```
     https://english-tracker-app.ddev.site/api/auth/callback/github
     ```
   - For local development, create another app with:
     ```
     http://localhost:3000/api/auth/callback/github
     ```
4. Click **Register application**
5. Generate a new client secret
6. Copy the credentials to `.env.local`:
   ```env
   GITHUB_CLIENT_ID=your-github-client-id
   GITHUB_CLIENT_SECRET=your-github-client-secret
   ```

### Step 4: Set NextAuth URL

In `.env.local`, set your application URL:

```env
# For DDEV
NEXTAUTH_URL=https://english-tracker-app.ddev.site

# For local development
# NEXTAUTH_URL=http://localhost:3000

# For production
# NEXTAUTH_URL=https://your-domain.com
```

### Step 5: Restart the Application

```bash
# If using DDEV
ddev restart

# If using local Node.js
npm run dev
```

## Complete Example .env.local

```env
AI_API_KEY=your_api_key_here
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4.1-mini

# MongoDB Configuration
MONGODB_URI=mongodb://root:root@mongodb:27017/english_tracker?authSource=admin

# NextAuth Configuration
NEXTAUTH_URL=https://english-tracker-app.ddev.site
NEXTAUTH_SECRET=generated-secret-using-openssl-rand-base64-32

# Google OAuth
GOOGLE_CLIENT_ID=1234567890-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your_secret_here

# GitHub OAuth
GITHUB_CLIENT_ID=Iv1.1234567890abcdef
GITHUB_CLIENT_SECRET=1234567890abcdef1234567890abcdef12345678
```

## Usage

### Sign In Flow

1. Visit the app: `https://english-tracker-app.ddev.site`
2. You'll be redirected to `/auth/signin`
3. Click **Continue with Google** or **Continue with GitHub**
4. Authorize the application
5. You'll be redirected back to the app

### User Session

- Session persists across browser refreshes
- Session expires after 30 days (default)
- User profile shown in top-right corner
- Click **Sign Out** to logout

### Data Isolation

Each user's data is completely isolated:
- Progress tracked by email address
- Separate MongoDB documents per user
- No access to other users' data

## Architecture

### Authentication Flow

```
User clicks "Sign In"
    ↓
Redirects to OAuth Provider (Google/GitHub)
    ↓
User authorizes the app
    ↓
OAuth provider redirects back with code
    ↓
NextAuth exchanges code for tokens
    ↓
JWT session created
    ↓
User redirected to app
    ↓
Session stored in cookies
```

### Data Flow with Authentication

```
User authenticated
    ↓
Session provides user email
    ↓
DatabaseSync uses email as userId
    ↓
API routes filter by userId
    ↓
MongoDB stores data per user
    ↓
User sees only their own data
```

## Components

### `AuthGuard`

Protects pages from unauthenticated access.

```tsx
<AuthGuard>
  <YourProtectedContent />
</AuthGuard>
```

### `UserProfile`

Displays user info and sign out button.

```tsx
<UserProfile />
```

### `SessionProvider`

Wraps the app to provide session context.

```tsx
<SessionProvider>
  <App />
</SessionProvider>
```

## API Protection

All tracker API routes automatically use the authenticated user's email:

```typescript
// In components
const { data: session } = useSession();
const userId = session?.user?.email;

// API calls automatically include userId
fetch(`/api/tracker?userId=${userId}`);
```

## Database Schema

### Users Collection

NextAuth automatically creates user records in MongoDB (if using adapter).

For JWT mode (current setup), user data is only in the JWT token.

### Trackers Collection

Each tracker document is linked to a user:

```typescript
{
  userId: "user@example.com",  // User's email
  selectedDay: 1,
  days: { /* progress data */ },
  createdAt: Date,
  updatedAt: Date
}
```

## Troubleshooting

### "Error: Invalid OAuth credentials"

- Verify Client ID and Secret are correct
- Check that redirect URIs match exactly
- Ensure OAuth app is enabled

### "Callback URL mismatch"

- Add the exact callback URL to OAuth provider settings:
  - Google: `https://your-domain.com/api/auth/callback/google`
  - GitHub: `https://your-domain.com/api/auth/callback/github`

### "NextAuth secret not defined"

- Generate a secret: `openssl rand -base64 32`
- Add to `.env.local`: `NEXTAUTH_SECRET=your_secret`

### Session not persisting

- Check cookies are enabled
- Verify `NEXTAUTH_URL` matches your domain
- Check browser console for errors

### Data not syncing

- Sign out and sign back in
- Check MongoDB connection
- View browser console for API errors

## Security Best Practices

### Development

- Use different OAuth apps for dev/prod
- Never commit `.env.local` to git
- Use HTTPS even in development (DDEV provides this)

### Production

- Use strong NextAuth secret (32+ characters)
- Enable HTTPS only
- Set secure cookie options
- Regularly rotate OAuth secrets
- Monitor OAuth usage in provider dashboards

## Advanced Configuration

### Custom Callback URL

Override the callback URL for specific environments:

```typescript
// lib/auth.ts
Google({
  clientId: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  authorization: {
    params: {
      redirect_uri: process.env.GOOGLE_CALLBACK_URL,
    },
  },
}),
```

### Extended Session Duration

```typescript
// lib/auth.ts
session: {
  strategy: "jwt",
  maxAge: 30 * 24 * 60 * 60, // 30 days
},
```

### Custom Sign-In Page

Already configured at `/auth/signin`. Customize by editing:
- `app/auth/signin/page.tsx`

## Testing Authentication

### Local Testing

1. Start the app: `ddev start` or `npm run dev`
2. Visit `/auth/signin`
3. Test both Google and GitHub login
4. Verify user profile appears
5. Check MongoDB for user data
6. Test sign out

### Verify User Isolation

1. Sign in with first account
2. Add some progress data
3. Sign out
4. Sign in with different account  
5. Verify data is empty/different

## Migration from Default User

If you had data with the default user:

```bash
# Connect to MongoDB
docker exec -it ddev-english-tracker-app-mongodb mongosh mongodb://root:root@mongodb:27017/english_tracker --authenticationDatabase admin

# Update userId for existing data
db.trackers.updateMany(
  { userId: "default-user" },
  { $set: { userId: "your-real-email@example.com" } }
);
```

## Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [GitHub OAuth Apps](https://docs.github.com/en/apps/oauth-apps)
- [JWT vs Database Sessions](https://next-auth.js.org/configuration/options#session)

---

**Ready to test?** Visit [/auth/signin](https://english-tracker-app.ddev.site/auth/signin) to get started!
