import { useState } from 'react';
import {
  ChevronRight, TrendingUp, CheckCircle2, FileText, ArrowUpRight, FilePlus,
} from 'lucide-react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import FormGroup, { Input } from '../../components/ui/FormGroup';
import { IniAvatar, SectionHeader } from './contratanteShared';
import { ORA, TEXT4, fmt, contratanteState } from './contratanteData';

// ── NUEVA SOLICITUD ───────────────────────────────────────────────────────────
export default function EmpNuevaSolicitud() {
  const { go } = useApp();
  const [sol]  = useState(() => { const v = contratanteState.solicitudPyme; contratanteState.solicitudPyme = null; return v; });
  const [tipo, setTipo]       = useState('Nuevo contrato');
  const [pymeName, setPymeName] = useState('');
  const [monto, setMonto]     = useState('');
  const [plazo, setPlazo]     = useState('');
  const [desc, setDesc]       = useState('');
  const [notas, setNotas]     = useState('');

  // ── Confirmation mode: participar en solicitud de PYME ──
  if (sol) {
    return (
      <AppShell active="empSolicitudes" role="contratante" title="Confirmar participación" sub={`${sol.pyme} · ${sol.id}`}>
        <div className="fade-in space-y-5 max-w-2xl">

          <button onClick={() => go('empSolicitudes')} className="flex items-center gap-1.5 text-[12px] font-semibold hover:opacity-75 transition cursor-pointer" style={{ color: ORA }}>
            <ChevronRight className="w-4 h-4 rotate-180" /> Volver a solicitudes
          </button>

          <div className="card-enter bg-white rounded-[14px] border border-border p-4 sm:p-6 space-y-5">
            <SectionHeader title="Solicitud de PYME" sub="Revisa los datos y confirma tu participación" Icon={TrendingUp} />

            {/* PYME hero */}
            <div className="flex items-center gap-4 p-4 rounded-[12px]" style={{ background: '#F8F7F5' }}>
              <IniAvatar ini={sol.ini} size={48} />
              <div className="flex-1 min-w-0">
                <p className="text-[15px] font-bold text-text-1">{sol.pyme}</p>
                <p className="text-[12px]" style={{ color: TEXT4 }}>{sol.sector} · {sol.fecha}</p>
                <p className="text-[11px] font-mono mt-0.5" style={{ color: TEXT4 }}>{sol.id}</p>
              </div>
            </div>

            {/* Datos de la solicitud (read-only) */}
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-1.5">Descripción del proyecto</p>
                <p className="text-[13px] text-text-1 px-3 py-2.5 rounded-[8px] border border-border bg-page-bg">{sol.desc}</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-1.5">Monto solicitado</p>
                  <p className="text-[13px] font-extrabold text-text-1 px-3 py-2.5 rounded-[8px] border border-border bg-page-bg">
                    {fmt(sol.monto)} <span className="text-[11px] font-semibold" style={{ color: TEXT4 }}>XAF</span>
                  </p>
                </div>
                <div>
                  <p className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-1.5">Sector</p>
                  <p className="text-[13px] text-text-1 px-3 py-2.5 rounded-[8px] border border-border bg-page-bg">{sol.sector}</p>
                </div>
              </div>
            </div>

            {/* Campos editables */}
            <div className="pt-2 border-t border-border">
              <FormGroup label="Plazo propuesto (meses)">
                <Input value={plazo} onChange={e => setPlazo(e.target.value)} placeholder="Ej. 12" />
              </FormGroup>
            </div>

            <FormGroup label="Notas adicionales">
              <textarea
                value={notas}
                onChange={e => setNotas(e.target.value)}
                rows={3}
                placeholder="Comentarios o condiciones adicionales para el contrato…"
                className="w-full px-3 py-2 text-[13px] rounded-[8px] border border-border bg-white text-text-1 focus:outline-none focus:border-orange resize-none"
              />
            </FormGroup>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-2 border-t border-border">
              <Button variant="ghost" size="sm" className="justify-center" onClick={() => go('empSolicitudes')}>Cancelar</Button>
              <Button variant="primary" size="sm" className="justify-center">
                <CheckCircle2 className="w-3.5 h-3.5 mr-1" />Confirmar participación
              </Button>
            </div>
          </div>

        </div>
      </AppShell>
    );
  }

  // ── Normal mode: nueva solicitud propia ──
  return (
    <AppShell active="empSolicitudes" role="contratante" title="Nueva Solicitud" sub="Empresa Contratante · TotalEnerGE S.A.">
      <div className="fade-in space-y-5 max-w-2xl">

        <button onClick={() => go('empContratos')} className="flex items-center gap-1.5 text-[12px] font-semibold hover:opacity-75 transition cursor-pointer" style={{ color: ORA }}>
          <ChevronRight className="w-4 h-4 rotate-180" /> Volver
        </button>

        <div className="card-enter bg-white rounded-[14px] border border-border p-4 sm:p-6 space-y-5">
          <SectionHeader title="Datos de la solicitud" sub="Completa los campos para iniciar el proceso con Bonafide" Icon={FilePlus} />

          <FormGroup label="Tipo de solicitud">
            <select
              value={tipo}
              onChange={e => setTipo(e.target.value)}
              className="w-full px-3 py-2.5 text-[13px] rounded-[8px] border border-border bg-white text-text-1 focus:outline-none focus:border-orange"
            >
              {['Nuevo contrato', 'Ampliación de fondo', 'Renovación'].map(t => (
                <option key={t}>{t}</option>
              ))}
            </select>
          </FormGroup>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormGroup label="PYME a contratar" className="mb-0">
              <Input value={pymeName} onChange={e => setPymeName(e.target.value)} placeholder="Nombre o RUC de la PYME" />
            </FormGroup>
            <FormGroup label="Monto solicitado (XAF)" className="mb-0">
              <Input value={monto} onChange={e => setMonto(e.target.value)} placeholder="Ej. 50.000.000" />
            </FormGroup>
            <FormGroup label="Plazo (meses)" className="mb-0">
              <Input value={plazo} onChange={e => setPlazo(e.target.value)} placeholder="Ej. 12" />
            </FormGroup>
          </div>

          <FormGroup label="Justificación / descripción">
            <textarea
              value={desc}
              onChange={e => setDesc(e.target.value)}
              rows={4}
              placeholder="Describe el objeto del contrato y la necesidad…"
              className="w-full px-3 py-2.5 text-[13px] rounded-[8px] border border-border bg-white text-text-1 focus:outline-none focus:border-orange resize-none"
            />
          </FormGroup>

          {/* Adjuntos */}
          <div className="rounded-[10px] border-2 border-dashed border-border p-4 sm:p-5 text-center">
            <FileText className="w-6 h-6 mx-auto mb-2 text-text-4" />
            <p className="text-[12px] font-semibold text-text-3">Adjuntar documentos</p>
            <p className="text-[11px] text-text-4">Contrato borrador, estados financieros, etc.</p>
            <button className="mt-2 text-[11px] font-semibold px-3 py-1.5 rounded-[8px] border border-border hover:bg-page-bg transition" style={{ color: ORA }}>
              Seleccionar archivos
            </button>
          </div>

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 sm:gap-3 pt-2 border-t border-border">
            <Button variant="ghost" size="sm" className="justify-center" onClick={() => go('empContratos')}>Cancelar</Button>
            <Button variant="primary" size="sm" className="w-full sm:w-auto justify-center">
              <ArrowUpRight className="w-3.5 h-3.5 mr-1" />Enviar solicitud
            </Button>
          </div>
        </div>

      </div>
    </AppShell>
  );
}
