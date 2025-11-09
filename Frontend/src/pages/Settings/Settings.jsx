import { useState, useEffect } from 'react';
import { useUser } from '../../contexts/useUser';
import { useNavigate } from 'react-router-dom';
import PageWrapper from '../../components/PageWrapper/PageWrapper';
import styles from './Settings.module.css';
import * as settingsAPI from '../../api/settingsAPI';

const Settings = () => {
  const { user, setUser } = useUser();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profilePicture, setProfilePicture] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    bio: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [preferences, setPreferences] = useState({
    theme: 'dark',
    language: 'en',
    audioQuality: 'high',
    explicitContent: false,
  });

  const [notifications, setNotifications] = useState({
    emailNotifications: true,
    recommendations: true,
    analytics: true,
    fanMessages: true,
    marketing: false,
  });

  const [privacy, setPrivacy] = useState({
    publicProfile: true,
    showActivity: true,
    shareData: true,
  });

  // Load user settings on mount
  useEffect(() => {
    loadUserSettings();
  }, []);

  const loadUserSettings = async () => {
    try {
      const data = await settingsAPI.getUserSettings();
      
      // Update profile picture
      setProfilePicture(data.user.profilePicture || '');
      
      // Update form data
      setFormData({
        firstName: data.user.fullName?.firstName || '',
        lastName: data.user.fullName?.lastName || '',
        email: data.user.email || '',
        bio: data.user.bio || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      // Update preferences
      setPreferences({
        theme: data.user.preferences?.theme || 'dark',
        language: data.user.preferences?.language || 'en',
        audioQuality: data.user.preferences?.audioQuality || 'high',
        explicitContent: data.user.preferences?.explicitContent || false,
      });

      // Update notifications
      setNotifications({
        emailNotifications: data.user.notifications?.emailNotifications ?? true,
        recommendations: data.user.notifications?.recommendations ?? true,
        analytics: data.user.notifications?.analytics ?? true,
        fanMessages: data.user.notifications?.fanMessages ?? true,
        marketing: data.user.notifications?.marketing ?? false,
      });

      // Update privacy
      setPrivacy({
        publicProfile: data.user.privacy?.publicProfile ?? true,
        showActivity: data.user.privacy?.showActivity ?? true,
        shareData: data.user.privacy?.shareData ?? true,
      });
    } catch (err) {
      console.error('Error loading settings:', err);
      setError('Failed to load settings');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    try {
      const response = await settingsAPI.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        bio: formData.bio,
      });

      setSuccess(response.message);
      
      // Update user context
      setUser(response.user);
      
      // Reload settings to get latest data
      await loadUserSettings();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    clearMessages();

    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await settingsAPI.updatePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      setSuccess(response.message);
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = async (field, value) => {
    clearMessages();
    const updatedNotifications = { ...notifications, [field]: value };
    setNotifications(updatedNotifications);

    try {
      await settingsAPI.updateNotificationPreferences({
        [field]: value,
      });
      setSuccess('Notification preferences updated');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update notifications');
      // Revert on error
      setNotifications(notifications);
    }
  };

  const handlePrivacyChange = async (field, value) => {
    clearMessages();
    const updatedPrivacy = { ...privacy, [field]: value };
    setPrivacy(updatedPrivacy);

    try {
      await settingsAPI.updatePrivacySettings({
        [field]: value,
      });
      setSuccess('Privacy settings updated');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update privacy settings');
      // Revert on error
      setPrivacy(privacy);
    }
  };

  const handlePreferenceChange = async (field, value) => {
    clearMessages();
    const updatedPreferences = { ...preferences, [field]: value };
    setPreferences(updatedPreferences);

    try {
      await settingsAPI.updatePreferences({
        [field]: value,
      });
      setSuccess('Preferences updated');
      setTimeout(() => setSuccess(''), 3000);

      // Apply theme change immediately if it's the theme preference
      if (field === 'theme') {
        document.documentElement.setAttribute('data-theme', value);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update preferences');
      // Revert on error
      setPreferences(preferences);
    }
  };

  const handleExportData = async () => {
    setLoading(true);
    clearMessages();

    try {
      const response = await settingsAPI.exportUserData();
      
      // Create a downloadable JSON file
      const dataStr = JSON.stringify(response.data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rivo-user-data-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setSuccess('Data exported successfully');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to export data');
    } finally {
      setLoading(false);
    }
  };

  const handleProfilePictureChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setError('Invalid file type. Only JPEG, PNG, and WebP are allowed');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('File too large. Maximum size is 5MB');
      return;
    }

    setUploadingImage(true);
    clearMessages();

    try {
      const response = await settingsAPI.uploadProfilePicture(file);
      setProfilePicture(response.profilePicture);
      setSuccess('Profile picture updated successfully');
      
      // Update user context
      setUser(prev => ({
        ...prev,
        profilePicture: response.profilePicture,
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to upload profile picture');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteProfilePicture = async () => {
    const confirmDelete = window.confirm('Are you sure you want to remove your profile picture?');
    if (!confirmDelete) return;

    setUploadingImage(true);
    clearMessages();

    try {
      await settingsAPI.deleteProfilePicture();
      setProfilePicture('');
      setSuccess('Profile picture removed successfully');
      
      // Update user context
      setUser(prev => ({
        ...prev,
        profilePicture: '',
      }));
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete profile picture');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );

    if (!confirmDelete) return;

    const password = window.prompt('Please enter your password to confirm account deletion:');
    
    if (!password) return;

    setLoading(true);
    clearMessages();

    try {
      await settingsAPI.deleteAccount(password);
      
      // Clear user context and redirect to home
      setUser(null);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete account');
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'profile', label: 'Profile', icon: '👤' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'privacy', label: 'Privacy', icon: '🛡️' },
    { id: 'preferences', label: 'Preferences', icon: '⚙️' },
  ];

  // Add artist-specific tabs
  if (user?.role === 'artist') {
    tabs.push(
      { id: 'analytics', label: 'Analytics', icon: '📊' },
      { id: 'payments', label: 'Payments', icon: '💳' }
    );
  }

  return (
    <PageWrapper>
      <div className={styles.settings}>
        <div className={styles.header}>
          <h1 className={styles.title}>Settings</h1>
          <p className={styles.subtitle}>Manage your account settings and preferences</p>
        </div>

        {/* Error/Success Messages */}
        {error && (
          <div className={styles.errorMessage}>
            {error}
            <button onClick={clearMessages} className={styles.closeBtn}>✕</button>
          </div>
        )}
        {success && (
          <div className={styles.successMessage}>
            {success}
            <button onClick={clearMessages} className={styles.closeBtn}>✕</button>
          </div>
        )}

        <div className={styles.container}>
          {/* Sidebar Tabs */}
          <aside className={styles.sidebar}>
            <nav className={styles.tabList}>
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <span className={styles.tabIcon}>{tab.icon}</span>
                  <span className={styles.tabLabel}>{tab.label}</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className={styles.content}>
            {/* Profile Tab */}
            {activeTab === 'profile' && (
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
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Security Settings</h2>
                <p className={styles.sectionDesc}>Manage your password and security preferences</p>
                
                <form className={styles.form} onSubmit={handlePasswordSubmit}>
                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="currentPassword">Current Password</label>
                    <input
                      id="currentPassword"
                      name="currentPassword"
                      type="password"
                      className={styles.input}
                      value={formData.currentPassword}
                      onChange={handleInputChange}
                      placeholder="Enter current password"
                      required
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="newPassword">New Password</label>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      className={styles.input}
                      value={formData.newPassword}
                      onChange={handleInputChange}
                      placeholder="Enter new password"
                      required
                      minLength={6}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.label} htmlFor="confirmPassword">Confirm New Password</label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      className={styles.input}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      placeholder="Confirm new password"
                      required
                      minLength={6}
                    />
                  </div>

                  <div className={styles.formActions}>
                    <button type="submit" className={styles.saveBtn} disabled={loading}>
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>

                <div className={styles.divider} />

                <div className={styles.settingItem}>
                  <div className={styles.settingInfo}>
                    <h3 className={styles.settingTitle}>Two-Factor Authentication</h3>
                    <p className={styles.settingDesc}>Add an extra layer of security to your account</p>
                  </div>
                  <button className={styles.secondaryBtn}>Enable 2FA</button>
                </div>
              </div>
            )}

            {/* Notifications Tab */}
            {activeTab === 'notifications' && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Notification Preferences</h2>
                <p className={styles.sectionDesc}>Choose what notifications you want to receive</p>
                
                <div className={styles.settingsList}>
                  <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <h3 className={styles.settingTitle}>Email Notifications</h3>
                      <p className={styles.settingDesc}>Receive updates via email</p>
                    </div>
                    <label className={styles.switch}>
                      <input 
                        type="checkbox" 
                        checked={notifications.emailNotifications}
                        onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>

                  <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <h3 className={styles.settingTitle}>New Music Recommendations</h3>
                      <p className={styles.settingDesc}>Get notified about new music you might like</p>
                    </div>
                    <label className={styles.switch}>
                      <input 
                        type="checkbox" 
                        checked={notifications.recommendations}
                        onChange={(e) => handleNotificationChange('recommendations', e.target.checked)}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>

                  {user?.role === 'artist' && (
                    <>
                      <div className={styles.settingItem}>
                        <div className={styles.settingInfo}>
                          <h3 className={styles.settingTitle}>Analytics Updates</h3>
                          <p className={styles.settingDesc}>Receive weekly performance reports</p>
                        </div>
                        <label className={styles.switch}>
                          <input 
                            type="checkbox" 
                            checked={notifications.analytics}
                            onChange={(e) => handleNotificationChange('analytics', e.target.checked)}
                          />
                          <span className={styles.slider}></span>
                        </label>
                      </div>

                      <div className={styles.settingItem}>
                        <div className={styles.settingInfo}>
                          <h3 className={styles.settingTitle}>Fan Messages</h3>
                          <p className={styles.settingDesc}>Get notified when fans send you messages</p>
                        </div>
                        <label className={styles.switch}>
                          <input 
                            type="checkbox" 
                            checked={notifications.fanMessages}
                            onChange={(e) => handleNotificationChange('fanMessages', e.target.checked)}
                          />
                          <span className={styles.slider}></span>
                        </label>
                      </div>
                    </>
                  )}

                  <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <h3 className={styles.settingTitle}>Marketing Emails</h3>
                      <p className={styles.settingDesc}>Receive promotional content and updates</p>
                    </div>
                    <label className={styles.switch}>
                      <input 
                        type="checkbox" 
                        checked={notifications.marketing}
                        onChange={(e) => handleNotificationChange('marketing', e.target.checked)}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Privacy Tab */}
            {activeTab === 'privacy' && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Privacy Settings</h2>
                <p className={styles.sectionDesc}>Control your privacy and data sharing preferences</p>
                
                <div className={styles.settingsList}>
                  <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <h3 className={styles.settingTitle}>Public Profile</h3>
                      <p className={styles.settingDesc}>Make your profile visible to everyone</p>
                    </div>
                    <label className={styles.switch}>
                      <input 
                        type="checkbox" 
                        checked={privacy.publicProfile}
                        onChange={(e) => handlePrivacyChange('publicProfile', e.target.checked)}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>

                  <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <h3 className={styles.settingTitle}>Show Listening Activity</h3>
                      <p className={styles.settingDesc}>Let others see what you're listening to</p>
                    </div>
                    <label className={styles.switch}>
                      <input 
                        type="checkbox" 
                        checked={privacy.showActivity}
                        onChange={(e) => handlePrivacyChange('showActivity', e.target.checked)}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>

                  <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <h3 className={styles.settingTitle}>Share Data for Recommendations</h3>
                      <p className={styles.settingDesc}>Help us improve your music recommendations</p>
                    </div>
                    <label className={styles.switch}>
                      <input 
                        type="checkbox" 
                        checked={privacy.shareData}
                        onChange={(e) => handlePrivacyChange('shareData', e.target.checked)}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>
                </div>

                <div className={styles.divider} />

                <div className={styles.dangerZone}>
                  <h3 className={styles.dangerTitle}>Data Management</h3>
                  <button 
                    className={styles.dangerBtn} 
                    onClick={handleExportData}
                    disabled={loading}
                  >
                    {loading ? 'Exporting...' : 'Download My Data'}
                  </button>
                  <button 
                    className={styles.dangerBtn}
                    onClick={handleDeleteAccount}
                    disabled={loading}
                  >
                    Delete Account
                  </button>
                </div>
              </div>
            )}

            {/* Preferences Tab */}
            {activeTab === 'preferences' && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>App Preferences</h2>
                <p className={styles.sectionDesc}>Customize your app experience</p>
                
                <div className={styles.settingsList}>
                  <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <h3 className={styles.settingTitle}>Theme</h3>
                      <p className={styles.settingDesc}>Choose your preferred theme</p>
                    </div>
                    <select 
                      className={styles.select}
                      value={preferences.theme}
                      onChange={(e) => handlePreferenceChange('theme', e.target.value)}
                    >
                      <option value="dark">Dark</option>
                      <option value="light">Light</option>
                      <option value="auto">Auto</option>
                    </select>
                  </div>

                  <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <h3 className={styles.settingTitle}>Language</h3>
                      <p className={styles.settingDesc}>Select your preferred language</p>
                    </div>
                    <select 
                      className={styles.select}
                      value={preferences.language}
                      onChange={(e) => handlePreferenceChange('language', e.target.value)}
                    >
                      <option value="en">English</option>
                      <option value="es">Spanish</option>
                      <option value="fr">French</option>
                      <option value="de">German</option>
                    </select>
                  </div>

                  <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <h3 className={styles.settingTitle}>Audio Quality</h3>
                      <p className={styles.settingDesc}>Choose streaming quality</p>
                    </div>
                    <select 
                      className={styles.select}
                      value={preferences.audioQuality}
                      onChange={(e) => handlePreferenceChange('audioQuality', e.target.value)}
                    >
                      <option value="high">High (320kbps)</option>
                      <option value="normal">Normal (160kbps)</option>
                      <option value="low">Low (96kbps)</option>
                    </select>
                  </div>

                  <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <h3 className={styles.settingTitle}>Explicit Content</h3>
                      <p className={styles.settingDesc}>Filter explicit content</p>
                    </div>
                    <label className={styles.switch}>
                      <input 
                        type="checkbox" 
                        checked={preferences.explicitContent}
                        onChange={(e) => handlePreferenceChange('explicitContent', e.target.checked)}
                      />
                      <span className={styles.slider}></span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Analytics Tab (Artist Only) */}
            {activeTab === 'analytics' && user?.role === 'artist' && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Analytics Preferences</h2>
                <p className={styles.sectionDesc}>Configure your analytics and insights settings</p>
                
                <div className={styles.settingsList}>
                  <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <h3 className={styles.settingTitle}>Email Reports</h3>
                      <p className={styles.settingDesc}>Receive weekly performance reports via email</p>
                    </div>
                    <label className={styles.switch}>
                      <input type="checkbox" defaultChecked />
                      <span className={styles.slider}></span>
                    </label>
                  </div>

                  <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <h3 className={styles.settingTitle}>Public Stats</h3>
                      <p className={styles.settingDesc}>Show play counts on your profile</p>
                    </div>
                    <label className={styles.switch}>
                      <input type="checkbox" defaultChecked />
                      <span className={styles.slider}></span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Payments Tab (Artist Only) */}
            {activeTab === 'payments' && user?.role === 'artist' && (
              <div className={styles.section}>
                <h2 className={styles.sectionTitle}>Payment Settings</h2>
                <p className={styles.sectionDesc}>Manage your payment methods and payout preferences</p>
                
                <div className={styles.infoBox}>
                  <p>💡 Payment integration coming soon! Set up your bank account to receive payouts from your music streams.</p>
                </div>

                <div className={styles.settingsList}>
                  <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <h3 className={styles.settingTitle}>Payout Method</h3>
                      <p className={styles.settingDesc}>Bank Transfer (Not configured)</p>
                    </div>
                    <button className={styles.secondaryBtn}>Configure</button>
                  </div>

                  <div className={styles.settingItem}>
                    <div className={styles.settingInfo}>
                      <h3 className={styles.settingTitle}>Payout Schedule</h3>
                      <p className={styles.settingDesc}>Monthly automatic payouts</p>
                    </div>
                    <select className={styles.select}>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Settings;