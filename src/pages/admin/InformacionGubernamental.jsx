import { useState } from 'react';
import {
  Coins, Percent, Building2, Users, FileCheck2, Receipt,
  FileBarChart, Send, CheckCircle2, Eye,
} from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import { StatCard } from '../../components/common/StatCard';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import InfoRow from '../../components/ui/InfoRow';
import Modal from '../../components/ui/Modal';
import { Select } from '../../components/ui/FormGroup';

// ── INFORMACIÓN GUBERNAMENTAL ──────────────────────────────────────────────
// Módulo del admin (Bonafide) para generar y notificar, a plazos regulares,
// la información que dos ministerios requieren de la plataforma: Contenido
// Nacional (Hidrocarburos) y Recaudación/Digitalización de las finanzas
// (Hacienda). Selector superior con el mismo patrón de pestañas segmentadas
// ya usado en empresa-pequena/Solicitudes.jsx.

const fmt = n => new Intl.NumberFormat('de-DE').format(n);

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const formatDateDDMMYYYY = () => {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

const generarPeriodoLabel = (periodicidad) => {
  const now = new Date();
  const year = now.getFullYear();
  if (periodicidad === 'Mensual')    return `${MESES[now.getMonth()]} ${year}`;
  if (periodicidad === 'Trimestral') return `T${Math.floor(now.getMonth() / 3) + 1} ${year}`;
  return `${year}`;
};

const MINISTERIOS = [
  { id: 'hidrocarburos', lbl: 'Ministerio de Hidrocarburos' },
  { id: 'hacienda',      lbl: 'Ministerio de Hacienda' },
];

const KPIS_HIDROCARBUROS = [
  { label: '% Contenido Nacional Promedio',            value: '62%',              Icon: Percent },
  { label: 'PYMEs Locales Certificadas',                value: '18',               Icon: Building2 },
  { label: 'Empleo Local Generado',                     value: '340 personas',     Icon: Users },
  { label: 'Contratos con Cláusula de Contenido Nacional', value: '27',            Icon: FileCheck2 },
];

const KPIS_HACIENDA = [
  { label: 'Recaudación Fiscal Facilitada',   value: `${fmt(210_000_000)} XAF`, Icon: Coins },
  { label: '% Transacciones Digitalizadas',   value: '78%',                     Icon: Percent },
  { label: 'Retenciones Reportadas',          value: `${fmt(12_500_000)} XAF`,  Icon: Receipt },
  { label: 'Empresas Bancarizadas vía Plataforma', value: '46',                 Icon: Building2 },
];

const INFORMES_INICIALES = {
  hidrocarburos: [
    { id: 'INF-HC-2026-T1', periodo: 'T1 2026', tipo: 'Trimestral', fechaGeneracion: '05/04/2026', estado: 'Notificado', fechaNotificacion: '06/04/2026' },
    { id: 'INF-HC-2026-T2', periodo: 'T2 2026', tipo: 'Trimestral', fechaGeneracion: '04/07/2026', estado: 'Generado' },
  ],
  hacienda: [
    { id: 'INF-HA-2026-05', periodo: 'Mayo 2026',  tipo: 'Mensual', fechaGeneracion: '02/06/2026', estado: 'Notificado', fechaNotificacion: '03/06/2026' },
    { id: 'INF-HA-2026-06', periodo: 'Junio 2026', tipo: 'Mensual', fechaGeneracion: '02/07/2026', estado: 'Generado' },
  ],
};

const informeBadge = (estado) => estado === 'Notificado' ? 'green' : 'yellow';

// Contenido que se exporta en la notificación de cada informe, por ministerio.
const contenidoExport = (ministerio) =>
  ministerio === 'hidrocarburos'
    ? [
        { label: '% Contenido Nacional Promedio',             value: '62%' },
        { label: 'PYMEs Locales Certificadas',                value: '18' },
        { label: 'Empleo Local Generado',                     value: '340 personas' },
        { label: 'Contratos con Cláusula de Contenido Nacional', value: '27' },
        { label: 'Monto total facturado a hidrocarburos',     value: `${fmt(96_000_000)} XAF` },
        { label: 'Proveedores locales registrados',           value: '23' },
      ]
    : [
        { label: 'Recaudación Fiscal Facilitada',   value: `${fmt(210_000_000)} XAF` },
        { label: 'Retenciones Reportadas',          value: `${fmt(12_500_000)} XAF` },
        { label: '% Transacciones Digitalizadas',   value: '78%' },
        { label: 'Empresas Bancarizadas vía Plataforma', value: '46' },
        { label: 'Facturas digitalizadas en el período', value: '38' },
        { label: 'Nuevas empresas bancarizadas',    value: '9' },
      ];

export default function AdminInformacionGubernamental() {
  const [ministerio, setMinisterio] = useState('hidrocarburos');
  const [periodicidad, setPeriodicidad] = useState('Mensual');
  const [informes, setInformes] = useState(INFORMES_INICIALES);
  const [toast, setToast] = useState({ visible: false, message: '' });
  const [detalleInf, setDetalleInf] = useState(null);

  const showToast = (message) => {
    setToast({ visible: true, message });
    setTimeout(() => setToast(prev => ({ ...prev, visible: false })), 4500);
  };

  const kpis         = ministerio === 'hidrocarburos' ? KPIS_HIDROCARBUROS : KPIS_HACIENDA;
  const informesList = informes[ministerio];
  const ministerioLbl = MINISTERIOS.find(m => m.id === ministerio).lbl;

  const handleGenerar = () => {
    const nuevo = {
      id: `INF-${ministerio === 'hidrocarburos' ? 'HC' : 'HA'}-${Date.now()}`,
      periodo: generarPeriodoLabel(periodicidad),
      tipo: periodicidad,
      fechaGeneracion: formatDateDDMMYYYY(),
      estado: 'Generado',
    };
    setInformes(prev => ({ ...prev, [ministerio]: [nuevo, ...prev[ministerio]] }));
    showToast(`Informe ${periodicidad.toLowerCase()} generado para el ${ministerioLbl}.`);
  };

  const handleNotificar = (id) => {
    setInformes(prev => ({
      ...prev,
      [ministerio]: prev[ministerio].map(inf => inf.id === id
        ? { ...inf, estado: 'Notificado', fechaNotificacion: formatDateDDMMYYYY() }
        : inf),
    }));
    showToast(`Informe notificado al ${ministerioLbl}.`);
  };

  // Notificar desde el modal de detalle (sin cerrarlo) — refleja el cambio en vivo.
  const handleNotificarDesdeDetalle = () => {
    handleNotificar(detalleInf.id);
    setDetalleInf(prev => prev && { ...prev, estado: 'Notificado', fechaNotificacion: formatDateDDMMYYYY() });
  };

  return (
    <AppShell active="adminGobierno" role="admin" title="Información Gubernamental" sub="Contenido Nacional y Recaudación/Digitalización, para los ministerios correspondientes">
      <div className="fade-in space-y-5">

        {/* Selector de ministerio — mismo patrón de pestañas segmentadas que
            empresa-pequena/Solicitudes.jsx */}
        <div className="flex gap-1 bg-page-bg p-1 rounded-xl w-fit max-w-full overflow-x-auto">
          {MINISTERIOS.map(m => (
            <button
              key={m.id}
              onClick={() => setMinisterio(m.id)}
              className={`py-2 px-4 rounded-[8px] text-[12px] font-semibold transition-all cursor-pointer whitespace-nowrap text-center ${
                ministerio === m.id ? 'bg-white shadow-sm text-text-1' : 'text-text-4 hover:text-text-2'
              }`}
            >
              {m.lbl}
            </button>
          ))}
        </div>

        {/* KPIs del ministerio activo */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map(({ label, value, Icon }) => (
            <StatCard key={label} label={label} value={value} Icon={Icon} />
          ))}
        </div>

        {/* Generar informe */}
        <div className="bg-white rounded-[14px] border border-border p-5">
          <div className="flex items-center gap-3 mb-4">
            <div className="bona-gradient-bg w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0">
              <FileBarChart className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-[14px] font-bold text-text-1">Generar informe</div>
              <div className="text-[12px] text-text-4">
                {ministerio === 'hidrocarburos'
                  ? 'Reporte de contenido nacional a plazos, para notificar al Ministerio de Hidrocarburos.'
                  : 'Reporte de recaudación y digitalización de las finanzas, para notificar al Ministerio de Hacienda.'}
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-end gap-3">
            <div className="w-full sm:w-52">
              <label className="text-[11px] font-semibold uppercase tracking-wide text-text-4 block mb-1.5">Periodicidad</label>
              <Select value={periodicidad} onChange={e => setPeriodicidad(e.target.value)}>
                <option value="Mensual">Mensual</option>
                <option value="Trimestral">Trimestral</option>
                <option value="Anual">Anual</option>
              </Select>
            </div>
            <Button variant="primary" onClick={handleGenerar} className="sm:mb-0.5">
              <FileBarChart className="w-4 h-4" />
              Generar informe
            </Button>
          </div>
        </div>

        {/* Historial de informes */}
        <div className="bg-white rounded-[14px] border border-border p-5">
          <div className="mb-4">
            <div className="text-[14px] font-bold text-text-1">Informes generados</div>
            <div className="text-[12px] text-text-4">Historial de reportes y su estado de notificación al {ministerioLbl}.</div>
          </div>

          {/* Móvil: cards */}
          <div className="sm:hidden space-y-2">
            {informesList.map(inf => (
              <div key={inf.id} className="rounded-[12px] border border-border p-3.5 flex flex-col gap-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="text-[13px] font-bold text-text-1">{inf.periodo}</div>
                    <div className="text-[11px] text-text-4">{inf.tipo} · Generado {inf.fechaGeneracion}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setDetalleInf(inf)} title="Ver detalles a exportar"
                      className="p-1.5 rounded-[8px] hover:bg-orange-tint transition text-text-4 hover:text-orange cursor-pointer">
                      <Eye className="w-4 h-4" />
                    </button>
                    <Badge variant={informeBadge(inf.estado)}>{inf.estado}</Badge>
                  </div>
                </div>
                {inf.estado === 'Generado' ? (
                  <Button variant="primary" size="sm" onClick={() => handleNotificar(inf.id)} className="justify-center">
                    <Send className="w-3.5 h-3.5 mr-1" />Notificar al Ministerio
                  </Button>
                ) : (
                  <div className="text-[11px] text-text-4">Notificado el {inf.fechaNotificacion}</div>
                )}
              </div>
            ))}
            {informesList.length === 0 && (
              <div className="text-[12px] text-text-4 text-center py-8">Aún no se generó ningún informe.</div>
            )}
          </div>

          {/* Desktop: tabla */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-[640px]">
              <thead className="bg-page-bg">
                <tr className="border-b border-border">
                  {['Periodo', 'Tipo', 'Fecha de Generación', 'Estado', 'Detalle', ''].map((h, i) => (
                    <th key={h || 'accion'} className={`text-xs font-semibold text-text-4 uppercase tracking-wide px-4 py-3 ${i >= 4 ? 'text-center' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {informesList.map(inf => (
                  <tr key={inf.id} className="border-b border-border last:border-0 hover:bg-orange-tint/40 transition-colors">
                    <td className="px-4 py-3 text-[12px] font-bold text-text-1 whitespace-nowrap">{inf.periodo}</td>
                    <td className="px-4 py-3 text-[12px] text-text-4">{inf.tipo}</td>
                    <td className="px-4 py-3 text-[12px] text-text-4 whitespace-nowrap">{inf.fechaGeneracion}</td>
                    <td className="px-4 py-3">
                      <Badge variant={informeBadge(inf.estado)}>{inf.estado}</Badge>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button onClick={() => setDetalleInf(inf)} title="Ver detalles a exportar"
                        className="p-1.5 rounded-[8px] hover:bg-orange-tint transition text-text-4 hover:text-orange cursor-pointer">
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {inf.estado === 'Generado' ? (
                        <Button variant="primary" size="sm" onClick={() => handleNotificar(inf.id)}>
                          <Send className="w-3.5 h-3.5" />Notificar
                        </Button>
                      ) : (
                        <span className="text-[11px] text-text-5 whitespace-nowrap">{inf.fechaNotificacion}</span>
                      )}
                    </td>
                  </tr>
                ))}
                {informesList.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-[12px] text-text-4">Aún no se generó ningún informe.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* ── Modal: Detalle del informe (contenido a exportar) ── */}
      {detalleInf && (
        <Modal
          title={`Detalle del Informe · ${detalleInf.id}`}
          onClose={() => setDetalleInf(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setDetalleInf(null)}>Cerrar</Button>
              {detalleInf.estado !== 'Notificado' && (
                <Button variant="primary" onClick={handleNotificarDesdeDetalle}>
                  <Send className="w-4 h-4" />Notificar al Ministerio
                </Button>
              )}
            </>
          }
          wide
        >
          <div className="space-y-5">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <InfoRow label="Periodo" value={detalleInf.periodo} />
              <InfoRow label="Tipo" value={detalleInf.tipo} />
              <InfoRow label="Estado" value={detalleInf.estado} />
              <InfoRow label="Fecha de Generación" value={detalleInf.fechaGeneracion} />
              {detalleInf.fechaNotificacion && (
                <InfoRow label="Fecha de Notificación" value={detalleInf.fechaNotificacion} />
              )}
            </div>

            <div>
              <div className="text-[10px] font-semibold text-text-4 uppercase tracking-wide mb-2">Contenido a exportar · {ministerioLbl}</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {contenidoExport(ministerio).map(({ label, value }) => (
                  <div key={label} className="rounded-[10px] border border-border p-3 flex items-center justify-between gap-2 bg-page-bg/40">
                    <span className="text-[12px] text-text-4">{label}</span>
                    <span className="text-[13px] font-extrabold text-text-1 whitespace-nowrap">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* ── Toast ── */}
      <div className={`fixed bottom-6 right-6 z-50 w-[340px] bg-white rounded-[14px] shadow-xl border border-border p-4 flex items-start gap-3 transition-all duration-300 ease-out
        ${toast.visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}
      >
        <div className="w-8 h-8 rounded-[8px] bg-orange-tint flex items-center justify-center shrink-0 mt-0.5">
          <CheckCircle2 className="w-4 h-4 text-orange" />
        </div>
        <div>
          <div className="text-[13px] font-semibold text-text-1 mb-0.5">Acción completada</div>
          <div className="text-[12px] text-text-4 leading-snug">{toast.message}</div>
        </div>
      </div>
    </AppShell>
  );
}
