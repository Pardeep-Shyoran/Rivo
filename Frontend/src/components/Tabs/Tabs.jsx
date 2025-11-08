import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import styles from './Tabs.module.css';

const Tabs = ({ tabs, defaultTab, activeTab: controlledActiveTab, onTabChange, className }) => {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultTab || tabs[0]?.id);

  // Use controlled activeTab if provided, otherwise use internal state
  const activeTab = controlledActiveTab !== undefined ? controlledActiveTab : internalActiveTab;

  // Sync internal state when controlled activeTab changes
  useEffect(() => {
    if (controlledActiveTab !== undefined) {
      setInternalActiveTab(controlledActiveTab);
    }
  }, [controlledActiveTab]);

  const handleTabClick = (tabId) => {
    if (controlledActiveTab === undefined) {
      setInternalActiveTab(tabId);
    }
    if (onTabChange) {
      onTabChange(tabId);
    }
  };

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={`${styles.tabsContainer} ${className || ''}`}>
      {/* Tab Headers */}
      <div className={styles.tabsHeader}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`${styles.tab} ${activeTab === tab.id ? styles.activeTab : ''}`}
            onClick={() => handleTabClick(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTabContent}
      </div>
    </div>
  );
};

Tabs.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      content: PropTypes.node.isRequired,
    })
  ).isRequired,
  defaultTab: PropTypes.string,
  activeTab: PropTypes.string,
  onTabChange: PropTypes.func,
  className: PropTypes.string,
};

export default Tabs;
