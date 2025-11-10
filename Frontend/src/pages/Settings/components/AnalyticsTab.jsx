import SettingItem from './SettingItem';
import styles from '../Settings.module.css';

const AnalyticsTab = () => {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Analytics Preferences</h2>
      <p className={styles.sectionDesc}>Configure your analytics and insights settings</p>
      
      <div className={styles.settingsList}>
        <SettingItem
          title="Email Reports"
          description="Receive weekly performance reports via email"
        >
          <label className={styles.switch}>
            <input type="checkbox" defaultChecked />
            <span className={styles.slider}></span>
          </label>
        </SettingItem>

        <SettingItem
          title="Public Stats"
          description="Show play counts on your profile"
        >
          <label className={styles.switch}>
            <input type="checkbox" defaultChecked />
            <span className={styles.slider}></span>
          </label>
        </SettingItem>
      </div>
    </div>
  );
};

export default AnalyticsTab;
