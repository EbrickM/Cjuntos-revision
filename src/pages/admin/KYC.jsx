import { useState } from 'react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

const empresas = [
  {
    id: 'KYC-2026-011', nombre: 'Construcciones Silva Ltd.', ruc: 'GE-2020-00112',
    tipo: 'Empresa Pequeña', rep: 'Carlos Silva Nguema', email: 'c.silva@constsilva.gq',
    sector: 'Construcción', docs: ['DNI Rep. Legal','RUC Registro','Estados Financieros 2025','Escritura social'],
    estado: 'Aprobado', cls: 'green', dt: '05/05/26',
  },
  {
    id: 'KYC-2026-012', nombre: 'Pinturas Bata SL', ruc: 'GE-2022-00341',
    tipo: 'Empresa Pequeña', rep: 'María Eyeang', email: 'm.eyeang@pinturasbata.gq',
    sector: 'Industria', docs: ['DNI Rep. Legal','RUC Registro','Estados Financieros 2025'],
    estado: 'Pendiente', cls: 'yellow', dt: '10/05/26',
  },
  {
    id: 'KYC-2026-013', nombre: 'AgriEco PYME GE', ruc: 'GE-2023-00567',
    tipo: 'Empresa Pequeña', rep: 'Jean-Pierre Mba', email: 'jp.mba@agriecopyme.gq',
    sector: 'Agricultura', docs: ['DNI Rep. Legal','RUC Registro'],
    estado: 'Documentos incompletos', cls: 'red', dt: '12/05/26',
  },
  {
    id: 'KYC-2026-014', nombre: 'LogiRapid GE', ruc: 'GE-2021-00789',
    tipo: 'Empresa Pequeña', rep: 'Pedro Ela Nguema', email: 'p.ela@logige.gq',
    sector: 'Transporte', docs: ['DNI Rep. Legal','RUC Registro','Estados Financieros 2025','Plan de negocio'],
    estado: 'En revisión', cls: 'blue', dt: '12/05/26',
  },
];

const DOCS_REQUIRED = ['DNI Rep. Legal','RUC Registro','Estados Financieros 2025','Escritura social'];

export default function AdminKYC() {
  const { go } = useApp();
  const [selected, setSelected] = useState(null);
  const [aprobados, setAprobados] = useState({});

  const e = empresas.find(x => x.id === selected);

  return (
    <AppShell active="adminKYC" role="admin" title="KYC Empresas" sub="Verificación de identidad">
      <div className="fade-in">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[['👁','4','Total KYC','text-text-1'],['⏳','2','Pendientes revisión','text-yellow-text'],['✅','1','Aprobados','text-green-text'],['❌','1','Incompletos','text-red-text']].map(([ico,v,l,c]) => (
            <div key={l} className="bg-white rounded-[14px] p-5 border border-border">
              <div className="text-[24px] mb-2">{ico}</div>
              <div className={`text-[22px] font-extrabold ${c} mb-1`}>{v}</div>
              <div className="text-[12px] text-text-4">{l}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[14px] border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex justify-between items-center">
            <span className="text-[14px] font-bold">Cola de Verificación KYC</span>
            <Button variant="ghost" size="sm">📥 Exportar</Button>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>{['Empresa','RUC','Tipo','Representante Legal','Docs','Estado',''].map(h=>(
                <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-text-4 uppercase bg-[#FAFBFC] border-b border-border">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {empresas.map(em => {
                const aprobado = em.estado === 'Aprobado' || aprobados[em.id];
                return (
                  <tr key={em.id} className="border-b border-page-bg last:border-0 hover:bg-[#FFFAF8]">
                    <td className="px-4 py-3 font-semibold text-[13px]">{em.nombre}</td>
                    <td className="px-4 py-3 font-mono text-[11px] text-text-4">{em.ruc}</td>
                    <td className="px-4 py-3 text-[12px] text-text-3">{em.tipo}</td>
                    <td className="px-4 py-3 text-[12px]">{em.rep}</td>
                    <td className="px-4 py-3">
                      <span className={`text-[12px] font-semibold ${em.docs.length >= DOCS_REQUIRED.length ? 'text-green-text' : 'text-red-text'}`}>
                        {em.docs.length}/{DOCS_REQUIRED.length} docs
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={aprobado ? 'green' : em.cls}>{aprobado ? 'Aprobado' : em.estado}</Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5">
                        <Button variant="ghost" size="sm" onClick={() => setSelected(em.id)}>Ver →</Button>
                        {!aprobado && em.docs.length >= DOCS_REQUIRED.length && em.estado !== 'Aprobado' && (
                          <Button variant="success" size="sm" onClick={() => setAprobados(a=>({...a,[em.id]:true}))}>✅ Aprobar</Button>
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
      </div>

      {e && (
        <Modal title={`KYC — ${e.nombre}`} onClose={() => setSelected(null)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setSelected(null)}>Cerrar</Button>
              {!aprobados[e.id] && e.estado !== 'Aprobado' && e.docs.length >= DOCS_REQUIRED.length && (
                <Button variant="success" onClick={() => { setAprobados(a=>({...a,[e.id]:true})); setSelected(null); }}>
                  ✅ Aprobar KYC
                </Button>
              )}
            </>
          }
        >
          <div className="bg-page-bg rounded-[12px] p-4 mb-4">
            {[['Empresa',e.nombre],['RUC',e.ruc],['Tipo',e.tipo],['Sector',e.sector],['Rep. Legal',e.rep],['Email',e.email]].map(([k,v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-border last:border-0">
                <span className="text-[12px] text-text-4">{k}</span>
                <span className="text-[13px] font-semibold">{v}</span>
              </div>
            ))}
          </div>
          <div className="text-[12px] font-bold text-text-3 mb-2">Documentos aportados</div>
          <div className="flex flex-col gap-2">
            {DOCS_REQUIRED.map(doc => {
              const tiene = e.docs.includes(doc);
              return (
                <div key={doc} className={`flex items-center gap-2.5 p-2.5 rounded-[8px] ${tiene ? 'bg-green-bg' : 'bg-red-bg'}`}>
                  <span>{tiene ? '✅' : '❌'}</span>
                  <span className={`text-[12px] font-medium ${tiene ? 'text-green-text' : 'text-red-text'}`}>{doc}</span>
                  {tiene && <span className="ml-auto text-[11px] text-orange cursor-pointer">📥 Ver</span>}
                </div>
              );
            })}
          </div>
        </Modal>
      )}
    </AppShell>
  );
}
