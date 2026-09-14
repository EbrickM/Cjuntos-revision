import { useState } from 'react';
import { Bell, LogOut, X, Menu, UserPlus, CheckCheck, Trash2 } from 'lucide-react';
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
    id: 1,
    titulo: 'TotalEnerGE ha verificado tu contrato',
    cuerpo: 'El contratante TotalEnerGE confirmó los datos del contrato CTR-2026-001.',
    dt: 'Hoy, 14:30', leida: false,
  },
  {
    id: 2,
    titulo: 'Pago recibido de TotalEnerGE',
    cuerpo: 'Has recibido XAF 10,000,000 correspondiente al anticipo del contrato CTR-2026-001.',
    dt: 'Ayer, 11:20', leida: false,
  },
  {
    id: 3,
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
  const [ocultas,   setOcultas]   = useState(new Set());
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const fullName    = session?.user?.fullName ?? adminSession?.admin?.fullName ?? '';
  const meta        = ROLE_META[role] ?? { roleLabel: 'Bonafide', pill: null };
  const visibles    = notifs.filter(n => !ocultas.has(n.id));
  const pendientes  = visibles.filter(n => !leidas.has(n.id)).length;

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

        <button onClick={() => go('splash')} className="hidden sm:block cursor-pointer" type="button">
          <Logo />
        </button>

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
          <div className="fixed inset-0 bg-black/30 z-40" onClick={() => setNotifOpen(false)} />
          <div className="fixed top-0 right-0 h-full w-full sm:w-96 max-w-full bg-white shadow-2xl z-50 flex flex-col">
            {/* Cabecera del panel */}
            <div className="flex items-center justify-between p-4 border-b border-border gap-2 shrink-0">
              <h2 className="text-lg font-bold text-text-1">Notificaciones</h2>
              <div className="flex items-center gap-1">
                {pendientes > 0 && (
                  <button
                    onClick={() => setLeidas(new Set(notifs.map(n => n.id)))}
                    className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium text-orange-dark hover:bg-orange-tint rounded-lg transition-colors cursor-pointer"
                    title="Marcar todas como leídas"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Marcar todas</span>
                  </button>
                )}
                <button
                  onClick={() => setNotifOpen(false)}
                  className="p-2 hover:bg-page-bg rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5 text-text-3" />
                </button>
              </div>
            </div>

            {/* Lista de notificaciones */}
            <div className="overflow-y-auto flex-1 min-h-0">
              {visibles.length > 0 ? (
                <div className="p-4 space-y-3">
                  {visibles.map(n => {
                    const leida = leidas.has(n.id);
                    return (
                      <div
                        key={n.id}
                        onClick={() => setLeidas(prev => new Set(prev).add(n.id))}
                        className={`p-4 rounded-lg border cursor-pointer hover:bg-page-bg transition-colors ${
                          leida ? 'bg-white border-border' : 'bg-blue-bg border-blue-text/20'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ background: 'var(--bonafide-gradient)' }}>
                            <Bell className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-text-1 text-sm mb-1">{n.titulo}</h3>
                            <p className="text-sm text-text-3 mb-2">{n.cuerpo}</p>
                            <p className="text-xs text-text-4">{n.dt}</p>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); setOcultas(prev => new Set(prev).add(n.id)); }}
                            title="Ocultar"
                            className="p-1.5 rounded-md hover:bg-gray-200/60 text-text-4 hover:text-text-2 transition-colors cursor-pointer shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <Bell className="w-16 h-16 text-gray-300 mb-4" />
                  <p className="text-text-3">No hay notificaciones</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
