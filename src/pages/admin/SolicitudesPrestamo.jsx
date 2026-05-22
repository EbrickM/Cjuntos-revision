import { useState } from 'react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';

const prestamos = [
  {
    id: 'PRE-2026-001', empresa: 'Const. Silva Ltd.', contratante: 'TotalEnerGE',
    monto: '120,000,000', plazo: '12 meses', contrato: 'CTR-2026-001',
    verifContr: true, kyc: true, estado: 'Autorizado', cls: 'green', dt: '05/05/26',
    liberaciones: [
      { id:'LIB-001', proveedor:'CemGE SA',   monto:'5,200,000', estado:'Aprobada',  cls:'green',  dt:'12/05' },
      { id:'LIB-002', proveedor:'ElecBata SL', monto:'3,100,000', estado:'Aprobada',  cls:'green',  dt:'08/05' },
    ]
  },
  {
    id: 'PRE-2026-002', empresa: 'Pinturas Bata SL', contratante: 'TotalEnerGE',
    monto: '45,000,000', plazo: '6 meses', contrato: 'CTR-2026-004',
    verifContr: true, kyc: true, estado: 'Pendiente', cls: 'yellow', dt: '10/05/26',
    liberaciones: [
      { id:'LIB-003', proveedor:'PinMal SRL', monto:'2,800,000', estado:'Pendiente', cls:'yellow', dt:'11/05' },
    ]
  },
  {
    id: 'PRE-2026-003', empresa: 'LogiRapid GE', contratante: 'Infraconst. SA',
    monto: '80,000,000', plazo: '18 meses', contrato: 'CTR-2026-007',
    verifContr: false, kyc: true, estado: 'En revisión', cls: 'blue', dt: '12/05/26',
    liberaciones: []
  },
];

export default function AdminSolicitudesPrestamo() {
  const { go } = useApp();
  const [tab, setTab] = useState('prestamos');
  const [autorizados, setAutorizados] = useState({});
  const [libAprobadas, setLibAprobadas] = useState({});

  const allLibs = prestamos.flatMap(p => p.liberaciones.map(l => ({ ...l, empresa: p.empresa })));
  const libPendientes = allLibs.filter(l => l.estado === 'Pendiente');

  return (
    <AppShell active="adminPrestamos" role="admin" title="Solicitudes de Préstamo" sub="Gestión y aprobación">
      <div className="fade-in">
        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-border rounded-[12px] p-1 mb-6 w-fit">
          {[['prestamos','💼 Solicitudes Préstamo'],['liberaciones','💸 Liberaciones de Fondos']].map(([t,l]) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-[9px] text-[13px] font-semibold cursor-pointer border-none transition-all
                ${tab===t ? 'bg-orange text-white' : 'bg-transparent text-text-3 hover:bg-page-bg'}`}>{l}
              {t==='liberaciones' && libPendientes.length > 0 && (
                <span className="ml-1.5 bg-white text-orange text-[10px] font-bold px-[6px] py-0.5 rounded-full">{libPendientes.length}</span>
              )}
            </button>
          ))}
        </div>

        {tab === 'prestamos' && (
          <>
            <div className="bg-white rounded-[14px] border border-border overflow-hidden">
              <div className="px-5 py-4 border-b border-border flex justify-between items-center">
                <span className="text-[14px] font-bold">Solicitudes de Préstamo PYME</span>
                <span className="text-[12px] text-text-4">{prestamos.length} solicitudes</span>
              </div>
              <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>{['ID','Empresa PYME','Contratante','Monto XAF','Verif. Contr.','KYC','Estado',''].map(h=>(
                    <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-text-4 uppercase bg-[#FAFBFC] border-b border-border">{h}</th>
                  ))}</tr>
                </thead>
                <tbody>
                  {prestamos.map(p => {
                    const autorizado = p.estado === 'Autorizado' || autorizados[p.id];
                    return (
                      <tr key={p.id} className="border-b border-page-bg last:border-0 hover:bg-[#FFFAF8]">
                        <td className="px-4 py-3 font-mono text-[11px] text-text-4">{p.id}</td>
                        <td className="px-4 py-3 font-semibold text-[13px]">{p.empresa}</td>
                        <td className="px-4 py-3 text-[12px] text-text-3">{p.contratante}</td>
                        <td className="px-4 py-3 font-bold text-[13px]">XAF {p.monto}</td>
                        <td className="px-4 py-3">
                          {p.verifContr
                            ? <span className="text-green-text text-[12px] font-semibold">✅ Verificado</span>
                            : <span className="text-yellow-text text-[12px] font-semibold">⏳ Pendiente</span>}
                        </td>
                        <td className="px-4 py-3">
                          {p.kyc
                            ? <span className="text-green-text text-[12px] font-semibold">✅ OK</span>
                            : <span className="text-red-text text-[12px] font-semibold">❌ Pendiente</span>}
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant={autorizado ? 'green' : p.cls}>{autorizado ? 'Autorizado' : p.estado}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex gap-1.5">
                            <Button variant="ghost" size="sm" onClick={() => go('adminPrestamoDetalle')}>Ver →</Button>
                            {!autorizado && p.verifContr && p.kyc && p.estado !== 'Autorizado' && (
                              <Button variant="success" size="sm" onClick={() => setAutorizados(a=>({...a,[p.id]:true}))}>
                                ✅ Autorizar
                              </Button>
                            )}
                            {!p.verifContr && (
                              <span className="text-[11px] text-yellow-text bg-yellow-bg px-2 py-1 rounded-[6px]">Esperando contratante</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            </div>
          </>
        )}

        {tab === 'liberaciones' && (
          <div className="bg-white rounded-[14px] border border-border overflow-hidden">
            <div className="px-5 py-4 border-b border-border flex justify-between items-center">
              <span className="text-[14px] font-bold">Solicitudes de Liberación de Fondos</span>
              <span className="text-[12px] text-text-4">{allLibs.length} solicitudes</span>
            </div>
            <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>{['ID','Empresa PYME','Proveedor destino','Monto XAF','Fecha','Estado','Acciones'].map(h=>(
                  <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-text-4 uppercase bg-[#FAFBFC] border-b border-border">{h}</th>
                ))}</tr>
              </thead>
              <tbody>
                {allLibs.map(l => {
                  const aprobada = l.estado === 'Aprobada' || libAprobadas[l.id];
                  return (
                    <tr key={l.id} className="border-b border-page-bg last:border-0 hover:bg-[#FFFAF8]">
                      <td className="px-4 py-3 font-mono text-[11px] text-text-4">{l.id}</td>
                      <td className="px-4 py-3 font-semibold text-[13px]">{l.empresa}</td>
                      <td className="px-4 py-3 text-[12px] text-text-3">{l.proveedor}</td>
                      <td className="px-4 py-3 font-bold text-[13px]">XAF {l.monto}</td>
                      <td className="px-4 py-3 text-[12px] text-text-4">{l.dt}</td>
                      <td className="px-4 py-3">
                        <Badge variant={aprobada ? 'green' : l.cls}>{aprobada ? 'Aprobada' : l.estado}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        {!aprobada && (
                          <div className="flex gap-1.5">
                            <Button variant="danger" size="sm">✕ Rechazar</Button>
                            <Button variant="success" size="sm" onClick={() => setLibAprobadas(a=>({...a,[l.id]:true}))}>
                              ✅ Aprobar
                            </Button>
                          </div>
                        )}
                        {aprobada && (
                          <span className="text-[12px] text-green-text font-semibold">✅ Fondos liberados</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
