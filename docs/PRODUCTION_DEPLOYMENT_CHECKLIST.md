# Production Deployment Checklist

## Issue Fixed
✅ Cross-domain authentication (401 errors on music API calls)

## Files Modified
- ✅ `Frontend/src/api/axiosMusicConfig.jsx` - Added Authorization header interceptor
- ✅ `Frontend/src/pages/Login/Login.jsx` - Store token on login
- ✅ `Frontend/src/pages/Register/Register.jsx` - Store token on registration
- ✅ `Frontend/src/contexts/UserContext.jsx` - Fetch and store token on initialization
- ✅ `Frontend/src/components/Header/Header.jsx` - Clear token on logout

## Backend Services Configuration

### 1. Auth Service (Render)

**Environment Variables Required:**
```bash
NODE_ENV=production
PORT=3000
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=1e57d7eda2fd70ee424b411c03dd45447bf355c4df8009ad327b97bdf1b037d8
FRONTEND_URL=<your-frontend-url>  # e.g., https://your-app.vercel.app
BACKEND_URL=<your-auth-service-url>  # e.g., https://rivo-auth.onrender.com
COOKIE_DOMAIN=.onrender.com
RABBITMQ_URI=<your-rabbitmq-uri>
CLIENT_ID=<your-google-oauth-client-id>
CLIENT_SECRET=<your-google-oauth-client-secret>
IMAGEKIT_PUBLIC_KEY=<your-imagekit-public-key>
IMAGEKIT_PRIVATE_KEY=<your-imagekit-private-key>
IMAGEKIT_URL_ENDPOINT=<your-imagekit-endpoint>
```

### 2. Music Service (Render)

**Environment Variables Required:**
```bash
PORT=3002
MONGO_URI=<your-mongodb-uri>
JWT_SECRET=1e57d7eda2fd70ee424b411c03dd45447bf355c4df8009ad327b97bdf1b037d8
FRONTEND_URL=<your-frontend-url>  # e.g., https://your-app.vercel.app
AWS_S3_BUCKET_NAME=<your-s3-bucket>
AWS_REGION=<your-aws-region>
AWS_ACCESS_KEY_ID=<your-aws-access-key>
AWS_SECRET_ACCESS_KEY=<your-aws-secret-key>
```

### 3. Notification Service (Render)

**Environment Variables Required:**
```bash
PORT=<port-number>
MONGO_URI=<your-mongodb-uri>
RABBITMQ_URI=<your-rabbitmq-uri>
# Add email service configuration if needed
```

### 4. Frontend (Vercel)

**Environment Variables Required:**
```bash
VITE_BACKEND_AUTH_URL=https://rivo-auth.onrender.com
VITE_BACKEND_MUSIC_URL=https://rivo-music.onrender.com
```

## Critical Points

### ⚠️ IMPORTANT: JWT_SECRET Must Match
The `JWT_SECRET` in **Auth Service** and **Music Service** **MUST BE THE SAME**!

Current shared secret (update if needed):
```
JWT_SECRET=1e57d7eda2fd70ee424b411c03dd45447bf355c4df8009ad327b97bdf1b037d8
```

### Deployment Steps

#### Step 1: Deploy Backend Services on Render

1. **Auth Service**
   ```bash
   # In Render Dashboard for Auth Service
   # Add all environment variables listed above
   # Ensure NODE_ENV=production
   # Deploy
   ```

2. **Music Service**
   ```bash
   # In Render Dashboard for Music Service
   # Add all environment variables listed above
   # Ensure JWT_SECRET matches Auth Service
   # Deploy
   ```

3. **Notification Service**
   ```bash
   # In Render Dashboard for Notification Service
   # Add all environment variables listed above
   # Deploy
   ```

#### Step 2: Update Frontend Environment Variables

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add/Update:
   ```
   VITE_BACKEND_AUTH_URL=https://your-auth-service.onrender.com
   VITE_BACKEND_MUSIC_URL=https://your-music-service.onrender.com
   ```
3. Redeploy frontend

#### Step 3: Verify Deployment

1. **Clear browser cache and localStorage**
   ```javascript
   // In browser console
   localStorage.clear();
   ```

2. **Test Login Flow**
   - Login with credentials
   - Check console: `localStorage.getItem('token')` should show token
   - Navigate to home page
   - Verify music data loads (no 401 errors)

3. **Check Network Tab**
   - Music API calls should have `Authorization: Bearer <token>` header
   - All requests should return 200 status

4. **Test Logout**
   - Click logout
   - Check console: `localStorage.getItem('token')` should be null
   - Verify redirected to login

## Testing in Production

### Test Scenarios

1. ✅ **New User Registration**
   - Register new account
   - Verify auto-login works
   - Verify music loads

2. ✅ **Existing User Login**
   - Login with existing credentials
   - Verify music loads
   - Verify play history works

3. ✅ **Google OAuth**
   - Login with Google
   - Verify redirect works
   - Verify music loads

4. ✅ **Token Refresh**
   - Stay logged in
   - Refresh page
   - Verify still logged in
   - Verify music still loads

5. ✅ **Logout**
   - Click logout
   - Verify redirected to login
   - Verify music API returns 401 (as expected)

## Common Issues & Solutions

### Issue: Still getting 401 errors

**Solution:**
1. Verify `JWT_SECRET` is identical in both services
2. Check that token is being stored: `localStorage.getItem('token')`
3. Check Network tab - Authorization header should be present
4. Verify CORS is allowing credentials

### Issue: Token not being stored

**Solution:**
1. Clear localStorage and cookies
2. Login again
3. Check browser console for errors
4. Verify `/api/auth/token` endpoint is accessible

### Issue: CORS errors

**Solution:**
1. Verify `FRONTEND_URL` is set correctly in both services
2. Check that `credentials: true` is in CORS config
3. Ensure frontend is using `withCredentials: true`

### Issue: Logout not clearing token

**Solution:**
1. Clear localStorage manually: `localStorage.clear()`
2. Check that logout handler is calling `localStorage.removeItem('token')`

## Rollback Plan

If issues occur after deployment:

1. **Frontend Rollback:**
   - Revert to previous Vercel deployment
   - Or remove changes from these files and redeploy

2. **Backend Rollback:**
   - No backend changes were made (middleware already supported both auth methods)
   - Only environment variables added

## Monitoring

After deployment, monitor:
- Error rates in production logs
- 401 error count (should drop to zero)
- User login success rate
- Music API call success rate

## Support

If issues persist:
1. Check Render logs for both services
2. Check browser console for errors
3. Verify all environment variables are set correctly
4. Ensure JWT_SECRET matches in both services
