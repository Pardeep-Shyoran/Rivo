import { useState, useEffect } from 'react';
import { useUser } from '../../contexts/useUser';
import PageWrapper from '../../components/PageWrapper/PageWrapper';
import styles from './Settings.module.css';
import * as settingsAPI from '../../api/settingsAPI';
import {
  ProfileTab,
  SecurityTab,
  NotificationsTab,
  PrivacyTab,
  PreferencesTab,
  AnalyticsTab,
  PaymentsTab,
  MessageBanner,
} from './components';

const Settings = () => {
  const { user, setUser } = useUser();
  const [activeTab, setActiveTab] = useState('profile');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
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

  const clearMessages = () => {
    setError('');
    setSuccess('');
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

        <MessageBanner type="error" message={error} onClose={clearMessages} />
        <MessageBanner type="success" message={success} onClose={clearMessages} />

        <div className={styles.container}>
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

          <main className={styles.content}>
            {activeTab === 'profile' && (
              <ProfileTab
                user={user}
                formData={formData}
                setFormData={setFormData}
                profilePicture={profilePicture}
                setProfilePicture={setProfilePicture}
                setUser={setUser}
                onSuccess={setSuccess}
                onError={setError}
              />
            )}

            {activeTab === 'security' && (
              <SecurityTab
                formData={formData}
                setFormData={setFormData}
                onSuccess={setSuccess}
                onError={setError}
              />
            )}

            {activeTab === 'notifications' && (
              <NotificationsTab
                user={user}
                notifications={notifications}
                setNotifications={setNotifications}
                onSuccess={setSuccess}
                onError={setError}
              />
            )}

            {activeTab === 'privacy' && (
              <PrivacyTab
                privacy={privacy}
                setPrivacy={setPrivacy}
                setUser={setUser}
                onSuccess={setSuccess}
                onError={setError}
              />
            )}

            {activeTab === 'preferences' && (
              <PreferencesTab
                preferences={preferences}
                setPreferences={setPreferences}
                onSuccess={setSuccess}
                onError={setError}
              />
            )}

            {activeTab === 'analytics' && user?.role === 'artist' && (
              <AnalyticsTab />
            )}

            {activeTab === 'payments' && user?.role === 'artist' && (
              <PaymentsTab />
            )}
          </main>
        </div>
      </div>
    </PageWrapper>
  );
};

export default Settings;
