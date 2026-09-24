import { useState } from 'react';
import {
  TrendingUp, FilePlus, ClipboardList, ChevronRight, CheckCircle2, AlertCircle, Mail,
} from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import InfiniteScrollSentinel from '../../components/common/InfiniteScrollSentinel';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
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
  const [tab, setTab]         = useState('mis');
  const [solModal, setSolModal] = useState(null);

  const closeModal = () => setSolModal(null);

  // Sin delay artificial — la lógica de paginado queda lista para cuando
  // haya suficientes registros reales del backend como para necesitarla.
  const { visibleItems: pagedMisSolicitudes, hasMore: hasMoreMis, loading: loadingMis, sentinelRef: sentinelMisRef } =
    useInfiniteScroll(misSolicitudes, { pageSize: 10, delay: 0 });
  const { visibleItems: pagedSolicitudesPymes, hasMore: hasMorePymes, loading: loadingPymes, sentinelRef: sentinelPymesRef } =
    useInfiniteScroll(solicitudesPymes, { pageSize: 10, delay: 0 });

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
    <AppShell active="empSolicitudes" role="contratante" title="Solicitudes" sub="Mis solicitudes y oportunidades de Empresas Contratadas" back
      headerRight={
        <div className="flex bg-white rounded-[10px] gap-1 shrink-0">
          {[
            { id: 'mis',   lbl: 'Mis solicitudes',             Icon: ClipboardList },
            { id: 'pymes', lbl: 'Solicitudes de Emp. Contratadas', Icon: Mail      },
          ].map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`bona-btn py-1.5 px-4 rounded-[8px] text-[12px] font-medium transition-all cursor-pointer whitespace-nowrap inline-flex items-center justify-center gap-1.5 ${
                tab === t.id ? 'bg-[#EF7A2C] shadow-sm text-white font-semibold' : 'text-text-3 hover:text-text-1'
              }`}>
              <t.Icon className="w-3.5 h-3.5 shrink-0" />
              {t.lbl}
            </button>
          ))}
        </div>
      }
    >
      <div className="fade-in space-y-4">

        {/* ── Mis solicitudes ── */}
        {tab === 'mis' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pagedMisSolicitudes.map(s => {
                const cfg = solicIconCfg[s.tipo] ?? { Icon: ClipboardList, iconBg: '#FFF3E0', iconColor: ORA };
                return (
                  <div key={s.id} className="card-lift card-enter bg-white rounded-[14px] border border-border p-5 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="bona-gradient-bg w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
                          <cfg.Icon className="w-5 h-5 text-white" />
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
              <InfiniteScrollSentinel sentinelRef={sentinelMisRef} loading={loadingMis} hasMore={hasMoreMis} />
            </div>
        )}

        {/* ── Solicitudes de PYMEs ── */}
        {tab === 'pymes' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {pagedSolicitudesPymes.map(s => (
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
              <InfiniteScrollSentinel sentinelRef={sentinelPymesRef} loading={loadingPymes} hasMore={hasMorePymes} />
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
                <div className="bona-gradient-bg w-11 h-11 rounded-xl flex items-center justify-center shrink-0">
                  <cfg.Icon className="w-6 h-6 text-white" />
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
