import styles from './Loader.module.css';

const Loader = ({ message = 'Loading...', inline = false }) => (
  <div className={inline ? styles.loaderInline : styles.loaderOverlay}>
    <div className={styles.loaderSpinner}></div>
    <span className={styles.loaderText}>{message}</span>
  </div>
);

export default Loader;
