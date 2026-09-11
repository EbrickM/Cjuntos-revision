import AppShell from '../../components/layout/AppShell';
import BackButton from '../../components/common/BackButton';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Timeline from '../../components/ui/Timeline';

// ── CONFIRMING DETALLE ──
export default function EmpConfDet() {
  const timeline = [
    { icon: '✓', title: 'Enviada', timestamp: '12/05/2026 11:00', sub: 'Solicitud creada por TotalEnerGE', done: true },
    { icon: '✓', title: 'Recibida', timestamp: '12/05/2026 14:20', sub: 'Documentos verificados', done: true },
    { icon: '✓', title: 'En revisión', timestamp: '13/05/2026 09:15', sub: 'Asignada a analista', done: true },
    { icon: '✓', title: 'Aprobada', timestamp: '13/05/2026 16:45', sub: 'Anticipo desembolsado', done: true },
    { icon: '⏳', title: 'Cobro empresa', timestamp: '60–90 días', sub: 'TotalEnerGE paga a Bonafide', done: false },
  ];
  return (
    <AppShell active="empConf" role="contratante" title="Solicitud CONF-2026-04821">
      <div className="fade-in">
        <div className="flex items-center gap-3 mb-5">
          <BackButton to="empConf" />
          <Badge variant="green">Aprobada</Badge>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-[14px] border border-border p-6">
            <div className="text-[14px] font-bold mb-4">Datos de la Solicitud</div>
            {[['Proveedor','Construcciones Silva Ltd.'],['RUC','GE-2021-00234'],['Semáforo','🟢 Verde — Bajo Riesgo'],['Nº Factura','FAC-2026-0892'],['Fecha','12/05/2026'],['Monto factura','XAF 12,500,000'],['Anticipo (98%)','XAF 12,250,000'],['Comisión','XAF 0'],['Documento','📄 factura_silva_0892.pdf']].map(([k,v]) => (
              <div key={k} className="flex justify-between py-2.5 border-b border-page-bg last:border-0">
                <span className="text-[12px] text-text-4">{k}</span>
                <span className="text-[13px] font-semibold">{v}</span>
              </div>
            ))}
            <div className="mt-4">
              <Button variant="ghost" size="sm">📄 Ver Factura PDF</Button>
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <div className="bg-white rounded-[14px] border border-border p-6">
              <div className="text-[14px] font-bold mb-4">Estado del Proceso</div>
              <Timeline items={timeline} />
              <div className="mt-3 p-3 bg-green-bg border border-green-border rounded-[10px]">
                <div className="text-[12px] font-bold text-green-text">⚡ Tiempo total: 38 horas</div>
                <div className="text-[11px] text-text-4">Meta: menos de 72h — ✅ Cumplida</div>
              </div>
            </div>
            <div className="bg-white rounded-[14px] border border-border p-5">
              <div className="text-[13px] font-bold mb-3">Gestor Asignado</div>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-orange to-orange-dark flex items-center justify-center text-white font-bold text-[13px]">AM</div>
                <div>
                  <div className="text-[13px] font-semibold">Ana Martínez</div>
                  <div className="text-[11px] text-text-4">Operaciones Bonafide</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
