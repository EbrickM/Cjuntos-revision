// ── Gráficos SVG compartidos entre portales ──────────────────────────────────
// Extraídos del Dashboard de admin para reutilizarlos en el portal del Banco
// Fondeador sin duplicar el código.

import { useState, useRef } from 'react';

// ── ChartTooltip — DOM tooltip absolutamente posicionado ─────────────────────
export function ChartTooltip({ x, y, title, lines }) {
  return (
    <div style={{
      position: 'absolute',
      left: x + 14,
      top: Math.max(4, y - 16),
      background: '#fff',
      border: '1px solid #ECEAE7',
      borderRadius: 8,
      padding: '7px 11px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
      fontFamily: 'Poppins, sans-serif',
      fontSize: 11,
      whiteSpace: 'nowrap',
      zIndex: 20,
      pointerEvents: 'none',
    }}>
      <div style={{ fontWeight: 700, color: '#26262B', marginBottom: 5 }}>{title}</div>
      {lines.map((l, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: i < lines.length - 1 ? 3 : 0 }}>
          <div style={{ width: 7, height: 7, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
          <span style={{ color: '#5B5B5F', fontSize: 10 }}>{l.label}:</span>
          <span style={{ fontWeight: 700, color: l.color, fontSize: 10, marginLeft: 2 }}>{l.value}</span>
        </div>
      ))}
    </div>
  );
}

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

  const ref = useRef(null);
  const [tip, setTip] = useState(null);

  const handleMouseMove = (e) => {
    const bbox = ref.current ? ref.current.getBoundingClientRect() : null;
    if (!bbox) return;
    const relX = (e.clientX - bbox.left) / bbox.width;
    const svgX = relX * W;
    const rawCol = ((svgX - PL) / cW) * (data.length - 1);
    const col = Math.max(0, Math.min(data.length - 1, Math.round(rawCol)));
    setTip({ col, mouseX: e.clientX - bbox.left, mouseY: e.clientY - bbox.top });
  };

  const handleMouseLeave = () => setTip(null);

  const tipCol = tip !== null ? tip.col : null;

  return (
    <div ref={ref} className="relative w-full h-full">
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
        <path d={areaPath} fill={`url(#${gId})`} style={{ animation: 'fadeIn 0.5s ease 0.9s both' }} />
        <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ strokeDasharray: 3000, animation: 'lineDrawOn 1.1s ease-out both' }} />
        {tipCol !== null && (
          <line
            x1={pts[tipCol][0]} y1={PT}
            x2={pts[tipCol][0]} y2={PT + cH}
            stroke="rgba(0,0,0,0.15)" strokeWidth="1" strokeDasharray="4 3"
          />
        )}
        {pts.map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="5" fill={color} stroke="white" strokeWidth="2.5"
              style={{ animation: `dotFadeIn 0.35s ease ${i * 60}ms both`, transformOrigin: 'center' }} />
            <text x={x} y={y - 12} textAnchor="middle" fontSize="9.5" fontWeight="700" fill={color} fontFamily="Poppins,sans-serif">{data[i][yKey]}{unit}</text>
          </g>
        ))}
        {data.map((d, i) => (
          <text key={i} x={PL + (i / (data.length - 1)) * cW} y={H - 10} textAnchor="middle" fontSize="10" fill="#9CA3AF" fontFamily="Poppins,sans-serif">{d[xKey]}</text>
        ))}
        {[0, 0.5, 1].map(p => (
          <text key={p} x={PL - 5} y={PT + cH * (1 - p) + 4} textAnchor="end" fontSize="9" fill="#9CA3AF" fontFamily="Poppins,sans-serif">{Math.round(maxV * p)}{unit}</text>
        ))}
        <rect x={0} y={0} width={W} height={H} fill="transparent"
          onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} />
      </svg>
      {tip !== null && tipCol !== null && (
        <ChartTooltip
          x={tip.mouseX}
          y={tip.mouseY}
          title={data[tipCol][xKey]}
          lines={[{ label: yKey, value: `${data[tipCol][yKey]}${unit}`, color }]}
        />
      )}
    </div>
  );
}

// ── MultiLineChart — multi-series polyline chart ──────────────────────────────
export function MultiLineChart({ data, series, windowStart = 0, minValue = 0, h = 180, vbW = 560, pl = 56, pr = 16, pt = 14, pb = 28, fxSz = 11, fySz = 10, compact = false, tipFmt }) {
  const W = vbW, H = h, PL = pl, PR = pr, PT = pt, PB = pb;
  const cW = W - PL - PR, cH = H - PT - PB;
  const allVals = data.flatMap(d => series.map(s => d[s.key] || 0));
  const maxV = Math.max(...allVals) * 1.12;
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map(p => Math.round(maxV * p));
  const isIn = (key, i) => i >= windowStart && (data[i][key] || 0) >= minValue;
  const inWindow = i => i >= windowStart;
  const xPos = i => data.length > 1 ? PL + (i / (data.length - 1)) * cW : PL + cW / 2;
  const yPos = v => maxV > 0 ? PT + cH - (v / maxV) * cH : PT + cH;
  const fmt = tipFmt || (v => `${v}M`);

  const ref = useRef(null);
  const [tip, setTip] = useState(null);

  const handleMouseMove = (e) => {
    const bbox = ref.current ? ref.current.getBoundingClientRect() : null;
    if (!bbox) return;
    const relX = (e.clientX - bbox.left) / bbox.width;
    const svgX = relX * W;
    const rawCol = ((svgX - PL) / cW) * (data.length - 1);
    const col = Math.max(0, Math.min(data.length - 1, Math.round(rawCol)));
    setTip({ col, mouseX: e.clientX - bbox.left, mouseY: e.clientY - bbox.top });
  };

  const handleMouseLeave = () => setTip(null);

  const tipCol = tip !== null ? tip.col : null;

  return (
    <div ref={ref} className="relative w-full h-full">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-full">
        {yTicks.map(t => (
          <line key={t} x1={PL} y1={yPos(t)} x2={W - PR} y2={yPos(t)}
            stroke="rgba(0,0,0,0.04)" strokeWidth="1" />
        ))}
        {series.map((s, si) => {
          const segments = [];
          let current = [];
          data.forEach((d, i) => {
            if (isIn(s.key, i)) {
              current.push([xPos(i), yPos(d[s.key] || 0)]);
            } else if (current.length) {
              segments.push(current);
              current = [];
            }
          });
          if (current.length) segments.push(current);
          return segments.map((seg, segI) => (
            <polyline key={`${si}-${segI}`} points={seg.map(([x, y]) => `${x},${y}`).join(' ')} fill="none" stroke={s.color}
              strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              style={{ strokeDasharray: 6000, animation: `lineDrawOn 1.1s ease-out ${si * 180}ms both` }} />
          ));
        })}
        {series.map((s, si) => data.map((d, i) => isIn(s.key, i) && (
          <circle key={`${si}-${i}`} cx={xPos(i)} cy={yPos(d[s.key] || 0)} r="3" fill={s.color}
            style={{ animation: `dotFadeIn 0.3s ease ${si * 180 + i * 35}ms both`, transformOrigin: 'center' }} />
        )))}
        {tipCol !== null && (
          <line
            x1={xPos(tipCol)} y1={PT}
            x2={xPos(tipCol)} y2={PT + cH}
            stroke="rgba(0,0,0,0.15)" strokeWidth="1" strokeDasharray="4 3"
          />
        )}
        {data.map((d, i) => (
          <text key={i} x={xPos(i)} y={H - Math.round(pb * 0.2)} textAnchor="middle"
            fontSize={fxSz} fill={inWindow(i) ? '#A9A6A1' : '#D8D5D0'} fontFamily="Poppins,sans-serif">{d.label}</text>
        ))}
        {yTicks.map(t => (
          <text key={t} x={PL - 5} y={yPos(t) + 3} textAnchor="end"
            fontSize={fySz} fill="#A9A6A1" fontFamily="Poppins,sans-serif">
            {compact ? `${t}M` : `${t}M`}
          </text>
        ))}
        <rect x={0} y={0} width={W} height={H} fill="transparent"
          onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} />
      </svg>
      {tip !== null && tipCol !== null && (
        <ChartTooltip
          x={tip.mouseX}
          y={tip.mouseY}
          title={data[tipCol].label || `Col ${tipCol}`}
          lines={series
            .filter(s => isIn(s.key, tipCol))
            .map(s => ({ label: s.label, value: fmt(data[tipCol][s.key] || 0), color: s.color }))}
        />
      )}
    </div>
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

export function VBarChart({ id, data, windowStart = 0, minValue = 0, h = 170, unit = '', vbW = 420, fxSz = 9, fvSz = 10, rotateLabels = false, labelKey = 'label' }) {
  const W = vbW, H = h, PL = 32, PR = 12, PT = 28;
  const PB = rotateLabels ? 62 : 32;
  const cW = W - PL - PR, cH = H - PT - PB;
  const maxV = Math.max(...data.map(d => d.value)) * 1.12;
  const slot = cW / data.length, bW = slot * 0.52;
  const gId = `vb-${id}`;
  const inWindow = i => i >= windowStart;
  const isIn = (d, i) => inWindow(i) && d.value >= minValue;

  const ref = useRef(null);
  const [tip, setTip] = useState(null);

  return (
    <div ref={ref} className="relative w-full h-full">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" className="w-full h-full">
        <defs>
          <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#ef7a2c" />
            <stop offset="100%" stopColor="#ef7a2c" stopOpacity="0.55" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map(p => (
          <line key={p} x1={PL} y1={PT + cH * (1 - p)} x2={W - PR} y2={PT + cH * (1 - p)}
            stroke="rgba(0,0,0,0.04)" strokeWidth="1" />
        ))}
        {data.map((d, i) => {
          const lx = PL + slot * i + slot / 2;
          const ly = PT + cH + (rotateLabels ? 32 : 14);
          const x = PL + slot * i + (slot - bW) / 2;
          const bH = (d.value / maxV) * cH;
          const y = PT + cH - bH;
          const fill = d.color ?? `url(#${gId})`;
          return (
            <g key={i} opacity={inWindow(i) ? 1 : 0.15}>
              {d.value > 0 && isIn(d, i) && (
                <rect x={x} y={y} width={bW} height={bH} rx="5" fill={fill} opacity="0.88"
                  style={{ transformOrigin: `${x + bW / 2}px ${PT + cH}px`, animation: `barGrowUp 0.55s cubic-bezier(0.22, 1, 0.36, 1) ${i * 80}ms both` }}
                  onMouseEnter={(e) => {
                    const bbox = ref.current ? ref.current.getBoundingClientRect() : null;
                    if (!bbox) return;
                    setTip({ barIdx: i, mouseX: e.clientX - bbox.left, mouseY: e.clientY - bbox.top });
                  }}
                  onMouseLeave={() => setTip(null)}
                />
              )}
              <text x={x + bW / 2} y={y - 6} textAnchor="middle" fontSize={fvSz} fontWeight="700"
                fill={isIn(d, i) ? (d.color ?? '#ef7a2c') : '#D8D5D0'} fontFamily="Poppins,sans-serif">{d.value}{unit}</text>
              <text x={lx} y={ly}
                textAnchor="middle"
                fontSize={fxSz} fill="#A9A6A1" fontFamily="Poppins,sans-serif"
                transform={rotateLabels ? `rotate(-40, ${lx}, ${ly})` : undefined}>
                {d[labelKey]}
              </text>
            </g>
          );
        })}
      </svg>
      {tip !== null && (
        <ChartTooltip
          x={tip.mouseX}
          y={tip.mouseY}
          title={data[tip.barIdx][labelKey]}
          lines={[{ label: 'Valor', value: `${data[tip.barIdx].value}${unit}`, color: data[tip.barIdx].color ?? '#ef7a2c' }]}
        />
      )}
    </div>
  );
}

export function HBarChart({ data, fmtVal = v => `${v}M`, visible = true }) {
  const maxVal = Math.max(...data.map(d => d.value));
  return (
    <div className="space-y-3.5">
      {data.map((d, i) => {
        const pct = (d.value / maxVal) * 100;
        return (
          <div key={i}>
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-[12px] font-semibold text-text-2 truncate mr-2">{d.label}</span>
              <span className="text-[12px] font-bold shrink-0" style={{ color: d.color ?? '#ef7a2c' }}>{fmtVal(d.value)}</span>
            </div>
            <div className="h-3 bg-page-bg rounded-full overflow-hidden">
              <div className="h-full rounded-full"
                style={{
                  width: visible ? `${pct}%` : '0%',
                  background: d.color ?? '#ef7a2c',
                  transition: `width 1.2s cubic-bezier(0.22, 1, 0.36, 1) ${i * 120}ms`,
                }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
