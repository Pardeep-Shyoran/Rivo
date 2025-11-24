import styles from './Logo.module.css'

const Logo = ({ collapsed = false }) => {
  return (
    <div className={`${styles.logo} ${collapsed ? styles.compact : ''}`} aria-label="Rivo">
      {/* <span className={styles.brandMark}>R</span> */}
      <span className={styles.brandMark}>
        <img className={styles.brandImage} src="https://ik.imagekit.io/00zfvrear/profile-pictures/WhatsApp%20Image%202025-09-10%20at%2021.42.49.png" alt="" />
      </span>
      {!collapsed && <span className={styles.brandText}>Rivo</span>}
    </div>
  )
}

export default Logo