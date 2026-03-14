# Multi-Language Learning Tracker

A **15-day structured language learning app** with daily speaking practice, progress tracking, and AI feedback. Built for learners who want to practice speaking any popular language with confidence.

## 🌍 Supported Languages

Learn any of these languages:
- 🇬🇧 **English** 
- 🇪🇸 **Spanish** (Español)
- 🇩🇪 **German** (Deutsch)
- 🇷🇺 **Russian** (Русский)
- 🇨🇳 **Chinese** (中文)
- 🇯🇵 **Japanese** (日本語)
- 🇫🇷 **French** (Français)
- 🇮🇹 **Italian** (Italiano)
- 🇧🇷 **Portuguese** (Português)
- 🇰🇷 **Korean** (한국어)

**Switch between languages anytime** - your progress is saved separately for each language!

## Quick Start

### Option 1: Local Development
```bash
npm install
cp .env.example .env.local
# Configure OAuth credentials (see docs/AUTHENTICATION.md)
npm run dev
```

Open http://localhost:3000

### Option 2: DDEV (Recommended for Teams)
```bash
ddev start  
# Configure OAuth credentials in .env.local
```

Open https://english-tracker-app.ddev.site

**Note**: You must configure Google and GitHub OAuth credentials to sign in. See [Authentication Setup](docs/AUTHENTICATION.md).

## ✨ Features

- 🌍 **10 Languages**: English, Spanish, German, Russian, Chinese, Japanese, French, Italian, Portuguese, Korean
- ✅ **Separate Progress**: Each language has its own 15-day tracker
- 🔄 **Seamless Switching**: Change languages without losing progress
- 🎯 **Personalized Onboarding**: 4-step setup with native/target language selection
- 📄 **CV Upload**: Upload your resume for AI-powered personalized milestones
- 🤖 **AI-Generated Milestones**: Custom learning goals based on your profile and career
- 🗣️ **Audio Recording & Upload**: Practice speaking and save recordings
- 💬 **AI-Powered Feedback**: Get instant feedback on pronunciation and grammar
- 🗄️ **MongoDB Persistence**: All progress synced to cloud database
- 📊 **Progress Tracking**: Confidence scores, completed days, audio archive
- 🔐 **Google & GitHub Auth**: Secure OAuth authentication
- 👤 **Per-User Data**: Personalized data isolation across devices
- ⚙️ **Settings Page**: Manage languages, AI config, profile, and milestones

## Authentication

The app requires Google or GitHub login for personalized learning:

1. **Setup OAuth Credentials**: Follow [Authentication Setup Guide](docs/AUTHENTICATION.md)
2. **Configure Redirect URIs** in your OAuth providers:
   - **Google**: `https://english-tracker-app.ddev.site/api/auth/callback/google`
   - **GitHub**: `https://english-tracker-app.ddev.site/api/auth/callback/github`
3. **Sign In**: Visit `/auth/signin` and choose your provider
4. **Your Data**: Progress synced to your account across devices

### Important Redirect URLs

When setting up OAuth apps, use these **exact** callback URLs:

```
Google OAuth Redirect URI:
https://english-tracker-app.ddev.site/api/auth/callback/google

GitHub OAuth Callback URL:
https://english-tracker-app.ddev.site/api/auth/callback/github
```

**For Production**, replace with your domain:
```
https://your-domain.com/api/auth/callback/google
https://your-domain.com/api/auth/callback/github
```

##📚 [**Multi-Language Feature**](docs/MULTI_LANGUAGE_FEATURE.md) - How to use multi-language support
- 🔐 [Authentication Setup](docs/AUTHENTICATION.md) - **Start here for OAuth setup**
- 🐳 [DDEV Setup Guide](docs/DDEV_SETUP.md)
- 🗄️ [MongoDB Integration](docs/MONGODB_INTEGRATION.md)
- 🏗️ [Architecture](docs/ARCHITECTURE.md)
- 📊 [Data Model](docs/DATA_MODEL.md)
- 🗺️ [Architecture](docs/ARCHITECTURE.md)
- [Data Model](docs/DATA_MODEL.md)
- [Development Roadmap](docs/DEV_ROADMAP.md)

## Environment Variables

Required in `.env.local`:

```env
# OAuth (Required for login)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://english-tracker-app.ddev.site

# MongoDB (Auto-configured in DDEV)
MONGODB_URI=mongodb://root:root@mongodb:27017/english_tracker?authSource=admin

# AI (Optional)
AI_API_KEY=your_openai_api_key
```

See [Authentication Setup](docs/AUTHENTICATION.md) for detailed instructions.

## Tech Stack

- **Framework**: Next.js 14
- **Authentication**: NextAuth.js v5
- **Database**: MongoDB
- **State**: Redux Toolkit
- **Styling**: CSS
- **DevOps**: DDEV

## Notes

- OAuth setup is required for authentication
- AI feedback falls back to local engine if API key is missing
- All user data is isolated per email address
