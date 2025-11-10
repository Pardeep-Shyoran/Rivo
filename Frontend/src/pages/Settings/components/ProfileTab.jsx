import { useState } from 'react';
import * as settingsAPI from '../../../api/settingsAPI';
import styles from '../Settings.module.css';

const ProfileTab = ({ user, formData, setFormData, profilePicture, setProfilePicture, setUser, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    onError('');
    onSuccess('');

    try {
      const response = await settingsAPI.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio,
      });

      onSuccess(response.message);
      setUser(response.user);
    } catch (err) {
      onError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      onError('Invalid file type. Only JPEG, PNG, and WebP are allowed');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      onError('File too large. Maximum size is 5MB');
      return;
    }

    setUploadingImage(true);
    onError('');
    onSuccess('');

    try {
      const response = await settingsAPI.uploadProfilePicture(file);
      setProfilePicture(response.profilePicture);
      onSuccess('Profile picture updated successfully');
      
      setUser(prev => ({
        ...prev,
        profilePicture: response.profilePicture,
      }));
    } catch (err) {
      onError(err.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteProfilePicture = async () => {
    const confirmDelete = window.confirm('Are you sure you want to remove your profile picture?');
    if (!confirmDelete) return;

    setUploadingImage(true);
    onError('');
    onSuccess('');

    try {
      await settingsAPI.deleteProfilePicture();
      setProfilePicture('');
      onSuccess('Profile picture removed successfully');
      
      setUser(prev => ({
        ...prev,
        profilePicture: '',
      }));
    } catch (err) {
      onError(err.response?.data?.message || 'Failed to delete profile picture');
    } finally {
      setUploadingImage(false);
    }
  };

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Profile Information</h2>
      <p className={styles.sectionDesc}>Update your personal information and profile picture</p>
      
      <form className={styles.form} onSubmit={handleProfileSubmit}>
        <div className={styles.formGroup}>
          <label className={styles.label}>Profile Picture</label>
          <div className={styles.avatarContainer}>
            <div className={styles.avatar}>
              {profilePicture ? (
                <img src={profilePicture} alt="Profile" className={styles.avatarImage} />
              ) : (
                <span className={styles.avatarInitial}>
                  {formData.firstName?.charAt(0).toUpperCase() || 'U'}
                </span>
              )}
            </div>
            <div className={styles.avatarActions}>
              <input
                type="file"
                id="profilePictureInput"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleProfilePictureChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="profilePictureInput" className={styles.changeAvatarBtn}>
                {uploadingImage ? 'Uploading...' : 'Change Photo'}
              </label>
              {profilePicture && (
                <button 
                  type="button" 
                  className={styles.removeAvatarBtn}
                  onClick={handleDeleteProfilePicture}
                  disabled={uploadingImage}
                >
                  Remove
                </button>
              )}
            </div>
          </div>
          <small className={styles.helperText}>
            JPG, PNG or WebP. Max size 5MB
          </small>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="firstName">First Name</label>
          <input
            id="firstName"
            name="firstName"
            type="text"
            className={styles.input}
            value={formData.firstName}
            onChange={handleInputChange}
            placeholder="Enter your first name"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="lastName">Last Name</label>
          <input
            id="lastName"
            name="lastName"
            type="text"
            className={styles.input}
            value={formData.lastName}
            onChange={handleInputChange}
            placeholder="Enter your last name"
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="email">Email</label>
          <input
            id="email"
            name="email"
            type="email"
            className={`${styles.input} ${styles.readOnly}`}
            value={formData.email}
            readOnly
            disabled
            placeholder="Enter your email"
          />
          <small className={styles.helperText}>Email cannot be changed</small>
        </div>

        {user?.role === 'artist' && (
          <div className={styles.formGroup}>
            <label className={styles.label} htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              className={styles.textarea}
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Tell us about yourself"
              rows={4}
            />
          </div>
        )}

        <div className={styles.formActions}>
          <button type="submit" className={styles.saveBtn} disabled={loading}>
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileTab;
