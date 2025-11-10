import styles from '../Settings.module.css';

const SettingItem = ({ title, description, children }) => {
  return (
    <div className={styles.settingItem}>
      <div className={styles.settingInfo}>
        <h3 className={styles.settingTitle}>{title}</h3>
        <p className={styles.settingDesc}>{description}</p>
      </div>
      {children}
    </div>
  );
};

export default SettingItem;
