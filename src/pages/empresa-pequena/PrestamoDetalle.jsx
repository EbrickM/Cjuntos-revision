import { useState } from 'react';
import { Briefcase, CheckCircle2, FileText, Building2, ClipboardList, Lock, Download, Edit } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import Timeline from '../../components/ui/Timeline';
import FormGroup, { Input, Select } from '../../components/ui/FormGroup';

const proveedores = [
  { nombre: 'Cemex GE',       ruc: 'GE-2019-00123', asignado: 30000000, pagado: 12000000 },
  { nombre: 'TransGE S.L.',   ruc: 'GE-2020-00445', asignado: 15000000, pagado:  5000000 },
  { nombre: 'Personal obra',  ruc: 'NOMINA',         asignado: 25000000, pagado: 12500000 },
];

const pagosContratante = [
  { fecha: '15/05/2026', monto: '15,000,000', ref: 'PAY-TotalEnerGE-001', estado: 'Recibido' },
  { fecha: '01/05/2026', monto: '25,000,000', ref: 'PAY-TotalEnerGE-000', estado: 'Recibido' },
];

const timelineItems = [
  { icon: 'CHECK', title: 'Solicitud enviada',       timestamp: '15/05/2026 · 10:00', sub: 'Documentos recibidos',          done: true },
  { icon: 'CHECK', title: 'Contratante verificó',    timestamp: '16/05/2026 · 14:30', sub: 'TotalEnerGE confirmó los datos', done: true },
  { icon: 'CHECK', title: 'Bonafide autorizó',        timestamp: '17/05/2026 · 09:15', sub: 'Préstamo aprobado por Bonafide', done: true },
  { icon: 'MONEY', title: 'Fondos disponibles',      timestamp: '17/05/2026 · 16:00', sub: 'Crédito activado en tu cuenta',  done: true },
  { icon: 'WAIT', title: 'Cobro al contratante',   timestamp: 'Ciclo mensual',       sub: 'TotalEnerGE paga a Bonafide',   done: false },
];

export default function EpPrestamoDetalle() {
  const { go } = useApp();
  const [tab, setTab] = useState('resumen');
  const aprobado = true;

  const distribuciones = [
    { lbl: 'Reserva',     monto: 10000000, color: 'bg-blue-bg text-blue-text' },
    { lbl: 'Nómina',      monto: 25000000, color: 'bg-orange-tint text-orange' },
    { lbl: 'Proveedores', monto: 75000000, color: 'bg-green-bg text-green-text' },
  ];

  const tabs = ['resumen', 'contratante', 'proveedores', 'distribucion', 'pagos'];
  const tabLabels = { resumen: 'Resumen', contratante: 'Contratante', proveedores: 'Mis Proveedores', distribucion: 'Distribución', pagos: 'Pagos Recibidos' };

  return (
    <AppShell active="epPrestamos" role="empresa-pequena" title="Préstamo PRE-2026-001"
      extra={
        <div className="flex gap-2">
          <Badge variant="green">Aprobado</Badge>
          <Button variant="secondary" size="sm" onClick={() => go('epLiberacion')}>
            <Lock size={16} className="mr-1.5" style={{transform: 'scaleX(-1)'}} /> Liberar fondos
          </Button>
        </div>
      }
    >
      <div className="fade-in">
        {/* Topbar back */}
        <div className="mb-4">
          <Button variant="ghost" size="sm" onClick={() => go('epPrestamos')}>← Volver a mis préstamos</Button>
        </div>

        {/* Header card */}
        <div className="bg-white rounded-[14px] border border-border p-6 mb-5">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-14 h-14 rounded-[14px] bg-orange-tint flex items-center justify-center">
              <Briefcase size={28} className="text-orange" />
            </div>
            <div className="flex-1">
              <div className="text-[18px] font-bold text-text-1">Préstamo PRE-2026-001</div>
              <div className="text-[13px] text-text-4">TotalEnerGE · Contrato CTR-2026-001 · Aprobado 17/05/2026</div>
            </div>
            <Badge variant="green">
              <CheckCircle2 size={14} className="mr-1" />
              Aprobado
            </Badge>
          </div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 bg-page-bg rounded-[12px] p-4">
            {[['XAF 120,000,000','Monto total','text-text-1'],['XAF 85,000,000','Disponible','text-orange'],['XAF 35,000,000','Utilizado','text-blue-text'],['12 meses','Plazo','text-text-1']].map(([v,l,c]) => (
              <div key={l} className="text-center">
                <div className={`text-[17px] font-extrabold ${c} mb-0.5`}>{v}</div>
                <div className="text-[11px] text-text-4">{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-0 border-b-2 border-border mb-5">
          {tabs.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-5 py-3 text-[14px] font-semibold border-b-2 -mb-px cursor-pointer bg-transparent border-x-0 border-t-0 transition-colors
                ${tab === t ? 'border-orange text-orange' : 'border-transparent text-text-3 hover:text-text-1'}`}>
              {tabLabels[t]}
            </button>
          ))}
        </div>

        {/* Tab: Resumen */}
        {tab === 'resumen' && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-5">
            <div className="bg-white rounded-[14px] border border-border p-5">
              <div className="text-[14px] font-bold mb-5">Estado del proceso</div>
              <Timeline items={timelineItems} />
            </div>
            <div className="flex flex-col gap-4">
              <div className="bg-white rounded-[14px] border border-border p-5">
                <div className="text-[13px] font-bold mb-3">Verificación</div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-[13px]">
                    <CheckCircle2 size={16} className="text-green-text" />
                    <span className="text-text-3">Contratante verificó los datos</span>
                  </div>
                  <div className="flex items-center gap-2 text-[13px]">
                    <CheckCircle2 size={16} className="text-green-text" />
                    <span className="text-text-3">Bonafide autorizó el préstamo</span>
                  </div>
                  <div className="flex items-center gap-2 text-[13px]">
                    <CheckCircle2 size={16} className="text-green-text" />
                    <span className="text-text-3">Domiciliación bancaria adjunta</span>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-[14px] border border-border p-5">
                <div className="text-[13px] font-bold mb-3">Documentos del préstamo</div>
                {[['FILE','Contrato firmado','contrato_ctr2026001.pdf'],['BANK','Domiciliación bancaria','domiciliacion_totalenerge.pdf'],['CLIPBOARD','Resolución Bonafide','auth_pre2026001.pdf']].map(([type,name,file]) => {
                  let IconComp = FileText;
                  switch(type) {
                    case 'FILE': IconComp = FileText; break;
                    case 'BANK': IconComp = Building2; break;
                    case 'CLIPBOARD': IconComp = ClipboardList; break;
                  }
                  return (
                  <div key={name} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                    <IconComp size={20} className="text-text-2" />
                    <div className="flex-1">
                      <div className="text-[12px] font-semibold">{name}</div>
                      <div className="text-[11px] text-text-4">{file}</div>
                    </div>
                    <Button variant="ghost" size="sm"><Download size={16} /></Button>
                  </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab: Contratante */}
        {tab === 'contratante' && (
          <div className="max-w-[600px]">
            <div className={`rounded-[12px] p-3 mb-5 ${aprobado ? 'bg-orange-tint border border-orange-border' : 'bg-green-bg border border-green-border'}`}>
              <div className={`text-[12px] font-bold mb-0.5 flex items-center gap-1.5 ${aprobado ? 'text-orange' : 'text-green-text'}`}>
                {aprobado ? (
                  <>
                    <Lock size={14} />
                    <span>Datos no editables — Préstamo aprobado</span>
                  </>
                ) : (
                  <>
                    <Edit size={14} />
                    <span>Puedes editar estos datos</span>
                  </>
                )}
              </div>
              <div className="text-[11px] text-text-3">
                {aprobado ? 'Una vez el préstamo fue aprobado, los datos del contratante quedan bloqueados.' : 'El contratante aún no ha verificado los datos.'}
              </div>
            </div>
            <div className="bg-white rounded-[14px] border border-border p-5">
              <div className="text-[14px] font-bold mb-4">Datos del Contratante</div>
              {[['Empresa','TotalEnerGE'],['RUC','GE-2020-00567'],['Representante legal','Jean-Pierre Obiang'],['Cargo','Director de Operaciones'],['Email','jp.obiang@totalenerge.com'],['Teléfono','+240 222 111 444'],['Monto del contrato','XAF 150,000,000'],['Inicio contrato','01/05/2026'],['Fin contrato','30/04/2027'],['Contratante verificó','✅ 16/05/2026 · 14:30']].map(([k,v]) => (
                <div key={k} className="flex justify-between py-2.5 border-b border-border last:border-0">
                  <span className="text-[12px] text-text-4">{k}</span>
                  <span className="text-[13px] font-semibold text-text-1">{v}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab: Mis Proveedores */}
        {tab === 'proveedores' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[14px] font-semibold text-text-1">{proveedores.length} proveedores registrados</span>
              <Button variant="secondary" size="sm">+ Agregar proveedor</Button>
            </div>
            <div className="flex flex-col gap-3">
              {proveedores.map((p, i) => {
                const pct = Math.round(p.pagado / p.asignado * 100);
                const disponible = p.asignado - p.pagado;
                return (
                  <div key={i} className="bg-white rounded-[14px] border border-border p-5">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-10 h-10 rounded-[10px] bg-orange-tint flex items-center justify-center text-orange font-bold text-[14px] shrink-0">
                        {p.nombre.slice(0,2).toUpperCase()}
                      </div>
                      <div className="flex-1">
                        <div className="text-[14px] font-bold text-text-1">{p.nombre}</div>
                        <div className="text-[11px] text-text-4">{p.ruc}</div>
                      </div>
                      <Button variant="ghost" size="sm">✏ Editar</Button>
                    </div>
                    <div className="grid grid-cols-3 gap-4 bg-page-bg rounded-[10px] p-4 mb-3">
                      <div className="text-center">
                        <div className="text-[15px] font-extrabold text-text-1">XAF {(p.asignado/1e6).toFixed(0)}M</div>
                        <div className="text-[11px] text-text-4">Asignado</div>
                      </div>
                      <div className="text-center border-x border-border">
                        <div className="text-[15px] font-extrabold text-orange">XAF {(p.pagado/1e6).toFixed(0)}M</div>
                        <div className="text-[11px] text-text-4">Pagado</div>
                      </div>
                      <div className="text-center">
                        <div className="text-[15px] font-extrabold text-green-text">XAF {(disponible/1e6).toFixed(0)}M</div>
                        <div className="text-[11px] text-text-4">Disponible</div>
                      </div>
                    </div>
                    <div className="flex justify-between text-[11px] text-text-4 mb-1">
                      <span>Utilizado</span><span>{pct}%</span>
                    </div>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden">
                      <div className="h-full bg-orange rounded-full" style={{width:`${pct}%`}} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tab: Distribución */}
        {tab === 'distribucion' && (
          <div className="max-w-[600px]">
            <div className="bg-green-bg border border-green-border rounded-[12px] p-3 mb-5">
              <div className="text-[12px] font-bold text-green-text mb-0.5">Esta distribución es editable</div>
              <div className="text-[11px] text-text-3">Puedes ajustar la planificación del crédito en cualquier momento mientras el préstamo esté activo.</div>
            </div>
            <div className="bg-white rounded-[14px] border border-border p-5 mb-4">
              <div className="text-[14px] font-bold mb-4">Distribución del crédito</div>
              {distribuciones.map(({ lbl, monto, color }) => (
                <div key={lbl} className="flex items-center gap-4 p-4 bg-page-bg rounded-[12px] mb-3 last:mb-0">
                  <div className="flex-1">
                    <div className="text-[13px] font-bold text-text-1 mb-0.5">{lbl}</div>
                    <div className="h-1.5 bg-border rounded-full overflow-hidden mt-2">
                      <div className="h-full bg-orange rounded-full" style={{width:`${Math.round(monto/120000000*100)}%`}} />
                    </div>
                    <div className="text-[11px] text-text-4 mt-1">{Math.round(monto/120000000*100)}% del total</div>
                  </div>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-[13px] font-bold ${color}`}>
                    XAF {(monto/1e6).toFixed(0)}M
                  </span>
                </div>
              ))}
              <div className="mt-4 p-3 border-t border-border flex justify-between">
                <span className="text-[13px] text-text-3">Total distribuido</span>
                <span className="text-[14px] font-extrabold text-text-1">XAF 110M / 120M</span>
              </div>
            </div>
            <Button variant="secondary">Actualizar distribución</Button>
          </div>
        )}

        {/* Tab: Pagos Recibidos */}
        {tab === 'pagos' && (
          <div>
            <div className="flex justify-between items-center mb-4">
              <span className="text-[13px] text-text-3">Pagos del contratante recibidos para este contrato</span>
            </div>
            <div className="bg-white rounded-[14px] border border-border overflow-hidden mb-4">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {['Referencia','Fecha','Monto (XAF)','Estado'].map(h => (
                      <th key={h} className="text-left px-4 py-2.5 text-[11px] font-semibold text-text-4 uppercase tracking-[0.5px] bg-[#FAFBFC] border-b border-border">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {pagosContratante.map(p => (
                    <tr key={p.ref} className="border-b border-page-bg last:border-0 hover:bg-[#FFFAF8]">
                      <td className="px-4 py-3 font-mono text-[11px] text-text-4">{p.ref}</td>
                      <td className="px-4 py-3 text-[13px] text-text-2">{p.fecha}</td>
                      <td className="px-4 py-3 text-[13px] font-bold text-green-text">+{p.monto}</td>
                      <td className="px-4 py-3"><Badge variant="green">{p.estado}</Badge></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-green-bg border border-green-border rounded-[14px] p-5">
              <div className="text-[13px] font-bold text-green-text mb-2">Total recibido</div>
              <div className="text-[24px] font-extrabold text-green-text">XAF 40,000,000</div>
              <div className="text-[12px] text-text-4 mt-1">de XAF 120,000,000 en el plazo del contrato</div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
