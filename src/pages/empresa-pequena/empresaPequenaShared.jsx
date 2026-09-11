// Tarjeta de estadística compartida por las pantallas del dashboard PYME
// (Créditos, Proveedores, Facturas, Huella Verde) — estructura y colores
// inspirados en las cards de KPI del panel admin de bonafide-kappa (icono en
// caja + etiqueta/valor apilados), pero mantenidas en el tamaño compacto que
// ya usa este proyecto.
const TONES = {
  orange: { bg: 'var(--color-orange-tint)', icon: 'var(--bonafide-orange)', value: 'var(--color-text-1)' },
  green:  { bg: 'var(--color-green-bg)',    icon: 'var(--color-green)',     value: 'var(--color-green)'  },
};

export function StatCard({ label, value, Icon, tone = 'orange' }) {
  const t = TONES[tone] ?? TONES.orange;
  return (
    <div className="bg-white rounded-[14px] border border-border shadow-sm p-4 flex items-center gap-3">
      <div className="w-10 h-10 rounded-[12px] flex items-center justify-center shrink-0" style={{ background: t.bg }}>
        <Icon className="w-5 h-5" style={{ color: t.icon }} />
      </div>
      <div className="min-w-0">
        <div className="text-[10px] text-text-4 uppercase tracking-wide mb-0.5">{label}</div>
        <div className="text-[16px] font-extrabold leading-tight truncate" style={{ color: t.value }}>{value}</div>
      </div>
    </div>
  );
}
