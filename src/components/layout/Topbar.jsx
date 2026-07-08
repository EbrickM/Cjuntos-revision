import { useState } from 'react';
import { Bell, LogOut, X, Menu, UserPlus } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import Logo from './Logo';
import Button from '../ui/Button';

const USERS = {
  'empresa-pequena': {
    initials: 'CE',
    name: 'Construcciones Silva',
    role: 'Empresa PYME',
    pill: { lbl: 'PYME', cls: 'bg-green-bg text-green-text border-green-border' },
  },
  admin: {
    initials: 'AM',
    name: 'Ana Martínez',
    role: 'Ops. Bonafide',
    pill: { lbl: 'Admin', cls: 'bg-orange-tint text-orange border-orange-border' },
  },
  contratante: {
    initials: 'TE',
    name: 'TotalEnerGE',
    role: 'Empresa Contratante',
    pill: null,
  },
};

const notifs = [
  { id: 1, ico: '🔔', titulo: 'TotalEnerGE ha verificado tu contrato',   cuerpo: 'El contratante TotalEnerGE confirmó los datos del contrato CTR-2026-001.',                             dt: 'Hoy, 14:30',  leida: false, tipo: 'info' },
  { id: 2, ico: '💳', titulo: 'Pago recibido de TotalEnerGE',             cuerpo: 'Has recibido XAF 10,000,000 de TotalEnerGE correspondiente al anticipo del contrato CTR-2026-001.', dt: 'Ayer, 11:20', leida: false, tipo: 'info' },
  { id: 3, ico: '📋', titulo: 'Nueva factura pendiente de pago',          cuerpo: 'La factura FAC-2026-0971 de XAF 10,000,000 emitida a TotalEnerGE está pendiente de pago.',          dt: '18/05/26',    leida: true,  tipo: 'warning' },
];

const tipoCls = {
  info:    'bg-blue-bg border-blue-text/20',
  warning: 'bg-yellow-bg border-yellow-text/20',
  success: 'bg-green-bg border-green-border',
};

export default function Topbar({ role, onMenuClick }) {
  const { go } = useApp();
  const [notifOpen, setNotifOpen] = useState(false);
  const [leidas,    setLeidas]    = useState(new Set(notifs.filter(n => n.leida).map(n => n.id)));

  const user       = USERS[role] ?? USERS['empresa-pequena'];
  const pendientes = notifs.filter(n => !leidas.has(n.id)).length;

  return (
    <>
      {/* ── Barra principal ─────────────────────────────────────────────────── */}
      <div
        className="h-16 shrink-0 bg-white flex items-center gap-3 sm:gap-4 relative z-10 px-4 sm:px-4"
        style={{ boxShadow: '0 4px 12px -2px rgba(198,40,40,0.2), 0 8px 16px -4px rgba(245,124,0,0.15)' }}
      >
        {/* Hamburger — solo en móvil */}
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors text-text-3 shrink-0"
        >
          <Menu className="w-5 h-5" />
        </button>

        <span className="hidden sm:block"><Logo /></span>

        <div className="flex-1" />

        {/* Invitar PYME — solo contratante */}
        {(role === 'contratante' || role === 'empresa-pequena') && (
          <Button variant="primary" size="sm" className="hidden sm:inline-flex shrink-0">
            <UserPlus className="w-3.5 h-3.5" />
            Invitar PYME
          </Button>
        )}

        {/* Usuario */}
        <div className="flex items-center gap-2 sm:gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#C62828] to-[#F57C00] flex items-center justify-center text-white font-bold text-[12px] shrink-0">
            {user.initials}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-text-1 leading-tight">{user.name}</p>
            <p className="text-xs text-text-4 leading-tight">{user.role}</p>
          </div>
          {user.pill && (
            <span className={`hidden sm:inline text-[9px] font-bold px-[7px] py-0.5 rounded-full border ${user.pill.cls}`}>
              {user.pill.lbl}
            </span>
          )}
        </div>

        {/* Notificaciones */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen(true)}
            className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer text-text-3"
          >
            <Bell className="w-5 h-5" />
            {pendientes > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gradient-to-r from-[#C62828] to-[#F57C00] rounded-full" />
            )}
          </button>
        </div>

        {/* Cerrar sesión */}
        <button
          onClick={() => go('login')}
          className="p-2 rounded-lg hover:bg-red-bg transition-colors cursor-pointer text-text-3 hover:text-red-text"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>

      {/* ── Panel de notificaciones ─────────────────────────────────────────── */}
      {notifOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
          <div
            className="fixed top-0 right-0 h-full w-full sm:w-[360px] bg-white z-50 flex flex-col"
            style={{ borderLeft: '1px solid rgba(0,0,0,0.08)', boxShadow: '-4px 0 24px rgba(0,0,0,0.08)' }}
          >
            <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0" style={{ height: 64 }}>
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
                <button
                  onClick={() => setNotifOpen(false)}
                  className="w-8 h-8 bg-page-bg border border-border rounded-[8px] flex items-center justify-center cursor-pointer hover:bg-red-bg transition-colors"
                >
                  <X className="w-4 h-4 text-text-3" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
              {notifs.map(n => {
                const leida = leidas.has(n.id);
                return (
                  <div
                    key={n.id}
                    onClick={() => setLeidas(prev => new Set([...prev, n.id]))}
                    className={`rounded-[12px] border p-3.5 cursor-pointer transition-all ${leida ? 'bg-white border-border opacity-60' : tipoCls[n.tipo]}`}
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
