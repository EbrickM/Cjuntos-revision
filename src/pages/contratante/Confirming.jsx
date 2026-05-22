import { useState } from 'react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';
import Stepper from '../../components/ui/Stepper';
import FormGroup, { Input, Select } from '../../components/ui/FormGroup';
import UploadZone from '../../components/ui/UploadZone';

const rows = [
  ['CONF-04821','● Const. Silva','FAC-0892','12,500,000','12,250,000','green','Aprobada','12/05/26'],
  ['CONF-04820','● Tech Bata SL','FAC-0445','8,200,000','8,036,000','yellow','Pendiente','11/05/26'],
  ['CONF-04819','● LogiGE S.A.','FAC-0231','23,100,000','22,638,000','green','Aprobada','10/05/26'],
  ['CONF-04818','⚠ AgriEco PYME','FAC-0198','5,700,000','5,586,000','blue','En revisión','09/05/26'],
  ['CONF-04817','● Mader. Bata','FAC-0177','9,800,000','9,604,000','green','Aprobada','08/05/26'],
  ['CONF-04816','🔴 ServLog GE','FAC-0155','3,200,000','3,136,000','red','Rechazada','07/05/26'],
];

export default function EmpConf() {
  const { go } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [step, setStep] = useState(0);

  return (
    <AppShell active="empConf" role="contratante" title="Confirming" sub="Solicitudes"
      extra={<Button variant="primary" size="sm" onClick={() => { setStep(0); setShowModal(true); }}>+ Nueva Solicitud</Button>}
    >
      <div className="fade-in">
        <div className="bg-white rounded-[14px] border border-border p-4 mb-4 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 bg-page-bg border border-border rounded-[10px] px-3.5 py-2 text-[13px] text-text-4 w-[300px] cursor-pointer">🔍 Buscar por proveedor, nº factura...</div>
          <Select className="h-10 w-auto px-3 py-0 text-[13px]"><option>Todos los estados</option><option>Aprobadas</option><option>Pendientes</option></Select>
          <div className="flex-1"/>
          <Button variant="ghost" size="sm">📥 Exportar CSV</Button>
        </div>
        <div className="bg-white rounded-[14px] border border-border overflow-hidden">
          <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead><tr>{['ID','Proveedor','Factura','Monto XAF','Anticipo XAF','Estado','Fecha',''].map(h=><th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-text-4 uppercase bg-[#FAFBFC] border-b border-border">{h}</th>)}</tr></thead>
            <tbody>
              {rows.map(([id,name,fac,amt,anti,cls,st,dt]) => (
                <tr key={id} onClick={() => go('empConfDet')} className="border-b border-page-bg last:border-0 hover:bg-[#FFFAF8] cursor-pointer">
                  <td className="px-4 py-3 font-mono text-[11px] text-text-4">{id}</td>
                  <td className="px-4 py-3 font-semibold text-[13px]">{name}</td>
                  <td className="px-4 py-3 font-mono text-[11px] text-text-4">{fac}</td>
                  <td className="px-4 py-3 font-bold text-[13px]">{amt}</td>
                  <td className="px-4 py-3 font-semibold text-green-text text-[13px]">{anti}</td>
                  <td className="px-4 py-3"><Badge variant={cls}>{st}</Badge></td>
                  <td className="px-4 py-3 text-[12px] text-text-4">{dt}</td>
                  <td className="px-4 py-3"><Button variant="ghost" size="sm" onClick={(e) => {e.stopPropagation();go('empConfDet');}}>Ver →</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          <div className="px-5 py-4 flex justify-between items-center border-t border-border">
            <span className="text-[13px] text-text-4">Mostrando 1–6 de 24</span>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm">← Anterior</Button>
              <Button variant="primary" size="sm">Siguiente →</Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal nueva solicitud */}
      {showModal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.4)',zIndex:50,display:'flex',alignItems:'center',justifyContent:'center'}} onClick={e=>e.target===e.currentTarget&&setShowModal(false)}>
          <div className="bg-white rounded-2xl w-[680px] max-h-[90vh] overflow-y-auto shadow-xl" onClick={e=>e.stopPropagation()}>
            <div className="px-7 pt-6 pb-5 border-b border-border flex items-center justify-between">
              <span className="text-[17px] font-bold">Nueva Solicitud Confirming</span>
              <button onClick={() => setShowModal(false)} className="w-8 h-8 bg-page-bg border-none rounded-lg cursor-pointer text-[16px]">✕</button>
            </div>
            <div className="px-7 py-6">
              <Stepper steps={['Factura','Revisión','Listo']} current={step} />
              {step === 0 && (
                <>
                  <div className="text-[13px] font-semibold text-orange mb-4">PASO 1 — Datos de la Factura</div>
                  <FormGroup label="Proveedor" required><Select><option>Construcciones Silva · ● Verde</option><option>Tech Bata SL · ● Verde</option><option>AgriEco PYME · ⚠ Amarillo</option></Select></FormGroup>
                  <div className="grid grid-cols-2 gap-4">
                    <FormGroup label="Nº Factura" required><Input type="text" defaultValue="FAC-2026-0892" /></FormGroup>
                    <FormGroup label="Fecha factura" required><Input type="text" defaultValue="12 / 05 / 2026" /></FormGroup>
                  </div>
                  <FormGroup label="Monto Total (XAF)" required><Input type="text" defaultValue="12,500,000" /></FormGroup>
                  <div className="bg-green-bg border border-green-border rounded-[12px] p-3.5 flex justify-between items-center mb-4">
                    <span className="text-[13px] text-green-text">💰 Anticipo estimado (98%)</span>
                    <span className="text-[16px] font-extrabold text-green-text">XAF 12,250,000</span>
                  </div>
                  <FormGroup label="Subir factura PDF" required><UploadZone /></FormGroup>
                </>
              )}
              {step === 1 && (
                <>
                  <div className="text-[13px] font-semibold text-orange mb-4">PASO 2 — Revisión y Confirmación</div>
                  <div className="bg-page-bg border border-border rounded-[12px] p-5 mb-4">
                    {[['Proveedor','Construcciones Silva Ltd.'],['Nº Factura','FAC-2026-0892'],['Monto','XAF 12,500,000'],['Anticipo (98%)','XAF 12,250,000'],['Comisión','XAF 0 — Sin comisión']].map(([k,v]) => (
                      <div key={k} className="flex justify-between py-2 border-b border-border last:border-0">
                        <span className="text-[12px] text-text-4">{k}</span>
                        <span className="text-[13px] font-semibold">{v}</span>
                      </div>
                    ))}
                  </div>
                  <label className="flex items-center gap-2.5 cursor-pointer text-[13px]">
                    <input type="checkbox" defaultChecked className="accent-orange w-4 h-4" />
                    Confirmo que la información es correcta y autorizo el anticipo
                  </label>
                </>
              )}
            </div>
            <div className="px-7 py-5 border-t border-border flex justify-between">
              <Button variant="ghost" onClick={() => step > 0 ? setStep(step-1) : setShowModal(false)}>{step > 0 ? '← Volver' : 'Cancelar'}</Button>
              <Button variant="primary" onClick={() => step < 1 ? setStep(step+1) : setShowModal(false)}>
                {step < 1 ? 'Siguiente →' : 'Enviar Solicitud ✓'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </AppShell>
  );
}
