import styles from '../Settings.module.css';

const MessageBanner = ({ type, message, onClose }) => {
  if (!message) return null;

  const className = type === 'error' ? styles.errorMessage : styles.successMessage;

  return (
    <div className={className}>
      {message}
      {onClose && (
        <button onClick={onClose} className={styles.closeBtn}>✕</button>
      )}
    </div>
  );
};

export default MessageBanner;
