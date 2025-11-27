import PropTypes from 'prop-types';

const Sparkline = ({ data = [], stroke = 'var(--primary-color)', width = 120, height = 32 }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <svg width={width} height={height} aria-hidden="true" />
    );
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);
  const points = data
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / range) * height;
      return `${x},${y}`;
    })
    .join(' ');

  const last = data[data.length - 1];
  const first = data[0];
  const trendUp = last >= first;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label="trend sparkline">
      <polyline
        points={points}
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        style={{ filter: 'drop-shadow(0 0 4px rgba(0,0,0,0.25))' }}
      />
      {trendUp ? (
        <circle cx={width - 4} cy={4} r={3} fill="var(--secondary-color)" />
      ) : (
        <circle cx={width - 4} cy={height - 4} r={3} fill="#ef4444" />
      )}
    </svg>
  );
};

Sparkline.propTypes = {
  data: PropTypes.arrayOf(PropTypes.number),
  stroke: PropTypes.string,
  width: PropTypes.number,
  height: PropTypes.number,
};

export default Sparkline;