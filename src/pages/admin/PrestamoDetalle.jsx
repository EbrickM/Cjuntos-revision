import { useState } from 'react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Timeline from '../../components/ui/Timeline';

const prestamo = {
  id: 'PRE-2026-002',
  empresa: 'Pinturas Bata SL',
  ruc: 'GE-2022-00341',
  monto: '45,000,000',
  plazo: '6 meses',
  estado: 'Pendiente',
  cls: 'yellow',
  contratante: {
    empresa: 'TotalEnerGE SA',
    ruc: 'GE-2010-00011',
    contrato: 'CTR-2026-004',
    montoContrato: '60,000,000',
    repLegal: 'María Eyeang',
    email: 'm.eyeang@pinturasbata.gq',
    inicioContrato: '01/06/2026',
    finContrato: '31/05/2027',
    objeto: 'Pintura y acabados instalaciones TotalEnerGE Malabo.',
    verificado: true,
  },
  proveedores: [
    { nombre: 'PinMal SRL',     monto: '12,000,000', pagado: '2,800,000', disponible: '9,200,000' },
    { nombre: 'SumiColores GE', monto: '8,000,000',  pagado: '0',         disponible: '8,000,000' },
  ],
  distribucion: { reserva: '10,000,000', nomina: '7,000,000', proveedores: '28,000,000' },
  pagos: [
    { dt:'05/05/26', concepto:'Anticipo contrato CTR-2026-004', monto:'10,000,000', origen:'TotalEnerGE' },
  ],
  liberaciones: [
    { id:'LIB-003', proveedor:'PinMal SRL', monto:'2,800,000', justificante:'FAC-2026-0401.pdf', estado:'Pendiente', cls:'yellow', dt:'11/05' },
  ],
};

const timeline = [
  { label: 'Solicitud recibida',         done: true,  dt: '10 May' },
  { label: 'KYC completado',             done: true,  dt: '10 May' },
  { label: 'Datos contratante ingresados', done: true, dt: '10 May' },
  { label: 'Verificación por contratante', done: true, dt: '11 May' },
  { label: 'Revisión Bonafide',           done: false, dt: 'Hoy',   active: true },
  { label: 'Autorización préstamo',       done: false },
  { label: 'Desembolso fondos',           done: false },
];

export default function AdminPrestamoDetalle() {
  const { go } = useApp();
  const [tab, setTab] = useState('resumen');
  const [autorizado, setAutorizado] = useState(false);
  const [libAprobadas, setLibAprobadas] = useState({});

  return (
    <AppShell active="adminPrestamos" role="admin"
      title={`Préstamo ${prestamo.id}`} sub={`${prestamo.empresa} · XAF ${prestamo.monto}`}
      extra={<Button variant="ghost" size="sm" onClick={() => go('adminPrestamos')}>← Volver</Button>}
    >
      <div className="fade-in">
        {/* Header card */}
        <div className="bg-white rounded-[14px] border border-border p-5 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-[12px] bg-orange-tint flex items-center justify-center font-bold text-orange text-[16px]">
              {prestamo.empresa.slice(0,2).toUpperCase()}
            </div>
            <div>
              <div className="text-[16px] font-bold text-text-1">{prestamo.empresa}</div>
              <div className="text-[12px] text-text-4">RUC: {prestamo.ruc} · Contrato: {prestamo.contratante.contrato}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[22px] font-extrabold text-orange">XAF {prestamo.monto}</div>
              <div className="text-[12px] text-text-4">Plazo: {prestamo.plazo}</div>
            </div>
            <Badge variant={autorizado ? 'green' : prestamo.cls}>{autorizado ? 'Autorizado' : prestamo.estado}</Badge>
          </div>
        </div>

        {/* Verificación contratante alert */}
        {prestamo.contratante.verificado && !autorizado && (
          <div className="bg-green-bg border border-green-border rounded-[14px] p-4 mb-4 flex items-center gap-3">
            <span className="text-[20px]">✅</span>
            <div className="flex-1">
              <div className="text-[13px] font-bold text-green-text">El contratante ha verificado los datos del contrato</div>
              <div className="text-[11px] text-text-3">TotalEnerGE confirmó que la información es correcta. Puedes autorizar el préstamo.</div>
            </div>
            <Button variant="success" onClick={() => setAutorizado(true)}>✅ Autorizar Préstamo</Button>
          </div>
        )}

        {autorizado && (
          <div className="bg-green-bg border border-green-border rounded-[14px] p-4 mb-4 flex items-center gap-3">
            <span className="text-[20px]">🎉</span>
            <div className="text-[13px] font-bold text-green-text">Préstamo autorizado — los fondos han sido desembolsados a la empresa</div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-border rounded-[12px] p-1 mb-4 w-fit">
          {[['resumen','📋 Resumen'],['contratante','🏢 Contratante'],['proveedores','👥 Proveedores'],['distribucion','📊 Distribución'],['pagos','💳 Pagos'],['liberaciones','💸 Liberaciones']].map(([t,l]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3.5 py-2 rounded-[9px] text-[12px] font-semibold cursor-pointer border-none transition-all
                ${tab===t ? 'bg-orange text-white' : 'bg-transparent text-text-3 hover:bg-page-bg'}`}>{l}</button>
          ))}
        </div>

        {tab === 'resumen' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-4">
            <div className="bg-white rounded-[14px] border border-border p-5">
              <div className="text-[13px] font-bold text-text-1 mb-4">Timeline del Préstamo</div>
              <Timeline items={timeline} />
            </div>
            <div className="bg-white rounded-[14px] border border-border p-5">
              <div className="text-[13px] font-bold text-text-1 mb-3">Documentos</div>
              {[['📄','Contrato CTR-2026-004.pdf'],['🏦','Domiciliación bancaria.pdf'],['🪪','DNI Rep. Legal.pdf'],['📋','Declaración contratante.pdf']].map(([ico,name]) => (
                <div key={name} className="flex items-center gap-2.5 p-2.5 bg-page-bg rounded-[8px] mb-2 cursor-pointer hover:bg-orange-tint">
                  <span>{ico}</span>
                  <span className="text-[12px] font-medium text-text-2 flex-1">{name}</span>
                  <span className="text-[11px] text-orange">📥</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'contratante' && (
          <div className="bg-white rounded-[14px] border border-border p-5">
            <div className="flex items-center justify-between mb-4">
              <div className="text-[13px] font-bold text-text-1">Datos del Contratante</div>
              <Badge variant={prestamo.contratante.verificado ? 'green' : 'yellow'}>
                {prestamo.contratante.verificado ? '✅ Verificado por contratante' : '⏳ Pendiente verificación'}
              </Badge>
            </div>
            <div className="bg-page-bg rounded-[12px] p-4">
              {[
                ['Empresa contratante', prestamo.contratante.empresa],
                ['RUC', prestamo.contratante.ruc],
                ['Nº Contrato', prestamo.contratante.contrato],
                ['Monto del contrato', 'XAF ' + prestamo.contratante.montoContrato],
                ['Representante legal', prestamo.contratante.repLegal],
                ['Email', prestamo.contratante.email],
                ['Inicio contrato', prestamo.contratante.inicioContrato],
                ['Fin contrato', prestamo.contratante.finContrato],
                ['Objeto', prestamo.contratante.objeto],
              ].map(([k,v]) => (
                <div key={k} className="flex justify-between py-2.5 border-b border-border last:border-0">
                  <span className="text-[12px] text-text-4">{k}</span>
                  <span className="text-[13px] font-semibold text-text-1 max-w-[300px] text-right">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'proveedores' && (
          <div className="bg-white rounded-[14px] border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <span className="text-[14px] font-bold">Proveedores de la Empresa PYME</span>
            </div>
            <table className="w-full border-collapse">
              <thead><tr>{['Proveedor','Asignado (XAF)','Pagado (XAF)','Disponible (XAF)'].map(h=>(
                <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-text-4 uppercase bg-[#FAFBFC] border-b border-border">{h}</th>
              ))}</tr></thead>
              <tbody>
                {prestamo.proveedores.map(p => (
                  <tr key={p.nombre} className="border-b border-page-bg last:border-0">
                    <td className="px-4 py-3 font-semibold text-[13px]">{p.nombre}</td>
                    <td className="px-4 py-3 font-bold text-[13px]">XAF {p.monto}</td>
                    <td className="px-4 py-3 font-semibold text-green-text text-[13px]">XAF {p.pagado}</td>
                    <td className="px-4 py-3 font-semibold text-orange text-[13px]">XAF {p.disponible}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'distribucion' && (
          <div className="bg-white rounded-[14px] border border-border p-5">
            <div className="text-[13px] font-bold text-text-1 mb-4">Distribución del Crédito (planificación empresa)</div>
            <div className="grid grid-cols-3 gap-4">
              {[['🏦','Reserva de Capital', prestamo.distribucion.reserva,'bg-blue-bg text-blue-text'],
                ['👥','Nómina', prestamo.distribucion.nomina,'bg-green-bg text-green-text'],
                ['🚚','Proveedores', prestamo.distribucion.proveedores,'bg-orange-tint text-orange']].map(([ico,lbl,val,cls]) => (
                <div key={lbl} className={`rounded-[12px] p-4 ${cls}`}>
                  <div className="text-[18px] mb-2">{ico}</div>
                  <div className="text-[11px] font-semibold mb-1">{lbl}</div>
                  <div className="text-[18px] font-extrabold">XAF {val}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'pagos' && (
          <div className="bg-white rounded-[14px] border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <span className="text-[14px] font-bold">Pagos Recibidos del Contratante</span>
            </div>
            <table className="w-full border-collapse">
              <thead><tr>{['Fecha','Concepto','Origen','Monto XAF'].map(h=>(
                <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-text-4 uppercase bg-[#FAFBFC] border-b border-border">{h}</th>
              ))}</tr></thead>
              <tbody>
                {prestamo.pagos.map(p => (
                  <tr key={p.dt} className="border-b border-page-bg last:border-0">
                    <td className="px-4 py-3 text-[12px] text-text-4">{p.dt}</td>
                    <td className="px-4 py-3 text-[13px] font-medium">{p.concepto}</td>
                    <td className="px-4 py-3 text-[12px] text-text-3">{p.origen}</td>
                    <td className="px-4 py-3 font-bold text-[13px] text-green-text">XAF {p.monto}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {tab === 'liberaciones' && (
          <div className="bg-white rounded-[14px] border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <span className="text-[14px] font-bold">Solicitudes de Liberación de Fondos</span>
            </div>
            <table className="w-full border-collapse">
              <thead><tr>{['ID','Proveedor','Monto XAF','Justificante','Fecha','Estado','Acciones'].map(h=>(
                <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-text-4 uppercase bg-[#FAFBFC] border-b border-border">{h}</th>
              ))}</tr></thead>
              <tbody>
                {prestamo.liberaciones.map(l => {
                  const aprobada = l.estado === 'Aprobada' || libAprobadas[l.id];
                  return (
                    <tr key={l.id} className="border-b border-page-bg last:border-0">
                      <td className="px-4 py-3 font-mono text-[11px] text-text-4">{l.id}</td>
                      <td className="px-4 py-3 font-semibold text-[13px]">{l.proveedor}</td>
                      <td className="px-4 py-3 font-bold text-[13px]">XAF {l.monto}</td>
                      <td className="px-4 py-3">
                        <button className="text-[12px] text-orange underline cursor-pointer border-none bg-transparent">📄 {l.justificante}</button>
                      </td>
                      <td className="px-4 py-3 text-[12px] text-text-4">{l.dt}</td>
                      <td className="px-4 py-3"><Badge variant={aprobada ? 'green' : l.cls}>{aprobada ? 'Aprobada' : l.estado}</Badge></td>
                      <td className="px-4 py-3">
                        {!aprobada && (
                          <div className="flex gap-1.5">
                            <Button variant="danger" size="sm">✕</Button>
                            <Button variant="success" size="sm" onClick={() => setLibAprobadas(a=>({...a,[l.id]:true}))}>✅ Aprobar</Button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AppShell>
  );
}
