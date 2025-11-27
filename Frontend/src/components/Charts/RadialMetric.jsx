import PropTypes from 'prop-types';

const RadialMetric = ({ value = 0, max = 100, size = 90, stroke = 'var(--primary-color)', label = 'Metric' }) => {
  const radius = (size - 12) / 2;
  const circumference = 2 * Math.PI * radius;
  const pct = Math.min(Math.max(value / max, 0), 1);
  const dash = pct * circumference;
  const remainder = circumference - dash;

  return (
    <div style={{ width: size, height: size, position: 'relative' }} aria-label={`${label} ${Math.round(pct * 100)}%`}>
      <svg width={size} height={size}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--text-color5)"
          strokeWidth="10"
          strokeDasharray={`${circumference}`}
          strokeDashoffset={0}
          opacity="0.25"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth="10"
          strokeDasharray={`${dash} ${remainder}`}
          strokeDashoffset={0}
          strokeLinecap="round"
          style={{ filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.25))' }}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div style={{position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', textAlign:'center'}}>
        <div style={{fontSize:'0.8rem', color:'var(--text-color5)'}}>{label}</div>
        <div style={{fontSize:'1rem', fontWeight:600}}>{Math.round(pct*100)}%</div>
      </div>
    </div>
  );
};

RadialMetric.propTypes = {
  value: PropTypes.number,
  max: PropTypes.number,
  size: PropTypes.number,
  stroke: PropTypes.string,
  label: PropTypes.string,
};

export default RadialMetric;