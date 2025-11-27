import PropTypes from 'prop-types';

// Simple horizontal bar chart for categorical counts
const BarChart = ({ data = [], width = 320, height = 140, barColor = 'var(--secondary-color)', label = 'Bar chart' }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return <svg width={width} height={height} aria-hidden="true" />;
  }

  const max = Math.max(...data.map(d => d.value));
  const barHeight = (height - 20) / data.length;

  return (
    <svg width={width} height={height} role="img" aria-label={label}>
      {data.map((d, i) => {
        const y = 10 + i * barHeight;
        const w = (d.value / (max || 1)) * (width - 80);
        return (
          <g key={d.label}>
            <rect x={70} y={y} width={w} height={barHeight * 0.6} rx={6} fill={barColor} />
            <text x={4} y={y + barHeight * 0.4} fontSize={11} fill="var(--text-color)" fontWeight="600">{d.label}</text>
            <text x={70 + w + 6} y={y + barHeight * 0.4} fontSize={11} fill="var(--text-color2)" fontWeight="600">{d.value}</text>
          </g>
        );
      })}
    </svg>
  );
};

BarChart.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    })
  ),
  width: PropTypes.number,
  height: PropTypes.number,
  barColor: PropTypes.string,
  label: PropTypes.string,
};

export default BarChart;