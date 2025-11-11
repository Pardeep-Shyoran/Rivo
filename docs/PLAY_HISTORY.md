# Play History Feature Documentation

## Overview
The play history feature tracks every song play with timestamps, enabling "Recently Played" views, listening analytics, and personalized recommendations across all devices.

## Backend Implementation

### Models

#### PlayHistory Model
Location: `Backend/music/src/models/playHistory.model.js`

Stores individual play events for detailed listening history.

```javascript
{
  userId: String,          // User ID from JWT
  musicId: ObjectId,       // Reference to Music document
  playedAt: Date,          // Timestamp of play event
  duration: Number,        // Optional: seconds listened
  deviceId: String,        // Optional: device fingerprint
  timestamps: true         // Auto-managed createdAt/updatedAt
}
```

**Indexes:**
- `{ userId: 1, playedAt: -1 }` - Efficient user history queries (most recent first)
- `{ playedAt: -1 }` - For cleanup/archival

#### PlayActivity Model
Location: `Backend/music/src/models/playActivity.model.js`

Aggregates plays by day for streak calculation.

```javascript
{
  userId: String,
  day: String,            // YYYY-MM-DD format (UTC)
  plays: Number,          // Count of plays that day
  lastPlayAt: Date,       // Last play timestamp
  timestamps: true
}
```

**Unique Index:** `{ userId: 1, day: 1 }` - Ensures one record per user per day

### Endpoints

#### POST /api/music/play/:id
Logs a play event (updates both PlayActivity and PlayHistory).

**Authentication:** Required (JWT via Authorization header or cookie)

**Request Body (optional):**
```json
{
  "duration": 180,           // Optional: seconds listened
  "deviceId": "device123"    // Optional: device identifier
}
```

**Response:**
```json
{
  "message": "Play logged",
  "activity": {
    "day": "2025-11-08",
    "plays": 3,
    "lastPlayAt": "2025-11-08T14:30:00.000Z"
  },
  "historyId": "507f1f77bcf86cd799439011"
}
```

**Error Codes:**
- `401` - Unauthorized (missing/invalid token)
- `404` - Music not found
- `500` - Server error

#### GET /api/music/history
Retrieves user's play history with pagination.

**Authentication:** Required

**Query Parameters:**
- `limit` (default: 50, max: 200) - Number of items to return
- `skip` (default: 0) - Number of items to skip

**Response:**
```json
{
  "message": "Play history fetched",
  "history": [
    {
      "_id": "507f...",
      "userId": "user123",
      "musicId": "507f...",
      "playedAt": "2025-11-08T14:30:00.000Z",
      "duration": 180,
      "deviceId": "device123",
      "music": {
        "_id": "507f...",
        "title": "Song Title",
        "artist": "Artist Name",
        "musicUrl": "https://presigned-url...",
        "coverImageUrl": "https://presigned-url..."
      }
    }
  ],
  "pagination": {
    "total": 150,
    "limit": 50,
    "skip": 0,
    "hasMore": true
  }
}
```

#### GET /api/music/streak
Retrieves current listening streak (consecutive days with at least one play).

**Authentication:** Required

**Response:**
```json
{
  "message": "Streak fetched",
  "streak": 7,
  "daysConsidered": 30,
  "hasActivityToday": true
}
```

## Frontend Implementation

### Custom Hook: usePlayHistory
Location: `Frontend/src/hooks/usePlayHistory.js`

Fetches play history from backend with automatic fallback to localStorage.

**Usage:**
```javascript
import { usePlayHistory } from '../hooks/usePlayHistory';

function MyComponent() {
  const { history, loading, error, refresh } = usePlayHistory(50);
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      {history.map(item => (
        <div key={item._historyId}>
          {item.title} - {item.artist}
          <small>{new Date(item.playedAt).toLocaleString()}</small>
        </div>
      ))}
    </div>
  );
}
```

**API:**
- `history` - Array of play history items with music details
- `loading` - Boolean indicating fetch status
- `error` - Error message string (null if no error)
- `refresh` - Function to manually re-fetch history

### MusicPlayerContext Integration
Location: `Frontend/src/contexts/MusicPlayerContext.jsx`

**Automatic Play Logging:**
Every time a user plays a song, the context automatically:
1. Saves to localStorage (local backup)
2. Sends POST request to `/api/music/play/:id` with device fingerprint
3. Backend updates both daily activity (for streak) and individual history entry

**Manual Logging (if needed):**
```javascript
import axiosMusic from '../api/axiosMusicConfig';

// Log a play manually
await axiosMusic.post(`/api/music/play/${musicId}`, {
  duration: 180,
  deviceId: 'custom-device-id'
});
```

### Dashboard Integration
Location: `Frontend/src/hooks/useListenerDashboardData.js`

The dashboard hook automatically:
1. Fetches server play history via `usePlayHistory`
2. Falls back to local `playHistory` from MusicPlayerContext if server fails
3. Uses history for:
   - "Continue Listening" (most recent plays)
   - Top Artists calculation
   - Listening streak display
   - Recommendations (excludes recently played)

## Data Flow

### Play Event Flow
```
User clicks Play
    ↓
MusicPlayerContext.playMusic()
    ↓
1. Add to local history (localStorage)
    ↓
2. POST /api/music/play/:id
    ↓
Backend Controller (logPlay)
    ↓
3a. Update PlayActivity (daily aggregate)
3b. Create PlayHistory entry (individual event)
    ↓
Return success response
```

### History Retrieval Flow
```
Dashboard Component Mounts
    ↓
usePlayHistory hook
    ↓
GET /api/music/history?limit=50
    ↓
Backend Controller (getPlayHistory)
    ↓
1. Fetch PlayHistory entries
2. Populate Music details
3. Generate presigned URLs
    ↓
Return formatted history
    ↓
If server fails → fallback to localStorage
```

## Performance Considerations

### Backend Optimization
- **Indexes:** Compound index on `{ userId, playedAt }` ensures fast queries
- **Pagination:** Default limit of 50, max 200 to prevent overload
- **Lean queries:** Use `.lean()` to return plain objects (faster than Mongoose documents)
- **Presigned URL caching:** Consider implementing short-lived cache for frequently accessed URLs

### Frontend Optimization
- **Lazy loading:** Fetch history only when dashboard/history page is viewed
- **Local caching:** Keep last 20 items in localStorage as immediate fallback
- **Debounced updates:** Don't refetch history on every navigation
- **Optimistic updates:** Show local history immediately while server syncs

### Storage Cleanup
Consider implementing a background job to:
- Archive history older than 6-12 months
- Aggregate old data for long-term analytics
- Delete orphaned entries (where musicId no longer exists)

## Privacy & Security

### Data Minimization
- Device ID is optional and uses a simple user-agent substring (not a persistent fingerprint)
- Duration tracking is optional
- No IP addresses or precise location data stored

### Access Control
- History is user-scoped (JWT required)
- Each endpoint validates `req.user.id` matches the requested user
- No cross-user history access possible

### GDPR Compliance Considerations
- Implement `/api/user/delete-history` endpoint to allow users to clear their history
- Add `/api/user/export-data` to provide downloadable history
- Document retention period in privacy policy

## Future Enhancements

### Analytics Features
- Most played songs/artists (weekly/monthly)
- Listening time trends (hour of day heatmap)
- Genre distribution over time
- Skip rate tracking (plays < 30 seconds)

### Recommendations Engine
- Collaborative filtering based on similar users' histories
- "Discover Weekly" playlists from unplayed songs by favorite artists
- "Because you listened to..." suggestions

### Social Features
- Share listening stats with friends
- Compare listening habits
- Collaborative playlist creation from combined histories

### Advanced Streak Features
- Streak freeze tokens (allow 1-2 missed days per month)
- Weekly/monthly challenges with badge rewards
- "Almost lost your streak" push notifications

## Testing

### Backend Tests (Recommended)
```javascript
// Test play logging
POST /api/music/play/:validMusicId
  → Expect 200, activity.plays increments
  → Expect new PlayHistory document created

// Test history retrieval
GET /api/music/history?limit=10
  → Expect array of 10 most recent plays
  → Expect pagination object with correct counts

// Test unauthorized access
GET /api/music/history (no token)
  → Expect 401

// Test invalid music ID
POST /api/music/play/:invalidId
  → Expect 404
```

### Frontend Tests (Recommended)
- Verify `usePlayHistory` fetches and formats correctly
- Test localStorage fallback when backend fails
- Verify play logging triggers on `playMusic` call
- Test pagination and "Load More" functionality

## Migration Notes

If you have existing users with local-only play history:
1. Create a one-time sync script that reads localStorage and backfills PlayHistory
2. Send a batch of POST requests to `/api/music/play/:id` with historical `playedAt` dates
3. Backend should accept optional `playedAt` in request body for backfill scenarios

## Troubleshooting

### History Not Syncing
- Check JWT token is valid and sent with requests
- Verify backend MongoDB connection is active
- Check browser console for network errors
- Confirm CORS headers allow cross-origin requests (if frontend/backend on different domains)

### Duplicate Entries
- Ensure `usePlayHistory` hook doesn't re-fetch on every render (use proper dependencies)
- Verify `playMusic` doesn't call logging endpoint multiple times
- Check for duplicate event listeners in MusicPlayerContext

### Performance Issues
- Add pagination to history display (load 50 at a time)
- Implement virtual scrolling for long lists
- Consider indexing `musicId` if queries by music become common
- Use Redis caching for frequently accessed presigned URLs

---

**Last Updated:** November 8, 2025  
**Version:** 1.0.0
