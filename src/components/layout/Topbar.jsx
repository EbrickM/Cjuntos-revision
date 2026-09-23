import { useState } from 'react';
import { Bell, LogOut, X, Menu, CheckCheck, Trash2, ArrowRight } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import { useAuthStore, logout } from '../../stores/authStore';
import { fmt } from '../../pages/contratante/contratanteData';
import { contratoService } from '../../services/contrato.service';
import { facturaService } from '../../services/factura.service';
import { BANCO } from '../../pages/fondeador/fondeadorShared';
import Logo from './Logo';
import LogoutConfirmModal from '../common/LogoutConfirmModal';

const ROLE_META = {
  'empresa-pequena': { roleLabel: 'Empresa Contratada',  pill: null },
  contratante:       { roleLabel: 'Empresa Contratante', pill: null },
  admin:             { roleLabel: 'Ops. Bonafide',       pill: { lbl: 'Admin', cls: 'bg-orange-tint text-orange border-orange-border' } },
  proveedor:         { roleLabel: 'Proveedor',           pill: { lbl: 'Proveedor', cls: 'bg-blue-bg text-blue-text border-blue-text/20' } },
  fondeador:         { roleLabel: 'Banco Fondeador · BGFI', pill: { lbl: 'Fondeador', cls: 'bg-blue-bg text-blue-text border-blue-text/20' } },
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
    titulo: 'Chevron ha verificado tu contrato',
    cuerpo: 'El contratante Chevron confirmó los datos del contrato CTR-2026-001.',
    dt: 'Hoy, 14:30', leida: false,
  },
  {
    id: 2,
    titulo: 'Pago recibido de Chevron',
    cuerpo: 'Has recibido XAF 10,000,000 correspondiente al anticipo del contrato CTR-2026-001.',
    dt: 'Ayer, 11:20', leida: false,
  },
  {
    id: 3,
    titulo: 'Nueva factura pendiente de pago',
    cuerpo: 'La factura FAC-2026-0971 de XAF 10,000,000 emitida a Chevron está pendiente.',
    dt: '18/05/26', leida: true,
  },
];

export default function Topbar({ role, onMenuClick, hideNotifications = false }) {
  const { go } = useApp();
  const session      = useAuthStore(s => s.session);
  const adminSession = useAuthStore(s => s.adminSession);

  // Notificación de contrato recién encomendado por Bonafide/la Contratante, a
  // la espera de que este rol lo configure repartiéndolo entre sus propias
  // contrapartes (Subproceso 1 para la Contratante, Subproceso 2 para la
  // PYME). Se antepone al resto de notificaciones, con su propio CTA.
  const contratoNotifs = (() => {
    if (role === 'contratante') {
      return contratoService.listarPendientes('contratante').map(m => ({
        id: `marco-${m.id}`,
        titulo: 'Bonafide te asignó un nuevo contrato',
        cuerpo: `Contrato ${m.id} por ${fmt(m.montoBase)} XAF, financiado por ${m.bancoFondeador}. Repártelo entre tus Empresas Contratadas para activarlo.`,
        dt: m.fechaCreacion,
        leida: false,
        accion: { label: 'Proceder con el contrato', screenId: 'empConfigurarContrato', opts: { marcoId: m.id } },
      }));
    }
    if (role === 'empresa-pequena') {
      return contratoService.listarPendientes('pyme').map(c => ({
        id: `pymeCt-${c.id}`,
        titulo: `${c.contratanteNombre} te asignó un nuevo contrato`,
        cuerpo: `Contrato ${c.id} por ${fmt(c.montoAsignado)} XAF. Acepta los términos y repártelo entre tus proveedores para activarlo.`,
        dt: c.fechaAsignacion,
        leida: false,
        accion: { label: 'Proceder con el contrato', screenId: 'epConfigurarContrato', opts: { contratoId: c.id } },
      }));
    }
    if (role === 'proveedor') {
      return contratoService.listarPendientes('proveedor').map(c => ({
        id: `provCt-${c.id}`,
        titulo: `${c.pymeNombre} te asignó un nuevo contrato`,
        cuerpo: `Contrato ${c.id} por ${fmt(c.montoAsignado)} XAF. Repártelo entre tus suministradores para activarlo.`,
        dt: c.fechaAsignacion,
        leida: false,
        accion: { label: 'Proceder con el contrato', screenId: 'provConfigurarContrato', opts: { contratoId: c.id } },
      }));
    }
    if (role === 'fondeador') {
      return facturaService.bandejaOrdenes(BANCO).map(f => ({
        id: `fondOrd-${f.id}`,
        titulo: 'Nueva orden de fondeo recibida',
        cuerpo: `${f.contratante} envió la orden del IPI ${f.ipi?.numero ?? f.id} por ${fmt(f.monto)} XAF. Confirma la transferencia a Bonafide.`,
        dt: f.ipi?.fechaEmision ?? f.fecha,
        leida: false,
        accion: { label: 'Ir a Sistema', screenId: 'fondOrdenes' },
      }));
    }
    return [];
  })();
  const allNotifs = [...contratoNotifs, ...notifs];

  const [notifOpen, setNotifOpen] = useState(false);
  const [leidas,    setLeidas]    = useState(new Set(allNotifs.filter(n => n.leida).map(n => n.id)));
  const [ocultas,   setOcultas]   = useState(new Set());
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const fullName    = session?.user?.fullName ?? adminSession?.admin?.fullName ?? '';
  const meta        = ROLE_META[role] ?? { roleLabel: 'Bonafide', pill: null };
  const visibles    = allNotifs.filter(n => !ocultas.has(n.id));
  const pendientes  = visibles.filter(n => !leidas.has(n.id)).length;

  const handleProceder = (accion) => {
    setNotifOpen(false);
    go(accion.screenId, accion.opts);
  };

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
        {!hideNotifications && (
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
        )}

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
                    onClick={() => setLeidas(new Set(allNotifs.map(n => n.id)))}
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
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-xs text-text-4">{n.dt}</p>
                              {n.accion && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleProceder(n.accion); }}
                                  className="inline-flex items-center gap-1 text-xs font-semibold text-orange hover:underline cursor-pointer shrink-0"
                                >
                                  {n.accion.label}
                                  <ArrowRight className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
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
