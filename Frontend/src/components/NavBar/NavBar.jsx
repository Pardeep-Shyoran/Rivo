import { NavLink } from 'react-router-dom'
import { useUser } from '../../contexts/useUser'
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
const ListenerDashboardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" fill="currentColor"/>
  </svg>
)
const SettingsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.488.488 0 0 0-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94L14.4 2.81a.488.488 0 0 0-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" fill="currentColor"/>
  </svg>
)
const AnalyticsIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path d="M3 3h2v18H3V3Zm16 8h2v10h-2V11ZM11 7h2v14h-2V7Zm-4 6h2v8H7v-8Zm8-4h2v12h-2V9Z" fill="currentColor" />
  </svg>
)

const allRoutes = [
  { to: '/', label: 'Home', icon: HomeIcon, requiresAuth: false, publicOnly: false, requiredRole: null },
  { to: '/listener/dashboard', label: 'Dashboard', icon: ListenerDashboardIcon, requiresAuth: true, publicOnly: false, requiredRole: 'listener' },
  { to: '/listener/create-playlist', label: 'Create Playlist', icon: PlaylistIcon, requiresAuth: true, publicOnly: false, requiredRole: 'listener' },
  { to: '/artist/dashboard', label: 'Artist Dashboard', icon: DashboardIcon, requiresAuth: true, publicOnly: false, requiredRole: 'artist' },
  { to: '/artist/analytics', label: 'Analytics', icon: AnalyticsIcon, requiresAuth: true, publicOnly: false, requiredRole: 'artist' },
  { to: '/artist/upload', label: 'Upload Music', icon: UploadIcon, requiresAuth: true, publicOnly: false, requiredRole: 'artist' },
  { to: '/artist/create-playlist', label: 'Create Playlist', icon: PlaylistIcon, requiresAuth: true, publicOnly: false, requiredRole: 'artist' },
  { to: '/settings', label: 'Settings', icon: SettingsIcon, requiresAuth: true, publicOnly: false, requiredRole: null },
  { to: '/login', label: 'Login', icon: LoginIcon, requiresAuth: false, publicOnly: true, requiredRole: null },
  { to: '/register', label: 'Register', icon: RegisterIcon, requiresAuth: false, publicOnly: true, requiredRole: null },
]

const NavBar = ({ collapsed = false }) => {
  const { user } = useUser();

  // Filter routes based on authentication status and role
  const visibleRoutes = allRoutes.filter(route => {
    // If route is public only (login/register), hide when user is logged in
    if (route.publicOnly && user) {
      return false;
    }
    
    // If route requires authentication, hide when user is not logged in
    if (route.requiresAuth && !user) {
      return false;
    }
    
    // If route requires specific role, check if user has that role
    if (route.requiredRole && (!user || user.role !== route.requiredRole)) {
      return false;
    }
    
    return true;
  });

  return (
    <nav className={`${styles.navBar} ${collapsed ? styles.collapsed : ''}`} aria-label="Primary">
      <ul className={styles.navList}>
        {visibleRoutes.map(({ to, label, icon }) => (
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