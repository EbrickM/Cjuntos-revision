import { useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Modal from '../../components/ui/Modal';

const contratos = [
  {
    id: 'PRE-2026-002', empresa: 'MH Pinturas', ruc: 'GE-2022-00341',
    contrato: 'CTR-2026-004', monto_prestamo: '45,000,000', monto_contrato: '60,000,000',
    rep_legal: 'María Eyeang', email: 'm.eyeang@pinturasbata.gq',
    fecha_inicio: '01/06/2026', fecha_fin: '31/05/2027',
    objeto: 'Pintura y acabados instalaciones Chevron Malabo.',
    verificado: false,
  },
  {
    id: 'PRE-2026-003', empresa: 'Conexxia Log', ruc: 'GE-2021-00789',
    contrato: 'CTR-2026-007', monto_prestamo: '80,000,000', monto_contrato: '110,000,000',
    rep_legal: 'Pedro Ela Nguema', email: 'p.ela@logige.gq',
    fecha_inicio: '15/05/2026', fecha_fin: '15/05/2027',
    objeto: 'Servicios de transporte y logística para proyecto Bata Norte.',
    verificado: false,
  },
];

export default function EmpVerifContr() {
  const [selected, setSelected] = useState(null);
  const [verificados, setVerificados] = useState({});

  const c = contratos.find(x => x.id === selected);

  return (
    <AppShell active="empVerifContr" role="contratante" title="Verificar Contratos" sub="Empresas PYME pendientes">
      <div className="fade-in">
        <div className="bg-orange-tint border border-orange-border rounded-[14px] p-4 mb-6">
          <div className="text-[14px] font-bold text-text-1 mb-1">¿Por qué necesitas verificar esto?</div>
          <div className="text-[13px] text-text-3 leading-[1.6]">
            Estas empresas pequeñas han solicitado un préstamo a Bonafide indicando que tienen un contrato contigo. Bonafide <strong>no autorizará el préstamo hasta que tú confirmes</strong> que los datos son correctos. Solo tienes que revisar y confirmar — no firmas nada adicional.
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {contratos.map(ct => (
            <div key={ct.id} className={`bg-white rounded-[14px] border-2 p-5 transition-all
              ${verificados[ct.id] ? 'border-orange-border' : 'border-border'}`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-[12px] bg-orange-tint flex items-center justify-center text-orange font-bold text-[16px]">
                    {ct.empresa.slice(0,2).toUpperCase()}
                  </div>
                  <div>
                    <div className="text-[15px] font-bold text-text-1">{ct.empresa}</div>
                    <div className="text-[12px] text-text-4">{ct.ruc} · Préstamo {ct.id}</div>
                  </div>
                </div>
                {verificados[ct.id]
                  ? <Badge variant="orange">✅ Verificado</Badge>
                  : <Badge variant="yellow">⏳ Pendiente tu verificación</Badge>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-page-bg rounded-[10px] p-4 mb-4">
                {[['Contrato',ct.contrato],['Monto préstamo','XAF '+ct.monto_prestamo],['Monto contrato','XAF '+ct.monto_contrato]].map(([k,v]) => (
                  <div key={k}>
                    <div className="text-[11px] text-text-4 mb-0.5">{k}</div>
                    <div className="text-[13px] font-bold text-text-1">{v}</div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                {[['Representante legal',ct.rep_legal],['Email',ct.email],['Inicio contrato',ct.fecha_inicio],['Fin contrato',ct.fecha_fin]].map(([k,v]) => (
                  <div key={k}>
                    <div className="text-[11px] text-text-4">{k}</div>
                    <div className="text-[13px] font-semibold text-text-1">{v}</div>
                  </div>
                ))}
              </div>

              <div className="bg-page-bg rounded-[10px] p-3 mb-4">
                <div className="text-[11px] text-text-4 mb-0.5">Objeto del contrato</div>
                <div className="text-[13px] text-text-2">{ct.objeto}</div>
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" size="sm" onClick={() => setSelected(ct.id)}>Ver detalle completo</Button>
                {!verificados[ct.id] && (
                  <>
                    <Button variant="danger" size="sm">✕ Datos incorrectos</Button>
                    <Button variant="success" size="sm" onClick={() => setVerificados(v => ({...v, [ct.id]: true}))}>
                      ✅ Confirmar — los datos son correctos
                    </Button>
                  </>
                )}
                {verificados[ct.id] && (
                  <span className="text-[13px] text-orange-dark font-semibold flex items-center gap-1">
                    ✅ Has verificado este contrato — Bonafide puede proceder
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal detalle */}
      {c && (
        <Modal title={`Detalle contrato — ${c.empresa}`} onClose={() => setSelected(null)}>
          {[['Empresa',c.empresa],['RUC',c.ruc],['Préstamo',c.id],['Contrato',c.contrato],['Monto del préstamo','XAF '+c.monto_prestamo],['Monto del contrato','XAF '+c.monto_contrato],['Representante legal',c.rep_legal],['Email',c.email],['Fecha inicio',c.fecha_inicio],['Fecha fin',c.fecha_fin],['Objeto',c.objeto]].map(([k,v]) => (
            <div key={k} className="flex justify-between py-2.5 border-b border-border last:border-0">
              <span className="text-[12px] text-text-4">{k}</span>
              <span className="text-[13px] font-semibold text-text-1 max-w-[300px] text-right">{v}</span>
            </div>
          ))}
        </Modal>
      )}
    </AppShell>
  );
}
