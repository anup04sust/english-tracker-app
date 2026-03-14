# Architecture

The application uses a modern React architecture built on Next.js with MongoDB for data persistence.

## Stack
- Next.js (App Router)
- React
- Redux Toolkit
- TypeScript
- MongoDB (NoSQL Database)
- Mongoose (ODM)

## Directory Structure

/app
  /api          # API routes
    /tracker    # Data persistence
/components     # React components
/features       # Feature modules
/store          # Redux state
/lib            # Utilities & database
  /models       # MongoDB schemas
/data           # Static data

## Data Flow

User → UI → Redux → DatabaseSync → API → MongoDB → Redux → UI

## Key Modules

### Recorder
Handles voice recording using MediaRecorder API.

### ScriptReader
Displays daily speaking scripts.

### ProgressDashboard
Tracks completion and improvement.

### DatabaseSync
Syncs Redux state with MongoDB in real-time.