import styles from './EmptyState.module.css';

const EmptyState = ({ icon, title, description, buttonText, onButtonClick }) => {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIcon}>{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {buttonText && onButtonClick && (
        <button className={styles.emptyBtn} onClick={onButtonClick}>
          {buttonText}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
