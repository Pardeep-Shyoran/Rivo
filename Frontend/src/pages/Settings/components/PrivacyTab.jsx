import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as settingsAPI from '../../../api/settingsAPI';
import SettingItem from './SettingItem';
import styles from '../Settings.module.css';

const PrivacyTab = ({ privacy, setPrivacy, setUser, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handlePrivacyChange = async (field, value) => {
    onError('');
    onSuccess('');
    const prevPrivacy = { ...privacy };
    const updatedPrivacy = { ...privacy, [field]: value };
    setPrivacy(updatedPrivacy);

    try {
      await settingsAPI.updatePrivacySettings({
        [field]: value,
      });
      onSuccess('Privacy settings updated');
      setTimeout(() => onSuccess(''), 3000);
    } catch (err) {
      onError(err.response?.data?.message || 'Failed to update privacy settings');
      setPrivacy(prevPrivacy);
    }
  };

  const handleExportData = async () => {
    setLoading(true);
    onError('');
    onSuccess('');

    try {
      const response = await settingsAPI.exportUserData();
      
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

      onSuccess('Data exported successfully');
    } catch (err) {
      onError(err.response?.data?.message || 'Failed to export data');
    } finally {
      setLoading(false);
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
    onError('');
    onSuccess('');

    try {
      await settingsAPI.deleteAccount(password);
      
      setUser(null);
      navigate('/');
    } catch (err) {
      onError(err.response?.data?.message || 'Failed to delete account');
      setLoading(false);
    }
  };

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Privacy Settings</h2>
      <p className={styles.sectionDesc}>Control your privacy and data sharing preferences</p>
      
      <div className={styles.settingsList}>
        <SettingItem
          title="Public Profile"
          description="Make your profile visible to everyone"
        >
          <label className={styles.switch}>
            <input 
              type="checkbox" 
              checked={privacy.publicProfile}
              onChange={(e) => handlePrivacyChange('publicProfile', e.target.checked)}
            />
            <span className={styles.slider}></span>
          </label>
        </SettingItem>

        <SettingItem
          title="Show Listening Activity"
          description="Let others see what you're listening to"
        >
          <label className={styles.switch}>
            <input 
              type="checkbox" 
              checked={privacy.showActivity}
              onChange={(e) => handlePrivacyChange('showActivity', e.target.checked)}
            />
            <span className={styles.slider}></span>
          </label>
        </SettingItem>

        <SettingItem
          title="Share Data for Recommendations"
          description="Help us improve your music recommendations"
        >
          <label className={styles.switch}>
            <input 
              type="checkbox" 
              checked={privacy.shareData}
              onChange={(e) => handlePrivacyChange('shareData', e.target.checked)}
            />
            <span className={styles.slider}></span>
          </label>
        </SettingItem>
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
  );
};

export default PrivacyTab;
