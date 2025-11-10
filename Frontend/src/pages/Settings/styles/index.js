/**
 * Styles Index
 * Central export point for all Settings CSS modules
 * 
 * Usage:
 * import styles from './styles';
 * 
 * This provides access to all style modules through a single import
 */

// Main settings styles (includes all imports)
export { default } from './Settings.module.css';

// Individual modules (for direct access if needed)
export { default as variables } from './variables.module.css';
export { default as messageBanner } from './MessageBanner.module.css';
export { default as sidebar } from './Sidebar.module.css';
export { default as forms } from './Forms.module.css';
export { default as avatar } from './Avatar.module.css';
export { default as settingItem } from './SettingItem.module.css';
export { default as utilities } from './Utilities.module.css';
