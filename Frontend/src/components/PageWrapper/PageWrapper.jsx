import { useMusicPlayer } from '../../contexts/useMusicPlayer';
import styles from './PageWrapper.module.css';

const PageWrapper = ({ children, className = '' }) => {
  const { currentMusic } = useMusicPlayer();
  
  return (
    <div className={`${styles.pageWrapper} ${currentMusic ? styles.withPlayer : ''} ${className}`}>
      {children}
    </div>
  );
};

export default PageWrapper;
