import { useState } from 'react';
import { Bell, LogOut, X, Menu, UserPlus, FileCheck, Banknote, AlertCircle } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { useAuthStore, logout } from '../../stores/authStore';
import Logo from './Logo';
import Button from '../ui/Button';
import LogoutConfirmModal from '../common/LogoutConfirmModal';

const ROLE_META = {
  'empresa-pequena': { roleLabel: 'Empresa PYME',       pill: { lbl: 'PYME',  cls: 'bg-green-bg text-green-text border-green-border'    } },
  contratante:       { roleLabel: 'Empresa Contratante', pill: null },
  admin:             { roleLabel: 'Ops. Bonafide',       pill: { lbl: 'Admin', cls: 'bg-orange-tint text-orange border-orange-border' } },
};

function getInitials(fullName = '') {
  const words = fullName.trim().split(/\s+/).filter(w => w.length > 1);
  if (words.length === 0) return '?';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}

const notifs = [
  {
    id: 1, Icon: FileCheck,
    iconBg: '#E3F4EA', iconColor: '#2E7D5B',
    cardCls: 'bg-green-bg border-green-border',
    titulo: 'TotalEnerGE ha verificado tu contrato',
    cuerpo: 'El contratante TotalEnerGE confirmó los datos del contrato CTR-2026-001.',
    dt: 'Hoy, 14:30', leida: false,
  },
  {
    id: 2, Icon: Banknote,
    iconBg: '#EFF6FF', iconColor: '#3B82F6',
    cardCls: 'bg-blue-bg border-blue-text/20',
    titulo: 'Pago recibido de TotalEnerGE',
    cuerpo: 'Has recibido XAF 10,000,000 correspondiente al anticipo del contrato CTR-2026-001.',
    dt: 'Ayer, 11:20', leida: false,
  },
  {
    id: 3, Icon: AlertCircle,
    iconBg: '#FDF6E8', iconColor: '#C68A1D',
    cardCls: 'bg-yellow-bg border-yellow-text/20',
    titulo: 'Nueva factura pendiente de pago',
    cuerpo: 'La factura FAC-2026-0971 de XAF 10,000,000 emitida a TotalEnerGE está pendiente.',
    dt: '18/05/26', leida: true,
  },
];

export default function Topbar({ role, onMenuClick, onInvitarPyme }) {
  const { go } = useApp();
  const session      = useAuthStore(s => s.session);
  const adminSession = useAuthStore(s => s.adminSession);
  const [notifOpen, setNotifOpen] = useState(false);
  const [leidas,    setLeidas]    = useState(new Set(notifs.filter(n => n.leida).map(n => n.id)));
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const fullName   = session?.user?.fullName ?? adminSession?.admin?.fullName ?? '';
  const meta       = ROLE_META[role] ?? { roleLabel: 'Bonafide', pill: null };
  const pendientes = notifs.filter(n => !leidas.has(n.id)).length;

  return (
    <>
      {/* ── Barra principal ─────────────────────────────────────────────────── */}
      <nav
        className="bona-brand-shadow h-16 shrink-0 bg-white flex items-center gap-3 sm:gap-4 relative z-10 px-4 sm:px-4"
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
          <Button variant="primary" size="sm" className="hidden sm:inline-flex shrink-0" onClick={onInvitarPyme}>
            <UserPlus className="w-3.5 h-3.5" />
            Invitar PYME
          </Button>
        )}

        {/* Usuario */}
        <div className="flex items-center gap-2 sm:gap-2.5 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange to-orange-dark flex items-center justify-center text-white font-bold text-[12px] shrink-0">
            {getInitials(fullName)}
          </div>
          <div className="hidden sm:block text-left">
            <p className="text-sm font-medium text-text-1 leading-tight truncate max-w-[160px]">{fullName || '—'}</p>
            <p className="text-xs text-text-4 leading-tight">{meta.roleLabel}</p>
          </div>
          {meta.pill && (
            <span className={`hidden sm:inline text-[9px] font-bold px-[7px] py-0.5 rounded-full border ${meta.pill.cls}`}>
              {meta.pill.lbl}
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
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gradient-to-r from-orange to-orange-dark rounded-full" />
            )}
          </button>
        </div>

        {/* Cerrar sesión */}
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="p-2 rounded-lg hover:bg-red-bg transition-colors cursor-pointer text-text-3 hover:text-red-text"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </nav>

      <LogoutConfirmModal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={() => { setShowLogoutConfirm(false); void logout(); go('login'); }}
      />

      {/* ── Panel de notificaciones ─────────────────────────────────────────── */}
      {notifOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
          <div
            className="fixed top-0 right-0 h-full w-full sm:w-[360px] bg-white z-50 flex flex-col"
            style={{ borderLeft: '1px solid rgba(0,0,0,0.08)', boxShadow: '-4px 0 24px rgba(0,0,0,0.08)' }}
          >
            {/* Cabecera del panel */}
            <div className="px-5 py-4 border-b border-border flex items-center justify-between shrink-0" style={{ height: 64 }}>
              <div className="flex items-center gap-2.5">
                <div className="bona-gradient-bg w-8 h-8 rounded-[8px] flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="text-[14px] font-bold text-text-1">Notificaciones</div>
                  {pendientes > 0
                    ? <div className="text-[10px] text-text-4">{pendientes} sin leer</div>
                    : <div className="text-[10px] text-text-4">Todo al día</div>
                  }
                </div>
              </div>
              <div className="flex items-center gap-2">
                {pendientes > 0 && (
                  <button
                    onClick={() => setLeidas(new Set(notifs.map(n => n.id)))}
                    className="text-[11px] text-orange font-semibold hover:opacity-75 transition"
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

            {/* Lista de notificaciones */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3" style={{ background: '#F6F5F3' }}>
              {notifs.map(n => {
                const leida = leidas.has(n.id);
                return (
                  <div
                    key={n.id}
                    onClick={() => setLeidas(prev => new Set([...prev, n.id]))}
                    className={`rounded-[12px] border p-4 cursor-pointer transition-all
                      ${leida ? 'bg-white border-border opacity-55' : `${n.cardCls}`}`}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icono */}
                      <div
                        className="w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0"
                        style={{ background: leida ? '#ECEAE7' : n.iconBg }}
                      >
                        <n.Icon className="w-[18px] h-[18px]" style={{ color: leida ? '#A9A6A1' : n.iconColor }} />
                      </div>

                      {/* Contenido */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <div className={`text-[12px] font-bold leading-snug ${leida ? 'text-text-3' : 'text-text-1'}`}>
                            {n.titulo}
                          </div>
                          {!leida && (
                            <div className="w-2 h-2 rounded-full shrink-0 mt-1" style={{ background: n.iconColor }} />
                          )}
                        </div>
                        <div className={`text-[11px] leading-relaxed ${leida ? 'text-text-4' : 'text-text-3'}`}>
                          {n.cuerpo}
                        </div>
                        <div className="text-[10px] text-text-5 mt-2">{n.dt}</div>
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
