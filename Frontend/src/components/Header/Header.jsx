import { useEffect, useState } from 'react'
import styles from './Header.module.css'
import Logo from '../Logo/Logo'
import NavBar from '../NavBar/NavBar'

const ChevronIcon = ({ collapsed }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={collapsed ? styles.chevronRotated : ''}
  >
    <path d="M9 18l6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

const Header = () => {
  const [collapsed, setCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

  // Reflect collapsed state to the document for layout adjustments
  useEffect(() => {
    const html = document.documentElement
    html.setAttribute('data-sidebar', collapsed ? 'collapsed' : 'expanded')
  }, [collapsed])

  // Detect mobile viewport and handle changes
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 768px)')
    const onChange = (e) => setIsMobile(e.matches)
    onChange(mq)
    if (mq.addEventListener) mq.addEventListener('change', onChange)
    else mq.addListener(onChange)
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange)
      else mq.removeListener(onChange)
    }
  }, [])

  // Close drawer when switching to desktop
  useEffect(() => {
    if (!isMobile) setMobileOpen(false)
  }, [isMobile])

  // Allow closing with Escape on mobile
  useEffect(() => {
    if (!isMobile || !mobileOpen) return
    const onKey = (e) => { if (e.key === 'Escape') setMobileOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isMobile, mobileOpen])

  // Prevent background scroll when drawer is open on mobile
  useEffect(() => {
    if (!isMobile) return
    const { body } = document
    const prev = body.style.overflow
    body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { body.style.overflow = prev }
  }, [isMobile, mobileOpen])

  const asideClass = [
    styles.sidebar,
    collapsed ? styles.collapsed : '',
    isMobile ? styles.mobile : '',
    isMobile && mobileOpen ? styles.mobileOpen : '',
  ].filter(Boolean).join(' ')

  return (
    <>
    {isMobile && (
      <button
        type="button"
        className={styles.mobileToggleBtn}
        aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        onClick={() => setMobileOpen((v) => !v)}
      >
        {!mobileOpen ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        ) : (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        )}
      </button>
    )}
    {isMobile && mobileOpen && (
      <div className={styles.backdrop} onClick={() => setMobileOpen(false)} aria-hidden="true" />
    )}
    <aside className={asideClass} aria-label="Main navigation" aria-hidden={isMobile && !mobileOpen ? 'true' : undefined}>
      <div className={styles.logoWrap}>
        <div className={styles.logoRow}>
          <Logo collapsed={collapsed} />
          <button
            type="button"
            className={styles.collapseBtn}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            title={collapsed ? 'Expand' : 'Collapse'}
            onClick={() => (isMobile ? setMobileOpen(false) : setCollapsed((v) => !v))}
          >
            <ChevronIcon collapsed={collapsed} />
          </button>
        </div>
      </div>
      <NavBar collapsed={collapsed} />
      <div className={styles.profileSection}>
        <div className={styles.avatar} aria-label="User profile">
          <img src="https://ui-avatars.com/api/?name=R+User&background=6366f1&color=fff&size=64" alt="User Avatar" />
        </div>
        {!collapsed && <div className={styles.profileInfo}>
          <span className={styles.profileName}>Rivo User</span>
          <span className={styles.profileRole}>Listener</span>
        </div>}
      </div>
    </aside>
    </>
  )
}

export default Header