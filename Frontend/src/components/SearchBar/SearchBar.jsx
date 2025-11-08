import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import styles from './SearchBar.module.css';

const SearchBar = ({ placeholder = "Search for songs, playlists, artists...", alwaysExpanded = false }) => {
  const [searchParams] = useSearchParams();
  const currentQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(currentQuery);
  const [isExpanded, setIsExpanded] = useState(alwaysExpanded);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  // Update search query when URL query changes
  useEffect(() => {
    setSearchQuery(currentQuery);
  }, [currentQuery]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsExpanded(false);
    }
  };

  const handleInputChange = (e) => {
    setSearchQuery(e.target.value);
  };

  return (
    <div 
      ref={searchRef} 
      className={`${styles.searchContainer} ${isExpanded || alwaysExpanded ? styles.expanded : ''} ${alwaysExpanded ? styles.alwaysExpanded : ''}`}
    >
      <form onSubmit={handleSearch} className={styles.searchForm}>
        <button 
          type="button" 
          className={styles.searchIcon}
          onClick={() => !alwaysExpanded && setIsExpanded(true)}
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
        </button>
        <input
          type="text"
          value={searchQuery}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={styles.searchInput}
          onFocus={() => !alwaysExpanded && setIsExpanded(true)}
        />
        {searchQuery && (
          <button
            type="button"
            className={styles.clearButton}
            onClick={() => setSearchQuery('')}
          >
            ×
          </button>
        )}
      </form>
    </div>
  );
};

export default SearchBar;
