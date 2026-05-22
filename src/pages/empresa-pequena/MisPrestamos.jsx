import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';

const prestamos = [
  { id: 'PRE-2026-001', contratante: 'TotalEnerGE', contrato: 'CTR-2026-001', monto: '120,000,000', estado: 'Aprobado', estadoCls: 'green', fecha: '01/05/2026', disponible: '85,000,000', progreso: 71, contr_verify: true, bonafide_auth: true },
  { id: 'PRE-2026-002', contratante: 'TotalEnerGE', contrato: 'CTR-2026-004', monto: '45,000,000', estado: 'Pendiente', estadoCls: 'yellow', fecha: '15/05/2026', disponible: '—', progreso: 0, contr_verify: false, bonafide_auth: false },
  { id: 'PRE-2026-003', contratante: 'ConstrGE Corp.', contrato: 'CTR-2026-007', monto: '80,000,000', estado: 'En revisión', estadoCls: 'blue', fecha: '18/05/2026', disponible: '—', progreso: 0, contr_verify: true, bonafide_auth: false },
];

export default function MisPrestamos() {
  const { go } = useApp();
  return (
    <AppShell active="epPrestamos" role="empresa-pequena" title="Mis Préstamos" sub="Historial y estado"
      extra={<Button variant="primary" size="sm" onClick={() => go('epSolicitar')}>+ Solicitar Préstamo</Button>}
    >
      <div className="fade-in">
        {/* Resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[['💼','2','Préstamos activos','text-orange'],['💰','XAF 165M','Crédito total','text-text-1'],['🔓','XAF 85M','Disponible ahora','text-green-text']].map(([ico,v,l,c]) => (
            <div key={l} className="bg-white rounded-[14px] p-5 border border-border">
              <div className="text-[28px] mb-2">{ico}</div>
              <div className={`text-[22px] font-extrabold ${c} mb-1`}>{v}</div>
              <div className="text-[12px] text-text-4">{l}</div>
            </div>
          ))}
        </div>

        {/* Lista de préstamos */}
        <div className="flex flex-col gap-4">
          {prestamos.map(p => (
            <div key={p.id} className="bg-white rounded-[14px] border border-border p-5 cursor-pointer hover:shadow-sm transition-shadow" onClick={() => go('epPrestamoDetalle')}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="text-[12px] font-mono text-text-4">{p.id}</span>
                  <span className="text-[15px] font-bold text-text-1">{p.contratante}</span>
                  <span className="text-[12px] text-text-4">· {p.contrato}</span>
                </div>
                <Badge variant={p.estadoCls}>{p.estado}</Badge>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-page-bg rounded-[10px] p-4 mb-4">
                {[['Monto','XAF '+p.monto],['Disponible',p.disponible==='—'?'—':'XAF '+p.disponible],['Solicitado',p.fecha],['Plazo','12 meses']].map(([k,v]) => (
                  <div key={k}>
                    <div className="text-[11px] text-text-4 mb-0.5">{k}</div>
                    <div className="text-[13px] font-bold text-text-1">{v}</div>
                  </div>
                ))}
              </div>

              {/* Verificación status */}
              <div className="flex items-center gap-6 mb-4">
                <div className="flex items-center gap-2 text-[12px]">
                  <span className={p.contr_verify ? 'text-green-text' : 'text-yellow-text'}>
                    {p.contr_verify ? '✅' : '⏳'}
                  </span>
                  <span className="text-text-3">Contratante verificó: <strong>{p.contr_verify ? 'Sí' : 'Pendiente'}</strong></span>
                </div>
                <div className="flex items-center gap-2 text-[12px]">
                  <span className={p.bonafide_auth ? 'text-green-text' : 'text-text-4'}>
                    {p.bonafide_auth ? '✅' : '○'}
                  </span>
                  <span className="text-text-3">Bonafide autorizó: <strong>{p.bonafide_auth ? 'Sí' : 'Pendiente'}</strong></span>
                </div>
              </div>

              {p.progreso > 0 && (
                <div className="mb-4">
                  <div className="flex justify-between text-[11px] text-text-4 mb-1">
                    <span>Fondos utilizados</span>
                    <span>{p.progreso}%</span>
                  </div>
                  <div className="h-1.5 bg-border rounded-full overflow-hidden">
                    <div className="h-full bg-orange rounded-full" style={{width:`${p.progreso}%`}} />
                  </div>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); go('epPrestamoDetalle'); }}>Ver detalle →</Button>
                {p.estado === 'Aprobado' && (
                  <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); go('epLiberacion'); }}>🔓 Liberar fondos</Button>
                )}
                {p.estado === 'Pendiente' && !p.contr_verify && (
                  <span className="text-[12px] text-yellow-text font-semibold flex items-center gap-1">
                    ⏳ Esperando verificación del contratante
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
