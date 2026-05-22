import { useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';

const notifs = [
  { id:1, ico:'✅', titulo:'Préstamo PRE-2026-001 autorizado', cuerpo:'Bonafide ha autorizado tu préstamo de XAF 120,000,000. Los fondos están disponibles en tu billetera.', dt:'Hoy, 09:15', leida:false, tipo:'success' },
  { id:2, ico:'💸', titulo:'Liberación LIB-001 aprobada', cuerpo:'Bonafide aprobó la liberación de XAF 5,200,000 para CemGE SA. El pago fue procesado.', dt:'Hoy, 08:42', leida:false, tipo:'success' },
  { id:3, ico:'🔔', titulo:'TotalEnerGE ha verificado tu contrato', cuerpo:'El contratante TotalEnerGE confirmó los datos del contrato CTR-2026-001. Bonafide puede proceder con la autorización.', dt:'Ayer, 14:30', leida:false, tipo:'info' },
  { id:4, ico:'💳', titulo:'Pago recibido de TotalEnerGE', cuerpo:'Has recibido XAF 10,000,000 de TotalEnerGE correspondiente al anticipo del contrato CTR-2026-001.', dt:'Ayer, 11:20', leida:true, tipo:'info' },
  { id:5, ico:'📋', titulo:'Nueva factura pendiente de pago', cuerpo:'La factura FAC-2026-0971 de XAF 10,000,000 emitida a TotalEnerGE está pendiente de pago.', dt:'18/05/26', leida:true, tipo:'warning' },
  { id:6, ico:'⚠️', titulo:'Recordatorio: datos contratante incompletos', cuerpo:'Para el préstamo PRE-2026-002, los datos del contratante aún no han sido verificados. Contacta a tu contratante.', dt:'17/05/26', leida:true, tipo:'warning' },
];

const tipoCls = {
  success: 'bg-green-bg border-green-border',
  info:    'bg-blue-bg border-blue-text/20',
  warning: 'bg-yellow-bg border-yellow-text/20',
};

export default function EpNotificaciones() {
  const [leidas, setLeidas] = useState(new Set(notifs.filter(n=>n.leida).map(n=>n.id)));

  const marcarTodas = () => setLeidas(new Set(notifs.map(n=>n.id)));
  const pendientes = notifs.filter(n=>!leidas.has(n.id)).length;

  return (
    <AppShell active="epNotif" role="empresa-pequena" title="Notificaciones" sub={`${pendientes} sin leer`}
      extra={pendientes > 0 && <Button variant="ghost" size="sm" onClick={marcarTodas}>Marcar todas como leídas</Button>}
    >
      <div className="fade-in max-w-[680px]">
        {notifs.map(n => {
          const leida = leidas.has(n.id);
          return (
            <div
              key={n.id}
              onClick={() => setLeidas(prev => new Set([...prev, n.id]))}
              className={`rounded-[14px] border p-4 mb-3 cursor-pointer transition-all
                ${leida ? 'bg-white border-border opacity-60' : `${tipoCls[n.tipo]} border`}`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-[10px] flex items-center justify-center text-[18px] shrink-0
                  ${leida ? 'bg-page-bg' : 'bg-white'}`}>{n.ico}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <div className={`text-[13px] font-bold ${leida ? 'text-text-3' : 'text-text-1'}`}>{n.titulo}</div>
                    {!leida && <div className="w-2 h-2 rounded-full bg-orange shrink-0 ml-2"/>}
                  </div>
                  <div className={`text-[12px] leading-[1.5] ${leida ? 'text-text-4' : 'text-text-3'}`}>{n.cuerpo}</div>
                  <div className="text-[11px] text-text-5 mt-1.5">{n.dt}</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
