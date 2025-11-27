import PropTypes from 'prop-types';

// Simple responsive SVG line chart with axes & gradient fill (optional)
const LineChart = ({ data = [], width = 320, height = 140, stroke = 'var(--primary-color)', fill = 'rgba(79,70,229,0.15)', yTicks = 4, smooth = true, label = 'Line chart' }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return <svg width={width} height={height} aria-hidden="true" />;
  }

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);

  const points = data.map((v, i) => {
    const x = i * stepX;
    const y = height - ((v - min) / range) * (height - 20) - 10; // padding top/bottom
    return { x, y };
  });

  const d = points
    .map((p, i) => {
      if (i === 0) return `M ${p.x} ${p.y}`;
      if (!smooth) return `L ${p.x} ${p.y}`;
      const prev = points[i - 1];
      const midX = (prev.x + p.x) / 2;
      return `Q ${prev.x} ${prev.y} ${midX} ${(prev.y + p.y) / 2} T ${p.x} ${p.y}`;
    })
    .join(' ');

  const areaPath = `${d} L ${points[points.length - 1].x} ${height} L 0 ${height} Z`;

  const ticks = Array.from({ length: yTicks + 1 }, (_, i) => {
    const value = min + (range * i) / yTicks;
    const y = height - ((value - min) / range) * (height - 20) - 10;
    return { y, value };
  });

  return (
    <svg width={width} height={height} role="img" aria-label={label}>
      <defs>
        <linearGradient id="lineGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={fill} />
          <stop offset="100%" stopColor="transparent" />
        </linearGradient>
      </defs>
      {/* Y axis grid */}
      {ticks.map((t, i) => (
        <g key={i}>
          <line x1={0} x2={width} y1={t.y} y2={t.y} stroke="var(--border-color)" strokeWidth={1} />
          <text x={4} y={t.y - 4} fontSize={11} fill="var(--text-color)" fontWeight="500">{Math.round(t.value)}</text>
        </g>
      ))}
      {/* Area fill */}
      <path d={areaPath} fill="url(#lineGradient)" />
      {/* Line stroke */}
      <path d={d} fill="none" stroke={stroke} strokeWidth={2.2} strokeLinecap="round" />
      {/* Last point marker */}
      {points.length > 0 && (
        <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r={4} fill={stroke} stroke="#fff" strokeWidth={1} />
      )}
    </svg>
  );
};

LineChart.propTypes = {
  data: PropTypes.arrayOf(PropTypes.number),
  width: PropTypes.number,
  height: PropTypes.number,
  stroke: PropTypes.string,
  fill: PropTypes.string,
  yTicks: PropTypes.number,
  smooth: PropTypes.bool,
  label: PropTypes.string,
};

export default LineChart;