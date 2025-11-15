import styles from './StatCard.module.css';

const StatCard = ({ icon, value, label, onClick }) => {
  const clickable = typeof onClick === 'function';
  const cardClassName = `${styles.statCard} ${clickable ? styles.clickable : ''}`.trim();

  const handleKeyDown = (event) => {
    if (!clickable) {
      return;
    }

    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onClick();
    }
  };

  return (
    <div
      className={cardClassName}
      onClick={clickable ? onClick : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onKeyDown={handleKeyDown}
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
