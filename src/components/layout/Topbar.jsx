import { useState } from 'react';
import { Search, Bell, LogOut, X } from 'lucide-react';
import { useApp } from '../../state/AppContext';

const EP_USER = {
  initials: 'CE',
  name: 'Construcciones Silva',
  role: 'Empresa Pequeña',
  pill: { lbl: 'PYME', cls: 'bg-green-bg text-green-text border-green-border' },
};

const ADMIN_USER = {
  initials: 'AM',
  name: 'Ana Martínez',
  role: 'Ops. Bonafide',
  pill: { lbl: 'Admin', cls: 'bg-orange-tint text-orange border-orange-border' },
};

const notifs = [
  { id:1, ico:'🔔', titulo:'TotalEnerGE ha verificado tu contrato', cuerpo:'El contratante TotalEnerGE confirmó los datos del contrato CTR-2026-001.', dt:'Hoy, 14:30', leida:false, tipo:'info' },
  { id:2, ico:'💳', titulo:'Pago recibido de TotalEnerGE', cuerpo:'Has recibido XAF 10,000,000 de TotalEnerGE correspondiente al anticipo del contrato CTR-2026-001.', dt:'Ayer, 11:20', leida:false, tipo:'info' },
  { id:3, ico:'📋', titulo:'Nueva factura pendiente de pago', cuerpo:'La factura FAC-2026-0971 de XAF 10,000,000 emitida a TotalEnerGE está pendiente de pago.', dt:'18/05/26', leida:true, tipo:'warning' },
];

const tipoCls = {
  info:    'bg-blue-bg border-blue-text/20',
  warning: 'bg-yellow-bg border-yellow-text/20',
  success: 'bg-green-bg border-green-border',
};

const IconBtn = ({ onClick, children, hoverCls = 'hover:bg-orange-tint hover:border-orange-border' }) => (
  <div
    onClick={onClick}
    className={`w-9 h-9 bg-page-bg border border-border rounded-[10px] flex items-center justify-center cursor-pointer transition-colors ${hoverCls}`}
  >
    {children}
  </div>
);

export default function Topbar({ title, sub = '', role }) {
  const { go } = useApp();
  const [notifOpen, setNotifOpen] = useState(false);
  const [leidas, setLeidas] = useState(new Set(notifs.filter(n => n.leida).map(n => n.id)));

  const pendientes = notifs.filter(n => !leidas.has(n.id)).length;
  const isEP    = role === 'empresa-pequena';
  const isAdmin = role === 'admin';
  const useNewBar = isEP || isAdmin;
  const currentUser = isAdmin ? ADMIN_USER : EP_USER;

  return (
    <>
      <div style={{ height: 64, flexShrink: 0, background: 'white', borderBottom: '1px solid #F0F2F5', display: 'flex', alignItems: 'center', padding: '0 28px', gap: 16 }}>
        <div>
          <span className="text-[18px] font-bold text-text-1">{title}</span>
          {sub && <span className="text-[13px] text-text-4 ml-1">/ {sub}</span>}
        </div>
        <div className="flex-1" />

        {useNewBar ? (
          <>
            {/* Identificación usuario */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-[8px] bg-gradient-to-br from-orange to-orange-dark flex items-center justify-center text-white font-bold text-[12px] shrink-0">
                {currentUser.initials}
              </div>
              <div className="hidden sm:block">
                <div className="text-[13px] font-semibold text-text-1 leading-tight">{currentUser.name}</div>
                <div className="text-[11px] text-text-4 leading-tight">{currentUser.role}</div>
              </div>
              <span className={`text-[9px] font-bold px-[7px] py-0.5 rounded-full border ${currentUser.pill.cls}`}>
                {currentUser.pill.lbl}
              </span>
            </div>

            {/* Notificaciones */}
            <div className="relative">
              <IconBtn onClick={() => setNotifOpen(true)}>
                <Bell className="w-4 h-4 text-text-3" />
                {pendientes > 0 && (
                  <div className="absolute top-1.5 right-1.5 w-[7px] h-[7px] bg-orange rounded-full border-2 border-white" />
                )}
              </IconBtn>
            </div>

            {/* Cerrar sesión */}
            <IconBtn onClick={() => go('login')} hoverCls="hover:bg-red-bg hover:border-red-text/30">
              <LogOut className="w-4 h-4 text-text-3" />
            </IconBtn>
          </>
        ) : (
          <>
            <div className="flex items-center gap-2 bg-page-bg border border-border rounded-[10px] px-3.5 py-2 text-[13px] text-text-4 cursor-pointer w-[220px]">
              <Search className="w-4 h-4 shrink-0" />
              Buscar...
            </div>
            <IconBtn>
              <Bell className="w-4 h-4 text-text-3" />
              <div className="absolute top-1.5 right-1.5 w-[7px] h-[7px] bg-orange rounded-full border-2 border-white" />
            </IconBtn>
          </>
        )}
      </div>

      {/* Panel de notificaciones (slide desde la derecha) */}
      {notifOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
          <div
            className="fixed top-0 right-0 h-full w-[360px] bg-white z-50 flex flex-col"
            style={{ borderLeft: '1px solid #F0F2F5', boxShadow: '-4px 0 24px rgba(0,0,0,0.08)' }}
          >
            <div className="px-5 py-4 border-b border-border flex items-center justify-between" style={{ height: 64, flexShrink: 0 }}>
              <div>
                <div className="text-[15px] font-bold text-text-1">Notificaciones</div>
                {pendientes > 0 && <div className="text-[11px] text-text-4">{pendientes} sin leer</div>}
              </div>
              <div className="flex items-center gap-2">
                {pendientes > 0 && (
                  <button
                    onClick={() => setLeidas(new Set(notifs.map(n => n.id)))}
                    className="text-[12px] text-orange font-semibold hover:opacity-75"
                  >
                    Marcar todas
                  </button>
                )}
                <div
                  onClick={() => setNotifOpen(false)}
                  className="w-8 h-8 bg-page-bg border border-border rounded-[8px] flex items-center justify-center cursor-pointer hover:bg-red-bg transition-colors"
                >
                  <X className="w-4 h-4 text-text-3" />
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {notifs.map(n => {
                const leida = leidas.has(n.id);
                return (
                  <div
                    key={n.id}
                    onClick={() => setLeidas(prev => new Set([...prev, n.id]))}
                    className={`rounded-[12px] border p-3.5 cursor-pointer transition-all
                      ${leida ? 'bg-white border-border opacity-60' : tipoCls[n.tipo]}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-8 h-8 rounded-[8px] flex items-center justify-center text-[16px] shrink-0 ${leida ? 'bg-page-bg' : 'bg-white'}`}>
                        {n.ico}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-0.5 gap-2">
                          <div className={`text-[12px] font-bold leading-snug ${leida ? 'text-text-3' : 'text-text-1'}`}>{n.titulo}</div>
                          {!leida && <div className="w-2 h-2 rounded-full bg-orange shrink-0 mt-1" />}
                        </div>
                        <div className={`text-[11px] leading-[1.5] ${leida ? 'text-text-4' : 'text-text-3'}`}>{n.cuerpo}</div>
                        <div className="text-[10px] text-text-5 mt-1.5">{n.dt}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </>
  );
}
