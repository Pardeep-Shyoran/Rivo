import { useState } from 'react';
import * as settingsAPI from '../../../api/settingsAPI';
import styles from '../Settings.module.css';

const SecurityTab = ({ formData, setFormData, onSuccess, onError }) => {
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    onError('');
    onSuccess('');

    if (formData.newPassword !== formData.confirmPassword) {
      onError('New passwords do not match');
      setLoading(false);
      return;
    }

    if (formData.newPassword.length < 6) {
      onError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    try {
      const response = await settingsAPI.updatePassword({
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword,
      });

      onSuccess(response.message);
      
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
    } catch (err) {
      onError(err.response?.data?.message || 'Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
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
  );
};

export default SecurityTab;
