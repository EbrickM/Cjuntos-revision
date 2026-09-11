import { useState } from 'react';
import {
  CheckCircle, AlertCircle, ChevronRight, ShieldCheck, ClipboardList, TrendingUp, Leaf, Building2,
  User, FileCheck, CheckCircle2, Shield, Star, Clock, Search,
} from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { InfoRow, ComplianceItem, IniAvatar } from './contratanteShared';
import { RED, ORA, GREEN, WARN, ERR, TEXT4, BORDER, BLUE, fmt, contratos, pymes, semBadge, semColor, scoreColor } from './contratanteData';

// ── PYMEs ─────────────────────────────────────────────────────────────────────
export default function EmpPymes() {
  const [busqueda, setBusqueda] = useState('');
  const [pymeModal, setPymeModal] = useState(null);

  const verde    = pymes.filter(p => p.semaforo === 'Verde').length;
  const amarillo = pymes.filter(p => p.semaforo === 'Amarillo').length;
  const rojo     = pymes.filter(p => p.semaforo === 'Rojo').length;

  const filtradas = busqueda.trim()
    ? pymes.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.sector.toLowerCase().includes(busqueda.toLowerCase())
      )
    : pymes;

  return (
    <AppShell active="empPymes" role="contratante" title="PYMEs" sub="Empresas con contrato activo">
      <div className="fade-in space-y-5">

        {/* KPIs de semáforo de riesgo */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3">
          {[
            { lbl: 'Riesgo bajo',  val: verde,    Icon: CheckCircle, iconBg: '#E3F4EA', iconColor: GREEN },
            { lbl: 'Riesgo medio', val: amarillo, Icon: AlertCircle, iconBg: '#FDF6E8', iconColor: WARN  },
            { lbl: 'Riesgo alto',  val: rojo,     Icon: AlertCircle, iconBg: '#FDEEEB', iconColor: ERR   },
          ].map(({ lbl, val, Icon, iconBg, iconColor }) => (
            <div key={lbl} className="card-lift card-enter bg-white rounded-[12px] border border-border p-2 sm:p-3 flex flex-col sm:flex-row items-center sm:items-center gap-1.5 sm:gap-3">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-[8px] sm:rounded-[10px] flex items-center justify-center shrink-0" style={{ background: iconBg }}>
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: iconColor }} />
              </div>
              <div className="min-w-0 text-center sm:text-left">
                <p className="text-[8px] sm:text-[9px] font-semibold text-text-4 uppercase tracking-wide mb-0.5">{lbl}</p>
                <p className="text-[13px] sm:text-[14px] font-extrabold leading-tight" style={{ color: iconColor }}>
                  {val} <span className="text-[9px] sm:text-[10px] font-semibold">PYME{val !== 1 ? 's' : ''}</span>
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Header + buscador */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-[13px] font-bold text-text-1">PYMEs contratadas</p>
            <p className="text-[11px]" style={{ color: TEXT4 }}>Score crediticio, fondo asignado y semáforo de riesgo</p>
          </div>
          <div className="relative w-full sm:w-52">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-4" />
            <input
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
              placeholder="Buscar PYME o sector…"
              className="w-full pl-8 pr-3 py-2 text-[12px] rounded-[8px] border border-border bg-white placeholder-text-4 focus:outline-none focus:border-orange"
            />
          </div>
        </div>

        {/* Grid de PYMEs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtradas.map(p => (
            <div key={p.nombre} className="card-lift card-enter bg-white rounded-[14px] border border-border p-5 flex flex-col">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <IniAvatar ini={p.ini} size={44} />
                  <div>
                    <p className="text-[13px] font-bold text-text-1 leading-snug">{p.nombre}</p>
                    <p className="text-[11px]" style={{ color: TEXT4 }}>{p.sector}</p>
                  </div>
                </div>
                <Badge variant={semBadge(p.semaforo)}>{p.semaforo}</Badge>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-page-bg rounded-[10px] p-3">
                  <p className="text-[9px] font-semibold uppercase tracking-wide mb-2" style={{ color: TEXT4 }}>Contratos</p>
                  <div className="flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4 shrink-0" style={{ color: ORA }} />
                    <p className="text-[15px] font-extrabold leading-none" style={{ color: ORA }}>{p.contratos}</p>
                  </div>
                </div>
                <div className="bg-page-bg rounded-[10px] p-3">
                  <p className="text-[9px] font-semibold uppercase tracking-wide mb-2" style={{ color: TEXT4 }}>Fondo</p>
                  <div className="flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 shrink-0" style={{ color: RED }} />
                    <div>
                      <p className="text-[13px] font-extrabold leading-tight text-text-1">{fmt(p.montoTotal)}</p>
                      <p className="text-[9px] font-semibold leading-tight" style={{ color: TEXT4 }}>XAF</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-1 flex justify-between items-center">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5" style={{ color: TEXT4 }} />
                  <span className="text-[10px] font-semibold" style={{ color: TEXT4 }}>Score crediticio</span>
                </div>
                <span className="text-[11px] font-bold" style={{ color: scoreColor(p.score) }}>{p.score}/1000</span>
              </div>
              <div className="h-2 rounded-full overflow-hidden mb-4" style={{ background: BORDER }}>
                <div className="h-full rounded-full" style={{ width: `${p.score / 10}%`, background: scoreColor(p.score) }} />
              </div>

              <div className="mt-auto pt-1 flex justify-end">
                <button
                  onClick={() => setPymeModal(p)}
                  className="text-[11px] font-semibold flex items-center gap-0.5 hover:opacity-75 cursor-pointer transition"
                  style={{ color: ORA }}
                >
                  Ver detalles <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {filtradas.length === 0 && (
            <div className="col-span-full py-12 flex flex-col items-center gap-2" style={{ color: TEXT4 }}>
              <Search className="w-8 h-8" />
              <p className="text-[13px] font-semibold">Sin resultados para "{busqueda}"</p>
            </div>
          )}
        </div>

      </div>

      {/* ── Modal: Detalle de PYME ── */}
      {pymeModal && (() => {
        const p = pymeModal;
        const pymesContratos = contratos.filter(c => c.ini === p.ini);
        const ModalLabel = ({ text, Icon }) => (
          <div className="flex items-center gap-2 mb-3">
            {Icon && (
              <div className="bona-gradient-bg w-5 h-5 rounded-[5px] flex items-center justify-center shrink-0">
                <Icon className="w-3 h-3 text-white" />
              </div>
            )}
            <span className="text-[10px] font-semibold text-text-4 uppercase tracking-wide">{text}</span>
          </div>
        );
        return (
          <Modal
            wide
            title={p.nombre}
            onClose={() => setPymeModal(null)}
            footer={<Button variant="ghost" size="sm" className="ml-auto" onClick={() => setPymeModal(null)}>Cerrar</Button>}
          >
            <div className="space-y-6">

              {/* Hero */}
              <div className="flex items-center gap-4 p-4 rounded-[12px]" style={{ background: '#F8F7F5' }}>
                <IniAvatar ini={p.ini} size={52} />
                <div className="flex-1 min-w-0">
                  <p className="text-[16px] font-bold text-text-1 leading-snug">{p.nombre}</p>
                  <p className="text-[12px]" style={{ color: TEXT4 }}>{p.nombreComercial} · {p.sector}</p>
                  <p className="text-[11px] font-mono mt-0.5" style={{ color: TEXT4 }}>{p.ruc}</p>
                </div>
                <div className="flex flex-col items-end gap-1.5 shrink-0">
                  <Badge variant={semBadge(p.semaforo)}>{p.semaforo}</Badge>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-[6px] text-[10px] font-semibold" style={{ background: '#E3F4EA', color: GREEN }}>
                    <Leaf className="w-3 h-3" />ESG Verde CO₂
                  </div>
                </div>
              </div>

              {/* Score crediticio */}
              <div className="rounded-[12px] border border-border p-4">
                <ModalLabel text="Score crediticio" Icon={ShieldCheck} />
                <div className="flex items-end gap-4 mb-3">
                  <span className="text-[42px] font-extrabold leading-none" style={{ color: scoreColor(p.score) }}>{p.score}</span>
                  <div className="pb-1">
                    <p className="text-[13px] font-bold" style={{ color: scoreColor(p.score) }}>
                      {p.score >= 750 ? 'Riesgo Bajo' : p.score >= 500 ? 'Riesgo Medio' : 'Riesgo Alto'}
                    </p>
                    <p className="text-[11px]" style={{ color: TEXT4 }}>sobre 1000 puntos</p>
                  </div>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden" style={{ background: BORDER }}>
                  <div className="h-full rounded-full" style={{ width: `${p.score / 10}%`, background: scoreColor(p.score) }} />
                </div>
                <div className="flex justify-between text-[10px] mt-1.5" style={{ color: TEXT4 }}>
                  <span>0 — Alto riesgo</span><span>1000 — Bajo riesgo</span>
                </div>
              </div>

              {/* Datos de identidad */}
              <div>
                <ModalLabel text="Datos de Identidad" Icon={Building2} />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <InfoRow label="Razón Social"      value={p.nombre} />
                  <InfoRow label="Nombre Comercial"  value={p.nombreComercial} />
                  <InfoRow label="RUC / NIF"         value={p.ruc} />
                  <InfoRow label="Sector Productivo" value={p.sector} />
                  <InfoRow label="Teléfono"          value={p.telefono} />
                  <InfoRow label="Correo"            value={p.correo} />
                </div>
              </div>

              {/* Representante Legal */}
              <div>
                <ModalLabel text="Representante Legal" Icon={User} />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  <InfoRow label="Nombre y Apellido"    value={p.repNombre} />
                  <InfoRow label="Tipo de Documento"    value={p.repTipoDoc} />
                  <InfoRow label="Nº de Identificación" value={p.repId} />
                  <InfoRow label="Cargo"                value={p.repCargo} />
                  <InfoRow label="Teléfono"             value={p.repTel} />
                  <InfoRow label="Correo"               value={p.repCorreo} />
                </div>
              </div>

              {/* Compliance */}
              <div>
                <ModalLabel text="Compliance & Documentos" Icon={FileCheck} />
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  <ComplianceItem label="KYC"        value="Vigente"    sub="Vence 31/12/2026"         Icon={CheckCircle2} iconBg="#E3F4EA" iconColor={GREEN} />
                  <ComplianceItem label="AML"        value="Aprobado"   sub="Sin alertas"               Icon={Shield}       iconBg="#E3F4EA" iconColor={GREEN} />
                  <ComplianceItem label="Documentos" value="4 / 4"      sub="Todos verificados"         Icon={FileCheck}    iconBg="#EFF6FF" iconColor={BLUE}  />
                  <ComplianceItem label="Nivel"      value="A"          sub="Calificación normativa"    Icon={Star}         iconBg="#EFF6FF" iconColor={BLUE}  />
                  <ComplianceItem label="Auditoría"  value="Mar 2026"   sub="Próx. revisión Sep 2026"  Icon={Clock}        iconBg="#FDF6E8" iconColor={WARN}  />
                  <ComplianceItem label="Semáforo"   value={p.semaforo} sub="Riesgo global asignado"   Icon={ShieldCheck}  iconBg={semColor(p.semaforo) + '20'} iconColor={semColor(p.semaforo)} />
                </div>
              </div>

              {/* Contratos */}
              <div>
                <ModalLabel text={`Contratos con TotalEnerGE (${pymesContratos.length})`} Icon={ClipboardList} />
                {pymesContratos.length === 0 ? (
                  <p className="text-[12px] text-center py-4" style={{ color: TEXT4 }}>Sin contratos activos</p>
                ) : (
                  <div className="space-y-2">
                    {pymesContratos.map(c => {
                      const pctC = Math.round((c.utilizado / c.asignado) * 100);
                      const barC = pctC > 90 ? ERR : pctC > 70 ? WARN : GREEN;
                      return (
                        <div key={c.id} className="flex items-center gap-4 p-3.5 rounded-[12px] border border-border">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-[12px] font-bold text-text-1 font-mono">{c.id}</span>
                              <Badge variant={c.estado === 'Activo' ? 'green' : 'gray'}>{c.estado}</Badge>
                            </div>
                            <p className="text-[11px] truncate" style={{ color: TEXT4 }}>{c.objeto}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-[13px] font-extrabold text-text-1">{fmt(c.asignado / 1_000_000)}M XAF</p>
                            <p className="text-[10px] font-semibold" style={{ color: barC }}>{pctC}% utilizado</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          </Modal>
        );
      })()}
    </AppShell>
  );
}
