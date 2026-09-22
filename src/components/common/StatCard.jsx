// Tarjeta de estadística compartida entre dashboards (PYME, Contratante).
// El tone 'gradient' usa fondo blanco con el degradado como borde inferior
// (ver las KPI de Contratos/Facturas). Los tones 'green'/'orange' se usan
// como excepción (p.ej. cards ESG), con fondo blanco y borde.
const TONES = {
  orange: { bg: 'var(--color-orange-tint)', icon: 'var(--bonafide-orange)', value: 'var(--color-text-1)' },
  green:  { bg: 'var(--color-green-bg)',    icon: 'var(--color-green)',     value: 'var(--color-green)'  },
};

export function StatCard({ label, value, Icon, tone = 'orange' }) {
  const t = TONES[tone] ?? TONES.orange;
  const isGradient = tone === 'gradient';

  if (isGradient) {
    return (
      <div className="rounded-[14px] bg-white shadow-sm overflow-hidden transition-transform duration-200 hover:scale-[1.02]">
        {Icon && (
          <div className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 mb-3"
            style={{ background: 'var(--bonafide-gradient)' }}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
        <div className="p-4">
          <div className="text-[10px] font-semibold uppercase tracking-wide mb-1.5 leading-tight text-text-4">{label}</div>
          <div className="text-[22px] font-extrabold leading-tight truncate text-text-1">{value}</div>
        </div>
        <div className="h-[4px] rounded-b-[14px]" style={{ background: 'var(--bonafide-gradient)' }} />
      </div>
    );
  }

  return (
    <div className="rounded-[14px] shadow-sm p-4 bg-white border border-border transition-transform duration-200 hover:scale-[1.02]">
      {Icon && (
        <div className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0 mb-3"
          style={{ background: t.bg }}>
          <Icon className="w-5 h-5 text-white" style={{ color: t.icon }} />
        </div>
      )}
      <div className="text-[10px] uppercase tracking-wide mb-1.5 leading-tight text-text-4">
        {label}
      </div>
      <div className="text-[22px] font-extrabold leading-tight truncate" style={{ color: t.value }}>
        {value}
      </div>
    </div>
  );
}