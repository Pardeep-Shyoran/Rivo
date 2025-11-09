import styles from './StatCard.module.css';

const StatCard = ({ icon, value, label, onClick }) => {
  const clickable = typeof onClick === 'function';
  return (
    <div
      className={styles.statCard}
      onClick={onClick}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      aria-pressed={undefined}
      aria-label={clickable ? `View ${label}` : undefined}
    >
      <div className={styles.statIcon}>{icon}</div>
      <div className={styles.statInfo}>
        <h3 className={styles.statValue}>{value}</h3>
        <p className={styles.statLabel}>{label}</p>
      </div>
    </div>
  );
};

export default StatCard;
