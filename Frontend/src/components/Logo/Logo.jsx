import styles from './Logo.module.css'

const Logo = ({ collapsed = false }) => {
  return (
    <div className={`${styles.logo} ${collapsed ? styles.compact : ''}`} aria-label="Rivo">
      <span className={styles.brandMark}>R</span>
      {!collapsed && <span className={styles.brandText}>Rivo</span>}
    </div>
  )
}

export default Logo