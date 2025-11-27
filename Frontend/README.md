# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


What a User Dashboard Could Include:
Based on the artist dashboard structure, a user dashboard could have:

Personal Library: User's liked/favorited songs
Personal Playlists: User-created playlists (not artist playlists)
Statistics:
Total songs liked
Number of playlists created
Recently played tracks
Actions:
Create personal playlists
Browse and add songs to playlists
View listening history
Would you like me to:

Create the User Dashboard structure with pages and components?
Add backend API endpoints for user-specific features (liked songs, user playlists, etc.)?
Update the routing to include the user dashboard?
Add navigation to distinguish between artist and regular user views?

## Home Page Tabs

The home page now includes an additional "Artists" tab which aggregates unique artist names from the loaded songs and shows their track counts. Clicking an artist navigates to the search page pre-filled with that artist's name (client-side query param based search).


Must‑have to store in backend (high impact)
Authentication and identity (Auth service)

User account: id, email, hashed password, role, profile basics
Sessions/refresh tokens, token revocation list
Email verification tokens, password reset tokens, timestamps
Playback activity and streak (Music service)

Play history events: userId, musicId, playedAt, deviceId (optional)
Daily play activity for streaks: userId, day (YYYY‑MM‑DD), playsCount, lastPlayAt
Why: enables “Recently Played,” “Top Artists,” and reliable cross‑device streaks
User playback state/preferences (Music or a small shared User service)

lastTrackId, lastPositionSeconds (for “Continue Listening”)
volume, repeat/shuffle, autoplay, theme preference (light/dark/system)
Why: seamless resume and consistent player behavior across devices
User-owned collections (Music service)

Playlists (ownerId, name, visibility, createdAt)
Playlist items (playlistId, musicId, position)
Why: user playlists must be portable across devices
Likes/favorites and saves (Music service)

Liked tracks: (userId, musicId, likedAt)
Saved playlists/albums (if applicable)
Why: powers “Liked Songs,” personal library, and recommendations
Follows/subscriptions (Music service)

Followed artists: (userId, artistId/name, followedAt)
Why: power personalized feeds and notification triggers

Notification preferences (Notification service)

Email/Push settings per category (new releases, playlist updates, marketing)
Subscription status, unsubscribed categories
Why: respect user consent and fine‑grained control
Strong “next” items (nice to have soon)
Search history and recent searches (Music service)

userId, query, searchedAt (cap or rollup to protect privacy)
Why: improves quick access and personalized search suggestions
Recommendations cache (Music service)

userId, modelVersion, items[], generatedAt, ttl
Why: performance; avoid recomputation per page load
Device registry (Auth or a small Device service)

userId, deviceId, lastSeenAt, platform
Why: security visibility, optional per‑device preferences
What should NOT be only local (move to backend or cookies)
JWT in localStorage

Prefer httpOnly, secure cookies for access/refresh tokens to reduce XSS risk
Play history and daily streak sentinel

Keep logging idempotent server‑side; don’t rely on a per‑device “already-logged-today” flag
Continue Listening and player preferences (volume, repeat/shuffle, theme)

Store per user; update with light debouncing



Minimal schema suggestions (MongoDB/Mongoose style)
PlayEvent

{ userId, musicId, playedAt, deviceId }
Indexes: userId + playedAt desc; musicId (optional)
PlayActivity (daily streak; you already started)

{ userId, day, playsCount, lastPlayAt }
Unique index: userId + day
UserPreferences

{ userId, theme: 'light'|'dark'|'system', volume: Number, lastTrackId, lastPositionSeconds, repeat: 'off'|'one'|'all', shuffle: Boolean }
Unique index: userId
Playlist, PlaylistItem

Playlist: { ownerId, name, isPublic, createdAt, updatedAt }
PlaylistItem: { playlistId, musicId, position, addedAt }
Indexes: ownerId; playlistId + position
UserLike

{ userId, musicId, likedAt }
Unique index: userId + musicId
UserFollow

{ userId, artistId/name, followedAt }
Unique index: userId + artistId/name
NotificationPreference

{ userId, categories: { newReleases: Boolean, playlistUpdates: Boolean, marketing: Boolean }, updatedAt }
Unique index: userId


Endpoint mapping (suggested)
Preferences
GET/PUT /api/user/preferences
Playback
POST /api/music/play/:musicId (log event; you have streak groundwork)
GET /api/music/history?limit=50
GET /api/music/continue (returns lastTrackId + lastPositionSeconds)
PUT /api/music/position/:musicId (optional finer control)
Likes/Follows
POST/DELETE /api/music/likes/:musicId, GET /api/music/likes
POST/DELETE /api/music/follows/:artistId, GET /api/music/follows
Playlists
Standard CRUD + reorder items
Auth
Cookie-based tokens, refresh flow, revoke sessions
Notifications
GET/PUT /api/notification/preferences
Data retention and privacy notes
Cap play history (e.g., last 200–500 entries) and/or set retention windows.
Allow users to clear history and preferences.
Use server‑side idempotency for daily streak logging.
Index carefully for userId + time fields to keep dashboard queries fast.

## Artist Analytics Page

The Artist Analytics page (`/artist/analytics`) provides a high-level performance overview for an artist:

Key stats:
- Total tracks
- Total plays (sum of `playCount` on artist tracks)
- Average plays per track
- Total playlists
- Followers count

Sections:
- Top Tracks (Top 5 by `playCount` with likes & duration)
- Recent Followers (latest 8 follow events)
- Insights placeholder (future charts: plays over time, follower growth, geography)

Data sources (current placeholders use existing endpoints):
- `GET /api/music/artist/musics`
- `GET /api/music/artist/followers`
- `GET /api/music/artist/playlist`

Extend by adding new backend endpoints for time‑series plays and geographic breakdown, then replace the placeholder panel with charts components.