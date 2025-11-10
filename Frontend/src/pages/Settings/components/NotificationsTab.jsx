import * as settingsAPI from '../../../api/settingsAPI';
import SettingItem from './SettingItem';
import styles from '../Settings.module.css';

const NotificationsTab = ({ user, notifications, setNotifications, onSuccess, onError }) => {
  const handleNotificationChange = async (field, value) => {
    onError('');
    onSuccess('');
    const prevNotifications = { ...notifications };
    const updatedNotifications = { ...notifications, [field]: value };
    setNotifications(updatedNotifications);

    try {
      await settingsAPI.updateNotificationPreferences({
        [field]: value,
      });
      onSuccess('Notification preferences updated');
      setTimeout(() => onSuccess(''), 3000);
    } catch (err) {
      onError(err.response?.data?.message || 'Failed to update notifications');
      setNotifications(prevNotifications);
    }
  };

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Notification Preferences</h2>
      <p className={styles.sectionDesc}>Choose what notifications you want to receive</p>
      
      <div className={styles.settingsList}>
        <SettingItem
          title="Email Notifications"
          description="Receive updates via email"
        >
          <label className={styles.switch}>
            <input 
              type="checkbox" 
              checked={notifications.emailNotifications}
              onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
            />
            <span className={styles.slider}></span>
          </label>
        </SettingItem>

        <SettingItem
          title="New Music Recommendations"
          description="Get notified about new music you might like"
        >
          <label className={styles.switch}>
            <input 
              type="checkbox" 
              checked={notifications.recommendations}
              onChange={(e) => handleNotificationChange('recommendations', e.target.checked)}
            />
            <span className={styles.slider}></span>
          </label>
        </SettingItem>

        {user?.role === 'artist' && (
          <>
            <SettingItem
              title="Analytics Updates"
              description="Receive weekly performance reports"
            >
              <label className={styles.switch}>
                <input 
                  type="checkbox" 
                  checked={notifications.analytics}
                  onChange={(e) => handleNotificationChange('analytics', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </SettingItem>

            <SettingItem
              title="Fan Messages"
              description="Get notified when fans send you messages"
            >
              <label className={styles.switch}>
                <input 
                  type="checkbox" 
                  checked={notifications.fanMessages}
                  onChange={(e) => handleNotificationChange('fanMessages', e.target.checked)}
                />
                <span className={styles.slider}></span>
              </label>
            </SettingItem>
          </>
        )}

        <SettingItem
          title="Marketing Emails"
          description="Receive promotional content and updates"
        >
          <label className={styles.switch}>
            <input 
              type="checkbox" 
              checked={notifications.marketing}
              onChange={(e) => handleNotificationChange('marketing', e.target.checked)}
            />
            <span className={styles.slider}></span>
          </label>
        </SettingItem>
      </div>
    </div>
  );
};

export default NotificationsTab;
