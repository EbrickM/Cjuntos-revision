import AppShell from '../../components/layout/AppShell';

// ── NOTIFICACIONES ──
const NOTIF_GROUPS = [
  { grp: 'Hoy', items: [
    { ico: '📄', title: 'Nueva factura recibida',      desc: 'Tradex envió FAC-2026-0911 · XAF 21.500.000 — pendiente de verificación', time: '09:32', unread: true  },
    { ico: '✅', title: 'Solicitud aprobada',           desc: 'SOL-2026-0138 · Contrato con MaderGE PYME S.L. fue aprobada por Bonafide',            time: '08:15', unread: true  },
  ]},
  { grp: 'Ayer', items: [
    { ico: '⚠️', title: 'Alerta de riesgo',             desc: 'MH Logística ha bajado a semáforo Rojo · Revisa su perfil de cumplimiento',             time: '11:00', unread: false },
    { ico: '🔔', title: 'PYME te declaró contratante',  desc: 'Conexxia Tech te ha declarado como empresa contratante — confirma tu participación', time: '10:20', unread: false },
    { ico: '🔐', title: 'Verificación IPI requerida',   desc: 'FAC-2026-0901 · Conexxia Agro está pendiente de tu código de confirmación',            time: '09:05', unread: false },
  ]},
  { grp: 'Esta semana', items: [
    { ico: '📊', title: 'Fondo al 90% utilizado',       desc: 'CT-2026-0041 · Tradex ha superado el 90% del fondo asignado (XAF 180.000.000)', time: 'Lun', unread: false },
    { ico: '📋', title: 'Contrato vencido',             desc: 'CT-2025-0087 · InfraBata S.L. venció el 30/11/2025 — considera iniciar una renovación',    time: 'Dom', unread: false },
  ]},
];

export default function EmpNotif() {
  return (
    <AppShell active="empNotif" role="contratante" title="Notificaciones">
      <div className="fade-in max-w-[720px]">
        {NOTIF_GROUPS.map(({ grp, items }) => (
          <div key={grp} className="mb-6">
            <div className="text-[11px] font-semibold text-text-4 uppercase tracking-[1px] mb-3">{grp}</div>
            {items.map(({ ico, title, desc, time, unread }) => (
              <div key={title} className="flex gap-3.5 p-3.5 bg-white border border-border rounded-[12px] mb-2 cursor-pointer hover:bg-[#FFFAF8]">
                <div className="w-10 h-10 bg-page-bg rounded-[10px] flex items-center justify-center text-[20px] shrink-0">{ico}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[13px] font-bold">{title}</span>
                    {unread && <span className="w-[7px] h-[7px] bg-orange rounded-full" />}
                  </div>
                  <div className="text-[12px] text-text-3">{desc}</div>
                </div>
                <span className="text-[11px] text-text-5 shrink-0">{time}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </AppShell>
  );
}
