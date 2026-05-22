import { useState } from 'react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import FormGroup, { Input, Select } from '../../components/ui/FormGroup';

const empresas = [
  { id:'EMP-001', nombre:'TotalEnerGE SA',      sector:'Energía',        ruc:'GE-2010-00011', pymes:6,  vol:'847,000,000',  estado:'Activa',   cls:'green' },
  { id:'EMP-002', nombre:'Infraconst. SA',       sector:'Construcción',   ruc:'GE-2015-00234', pymes:4,  vol:'420,000,000',  estado:'Activa',   cls:'green' },
  { id:'EMP-003', nombre:'MinGE Sociedad Est.',  sector:'Minería',        ruc:'GE-2008-00056', pymes:3,  vol:'310,000,000',  estado:'Activa',   cls:'green' },
  { id:'EMP-004', nombre:'AgroGE Holdings',      sector:'Agricultura',    ruc:'GE-2019-00678', pymes:1,  vol:'95,000,000',   estado:'Inactiva', cls:'red'   },
];

export default function AdminEmpresas() {
  const { go } = useApp();
  const [showNew, setShowNew] = useState(false);
  const [selected, setSelected] = useState(null);

  const e = empresas.find(x => x.id === selected);

  return (
    <AppShell active="adminEmpresas" role="admin" title="Empresas Contratantes" sub="Gestión de cartera"
      extra={<Button variant="primary" size="sm" onClick={() => setShowNew(true)}>+ Nueva Empresa</Button>}
    >
      <div className="fade-in">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[['🏢','4','Empresas registradas','text-text-1'],['✅','3','Activas','text-green-text'],['💰','XAF 1.67B','Volumen total confirmado','text-orange']].map(([ico,v,l,c]) => (
            <div key={l} className="bg-white rounded-[14px] p-5 border border-border">
              <div className="text-[24px] mb-2">{ico}</div>
              <div className={`text-[20px] font-extrabold ${c} mb-1`}>{v}</div>
              <div className="text-[12px] text-text-4">{l}</div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-[14px] border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex justify-between items-center">
            <span className="text-[14px] font-bold">Directorio de Empresas Contratantes</span>
            <Button variant="ghost" size="sm">📥 Exportar</Button>
          </div>
          <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>{['Empresa','RUC','Sector','PYMEs','Vol. Confirming XAF','Estado',''].map(h=>(
                <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-text-4 uppercase bg-[#FAFBFC] border-b border-border">{h}</th>
              ))}</tr>
            </thead>
            <tbody>
              {empresas.map(em => (
                <tr key={em.id} className="border-b border-page-bg last:border-0 hover:bg-[#FFFAF8] cursor-pointer" onClick={() => setSelected(em.id)}>
                  <td className="px-4 py-3 font-semibold text-[13px]">{em.nombre}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-text-4">{em.ruc}</td>
                  <td className="px-4 py-3 text-[12px] text-text-3">{em.sector}</td>
                  <td className="px-4 py-3 font-bold text-[13px] text-orange">{em.pymes}</td>
                  <td className="px-4 py-3 font-bold text-[13px]">XAF {em.vol}</td>
                  <td className="px-4 py-3"><Badge variant={em.cls}>{em.estado}</Badge></td>
                  <td className="px-4 py-3"><Button variant="ghost" size="sm" onClick={ev=>{ev.stopPropagation();setSelected(em.id);}}>Ver →</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      </div>

      {/* Detalle empresa */}
      {e && (
        <Modal title={e.nombre} onClose={() => setSelected(null)}>
          <div className="bg-page-bg rounded-[12px] p-4 mb-4">
            {[['RUC',e.ruc],['Sector',e.sector],['PYMEs asociadas',e.pymes],['Vol. Confirming','XAF '+e.vol],['Estado',e.estado]].map(([k,v]) => (
              <div key={k} className="flex justify-between py-2 border-b border-border last:border-0">
                <span className="text-[12px] text-text-4">{k}</span>
                <span className="text-[13px] font-semibold">{v}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" full>📄 Ver contratos</Button>
            <Button variant="ghost" full>📊 Ver confirming</Button>
          </div>
        </Modal>
      )}

      {/* Modal nueva empresa */}
      {showNew && (
        <Modal title="Nueva Empresa Contratante" onClose={() => setShowNew(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setShowNew(false)}>Cancelar</Button>
              <Button variant="primary" onClick={() => setShowNew(false)}>Guardar Empresa</Button>
            </>
          }
        >
          <FormGroup label="Razón Social" required><Input type="text" placeholder="Ej: TotalEnerGE SA" /></FormGroup>
          <FormGroup label="RUC" required><Input type="text" placeholder="GE-YYYY-XXXXX" /></FormGroup>
          <FormGroup label="Sector"><Select><option>Energía</option><option>Construcción</option><option>Minería</option><option>Agricultura</option><option>Transporte</option></Select></FormGroup>
          <FormGroup label="Email contacto"><Input type="email" placeholder="contacto@empresa.gq" /></FormGroup>
          <FormGroup label="Teléfono"><Input type="tel" placeholder="+240 XXX XXX XXX" /></FormGroup>
        </Modal>
      )}
    </AppShell>
  );
}
