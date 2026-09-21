// Gauge SVG de 270° estilo velocímetro — arco relleno proporcional a score/maxScore.
// El color y el valor animado se pasan desde el padre (ver useCountUp).
export default function ScoreGauge({ score, maxScore = 1000, color }) {
  const R = 52, C = 65;
  const circ = 2 * Math.PI * R;
  const arc  = circ * (270 / 360);
  const fill = arc  * (score / maxScore);
  return (
    <svg width="130" height="130" viewBox="0 0 130 130">
      <circle cx={C} cy={C} r={R} fill="none" stroke="#ECEAE7" strokeWidth="9"
        strokeDasharray={`${arc} ${circ - arc}`} strokeLinecap="round"
        transform={`rotate(135 ${C} ${C})`} />
      <circle cx={C} cy={C} r={R} fill="none" stroke={color} strokeWidth="9"
        strokeDasharray={`${fill} ${circ - fill}`} strokeLinecap="round"
        transform={`rotate(135 ${C} ${C})`} />
    </svg>
  );
}
