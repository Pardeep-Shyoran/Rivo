# Profile Picture Upload with ImageKit - Setup Guide

## 📦 Installation Complete

The following packages have been installed in the auth backend:
- ✅ `imagekit` - ImageKit SDK for Node.js
- ✅ `multer` - Middleware for handling multipart/form-data (file uploads)

## 🔑 ImageKit Configuration

### Step 1: Get ImageKit Credentials

1. Go to [ImageKit.io](https://imagekit.io/) and sign up for a free account
2. After signing in, go to **Developer Options** in the dashboard
3. You'll need three credentials:
   - **Public Key**
   - **Private Key**
   - **URL Endpoint**

### Step 2: Add Environment Variables

Add these to your `/Backend/auth/.env` file:

```env
# ImageKit Configuration
IMAGEKIT_PUBLIC_KEY=your_public_key_here
IMAGEKIT_PRIVATE_KEY=your_private_key_here
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_imagekit_id
```

**Example:**
```env
IMAGEKIT_PUBLIC_KEY=public_abc123xyz
IMAGEKIT_PRIVATE_KEY=private_def456uvw
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/demo
```

## 🎯 Features Implemented

### Backend Features:
1. ✅ **Upload Profile Picture** - POST `/api/settings/profile-picture`
   - Accepts image files (JPEG, PNG, WebP)
   - Max file size: 5MB
   - Uploads to ImageKit
   - Stores URL in database
   - Deletes old profile picture when uploading new one

2. ✅ **Delete Profile Picture** - DELETE `/api/settings/profile-picture`
   - Removes profile picture from ImageKit
   - Clears URL from database

3. ✅ **Image Validation**
   - File type validation (only images)
   - File size validation (max 5MB)
   - Automatic unique filename generation

4. ✅ **Database Schema Updated**
   - Added `profilePicture` field (stores ImageKit URL)
   - Added `profilePictureFileId` field (for deletion)

### Frontend Features:
1. ✅ **Profile Picture Display**
   - Shows uploaded image or user initials
   - Circular avatar with border

2. ✅ **Upload Interface**
   - Click "Change Photo" to select image
   - Shows uploading state
   - Displays success/error messages

3. ✅ **Remove Picture**
   - "Remove" button appears when picture exists
   - Confirmation before deletion
   - Reverts to initials after removal

4. ✅ **Validation**
   - Client-side file type validation
   - Client-side file size validation
   - Visual feedback for errors

## 🚀 How to Use

### For Users:

1. **Navigate to Settings**
   - Click "Settings" in the sidebar
   - Go to "Profile" tab

2. **Upload Profile Picture**
   - Click "Change Photo" button
   - Select an image file (JPG, PNG, or WebP)
   - Wait for upload to complete
   - See success message and new picture displayed

3. **Remove Profile Picture**
   - Click "Remove" button next to "Change Photo"
   - Confirm deletion
   - Picture removed and initials displayed

### For Developers:

#### Upload Profile Picture API:
```javascript
// Frontend
const file = e.target.files[0];
const formData = new FormData();
formData.append('profilePicture', file);

const response = await axios.post('/api/settings/profile-picture', formData, {
  headers: { 'Content-Type': 'multipart/form-data' }
});
// Response: { message: "...", profilePicture: "https://..." }
```

#### Delete Profile Picture API:
```javascript
const response = await axios.delete('/api/settings/profile-picture');
// Response: { message: "Profile picture deleted successfully" }
```

## 📁 Files Created/Modified

### Backend:
- ✅ `Backend/auth/src/services/imagekit.service.js` - **NEW** - ImageKit service
- ✅ `Backend/auth/src/config/config.js` - Updated with ImageKit config
- ✅ `Backend/auth/src/models/user.model.js` - Added profile picture fields
- ✅ `Backend/auth/src/controllers/settings.controller.js` - Added upload/delete functions
- ✅ `Backend/auth/src/controllers/auth.controller.js` - Added profilePicture to response
- ✅ `Backend/auth/src/routes/settings.routes.js` - Added profile picture routes
- ✅ `Backend/auth/package.json` - Added imagekit and multer dependencies

### Frontend:
- ✅ `Frontend/src/api/settingsAPI.js` - Added upload/delete functions
- ✅ `Frontend/src/pages/Settings/Settings.jsx` - Added upload UI and handlers
- ✅ `Frontend/src/pages/Settings/Settings.module.css` - Added avatar styles

## 🔒 Security Features

1. **File Type Validation**
   - Only image types allowed (JPEG, PNG, WebP)
   - Validated on both frontend and backend

2. **File Size Limit**
   - Maximum 5MB file size
   - Validated on both frontend and backend

3. **Authentication Required**
   - All endpoints require valid JWT token
   - Users can only upload/delete their own pictures

4. **Automatic Cleanup**
   - Old profile pictures are deleted when uploading new ones
   - Prevents storage waste

5. **Error Handling**
   - Comprehensive error messages
   - Failed uploads don't affect user data

## 📊 API Endpoints

### Upload Profile Picture
```http
POST /api/settings/profile-picture
Authorization: Cookie (token)
Content-Type: multipart/form-data

Body:
- profilePicture: File (image)

Response 200:
{
  "message": "Profile picture updated successfully",
  "profilePicture": "https://ik.imagekit.io/demo/profile-pictures/..."
}

Response 400:
{
  "message": "No file uploaded" | "Invalid file type" | "File too large"
}
```

### Delete Profile Picture
```http
DELETE /api/settings/profile-picture
Authorization: Cookie (token)

Response 200:
{
  "message": "Profile picture deleted successfully"
}

Response 400:
{
  "message": "No profile picture to delete"
}
```

## 🧪 Testing

### Test Upload:
1. Login to your account
2. Go to Settings > Profile
3. Click "Change Photo"
4. Select an image file
5. Verify upload success message
6. Check image displays correctly
7. Refresh page to confirm persistence

### Test Delete:
1. With profile picture uploaded
2. Click "Remove" button
3. Confirm deletion
4. Verify picture removed
5. Check initials displayed instead

### Test Validation:
1. Try uploading non-image file → Should show error
2. Try uploading file > 5MB → Should show error
3. Try uploading valid image → Should succeed

## 🎨 ImageKit Features You Can Add

ImageKit offers many advanced features you can implement:

1. **Image Transformations**
   ```javascript
   // Get optimized thumbnail
   const thumbnailUrl = profilePicture + '?tr=w-100,h-100,fo-face';
   ```

2. **Image Optimization**
   - Automatic format conversion (WebP for supported browsers)
   - Automatic quality optimization
   - Lazy loading support

3. **Face Detection**
   - Crop images to focus on faces
   - Use `fo-face` transformation

4. **Multiple Sizes**
   - Store one image, serve multiple sizes
   - Responsive images

## 🐛 Troubleshooting

### Error: "Failed to upload image"
- Check ImageKit credentials in .env file
- Verify ImageKit URL endpoint is correct
- Check network connectivity

### Error: "Invalid file type"
- Ensure file is JPEG, PNG, or WebP
- Check file extension

### Error: "File too large"
- Compress image before uploading
- Use image < 5MB

### Image not displaying:
- Check browser console for CORS errors
- Verify ImageKit URL is accessible
- Check if user has profilePicture field populated

### Old picture not deleted:
- Check ImageKit dashboard for orphaned files
- Verify profilePictureFileId is stored correctly

## 🌟 Next Steps

### Immediate Enhancements:
1. **Image Cropping**
   - Add client-side image cropper
   - Libraries: react-image-crop, react-easy-crop

2. **Image Preview**
   - Show preview before upload
   - FileReader API for local preview

3. **Drag & Drop**
   - Add drag & drop zone for images
   - Better UX than file picker

4. **Multiple Formats**
   - Automatic thumbnail generation
   - Different sizes for different views

### Advanced Features:
1. **Cover Photo**
   - Similar to profile picture
   - Different aspect ratio

2. **Photo Gallery**
   - Store multiple user photos
   - Album management

3. **Image Filters**
   - Apply filters before upload
   - Instagram-like effects

4. **Avatar Generation**
   - Generate default avatars
   - Use services like DiceBear

## ✅ Verification Checklist

Before deploying to production:

- [ ] ImageKit credentials configured in .env
- [ ] Backend service running without errors
- [ ] Frontend can upload images
- [ ] Images display correctly
- [ ] Old images are deleted when uploading new ones
- [ ] Delete functionality works
- [ ] File validation working (type & size)
- [ ] Error messages display properly
- [ ] Loading states show during upload
- [ ] Profile picture persists after page refresh
- [ ] Mobile responsive
- [ ] CORS configured for production
- [ ] Rate limiting implemented (optional)

## 📝 Environment Variables Summary

Add to `/Backend/auth/.env`:
```env
# Required for profile picture upload
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/your_id
```

---

**Profile picture upload is now fully functional!** 🎉

Users can upload, view, and delete profile pictures stored securely on ImageKit.
