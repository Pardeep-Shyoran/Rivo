import styles from './StatCard.module.css';

const StatCard = ({ icon, value, label }) => {
  return (
    <div className={styles.statCard}>
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statInfo}>
        <h3 className={styles.statValue}>{value}</h3>
        <p className={styles.statLabel}>{label}</p>
      </div>
    </div>
  );
};

export default StatCard;
