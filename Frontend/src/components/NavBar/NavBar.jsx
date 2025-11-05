import { NavLink } from 'react-router-dom'
import styles from './NavBar.module.css'

// Inline SVG icons to avoid extra dependencies
const HomeIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3 10.5l9-7 9 7V20a2 2 0 0 1-2 2h-4v-7H9v7H5a2 2 0 0 1-2-2v-9.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
  </svg>
)
const DashboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3 3h8v8H3V3Zm10 0h8v5h-8V3ZM13 10h8v11h-8V10ZM3 13h8v8H3v-8Z" fill="currentColor"/>
  </svg>
)
const UploadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 16V4m0 0l-4 4m4-4l4 4M4 20h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const PlaylistIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3 6h14M3 10h14M3 14h8M18 8v8a3 3 0 1 0 0-6Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const LoginIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M10 7V5a2 2 0 0 1 2-2h7v18h-7a2 2 0 0 1-2-2v-2M7 12h12M7 12l3-3m-3 3l3 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
)
const RegisterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 12a5 5 0 1 0-5-5 5 5 0 0 0 5 5Zm0 2c-4.418 0-8 2.239-8 5v1h16v-1c0-2.761-3.582-5-8-5Zm6.5-2v2h2v2h-2v2h-2v-2h-2v-2h2v-2Z" fill="currentColor"/>
  </svg>
)

const routes = [
  { to: '/', label: 'Home', icon: HomeIcon },
  { to: '/artist/dashboard', label: 'Artist Dashboard', icon: DashboardIcon },
  { to: '/artist/upload', label: 'Upload Music', icon: UploadIcon },
  { to: '/artist/create-playlist', label: 'Create Playlist', icon: PlaylistIcon },
  { to: '/login', label: 'Login', icon: LoginIcon },
  { to: '/register', label: 'Register', icon: RegisterIcon },
]

const NavBar = ({ collapsed = false }) => {
  return (
    <nav className={`${styles.navBar} ${collapsed ? styles.collapsed : ''}`} aria-label="Primary">
      <ul className={styles.navList}>
        {routes.map(({ to, label, icon }) => (
          <li key={to} className={styles.navItem}>
            <NavLink
              to={to}
              className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
              end={to === '/'}
              aria-label={label}
              title={collapsed ? label : undefined}
            >
              {icon()}
              {!collapsed && <span className={styles.label}>{label}</span>}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export default NavBar