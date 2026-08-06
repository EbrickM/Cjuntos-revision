import { useState } from 'react';
import {
  TrendingUp, FilePlus, ClipboardList, ArrowUpRight, ChevronRight, ShieldCheck, CheckCircle2, AlertCircle,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { IniAvatar, InfoRow } from './contratanteShared';
import { RED, ORA, GREEN, ERR, BLUE, BORDER, TEXT4, fmt, misSolicitudes, solicitudesPymes, solicBadge } from './contratanteData';

// ── SOLICITUDES ───────────────────────────────────────────────────────────────
const solicIconCfg = {
  'Ampliación de fondo': { Icon: TrendingUp,   iconBg: '#FDEEEB', iconColor: RED  },
  'Nuevo contrato':      { Icon: FilePlus,      iconBg: '#FFF3E0', iconColor: ORA  },
  'Renovación':          { Icon: ClipboardList, iconBg: '#EFF6FF', iconColor: BLUE },
};


export default function EmpSolicitudes() {
  const { go } = useApp();
  const [tab, setTab]         = useState('mis');
  const [solModal, setSolModal] = useState(null);

  const closeModal = () => setSolModal(null);

  const timelineSteps = s => {
    const isAprobada  = s.estado === 'Aprobada';
    const isRechazada = s.estado === 'Rechazada';
    return [
      { lbl: 'Enviada',     done: true,                        active: false,                         isResult: false, isRechazada: false },
      { lbl: 'En revisión', done: isAprobada || isRechazada,   active: s.estado === 'En revisión',    isResult: false, isRechazada: false },
      { lbl: isRechazada ? 'Rechazada' : 'Aprobada',
                            done: isAprobada || isRechazada,   active: false,                         isResult: true,  isRechazada },
    ];
  };

  return (
    <AppShell active="empSolicitudes" role="contratante" title="Solicitudes" sub="Mis solicitudes y oportunidades de PYMEs">
      <div className="fade-in space-y-4">

        {/* Tabs + acción */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <Button variant="primary" size="sm" className="w-full sm:w-auto sm:order-last justify-center" onClick={() => go('empNuevaSolicitud')}>
            <ArrowUpRight className="w-3.5 h-3.5 mr-1" />Nueva solicitud
          </Button>
          <div className="flex gap-1 bg-page-bg p-1 rounded-xl">
            {[{ id: 'mis', lbl: 'Mis solicitudes' }, { id: 'pymes', lbl: 'Solicitudes de PYMEs' }].map(t => (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex-1 py-2 px-4 rounded-[8px] text-[12px] font-semibold transition-all cursor-pointer whitespace-nowrap text-center ${
                  tab === t.id ? 'bg-white shadow-sm text-text-1' : 'text-text-4 hover:text-text-2'
                }`}>{t.lbl}
              </button>
            ))}
          </div>
        </div>

        {/* ── Mis solicitudes ── */}
        {tab === 'mis' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {misSolicitudes.map(s => {
                const cfg = solicIconCfg[s.tipo] ?? { Icon: ClipboardList, iconBg: '#FFF3E0', iconColor: ORA };
                return (
                  <div key={s.id} className="card-lift card-enter bg-white rounded-[14px] border border-border p-5 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ background: cfg.iconBg }}>
                          <cfg.Icon className="w-5 h-5" style={{ color: cfg.iconColor }} />
                        </div>
                        <div>
                          <p className="text-[12px] font-bold text-text-1">{s.tipo}</p>
                          <p className="text-[10px] font-mono" style={{ color: TEXT4 }}>{s.id}</p>
                        </div>
                      </div>
                      <Badge variant={solicBadge(s.estado)}>{s.estado}</Badge>
                    </div>
                    <p className="text-[12px] text-text-3 leading-snug">{s.desc}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-border mt-auto">
                      <div>
                        <p className="text-[16px] font-extrabold text-text-1 leading-none">{fmt(s.monto)}</p>
                        <p className="text-[10px] mt-0.5" style={{ color: TEXT4 }}>XAF · {s.fecha}</p>
                      </div>
                      <button onClick={() => setSolModal(s)}
                        className="text-[11px] font-semibold flex items-center gap-0.5 hover:opacity-75 transition cursor-pointer" style={{ color: ORA }}>
                        Ver detalle <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
        )}

        {/* ── Solicitudes de PYMEs ── */}
        {tab === 'pymes' && (
          <div className="space-y-4">
            <div className="bg-page-bg border border-border rounded-[12px] p-3.5 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" style={{ color: ORA }} />
              <p className="text-[12px]" style={{ color: TEXT4 }}>
                Estas PYMEs te han declarado como su empresa contratante. Haz clic en <strong className="text-text-2">Participar</strong> para confirmar tu participación e iniciar el proceso con Bonafide.
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {solicitudesPymes.map(s => (
                <div key={s.id} className="card-lift card-enter bg-white rounded-[14px] border border-border p-5 flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <IniAvatar ini={s.ini} size={44} />
                    <div>
                      <p className="text-[13px] font-bold text-text-1">{s.pyme}</p>
                      <p className="text-[11px]" style={{ color: TEXT4 }}>{s.sector} · {s.fecha}</p>
                    </div>
                  </div>
                  <p className="text-[12px] text-text-3 leading-snug flex-1">{s.desc}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <div>
                      <p className="text-[18px] font-extrabold text-text-1 leading-none">{fmt(s.monto)}</p>
                      <p className="text-[10px] mt-0.5" style={{ color: TEXT4 }}>XAF solicitados</p>
                    </div>
                    <Button variant="primary" size="sm">
                      <TrendingUp className="w-3.5 h-3.5 mr-1" />Participar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── Modal detalle solicitud ── */}
      {solModal && (() => {
        const s     = solModal;
        const cfg   = solicIconCfg[s.tipo] ?? { Icon: ClipboardList, iconBg: '#FFF3E0', iconColor: ORA };
        const steps = timelineSteps(s);
        return (
          <Modal title={`Solicitud · ${s.id}`} onClose={closeModal}
            footer={<Button variant="ghost" size="sm" onClick={closeModal} className="ml-auto">Cerrar</Button>}
          >
            <div className="space-y-5">

              {/* Hero */}
              <div className="flex items-start gap-4 p-4 rounded-[12px]" style={{ background: '#F8F7F5' }}>
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: cfg.iconBg }}>
                  <cfg.Icon className="w-6 h-6" style={{ color: cfg.iconColor }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-text-1">{s.tipo}</p>
                  <p className="text-[11px] font-mono mt-0.5" style={{ color: TEXT4 }}>{s.id} · {s.fecha}</p>
                </div>
                <Badge variant={solicBadge(s.estado)}>{s.estado}</Badge>
              </div>

              {/* Info grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2"><InfoRow label="Descripción" value={s.desc} /></div>
                <InfoRow label="Monto solicitado" value={`${fmt(s.monto)} XAF`} />
                <InfoRow label="Fecha de envío"   value={s.fecha} />
              </div>

              {/* Timeline */}
              <div>
                <p className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-4">Estado del proceso</p>
                <div className="flex items-start">
                  {steps.map((step, i) => {
                    const isLast    = i === steps.length - 1;
                    const dotColor  = step.done ? (step.isRechazada ? ERR : GREEN) : step.active ? ORA : BORDER;
                    const lineColor = steps[i + 1]?.done ? GREEN : BORDER;
                    return (
                      <div key={i} className={`flex flex-col items-center ${isLast ? '' : 'flex-1'}`}>
                        <div className="flex items-center w-full">
                          <div className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
                            style={{ borderColor: dotColor, background: step.done ? dotColor : 'white' }}>
                            {step.done && !step.isRechazada && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                            {step.done &&  step.isRechazada && <AlertCircle  className="w-3.5 h-3.5 text-white" />}
                            {!step.done && step.active      && <div className="w-2 h-2 rounded-full" style={{ background: ORA }} />}
                          </div>
                          {!isLast && <div className="flex-1 h-0.5 mx-1" style={{ background: lineColor }} />}
                        </div>
                        <p className="text-[10px] font-semibold mt-1.5 text-center leading-tight"
                          style={{ color: step.done && step.isRechazada ? ERR : step.done && step.isResult ? GREEN : step.active ? ORA : TEXT4 }}>
                          {step.lbl}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Mensaje contextual */}
              {s.estado === 'Aprobada' && (
                <div className="flex items-start gap-3 p-4 rounded-[12px]" style={{ background: '#E3F4EA', border: '1px solid #B6DFC9' }}>
                  <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: GREEN }} />
                  <div>
                    <p className="text-[13px] font-semibold" style={{ color: GREEN }}>Solicitud aprobada</p>
                    <p className="text-[11px] mt-0.5" style={{ color: GREEN }}>Bonafide ha procesado tu solicitud satisfactoriamente. El equipo de gestión se pondrá en contacto pronto.</p>
                  </div>
                </div>
              )}
              {s.estado === 'Rechazada' && (
                <div className="flex items-start gap-3 p-4 rounded-[12px]" style={{ background: '#FDEEEB', border: '1px solid #F5C3BB' }}>
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: ERR }} />
                  <div>
                    <p className="text-[13px] font-semibold" style={{ color: ERR }}>Solicitud rechazada</p>
                    <p className="text-[11px] mt-0.5" style={{ color: ERR }}>No fue posible aprobar esta solicitud en este momento. Para más información, contacta con tu gestor en Bonafide.</p>
                  </div>
                </div>
              )}

            </div>
          </Modal>
        );
      })()}

    </AppShell>
  );
}
