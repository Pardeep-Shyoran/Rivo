import SettingItem from './SettingItem';
import styles from '../Settings.module.css';

const PaymentsTab = () => {
  return (
    <div className={styles.section}>
      <h2 className={styles.sectionTitle}>Payment Settings</h2>
      <p className={styles.sectionDesc}>Manage your payment methods and payout preferences</p>
      
      <div className={styles.infoBox}>
        <p>💡 Payment integration coming soon! Set up your bank account to receive payouts from your music streams.</p>
      </div>

      <div className={styles.settingsList}>
        <SettingItem
          title="Payout Method"
          description="Bank Transfer (Not configured)"
        >
          <button className={styles.secondaryBtn}>Configure</button>
        </SettingItem>

        <SettingItem
          title="Payout Schedule"
          description="Monthly automatic payouts"
        >
          <select className={styles.select}>
            <option value="monthly">Monthly</option>
            <option value="quarterly">Quarterly</option>
          </select>
        </SettingItem>
      </div>
    </div>
  );
};

export default PaymentsTab;
