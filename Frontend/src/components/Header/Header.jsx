import { useEffect, useState } from "react";
import { useUser } from "../../contexts/useUser.js";
import axios from "../../api/axiosAuthConfig.jsx";
import styles from "./Header.module.css";
import Logo from "../Logo/Logo";
import NavBar from "../NavBar/NavBar";
import { useNavigate } from "react-router-dom";

const ChevronIcon = ({ collapsed }) => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    className={collapsed ? styles.chevronRotated : ""}
  >
    <path
      d="M9 18l6-6-6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const LogoutIcon = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    aria-hidden="true"
  >
    <path
      d="M14 7V5a2 2 0 0 0-2-2H5v18h7a2 2 0 0 0 2-2v-2M17 12H7m10 0l-3-3m3 3l-3 3"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Header = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const navigate = useNavigate();
  const { user, loading, setUser, setToken } = useUser();

  // Reflect collapsed state to the document for layout adjustments
  useEffect(() => {
    const html = document.documentElement;
    html.setAttribute("data-sidebar", collapsed ? "collapsed" : "expanded");
  }, [collapsed]);

  // Detect mobile viewport and handle changes
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 768px)");
    const onChange = (e) => setIsMobile(e.matches);
    onChange(mq);
    if (mq.addEventListener) mq.addEventListener("change", onChange);
    else mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener("change", onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  // Close drawer when switching to desktop
  useEffect(() => {
    if (!isMobile) setMobileOpen(false);
  }, [isMobile]);

  // Allow closing with Escape on mobile
  useEffect(() => {
    if (!isMobile || !mobileOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isMobile, mobileOpen]);

  // Prevent background scroll when drawer is open on mobile
  useEffect(() => {
    if (!isMobile) return;
    const { body } = document;
    const prev = body.style.overflow;
    body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      body.style.overflow = prev;
    };
  }, [isMobile, mobileOpen]);

  const asideClass = [
    styles.sidebar,
    collapsed ? styles.collapsed : "",
    isMobile ? styles.mobile : "",
    isMobile && mobileOpen ? styles.mobileOpen : "",
  ]
    .filter(Boolean)
    .join(" ");

  const [avatarError, setAvatarError] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post("/api/auth/logout");
      try { localStorage.removeItem('rivo_jwt'); } catch { /* ignore */ }
      // Clear in-memory token from UserContext
      setUser(null);
      setToken(null);
      // Reload the page to clear user context and redirect
      navigate(0);
    } catch (error) {
      console.error("Logout failed:", error);
      // Ensure legacy token is removed even if server call fails
      try { localStorage.removeItem('rivo_jwt'); } catch { /* ignore */ }
      // Still clear context and reload on error
      setUser(null);
      setToken(null);
      navigate(0);
    }
  };

  // Generate avatar URL based on user name with better quality
  const avatarUrl = user?.fullName
    ? `https://ui-avatars.com/api/?name=${encodeURIComponent(
        `${user.fullName.firstName} ${user.fullName.lastName}`
      )}&background=6366f1&color=fff&size=128&bold=true&rounded=true&font-size=0.4`
    : "https://ui-avatars.com/api/?name=R+User&background=6366f1&color=fff&size=128&bold=true&rounded=true&font-size=0.4";

  const handleAvatarError = () => {
    setAvatarError(true);
  };

  // Reset error state when user changes
  useEffect(() => {
    setAvatarError(false);
  }, [user]);

  return (
    <>
      {isMobile && (
        <button
          type="button"
          className={styles.mobileToggleBtn}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          onClick={() => setMobileOpen((v) => !v)}
        >
          {!mobileOpen ? (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 7h16M4 12h16M4 17h16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M6 6l12 12M18 6L6 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </button>
      )}
      {isMobile && mobileOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setMobileOpen(false)}
          aria-hidden="true"
        />
      )}
      <aside
        className={asideClass}
        aria-label="Main navigation"
        aria-hidden={isMobile && !mobileOpen ? "true" : undefined}
      >
        <div className={styles.logoWrap}>
          <div className={styles.logoRow}>
            <Logo collapsed={collapsed} />
            <button
              type="button"
              className={styles.collapseBtn}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={collapsed ? "Expand" : "Collapse"}
              onClick={() =>
                isMobile ? setMobileOpen(false) : setCollapsed((v) => !v)
              }
            >
              <ChevronIcon collapsed={collapsed} />
            </button>
          </div>
        </div>
        <NavBar collapsed={collapsed} />
        <div className={styles.bottomSection}>
          {/* Logout button - only shown for authenticated users */}
          {user && (
            <button
              onClick={handleLogout}
              className={`${styles.logoutBtn} ${
                collapsed ? styles.collapsed : ""
              }`}
              aria-label="Logout"
              title="Logout"
              type="button"
            >
              <LogoutIcon />
              {!collapsed && <span className={styles.logoutLabel}>Logout</span>}
            </button>
          )}

          <div className={styles.profileSection}>
            <div className={styles.avatarWrapper}>
              <div className={styles.avatar} aria-label="User profile">
                {avatarError ? (
                  <div className={styles.avatarFallback}>
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                ) : (
                  <img
                    src={avatarUrl}
                    alt={
                      user?.fullName
                        ? `${user.fullName.firstName} ${user.fullName.lastName}`
                        : "User Avatar"
                    }
                    onError={handleAvatarError}
                    loading="lazy"
                  />
                )}
              </div>
            </div>
            {!collapsed && (
              <div className={styles.profileInfo}>
                <span className={styles.profileName}>
                  {loading
                    ? "Loading..."
                    : user?.fullName
                    ? `${user.fullName.firstName} ${user.fullName.lastName}`
                    : "Rivo User"}
                </span>
                <span className={styles.profileRole}>
                  {loading ? "" : user?.role || "Listener"}
                </span>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Header;
