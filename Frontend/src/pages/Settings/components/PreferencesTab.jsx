import * as settingsAPI from '../../../api/settingsAPI';
import SettingItem from './SettingItem';
import styles from '../Settings.module.css';

const PreferencesTab = ({ preferences, setPreferences, onSuccess, onError }) => {
  const handlePreferenceChange = async (field, value) => {
    onError('');
    onSuccess('');
    const prevPreferences = { ...preferences };
    const updatedPreferences = { ...preferences, [field]: value };
    setPreferences(updatedPreferences);

    try {
      await settingsAPI.updatePreferences({
        [field]: value,
      });
      onSuccess('Preferences updated');
      setTimeout(() => onSuccess(''), 3000);

      if (field === 'theme') {
        document.documentElement.setAttribute('data-theme', value);
      }
    } catch (err) {
      onError(err.response?.data?.message || 'Failed to update preferences');
      setPreferences(prevPreferences);
    }
  };

  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>App Preferences</h2>
      <p className={styles.sectionDesc}>Customize your app experience</p>
      
      <div className={styles.settingsList}>
        <SettingItem
          title="Theme"
          description="Choose your preferred theme"
        >
          <select 
            className={styles.select}
            value={preferences.theme}
            onChange={(e) => handlePreferenceChange('theme', e.target.value)}
          >
            <option value="dark">Dark</option>
            <option value="light">Light</option>
            <option value="auto">Auto</option>
          </select>
        </SettingItem>

        <SettingItem
          title="Language"
          description="Select your preferred language"
        >
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
        </SettingItem>

        <SettingItem
          title="Audio Quality"
          description="Choose streaming quality"
        >
          <select 
            className={styles.select}
            value={preferences.audioQuality}
            onChange={(e) => handlePreferenceChange('audioQuality', e.target.value)}
          >
            <option value="high">High (320kbps)</option>
            <option value="normal">Normal (160kbps)</option>
            <option value="low">Low (96kbps)</option>
          </select>
        </SettingItem>

        <SettingItem
          title="Explicit Content"
          description="Filter explicit content"
        >
          <label className={styles.switch}>
            <input 
              type="checkbox" 
              checked={preferences.explicitContent}
              onChange={(e) => handlePreferenceChange('explicitContent', e.target.checked)}
            />
            <span className={styles.slider}></span>
          </label>
        </SettingItem>
      </div>
    </div>
  );
};

export default PreferencesTab;
