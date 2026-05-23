import { useState } from 'react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import FormGroup, { Input, Select } from '../../components/ui/FormGroup';
import Modal from '../../components/ui/Modal';

const provData = [
  { nombre: 'Cemex GE',       ruc: 'GE-2019-00123', sector: 'Materiales',  email: 'ventas@cemex.gq',      tel: '+240 222 111 222', activo: true,  prestamos: 2, pagado: 12000000, pendiente: 18000000 },
  { nombre: 'TransGE S.L.',   ruc: 'GE-2020-00445', sector: 'Transporte',   email: 'info@transge.gq',     tel: '+240 222 333 444', activo: true,  prestamos: 2, pagado:  5000000, pendiente: 10000000 },
  { nombre: 'Alim. Bata S.A.',ruc: 'GE-2021-00789', sector: 'Alimentación', email: 'pedidos@alimbata.gq',  tel: '+240 222 555 666', activo: false, prestamos: 1, pagado:  0,       pendiente:  8000000 },
  { nombre: 'ServTec GE',     ruc: 'GE-2022-00112', sector: 'Tecnología',   email: 'soporte@servtec.gq',  tel: '+240 222 777 888', activo: true,  prestamos: 1, pagado:  3000000, pendiente:  7000000 },
];

export default function EpProveedores() {
  const { go } = useApp();
  const [showModal, setShowModal] = useState(false);

  return (
    <AppShell active="epProveedores" role="empresa-pequena" title="Mis Proveedores" sub="Directorio"
      extra={<Button variant="primary" size="sm" onClick={() => setShowModal(true)}>+ Agregar proveedor</Button>}
    >
      <div className="fade-in">
        {/* Resumen */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[['👥','4','Total proveedores','text-text-1'],['✅','3','Activos','text-green-text'],['💰','XAF 43M','Total pagado','text-orange'],['📋','5','Libranzas realizadas','text-blue-text']].map(([ico,v,l,c]) => (
            <div key={l} className="bg-white rounded-[14px] p-4 border border-border">
              <div className="text-[24px] mb-2">{ico}</div>
              <div className={`text-[22px] font-extrabold ${c}`}>{v}</div>
              <div className="text-[12px] text-text-4">{l}</div>
            </div>
          ))}
        </div>

        {/* Lista de proveedores */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {provData.map(p => {
            const total = p.pagado + p.pendiente;
            const pct = total > 0 ? Math.round(p.pagado/total*100) : 0;
            return (
              <div key={p.nombre} className="bg-white rounded-[14px] border border-border p-5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-[10px] bg-orange-tint flex items-center justify-center text-orange font-bold text-[14px] shrink-0">
                    {p.nombre.slice(0,2).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="text-[14px] font-bold text-text-1">{p.nombre}</div>
                    <div className="text-[11px] text-text-4">{p.ruc} · {p.sector}</div>
                  </div>
                  <Badge variant={p.activo ? 'green' : 'yellow'}>{p.activo ? 'Activo' : 'Pendiente'}</Badge>
                </div>
                <div className="grid grid-cols-2 gap-3 bg-page-bg rounded-[10px] p-3 mb-3">
                  <div className="text-center">
                    <div className="text-[14px] font-extrabold text-orange">XAF {(p.pagado/1e6).toFixed(0)}M</div>
                    <div className="text-[11px] text-text-4">Pagado</div>
                  </div>
                  <div className="text-center border-l border-border">
                    <div className="text-[14px] font-extrabold text-green-text">XAF {(p.pendiente/1e6).toFixed(0)}M</div>
                    <div className="text-[11px] text-text-4">Disponible</div>
                  </div>
                </div>
                {total > 0 && (
                  <div className="mb-3">
                    <div className="flex justify-between text-[11px] text-text-4 mb-1"><span>Utilizado</span><span>{pct}%</span></div>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-orange rounded-full" style={{width:`${pct}%`}} />
                    </div>
                  </div>
                )}
                <div className="flex gap-2 text-[12px] text-text-4 mb-3">
                  <span>📧 {p.email}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal agregar proveedor */}
      {showModal && (
        <Modal
          title="Agregar nuevo proveedor"
          onClose={() => setShowModal(false)}
          footer={
            <>
              <Button variant="ghost" onClick={() => setShowModal(false)}>Cancelar</Button>
              <Button variant="primary" onClick={() => setShowModal(false)}>Guardar proveedor</Button>
            </>
          }
        >
          <div className="grid grid-cols-2 gap-x-4">
            <FormGroup label="Nombre del proveedor" required className="col-span-2">
              <Input type="text" placeholder="Empresa proveedora" />
            </FormGroup>
            <FormGroup label="RUC / NIF" required>
              <Input type="text" placeholder="GE-XXXX-XXXXX" />
            </FormGroup>
            <FormGroup label="Sector">
              <Select><option>Materiales</option><option>Transporte</option><option>Servicios</option><option>Tecnología</option><option>Alimentación</option></Select>
            </FormGroup>
            <FormGroup label="Email de contacto" required>
              <Input type="email" placeholder="contacto@proveedor.com" />
            </FormGroup>
            <FormGroup label="Teléfono">
              <Input type="text" placeholder="+240 222 XXX XXX" />
            </FormGroup>
            <FormGroup label="Monto asignado (XAF)" className="col-span-2">
              <Input type="text" placeholder="10,000,000" />
            </FormGroup>
          </div>
        </Modal>
      )}
    </AppShell>
  );
}
