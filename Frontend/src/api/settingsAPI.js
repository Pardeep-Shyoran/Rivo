import axios from './axiosAuthConfig';

// Get user settings
export const getUserSettings = async () => {
  const response = await axios.get('/api/settings');
  return response.data;
};

// Update profile
export const updateProfile = async (profileData) => {
  const response = await axios.put('/api/settings/profile', profileData);
  return response.data;
};

// Update password
export const updatePassword = async (passwordData) => {
  const response = await axios.put('/api/settings/password', passwordData);
  return response.data;
};

// Update notification preferences
export const updateNotificationPreferences = async (notificationData) => {
  const response = await axios.put('/api/settings/notifications', notificationData);
  return response.data;
};

// Update privacy settings
export const updatePrivacySettings = async (privacyData) => {
  const response = await axios.put('/api/settings/privacy', privacyData);
  return response.data;
};

// Update app preferences
export const updatePreferences = async (preferencesData) => {
  const response = await axios.put('/api/settings/preferences', preferencesData);
  return response.data;
};

// Export user data
export const exportUserData = async () => {
  const response = await axios.get('/api/settings/export');
  return response.data;
};

// Upload profile picture
export const uploadProfilePicture = async (file) => {
  const formData = new FormData();
  formData.append('profilePicture', file);
  
  const response = await axios.post('/api/settings/profile-picture', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Delete profile picture
export const deleteProfilePicture = async () => {
  const response = await axios.delete('/api/settings/profile-picture');
  return response.data;
};

// Delete account
export const deleteAccount = async (password) => {
  const response = await axios.delete('/api/settings/account', {
    data: { password },
  });
  return response.data;
};
