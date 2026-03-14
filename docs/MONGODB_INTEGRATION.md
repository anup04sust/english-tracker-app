# MongoDB Integration Guide

## Overview

The English Tracker App now uses **MongoDB** as a NoSQL database to persist user data. This replaces the previous localStorage-only approach with a scalable database solution.

## Architecture

### Data Flow

1. **On App Load**: Data is fetched from MongoDB and hydrated into Redux
2. **On State Change**: Changes are automatically synced to MongoDB (debounced)
3. **Hybrid Storage**: Both localStorage (via Redux Persist) AND MongoDB for redundancy

### Components

```
User Actions
    ↓
Redux Store (trackerSlice)
    ↓
DatabaseSync Hook
    ↓
API Routes (/api/tracker)
    ↓
MongoDB (via Mongoose)
```

## MongoDB Setup (DDEV)

### 1. Container Configuration

MongoDB runs as a separate container in DDEV:

- **Image**: `mongo:7`
- **Port**: `27017` (internal)
- **Credentials**:
  - Username: `root`
  - Password: `root`
  - Database: `english_tracker`

### 2. Connection String

```env
MONGODB_URI=mongodb://root:root@mongodb:27017/english_tracker?authSource=admin
```

This is automatically configured in DDEV via `.ddev/config.yaml`.

### 3. Accessing MongoDB

**From within DDEV:**
```bash
ddev exec mongosh mongodb://root:root@mongodb:27017/english_tracker --authenticationDatabase admin
```

**From host machine:**
```bash
# Get the exposed port
ddev describe

# Connect using the mapped port
mongosh mongodb://root:root@localhost:[PORT]/english_tracker --authenticationDatabase admin
```

## Database Schema

### Collection: `trackers`

```typescript
{
  userId: string,           // Default: "default-user"
  selectedDay: number,      // Current selected day (1-15)
  days: {
    [dayId: number]: {
      completed: boolean,
      confidence: number,   // 0-5
      notes: string,
      transcript: string,
      aiFeedback: string,
      vocabulary: string,
      audioEntries: [
        {
          id: string,
          name: string,
          url: string,      // Data URL or file URL
          createdAt: string,
          source: "recorded" | "uploaded",
          size: number
        }
      ]
    }
  },
  createdAt: Date,
  updatedAt: Date
}
```

## API Endpoints

### GET `/api/tracker`

Fetch tracker state for a user.

**Query Params:**
- `userId` (optional) - Default: `"default-user"`

**Response:**
```json
{
  "success": true,
  "data": {
    "selectedDay": 1,
    "days": { /* day data */ }
  }
}
```

### POST `/api/tracker`

Create or update entire tracker state.

**Body:**
```json
{
  "userId": "default-user",
  "selectedDay": 3,
  "days": { /* day data */ }
}
```

### PATCH `/api/tracker`

Update a specific field for a day.

**Body:**
```json
{
  "userId": "default-user",
  "dayId": 5,
  "field": "notes",
  "value": "Great progress today!"
}
```

### DELETE `/api/tracker`

Reset tracker (delete all data).

**Query Params:**
- `userId` (optional)

### POST `/api/tracker/audio`

Add an audio entry to a specific day.

**Body:**
```json
{
  "userId": "default-user",
  "dayId": 3,
  "entry": {
    "id": "uuid",
    "name": "Recording 1",
    "url": "data:audio/...",
    "createdAt": "2026-03-14T...",
    "source": "recorded",
    "size": 1024000
  }
}
```

### DELETE `/api/tracker/audio`

Remove an audio entry.

**Body:**
```json
{
  "userId": "default-user",
  "dayId": 3,
  "entryId": "uuid"
}
```

## Code Structure

### Database Utilities

**`lib/mongodb.ts`** - MongoDB connection manager
- Singleton connection pattern
- Cached connections for hot reload
- Auto-reconnect on failure

**`lib/models/Tracker.ts`** - Mongoose schema and model
- TypeScript interfaces
- Schema definitions
- Model export

### State Management

**`store/databaseSync.ts`** - Sync logic
- `useDatabaseSync()` hook - Auto-sync Redux ↔ MongoDB
- Debounced writes (1 second delay)
- Initial data load on mount

**`components/DatabaseSync.tsx`** - Sync component
- Invisible component
- Runs sync hook
- Loaded in root layout

## Usage Examples

### Load Data on App Start

Automatically handled by `DatabaseSync` component.

### Save Data on Change

Automatically handled by `useDatabaseSync()` hook with 1-second debounce.

### Manual Operations

```typescript
import { syncAudioEntry, removeAudioEntry, resetTracker } from '@/store/databaseSync';

// Add audio entry
await syncAudioEntry(dayId, audioEntry);

// Remove audio entry
await removeAudioEntry(dayId, entryId);

// Reset all data
await resetTracker();
```

## Benefits of MongoDB

### vs. localStorage

| Feature | localStorage | MongoDB |
|---------|-------------|---------|
| Storage Limit | ~5-10 MB | Unlimited |
| Multi-device Sync | ❌ | ✅ |
| Server-side Access | ❌ | ✅ |
| Backup/Export | Manual | Automatic |
| Query Abilities | Limited | Advanced |
| Multi-user Support | ❌ | ✅ |

### Current Benefits

1. **Persistent Storage**: Data survives browser cache clear
2. **Scalable**: Ready for audio file uploads to cloud storage
3. **Multi-user Ready**: Easy to add authentication later
4. **Backup**: Database can be backed up independently
5. **Analytics**: Query data for learning insights

## Development

### View Database Contents

```bash
# SSH into DDEV
ddev ssh

# Connect to MongoDB
mongosh mongodb://root:root@mongodb:27017/english_tracker --authenticationDatabase admin

# List all trackers
db.trackers.find().pretty()

# Find specific user
db.trackers.findOne({ userId: "default-user" })

# Count documents
db.trackers.countDocuments()

# Delete all data
db.trackers.deleteMany({})
```

### Database Backup

```bash
# Export database
ddev exec mongodump --uri="mongodb://root:root@mongodb:27017/english_tracker?authSource=admin" --out=/var/www/html/backup

# Import database
ddev exec mongorestore --uri="mongodb://root:root@mongodb:27017/english_tracker?authSource=admin" /var/www/html/backup
```

### Testing Connection

```bash
# Test MongoDB is running
ddev exec mongosh --eval "db.adminCommand('ping')" mongodb://root:root@mongodb:27017 --authenticationDatabase admin
```

## Troubleshooting

### MongoDB Not Starting

```bash
# Check container status
ddev describe

# View MongoDB logs
ddev logs -s mongodb

# Restart DDEV
ddev restart
```

### Connection Refused

1. Verify `MONGODB_URI` in `.env.local`
2. Check MongoDB container is running: `ddev describe`
3. Restart: `ddev restart`

### Data Not Syncing

1. Check browser console for errors
2. Verify API endpoints: `/api/tracker`
3. Check MongoDB logs: `ddev logs -s mongodb`
4. Clear Redux state: Use "Reset" button in app

### Mongoose Version Mismatch

```bash
# Reinstall mongoose
ddev exec npm install mongoose@latest
ddev restart
```

## Future Enhancements

### Phase 1 (Current)
- ✅ Basic CRUD operations
- ✅ Auto-sync with Redux
- ✅ Single user support

### Phase 2
- [ ] User authentication (JWT)
- [ ] Cloud audio storage (AWS S3, Cloudinary)
- [ ] Sessions and progress tracking

### Phase 3
- [ ] Multi-user support
- [ ] Sharing and collaboration
- [ ] Learning analytics dashboard

### Phase 4
- [ ] Real-time sync (WebSockets)
- [ ] Offline support (PWA)
- [ ] Mobile app integration

## Security Considerations

### Current Setup (Development)

⚠️ **Not suitable for production**:
- No authentication
- Root credentials in config
- No SSL/TLS encryption

### Production Recommendations

1. **Authentication**: Add JWT or session-based auth
2. **Environment Variables**: Use secrets management
3. **SSL/TLS**: Enable encrypted connections
4. **User Isolation**: Query by authenticated user ID
5. **Rate Limiting**: Prevent API abuse
6. **Validation**: Sanitize all inputs
7. **Hosting**: Use MongoDB Atlas or managed service

## Performance

### Optimizations Implemented

1. **Debounced Writes**: Reduces API calls (1s debounce)
2. **Cached Connections**: Reuses MongoDB connections
3. **Selective Updates**: PATCH for single field changes
4. **Lean Queries**: Returns plain objects, not Mongoose docs

### Monitoring

```bash
# Check MongoDB performance
ddev exec mongosh mongodb://root:root@mongodb:27017/english_tracker --authenticationDatabase admin --eval "db.serverStatus()"

# View collection stats
ddev exec mongosh mongodb://root:root@mongodb:27017/english_tracker --authenticationDatabase admin --eval "db.trackers.stats()"
```

## Resources

- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [Mongoose Documentation](https://mongoosejs.com/docs/)
- [DDEV Documentation](https://ddev.readthedocs.io/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)

---

**Questions?** Check the [DDEV Setup Guide](./DDEV_SETUP.md) or review the code in `lib/mongodb.ts` and `app/api/tracker/`.
