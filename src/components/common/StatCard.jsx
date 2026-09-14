// Tarjeta de estadística compartida entre dashboards (PYME, Contratante).
// Estilo homogéneo: degradado de marca, sin icono (como las KPI de facturas).
// Los tones 'green'/'orange' se usan como excepción (p.ej. cards ESG).
const TONES = {
  orange: { bg: 'var(--color-orange-tint)', icon: 'var(--bonafide-orange)', value: 'var(--color-text-1)' },
  green:  { bg: 'var(--color-green-bg)',    icon: 'var(--color-green)',     value: 'var(--color-green)'  },
};

export function StatCard({ label, value, Icon, tone = 'orange' }) {
  const t = TONES[tone] ?? TONES.orange;
  const isGradient = tone === 'gradient';

  return (
    <div
      className={`rounded-[14px] shadow-sm p-4 ${isGradient ? '' : 'bg-white border border-border'}`}
      style={isGradient ? { background: 'var(--bonafide-gradient)' } : undefined}
    >
      {Icon && (
        <div className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 mb-3"
          style={{ background: isGradient ? 'rgba(255,255,255,0.2)' : t.bg }}>
          <Icon className="w-5 h-5 text-white" style={isGradient ? undefined : { color: t.icon }} />
        </div>
      )}
      <div className={`text-[10px] uppercase tracking-wide mb-1.5 leading-tight ${isGradient ? 'text-white/80' : 'text-text-4'}`}>
        {label}
      </div>
      <div className="text-[22px] font-extrabold leading-tight truncate"
        style={isGradient ? { color: 'white' } : { color: t.value }}>
        {value}
      </div>
    </div>
  );
}
