import { useState } from 'react';
import {
  Eye, ShieldCheck, ClipboardList, Leaf, Building2,
  User, FileCheck, CheckCircle2, Shield, Star, Clock, Search, Plus,
} from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import { StatCard } from '../../components/common/StatCard';
import InfiniteScrollSentinel from '../../components/common/InfiniteScrollSentinel';
import { useInfiniteScroll } from '../../hooks/useInfiniteScroll';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import FormGroup, { Input, Select } from '../../components/ui/FormGroup';
import { InfoRow, ComplianceItem, IniAvatar, useSuministradores } from './provShared';
import { ORA, GREEN, TEXT4, BORDER, fmt, contratos, semBadge, semColor, scoreColor, contratoBadge } from './provData';
import { contratoService } from '../../services/contrato.service';
import { CST } from '../../lib/contractStates';

const SECTORES = [
  'Energía', 'Construcción', 'Manufactura', 'Transporte', 'Tecnología',
  'Servicios', 'Alimentación', 'Minería', 'Agricultura', 'Comercio',
  'Materiales', 'Otro',
];

const PREFIJO_TEL = '+240';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const NUEVO_SUM_EMPTY = {
  open: false,
  nombre: '',
  nombreComercial: '',
  sector: 'Construcción',
  telefono: '',
  correo: '',
  contratoId: '',
};

const initials = (name = '') => {
  const words = name
    .replace(/[^A-Za-zÀ-ÿÑñ0-9 ]/g, '')
    .split(' ')
    .filter(Boolean);
  if (words.length === 0) return '--';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return words.slice(0, 2).map((w) => w[0].toUpperCase()).join('');
};

// ── SUMINISTRADORES ───────────────────────────────────────────────────────────
export default function ProvSuministradores() {
  const [busqueda, setBusqueda] = useState('');
  const [sumModal, setSumModal] = useState(null);
  const [lista, setLista] = useSuministradores();
  const [agregar, setAgregar] = useState(NUEVO_SUM_EMPTY);

  const verde    = lista.filter(p => p.semaforo === 'Verde').length;
  const amarillo = lista.filter(p => p.semaforo === 'Amarillo').length;
  const rojo     = lista.filter(p => p.semaforo === 'Rojo').length;

  const filtradas = busqueda.trim()
    ? lista.filter(p =>
        p.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
        p.sector.toLowerCase().includes(busqueda.toLowerCase())
      )
    : lista;

  // Sin delay artificial: al conectar el backend, la siguiente página debe
  // mostrarse en cuanto llegue, no tras una espera puesta a mano.
  const { visibleItems: pagedSuministradores, hasMore, loading, sentinelRef } =
    useInfiniteScroll(filtradas, { pageSize: 10, delay: 0, resetKey: busqueda });

  // Contratos activos del portal (para asignar la nueva entidad opcionalmente).
  const contratosActivos = contratoService
    .listarPorVista('proveedor')
    .filter(c => c.estado === CST.activo);

  const emailLimpio      = agregar.correo.trim();
  const emailInvalido    = emailLimpio !== '' && !EMAIL_REGEX.test(emailLimpio);
  const telefonoLocal    = agregar.telefono.replace(/\D/g, '');
  const telefonoValido   = /^\d{7,9}$/.test(telefonoLocal);
  const telefonoInvalido = telefonoLocal !== '' && !telefonoValido;
  // Todos los campos obligatorios (los marcados con *) deben estar completos
  // antes de habilitar "Guardar": Razón Social, Sector, Teléfono y Correo. El
  // Nombre Comercial y el contrato son explícitamente opcionales.
  const formOk = agregar.nombre.trim() && !!agregar.sector && telefonoValido && emailLimpio !== '' && !emailInvalido;

  const handleAgregar = () => {
    if (!formOk) return;
    const contratoId = agregar.contratoId;
    setLista((prev) => [
      {
        ini: initials(agregar.nombre),
        nombre: agregar.nombre.trim(),
        sector: agregar.sector,
        contratos: contratoId ? 1 : 0,
        contratoId: contratoId || null,
        montoTotal: 0,
        score: null,
        semaforo: 'En espera',
        nombreComercial: agregar.nombreComercial.trim(),
        ruc: '',
        telefono: `${PREFIJO_TEL} ${telefonoLocal}`,
        correo: emailLimpio,
        repNombre: '', repTipoDoc: '', repId: '', repCargo: '', repTel: '', repCorreo: '',
      },
      ...prev,
    ]);
    setAgregar(NUEVO_SUM_EMPTY);
  };

  return (
    <AppShell active="provSuministradores" role="proveedor" title="Suministradores" sub="Suministradores con contrato activo" back>
      <div className="fade-in space-y-5">

        {/* KPIs de semáforo de riesgo */}
        <div className="grid grid-cols-3 gap-3">
          {[
            { lbl: 'Riesgo bajo',  val: `${verde} Suministrador${verde !== 1 ? 'es' : ''}` },
            { lbl: 'Riesgo medio', val: `${amarillo} Suministrador${amarillo !== 1 ? 'es' : ''}` },
            { lbl: 'Riesgo alto',  val: `${rojo} Suministrador${rojo !== 1 ? 'es' : ''}` },
          ].map(({ lbl, val }) => (
            <StatCard key={lbl} label={lbl} value={val} tone="gradient" />
          ))}
        </div>

        {/* Header + buscador */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <p className="text-[13px] font-bold text-text-1">Suministradores contratados</p>
            <p className="text-[11px]" style={{ color: TEXT4 }}>Score crediticio, fondo asignado y semáforo de riesgo</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
            <Button
              size="sm"
              onClick={() => setAgregar({ ...NUEVO_SUM_EMPTY, open: true })}
            >
              <Plus className="w-3.5 h-3.5" /> Agregar Suministrador
            </Button>
            <div className="relative w-full sm:w-52">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-4" />
              <input
                value={busqueda}
                onChange={e => setBusqueda(e.target.value)}
                placeholder="Buscar suministrador o sector…"
                className="h-8 w-full pl-8 pr-3 text-[12px] rounded-[8px] border-2 border-orange bg-white placeholder-text-4 focus:outline-none focus:border-orange transition"
              />
            </div>
          </div>
        </div>

        {/* Tabla de Suministradores */}
        <div className="bg-white rounded-[14px] border border-border overflow-x-auto">
          {/* Header */}
          <div className="min-w-[640px] grid [grid-template-columns:3fr_1.5fr_1fr_1.2fr_1fr_1fr] bg-page-bg px-4 py-2.5 border-b border-border gap-3">
            <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide">Suministrador</span>
            <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Contratos</span>
            <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Fondo</span>
            <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Score</span>
            <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Semáforo</span>
            <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Acciones</span>
          </div>

          {/* Rows */}
          {pagedSuministradores.map((p) => (
            <div
              key={p.nombre}
              onClick={() => setSumModal(p)}
              className="min-w-[640px] grid [grid-template-columns:3fr_1.5fr_1fr_1.2fr_1fr_1fr] px-4 py-3 border-b border-border last:border-0 cursor-pointer transition-all duration-150 hover:scale-[1.01] hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)] hover:z-10 relative bg-white items-center gap-3"
            >
              {/* Suministrador */}
              <div className="flex items-center gap-2.5 min-w-0">
                <IniAvatar ini={p.ini} size={32} />
                <div className="min-w-0">
                  <div className="text-[13px] font-bold text-text-1 leading-tight truncate">{p.nombre}</div>
                  <div className="text-[11px] text-text-4">{p.sector}</div>
                </div>
              </div>

              {/* Contratos */}
              <span className="text-[12px] text-text-3 text-center">{p.contratos}</span>

              {/* Fondo */}
              <span className="text-[12px] font-semibold text-text-1 text-center">{fmt(p.montoTotal)} XAF</span>

              {/* Score */}
              <div className="flex justify-center">
                <div className="text-center">
                  <div className="text-[12px] font-semibold" style={{ color: scoreColor(p.score) }}>{p.score ?? '—'}</div>
                  {p.score != null && (
                    <div className="h-1.5 w-20 rounded-full mt-1" style={{ background: '#ECEAE7' }}>
                      <div className="h-full rounded-full" style={{ width: `${p.score / 10}%`, background: scoreColor(p.score) }} />
                    </div>
                  )}
                </div>
              </div>

              {/* Semáforo */}
              <div className="flex justify-center">
                <Badge variant={semBadge(p.semaforo)}>{p.semaforo}</Badge>
              </div>

              {/* Acciones */}
              <div className="flex justify-center">
                <button
                  onClick={e => { e.stopPropagation(); setSumModal(p); }}
                  className="p-1.5 rounded-[8px] transition text-text-4 hover:text-orange cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {filtradas.length === 0 && (
            <div className="min-w-[640px] px-4 py-10 text-center text-[13px] text-text-4">
              Sin resultados para "{busqueda}".
            </div>
          )}
          <InfiniteScrollSentinel sentinelRef={sentinelRef} loading={loading} hasMore={hasMore} />
        </div>

      </div>

      {/* ── Modal: Detalle de Suministrador ── */}
      {sumModal && (() => {
        const p = sumModal;
        // Contratos de este Proveedor donde el suministrador tiene monto
        // asignado (Subproceso 3 del BPMN: el Proveedor reparte su monto
        // entre sus propios Suministradores, por contrato). Si la entidad
        // nueva se vinculó a un contrato activo al crearla, también se lista.
        const contratosConSum = [
          ...contratos
            .map(c => ({ contrato: c, asignacion: (c.suministradores || []).find(s => s.nombre === p.nombre) }))
            .filter(x => x.asignacion),
          ...(p.contratoId && !(contratos.some(c => c.id === p.contratoId && (c.suministradores || []).some(s => s.nombre === p.nombre)))
            ? [{ contrato: contratos.find(c => c.id === p.contratoId), asignacion: { monto: 0 } }].filter(x => x.contrato)
            : []),
        ];
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
            onClose={() => setSumModal(null)}
            footer={<Button variant="ghost" size="sm" className="ml-auto" onClick={() => setSumModal(null)}>Cerrar</Button>}
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
                  <span className="text-[42px] font-extrabold leading-none" style={{ color: scoreColor(p.score) }}>{p.score ?? '—'}</span>
                  <div className="pb-1">
                    <p className="text-[13px] font-bold" style={{ color: scoreColor(p.score) }}>
                      {p.score == null
                        ? 'En espera de calificación'
                        : p.score >= 750 ? 'Riesgo Bajo' : p.score >= 500 ? 'Riesgo Medio' : 'Riesgo Alto'}
                    </p>
                    <p className="text-[11px]" style={{ color: TEXT4 }}>sobre 1000 puntos</p>
                  </div>
                </div>
                <div className="h-2.5 rounded-full overflow-hidden" style={{ background: BORDER }}>
                  {p.score != null && (
                    <div className="h-full rounded-full" style={{ width: `${p.score / 10}%`, background: scoreColor(p.score) }} />
                  )}
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
                  <ComplianceItem label="Documentos" value="4 / 4"      sub="Todos verificados"         Icon={FileCheck}    iconBg="#FFF3E0" iconColor={ORA}  />
                  <ComplianceItem label="Nivel"      value="A"          sub="Calificación normativa"    Icon={Star}         iconBg="#FFF3E0" iconColor={ORA}  />
                  <ComplianceItem label="Auditoría"  value="Mar 2026"   sub="Próx. revisión Sep 2026"  Icon={Clock}        iconBg="#FFF3E0" iconColor={ORA}  />
                  <ComplianceItem label="Semáforo"   value={p.semaforo} sub="Riesgo global asignado"   Icon={ShieldCheck}  iconBg={semColor(p.semaforo) + '20'} iconColor={semColor(p.semaforo)} />
                </div>
              </div>

              {/* Contratos */}
              <div>
                <ModalLabel text={`Contratos con APEX (${contratosConSum.length})`} Icon={ClipboardList} />
                {contratosConSum.length === 0 ? (
                  <p className="text-[12px] text-center py-4" style={{ color: TEXT4 }}>Sin contratos activos</p>
                ) : (
                  <div className="space-y-2">
                    {contratosConSum.map(({ contrato: c, asignacion }) => (
                      <div key={c.id} className="flex items-center gap-4 p-3.5 rounded-[12px] border border-border">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="text-[12px] font-bold text-text-1 font-mono">{c.id}</span>
                            <Badge variant={contratoBadge(c.estado)}>{c.estado}</Badge>
                          </div>
                          <p className="text-[11px] truncate" style={{ color: TEXT4 }}>{c.objeto}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-[13px] font-extrabold text-text-1">{fmt(asignacion.monto)} XAF</p>
                          <p className="text-[10px] font-semibold" style={{ color: GREEN }}>monto asignado</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </Modal>
        );
      })()}

      {/* ── Modal: Nuevo Suministrador ── */}
      {agregar.open && (
        <Modal
          title="Agregar Suministrador"
          onClose={() => setAgregar(NUEVO_SUM_EMPTY)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setAgregar(NUEVO_SUM_EMPTY)}>Cancelar</Button>
              <Button variant="primary" onClick={handleAgregar} disabled={!formOk}>Guardar Suministrador</Button>
            </>
          }
          wide
        >
          <div className="space-y-4">
            <div className="text-[12px] text-text-4">
              Registra un nuevo Suministrador en tu directorio. Quedará
              disponible para asignar el monto de tus contratos.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4">
              <FormGroup label="Razón Social" required>
                <Input
                  value={agregar.nombre}
                  onChange={e => setAgregar(a => ({ ...a, nombre: e.target.value }))}
                  placeholder="Ej: Distribuidora del Golfo"
                />
              </FormGroup>
              <FormGroup label="Nombre Comercial">
                <Input
                  value={agregar.nombreComercial}
                  onChange={e => setAgregar(a => ({ ...a, nombreComercial: e.target.value }))}
                  placeholder="Ej: Digolf"
                />
              </FormGroup>
              <FormGroup label="Sector Productivo" required>
                <Select
                  value={agregar.sector}
                  onChange={e => setAgregar(a => ({ ...a, sector: e.target.value }))}
                >
                  {SECTORES.map(s => <option key={s} value={s}>{s}</option>)}
                </Select>
              </FormGroup>
              <FormGroup label="Teléfono" required>
                <div className="flex">
                  <span className="flex items-center h-12 px-3 border-2 border-r-0 border-gray-200 rounded-l-[8px] bg-[#fafafa] text-[14px] font-semibold text-text-2">
                    {PREFIJO_TEL}
                  </span>
                  <Input
                    type="tel"
                    inputMode="numeric"
                    value={telefonoLocal.slice(0, 9)}
                    onChange={e => setAgregar(a => ({ ...a, telefono: e.target.value.replace(/\D/g, '').slice(0, 9) }))}
                    placeholder="222 XXX XXX"
                    className={`!rounded-l-none ${telefonoInvalido ? '!border-red-400 focus:!border-red-500' : ''}`}
                  />
                </div>
                {telefonoInvalido && (
                  <p className="text-xs text-red-500 mt-1.5">El teléfono debe tener entre 7 y 9 dígitos.</p>
                )}
              </FormGroup>
              <FormGroup label="Correo" required>
                <Input
                  type="email"
                  value={agregar.correo}
                  onChange={e => setAgregar(a => ({ ...a, correo: e.target.value }))}
                  placeholder="Ej: contacto@suministrador.gq"
                  className={emailInvalido ? '!border-red-400 focus:!border-red-500' : ''}
                />
                {emailInvalido && (
                  <p className="text-xs text-red-500 mt-1.5">Ingresa un correo electrónico válido.</p>
                )}
              </FormGroup>
              <FormGroup label="Añadir a contrato activo (opcional)">
                <Select
                  value={agregar.contratoId}
                  onChange={e => setAgregar(a => ({ ...a, contratoId: e.target.value }))}
                >
                  <option value="">Ninguno</option>
                  {contratosActivos.map(c => (
                    <option key={c.id} value={c.id}>{c.id} · {c.pymeNombre || c.pyme || c.objeto || 'Activo'}</option>
                  ))}
                </Select>
              </FormGroup>
            </div>
          </div>
        </Modal>
      )}
    </AppShell>
  );
}
