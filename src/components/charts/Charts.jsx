// ── Gráficos SVG compartidos entre portales ──────────────────────────────────
// Extraídos del Dashboard de admin para reutilizarlos en el portal del Banco
// Fondeador sin duplicar el código.

function bezierLine(pts) {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0]},${pts[0][1]}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i], p2 = pts[i + 1];
    const p3 = pts[Math.min(pts.length - 1, i + 2)];
    const cp1 = [p1[0] + (p2[0] - p0[0]) / 4, p1[1] + (p2[1] - p0[1]) / 4];
    const cp2 = [p2[0] - (p3[0] - p1[0]) / 4, p2[1] - (p3[1] - p1[1]) / 4];
    d += ` C${cp1[0].toFixed(1)},${cp1[1].toFixed(1)} ${cp2[0].toFixed(1)},${cp2[1].toFixed(1)} ${p2[0]},${p2[1]}`;
  }
  return d;
}

export function LineChart({ id, data, color = '#ef7a2c', xKey = 'mes', yKey = 'monto', unit = 'M', h = 180 }) {
  const W = 500, H = h, PL = 48, PR = 20, PT = 24, PB = 34;
  const cW = W - PL - PR, cH = H - PT - PB;
  const vals = data.map(d => d[yKey]);
  const maxV = Math.max(...vals) * 1.18;
  const pts = data.map((d, i) => [PL + (i / (data.length - 1)) * cW, PT + cH - (d[yKey] / maxV) * cH]);
  const linePath = bezierLine(pts);
  const areaPath = `${linePath} L${pts[pts.length - 1][0]},${PT + cH} L${pts[0][0]},${PT + cH}Z`;
  const gId = `lg-${id}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      <defs>
        <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.18" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map(p => (
        <line key={p} x1={PL} y1={PT + cH * (1 - p)} x2={W - PR} y2={PT + cH * (1 - p)} stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
      ))}
      <path d={areaPath} fill={`url(#${gId})`} />
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {pts.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="5" fill={color} stroke="white" strokeWidth="2.5" />
          <text x={x} y={y - 12} textAnchor="middle" fontSize="9.5" fontWeight="700" fill={color} fontFamily="Poppins,sans-serif">{data[i][yKey]}{unit}</text>
        </g>
      ))}
      {data.map((d, i) => (
        <text key={i} x={PL + (i / (data.length - 1)) * cW} y={H - 10} textAnchor="middle" fontSize="10" fill="#9CA3AF" fontFamily="Poppins,sans-serif">{d[xKey]}</text>
      ))}
      {[0, 0.5, 1].map(p => (
        <text key={p} x={PL - 5} y={PT + cH * (1 - p) + 4} textAnchor="end" fontSize="9" fill="#9CA3AF" fontFamily="Poppins,sans-serif">{Math.round(maxV * p)}{unit}</text>
      ))}
    </svg>
  );
}

export function DonutChart({ data, centerLabel, centerSub, size = 130 }) {
  const r = 40, cx = 55, cy = 55, circ = 2 * Math.PI * r;
  const segs = data.reduce(({ segs, total }, d) => {
    const dash = (d.pct / 100) * circ;
    return { segs: [...segs, { ...d, dash, off: -total }], total: total + dash };
  }, { segs: [], total: 0 }).segs;
  return (
    <svg viewBox="0 0 110 110" style={{ width: size, height: size, flexShrink: 0 }}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#F0F0F0" strokeWidth="13" />
      {segs.map((s, i) => (
        <circle key={i} cx={cx} cy={cy} r={r} fill="none" stroke={s.color} strokeWidth="13"
          strokeDasharray={`${s.dash} ${circ - s.dash}`} strokeDashoffset={s.off} strokeLinecap="round"
          style={{ transform: 'rotate(-90deg)', transformOrigin: `${cx}px ${cy}px` }} />
      ))}
      {centerLabel && <text x={cx} y={cy - 4} textAnchor="middle" fontSize="14" fontWeight="800" fill="#1a1a1a" fontFamily="Poppins,sans-serif">{centerLabel}</text>}
      {centerSub && <text x={cx} y={cy + 11} textAnchor="middle" fontSize="9" fill="#9CA3AF" fontFamily="Poppins,sans-serif">{centerSub}</text>}
    </svg>
  );
}

export function VBarChart({ id, data, h = 170 }) {
  const W = 420, H = h, PL = 32, PR = 12, PT = 28, PB = 32;
  const cW = W - PL - PR, cH = H - PT - PB;
  const maxV = Math.max(...data.map(d => d.value)) * 1.12;
  const slot = cW / data.length, bW = slot * 0.52;
  const gId = `vb-${id}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
      <defs>
        <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#ef7a2c" />
          <stop offset="100%" stopColor="#ef7a2c" stopOpacity="0.55" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map(p => (
        <line key={p} x1={PL} y1={PT + cH * (1 - p)} x2={W - PR} y2={PT + cH * (1 - p)} stroke="rgba(0,0,0,0.04)" strokeWidth="1" />
      ))}
      {data.map((d, i) => {
        const x = PL + slot * i + (slot - bW) / 2;
        const bH = (d.value / maxV) * cH;
        const y = PT + cH - bH;
        const fill = d.color ?? `url(#${gId})`;
        return (
          <g key={i}>
            <rect x={x} y={y} width={bW} height={bH} rx="5" fill={fill} opacity="0.88" />
            <text x={x + bW / 2} y={y - 6} textAnchor="middle" fontSize="10" fontWeight="700" fill={d.color ?? '#ef7a2c'} fontFamily="Poppins,sans-serif">{d.value}</text>
            <text x={x + bW / 2} y={H - 10} textAnchor="middle" fontSize="9" fill="#9CA3AF" fontFamily="Poppins,sans-serif">{d.label}</text>
          </g>
        );
      })}
    </svg>
  );
}

export function HBarChart({ data, fmtVal = v => `${v}M` }) {
  const maxVal = Math.max(...data.map(d => d.value));
  return (
    <div className="space-y-3.5">
      {data.map((d, i) => (
        <div key={i}>
          <div className="flex justify-between items-center mb-1.5">
            <span className="text-[12px] font-semibold text-text-2 truncate mr-2">{d.label}</span>
            <span className="text-[12px] font-bold shrink-0" style={{ color: d.color ?? '#ef7a2c' }}>{fmtVal(d.value)}</span>
          </div>
          <div className="h-3 bg-page-bg rounded-full overflow-hidden">
            <div className="h-full rounded-full" style={{ width: `${(d.value / maxVal) * 100}%`, background: d.color ?? '#ef7a2c' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
