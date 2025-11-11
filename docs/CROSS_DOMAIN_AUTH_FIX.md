# Cross-Domain Authentication Fix

## Problem

In production, the application was experiencing 401 (Unauthorized) errors when calling the music API endpoints (`rivo-music.onrender.com`) even though users were successfully logged in via the auth service (`rivo-auth.onrender.com`).

### Root Cause

The issue was caused by **cross-domain cookie limitations**:
- Auth service sets cookies on its domain (e.g., `rivo-auth.onrender.com`)
- Music service is hosted on a different subdomain (e.g., `rivo-music.onrender.com`)
- Browsers don't automatically send cookies across different subdomains in this setup
- Even with `COOKIE_DOMAIN` set, microservices on different Render URLs cannot share cookies effectively

## Solution

Implemented a **dual authentication strategy**:
1. **Cookie-based auth**: Primary method for same-domain requests (auth service)
2. **Token-based auth**: Secondary method using `Authorization: Bearer <token>` header for cross-domain requests (music service)

### Changes Made

#### 1. Frontend - Music API Config (`axiosMusicConfig.jsx`)
Added request interceptor to automatically include JWT token in Authorization header:

```javascript
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

#### 2. Frontend - Login Component
Store token in localStorage on successful login:

```javascript
if (response.data.token) {
  localStorage.setItem('token', response.data.token);
}
```

#### 3. Frontend - Register Component
Store token in localStorage on successful registration:

```javascript
if (response.data.token) {
  localStorage.setItem('token', response.data.token);
}
```

#### 4. Frontend - User Context
Fetch and store token on app initialization:

```javascript
const tokenResponse = await axios.get('/api/auth/token');
if (tokenResponse.data.token) {
  localStorage.setItem('token', tokenResponse.data.token);
}
```

#### 5. Frontend - Header Component (Logout)
Clear token from localStorage on logout:

```javascript
localStorage.removeItem('token');
```

#### 6. Backend - Music Service Middleware
The existing middleware already supports Authorization header:

```javascript
let token = req.cookies.token;
const authHeader = req.headers.authorization || req.headers.Authorization;
if (!token && authHeader && authHeader.startsWith("Bearer ")) {
  token = authHeader.substring(7);
}
```

## Backend Environment Configuration

### Required Environment Variables for Production

Both auth and music services must have the **same JWT_SECRET** to verify tokens:

**Auth Service (.env)**:
```
NODE_ENV=production
JWT_SECRET=<your-secret-key>
FRONTEND_URL=<your-frontend-url>
BACKEND_URL=<your-auth-service-url>
COOKIE_DOMAIN=.onrender.com  # Optional, for cookie sharing attempts
```

**Music Service (.env)**:
```
JWT_SECRET=<same-secret-as-auth-service>
FRONTEND_URL=<your-frontend-url>
```

### Deployment Checklist on Render

For each backend service on Render:

1. **Auth Service**:
   - Set `NODE_ENV=production`
   - Set `JWT_SECRET` (same value for both services)
   - Set `FRONTEND_URL` to your deployed frontend URL
   - Set `BACKEND_URL` to the auth service URL
   - Set `COOKIE_DOMAIN` (optional, e.g., `.onrender.com`)

2. **Music Service**:
   - Set `JWT_SECRET` (must match auth service)
   - Set `FRONTEND_URL` to your deployed frontend URL

3. **Frontend** (Vercel/Other):
   - Set `VITE_BACKEND_AUTH_URL` to auth service URL
   - Set `VITE_BACKEND_MUSIC_URL` to music service URL

## How It Works

1. User logs in via auth service → receives JWT token
2. Token is stored in both:
   - **HttpOnly cookie** (for auth service requests)
   - **localStorage** (for music service requests)
3. When calling auth API → axios uses cookie automatically
4. When calling music API → interceptor adds token to Authorization header
5. Music service middleware checks both cookie AND Authorization header

## Benefits

- ✅ Works across different domains/subdomains
- ✅ Maintains security with HttpOnly cookies for auth service
- ✅ Enables cross-domain API calls without CORS cookie issues
- ✅ Backward compatible with existing cookie-based auth
- ✅ No changes needed to backend middleware (already supports both methods)

## Testing

### Local Testing
1. Login and verify token is stored: `localStorage.getItem('token')`
2. Check Network tab - music API calls should include `Authorization: Bearer <token>` header
3. Verify music endpoints return 200 instead of 401

### Production Testing
1. Deploy all services with correct environment variables
2. Clear browser cache and localStorage
3. Login and verify music data loads correctly
4. Check browser console for no 401 errors
5. Test logout and verify token is cleared

## Security Notes

- Token is still signed with JWT_SECRET and expires after 2 days
- HttpOnly cookies remain the primary auth method (more secure)
- localStorage token is only used for cross-domain requests
- Both auth methods validate the same JWT token
- Token is cleared on logout

## Migration Notes

For existing users:
- On first page load after deployment, UserContext will fetch and store the token
- Existing cookies will continue to work
- No user action required

For new users:
- Token is stored immediately on login/register
- Full authentication works from the start
