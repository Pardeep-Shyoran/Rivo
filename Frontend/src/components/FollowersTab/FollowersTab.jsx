import PropTypes from 'prop-types';
import EmptyState from '../EmptyState/EmptyState';
import Loader from '../Loader/Loader';
import styles from './FollowersTab.module.css';

const formatDate = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const shortenId = (value) => {
  if (typeof value !== 'string') {
    return '';
  }

  const trimmed = value.trim();

  if (trimmed.length <= 12) {
    return trimmed;
  }

  return `${trimmed.slice(0, 6)}...${trimmed.slice(-4)}`;
};

const getInitial = (name) => {
  if (typeof name !== 'string') {
    return '?';
  }

  const trimmed = name.trim();

  if (!trimmed) {
    return '?';
  }

  return trimmed.charAt(0).toUpperCase();
};

const FollowersTab = ({ followers = [], isLoading = false }) => {
  if (isLoading) {
    return <Loader message="Loading followers..." inline />;
  }

  console.log(followers);
  

  if (!followers.length) {
    return (
      <EmptyState
        icon="👥"
        title="No followers yet"
        description="Keep sharing your music to grow your audience."
      />
    );
  }

  return (
    <div className={styles.followersList}>

      {followers.map((follower, index) => {
        const displayName = follower.listenerName?.trim() || 'Unknown listener';
        const joinedOn = formatDate(follower.followedAt);
        const listenerId = follower.listenerId?.toString?.() || '';
        const key = follower.id?.toString?.() || listenerId || `follower-${index}`;

        return (
          <div key={key} className={styles.followerCard}>
            <div className={styles.avatar}>{getInitial(displayName)}</div>
            <div className={styles.followerInfo}>
              <p className={styles.followerName}>{displayName}</p>
              <p className={styles.followerMeta}>
                {joinedOn ? `Followed on ${joinedOn}` : 'Follow date unavailable'}
                {listenerId ? ` · ID ${shortenId(listenerId)}` : ''}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};

FollowersTab.propTypes = {
  followers: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      listenerId: PropTypes.string,
      listenerName: PropTypes.string,
      followedAt: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.instanceOf(Date),
      ]),
    })
  ),
  isLoading: PropTypes.bool,
};

export default FollowersTab;
