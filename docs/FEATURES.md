# Rivo App Features

## 🎵 Authentication & User Management
- **User Registration** – Email/password signup with role selection (Artist or Listener)
- **Login System** – Standard email/password authentication
- **Google OAuth** – Sign in/Sign up with Google
- **JWT Authentication** – Token-based auth with httpOnly cookies
- **Role-based Access Control** – Artist vs Listener permissions
- **Current User API** – Get authenticated user details
- **Logout** – Secure session termination

## 🎧 Music Management (Artist Features)
- **Music Upload** – Artists can upload tracks with cover images (AWS S3 storage)
- **Get Artist's Music** – View all tracks uploaded by the artist
- **AWS S3 Integration** – Secure file storage with presigned URLs
- **Music Metadata** – Title, artist name, cover image

## 📻 Music Discovery & Playback
- **Browse All Music** – View all available tracks with pagination
- **Get Music Details** – View individual track information
- **Music Player** – Play music with controls (via context)
- **Presigned URLs** – Secure, time-limited access to music files
- **Continue Listening** – Resume from where you left off

## 🔍 Search Functionality
- **Search Music** – Search by track title or artist name
- **Search Playlists** – Find playlists by title or artist
- **Unified Search** – Search across both music and playlists
- **Artist Detail Page** – View all tracks by a specific artist
- **Case-insensitive Search** – Flexible search queries

## 📝 Playlist Features
- **Create Playlists** – Both artists and listeners can create playlists
- **Browse All Playlists** – View all public playlists
- **Get Playlist Details** – View individual playlist with all tracks
- **Artist Playlists** – Artists can manage their own playlists
- **User Playlists** – Listeners can manage their personal playlists
- **Playlist Visibility** – Public/private playlist options
- **Playlist Description** – Add context to playlists

## 📊 Analytics & Activity Tracking
- **Play History** – Track every song play with timestamps
- **Listening Streaks** – Daily play activity with streak calculation
- **Play Activity Logging** – Automatic tracking when songs are played
- **Device Tracking** – Optional device fingerprinting
- **Duration Tracking** – Record how long songs were played
- **Play Count** – Track number of plays per day
- **Pagination** – Navigate through play history efficiently

## 👤 Dashboard Features

### Artist Dashboard
1. **Stats Overview** – Total tracks, playlists, and plays  
2. **Upload Music** – Quick access to upload interface  
3. **Create Playlist** – Manage artist playlists  
4. **View Artist Content** – All uploaded tracks and playlists  

### Listener Dashboard
1. **Personal Stats** – Listening activity overview  
2. **Continue Listening** – Recently played tracks  
3. **Top Artists** – Most played artists  
4. **Recommendations** – Suggested tracks based on history  
5. **Streak Display** – Show current listening streak  
6. **Create Personal Playlists** – Manage user playlists  
7. **My Playlists Page** – View all user-created playlists  

## 🔔 Notification System
- **Welcome Email** – Automated email on registration
- **RabbitMQ Integration** – Event-driven notification system
- **Email Service** – HTML email templates
- **User Creation Events** – Pub/sub messaging for new users

## 🎨 UI/UX Components
- **Tabbed Navigation** – All/Music/Playlist/Artist tabs
- **Music Cards** – Visual music track display
- **Playlist Cards** – Visual playlist display
- **Artist Cards** – Visual artist display
- **Header** – Navigation and user actions
- **Search Bar** – Quick search interface
- **Empty States** – User-friendly empty views
- **Loader** – Loading states
- **Music Player Context** – Global player state management
- **User Context** – Global user state management

## 🔐 Security & Architecture
- **Protected Routes** – Role-based route protection
- **Public Routes** – Redirect logged-in users
- **Auth Middleware** – Token verification
- **Validation Middleware** – Request validation
- **CORS Configuration** – Cross-origin resource sharing
- **Secure Cookies** – HttpOnly, Secure, SameSite settings
- **Password Hashing** – bcrypt encryption
- **Environment-based Config** – Development/production settings

## 🏗️ Microservices Architecture
- **Auth Service** – Separate authentication microservice
- **Music Service** – Music and playlist management
- **Notification Service** – Email and notification handling
- **Database Separation** – Independent databases per service
- **RabbitMQ Message Broker** – Inter-service communication

## 📱 Frontend Features
- **React + Vite** – Modern frontend build setup
- **React Router** – Client-side routing
- **Axios Integration** – Separate configs for auth and music APIs
- **Context API** – Global state management
- **Custom Hooks** – Reusable logic (`usePlayHistory`, `useListenerDashboard`)
- **CSS Modules** – Component-scoped styling
- **Responsive Design** – Mobile-friendly interface

## 🗄️ Database & Models
- **User Model** – User accounts with roles
- **Music Model** – Track metadata and storage keys
- **Playlist Model** – Playlist with music references
- **Play History Model** – Individual play events
- **Play Activity Model** – Daily aggregated plays
- **MongoDB Indexes** – Optimized queries
- **Mongoose ODM** – Schema validation and relationships

## 🎯 Additional Technical Features
- **Presigned URL Generation** – S3 secure access
- **File Upload Handling** – Multer multipart processing
- **Lean Queries** – Performance optimization
- **Pagination Support** – Efficient data loading
- **Text Search Indexes** – Fast text search
- **Timestamps** – Automatic `createdAt`/`updatedAt`
- **Reference Population** – Join-like queries
- **Error Handling** – Comprehensive error responses
- **Docker Support** – Containerized auth service
- **LocalStorage Fallback** – Offline play history
- **Device Fingerprinting** – Basic device identification
