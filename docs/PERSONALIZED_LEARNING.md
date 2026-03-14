# Personalized Learning Platform

Complete guide to the onboarding, profile system, CV upload, and AI-generated milestones.

## Overview

The app now features:
- **Landing Page** for non-authenticated users
- **Onboarding Flow** with 4 steps
- **Profile Management** with native and target languages
- **CV Upload** for personalized insights
- **AI-Generated Milestones** based on user profile and CV
- **Settings Page** for managing profile and milestones

## User Journey

### 1. Landing Page (`/landing`)
- Beautiful hero section with language flags
- Feature showcase (10 languages, AI feedback, etc.)
- Call-to-action buttons to sign in

**When to show**: User is not authenticated

### 2. Sign In (`/auth/signin`)
- Google or GitHub OAuth
- Redirects to onboarding after successful authentication

### 3. Onboarding (`/onboarding`)
Guided 4-step setup process:

#### Step 1: Native Language
- User selects their mother tongue
- Required for personalized content

#### Step 2: Target Languages
- Multi-select from 10 supported languages
- Can select multiple languages to learn

#### Step 3: AI Configuration (Optional)
- Choose AI provider (OpenAI, Anthropic, Custom)
- Enter personal API key for AI feedback
- Encrypted and never shared

#### Step 4: Profile & CV
- Profession and industry
- Current language level (beginner/intermediate/advanced)
- Learning goals (why they want to learn)
- **CV Upload** (PDF, DOC, DOCX, TXT up to 5MB)

**When to show**: User authenticated but `onboardingCompleted === false`

### 4. Main App (`/`)
- Full 15-day learning tracker
- Shows personalized milestones at the top
- All existing features (recording, AI feedback, progress tracking)

**When to show**: User authenticated AND `onboardingCompleted === true`

### 5. Settings (`/settings`)
- Update languages, AI config, profile
- View and manage milestones
- Toggle milestone completion
- Regenerate milestones with AI
- View uploaded CV

## Data Model

### Profile Schema

```typescript
{
  userId: string;                  // Email from NextAuth
  nativeLanguage: string;          // e.g., 'en'
  targetLanguages: string[];       // e.g., ['es', 'de', 'ja']
  
  // AI Configuration
  aiApiKey?: string;               // Encrypted user API key
  aiProvider?: 'openai' | 'anthropic' | 'custom';
  aiModel?: string;                // e.g., 'gpt-4o-mini'
  
  // CV/Resume
  cvUrl?: string;                  // /uploads/cvs/filename.pdf
  cvText?: string;                 // Extracted text for AI
  cvUploadedAt?: Date;
  
  // Profile
  profession?: string;             // e.g., 'Software Engineer'
  industry?: string;               // e.g., 'Technology'
  learningGoals?: string;          // Why they want to learn
  currentLevel?: 'beginner' | 'intermediate' | 'advanced';
  
  // Milestones
  milestones: Array<{
    id: string;
    title: string;
    description: string;
    targetDate: string;            // YYYY-MM-DD
    completed: boolean;
    createdBy: 'ai' | 'user';
  }>;
  
  // Onboarding
  onboardingCompleted: boolean;
  onboardingStep: number;          // 0-4
}
```

## API Endpoints

### GET `/api/profile?userId=email`
Fetch user profile
```json
{
  "success": true,
  "profile": { /* Profile object */ }
}
```

### POST `/api/profile`
Create or update profile
```json
{
  "userId": "user@example.com",
  "nativeLanguage": "en",
  "targetLanguages": ["es", "de"],
  "profession": "Software Engineer",
  // ... other fields
}
```

### PATCH `/api/profile`
Update specific fields
```json
{
  "userId": "user@example.com",
  "updates": {
    "milestones": [/* updated array */]
  }
}
```

### POST `/api/upload-cv`
Upload CV file (FormData)
```typescript
const formData = new FormData();
formData.append('file', cvFile);
formData.append('userId', 'user@example.com');

// Response:
{
  "success": true,
  "cvUrl": "/uploads/cvs/user_1234567890.pdf",
  "message": "CV uploaded successfully"
}
```

**Limitations**:
- Max file size: 5MB
- Allowed types: PDF, DOC, DOCX, TXT
- Files stored in: `/public/uploads/cvs/`

### POST `/api/generate-milestones`
Generate AI-powered learning milestones
```json
{
  "userId": "user@example.com"
}

// Response:
{
  "success": true,
  "milestones": [
    {
      "id": "milestone_1234567890_1",
      "title": "Complete 15-Day Spanish Speaking Plan",
      "description": "Follow the structured program...",
      "targetDate": "2026-04-14",
      "completed": false,
      "createdBy": "ai"
    }
    // ... 4 more milestones
  ],
  "message": "AI-generated milestones created successfully"
}
```

**How it works**:
1. Fetches user profile from MongoDB
2. Uses user's API key (or falls back to system key)
3. Builds prompt with profile data + CV text
4. Calls OpenAI/Anthropic API
5. Parses response into milestone objects
6. Saves to profile.milestones

**Fallback**: If AI fails, generates 5 default milestones based on profile

## AI Milestone Generation

### Prompt Structure

The AI receives:
- Native & target languages
- Profession & industry
- Current skill level
- Learning goals
- CV summary/text

Example prompt:
```
Create 5 personalized language learning milestones for this user:

Profile:
- Native Language: English
- Target Languages: Spanish, German
- Profession: Software Engineer
- Industry: Technology
- Current Level: intermediate
- Learning Goals: Career advancement, international projects
- CV Summary: 5 years experience in web development...

Please create 5 specific, measurable milestones that:
1. Align with their profession and industry
2. Progress from their current level
3. Support their stated learning goals
4. Are achievable in 1-3 months each

Format each milestone as:
TITLE: [clear, specific title]
DESCRIPTION: [detailed description with actionable steps]
TARGET_DATE: [date in YYYY-MM-DD format, 1-3 months from today]

Separate each milestone with "---"
```

### Example AI Response

```
TITLE: Master Technical Spanish Vocabulary
DESCRIPTION: Learn 100 software development terms in Spanish including: variables, functions, debugging, deployment. Practice using these in code comments and technical discussions. Create flashcards and use them daily.
TARGET_DATE: 2026-04-15
---
TITLE: Conduct Code Review in German
DESCRIPTION: Build confidence to conduct a 10-minute code review entirely in German. Practice technical explanations, ask questions about implementation details, and provide constructive feedback.
TARGET_DATE: 2026-05-15
---
...
```

### Default Milestones (Fallback)

If AI is unavailable or fails:
1. Complete 15-Day [Language] Speaking Plan
2. Build Professional Vocabulary (50 industry terms)
3. Hold 5-Minute Conversation
4. Record Professional Introduction
5. Practice Daily for 30 Days

## Routing Logic

```typescript
// app/page.tsx
useEffect(() => {
  if (status === 'unauthenticated') {
    router.push('/landing');  // Not logged in → Landing page
    return;
  }
  
  if (status === 'authenticated') {
    checkOnboarding();        // Check if setup is complete
  }
}, [status]);

async function checkOnboarding() {
  const profile = await fetch('/api/profile?userId=' + email);
  
  if (!profile.onboardingCompleted) {
    router.push('/onboarding');  // Setup incomplete → Onboarding
  }
  // Otherwise stay on main app
}
```

## Features

### 1. Onboarding Progress Saving
- Users can leave and resume onboarding
- Progress saved to `onboardingStep` field
- Returns to last completed step

### 2. Milestone Management
- View milestones on main tracker page (top 3)
- Toggle completion with checkbox
- View all milestones in settings
- Regenerate with "Regenerate with AI" button

### 3. CV Processing
- Files uploaded to `/public/uploads/cvs/`
- Unique filenames: `userId_timestamp.ext`
- Stored URL in profile for future reference
- Text extraction (basic, can be enhanced with pdf-parse)

### 4. Multi-Language Support
- Each target language tracks separately
- Native language used for UI hints
- Language selector works across all pages

### 5. Privacy & Security
- API keys stored in MongoDB (should be encrypted in production)
- CV files accessible only via direct URL
- Profile data isolated per user

## Environment Variables

Update `.env.local`:

```bash
# Existing variables...

# AI Configuration (Optional - users can provide their own)
AI_API_KEY=your_openai_key
AI_BASE_URL=https://api.openai.com/v1
AI_MODEL=gpt-4o-mini

# File Upload (defaults to public/uploads)
UPLOAD_DIR=./public/uploads
```

## Testing the Flow

### Test Onboarding
1. Sign in with Google/GitHub
2. Redirected to `/onboarding`
3. Select Bengali as native language
4. Select Spanish and German as targets
5. Add OpenAI API key (optional)
6. Enter profession: "Software Engineer"
7. Upload CV PDF
8. Click "Complete Setup"
9. AI generates 5 milestones
10. Redirected to main app

### Test Settings
1. Click "Manage" next to milestones
2. Goes to `/settings`
3. Change target languages
4. Click "Save Settings"
5. Click "Regenerate with AI"
6. New milestones appear

### Test Milestone Display
1. Main app shows top 3 milestones
2. Checkbox to mark complete
3. Click "Manage" to see all

## Future Enhancements

### PDF Text Extraction
```bash
npm install pdf-parse
```

```typescript
// In upload-cv/route.ts
import pdf from 'pdf-parse';

const dataBuffer = Buffer.from(bytes);
if (file.type === 'application/pdf') {
  const pdfData = await pdf(dataBuffer);
  cvText = pdfData.text;
}
```

### API Key Encryption
```typescript
import crypto from 'crypto';

function encrypt(text: string): string {
  const cipher = crypto.createCipher('aes-256-cbc', process.env.ENCRYPTION_KEY!);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return encrypted;
}
```

### Milestone Reminders
- Email reminders for upcoming target dates
- Push notifications
- Progress tracking dashboard

### CV Analysis Dashboard
- Extract skills, experience, education
- Match with language learning goals
- Visualize career progression

## Summary

Your app now offers a complete personalized learning experience:
1. **Landing page** attracts new users
2. **Onboarding** collects profile data
3. **CV upload** enables AI personalization
4. **AI milestones** create custom learning path
5. **Main tracker** delivers structured content
6. **Settings** allows profile management

Users get a tailored 15-day plan PLUS long-term milestones aligned with their career goals! 🎯
