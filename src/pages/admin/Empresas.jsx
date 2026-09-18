import { useState } from 'react';
import { Search, Building2, Mail, Phone } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';

const empresas = [
  {
    id: 'EMP-001',
    nombre: 'TotalEnerGE SA',
    nombreComercial: 'TotalEnerGE',
    sector: 'Energía',
    ruc: 'GE-2010-00011',
    email: 'contacto@totalenerge.gq',
    telefono: '+240 222 100 200',
    contratos: ['CONT-001', 'CONT-002', 'CONT-003'],
  },
  {
    id: 'EMP-002',
    nombre: 'Infraconst. SA',
    nombreComercial: 'Infraconst',
    sector: 'Construcción',
    ruc: 'GE-2015-00234',
    email: 'info@infraconst.gq',
    telefono: '+240 222 300 400',
    contratos: ['CONT-004', 'CONT-005'],
  },
  {
    id: 'EMP-003',
    nombre: 'MinGE Sociedad Est.',
    nombreComercial: 'MinGE',
    sector: 'Minería',
    ruc: 'GE-2008-00056',
    email: 'operaciones@minge.gq',
    telefono: '+240 222 500 600',
    contratos: ['CONT-006'],
  },
  {
    id: 'EMP-004',
    nombre: 'AgroGE Holdings',
    nombreComercial: 'AgroGE',
    sector: 'Agricultura',
    ruc: 'GE-2019-00678',
    email: 'admin@agroge.gq',
    telefono: '+240 222 700 800',
    contratos: [],
  },
];

export default function AdminEmpresas() {
  const [search, setSearch] = useState('');

  const conContratosActivos = empresas.filter(e => e.contratos.length > 0).length;
  const sinContratosActivos = empresas.filter(e => e.contratos.length === 0).length;

  const filtered = empresas.filter(e => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    return (
      e.nombre.toLowerCase().includes(q) ||
      (e.nombreComercial || '').toLowerCase().includes(q) ||
      (e.ruc || '').toLowerCase().includes(q) ||
      (e.sector || '').toLowerCase().includes(q) ||
      (e.email || '').toLowerCase().includes(q) ||
      (e.telefono || '').toLowerCase().includes(q) ||
      e.contratos.some(c => c.toLowerCase().includes(q))
    );
  });

  return (
    <AppShell active="adminEmpresas" role="admin" title="Empresas Contratantes" sub="Directorio de empresas contratantes">
      <div className="fade-in">

        {/* Resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {[
            { value: empresas.length,  label: 'Total de empresas',                   cls: 'text-text-1' },
            { value: conContratosActivos, label: 'Asociadas a contratos activos',    cls: 'text-orange' },
            { value: sinContratosActivos, label: 'No asociadas a contratos activos', cls: 'text-text-4' },
          ].map(({ value, label, cls }) => (
            <div key={label} className="bg-white rounded-[14px] border border-border p-4">
              <div className={`text-[32px] font-extrabold leading-none mb-1 ${cls}`}>{value}</div>
              <div className="text-[12px] text-text-4">{label}</div>
            </div>
          ))}
        </div>

        {/* Directorio */}
        <div className="bg-white rounded-[14px] border border-border p-5">
          {/* Header */}
          <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <div className="bona-gradient-bg w-9 h-9 rounded-[10px] flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-[14px] font-bold text-text-1">Directorio de Empresas Contratantes</div>
                <div className="text-[11px] text-text-4">Todas las empresas contratantes registradas en la plataforma.</div>
              </div>
            </div>
            <span className="text-[11px] font-bold text-orange-dark whitespace-nowrap">{empresas.length} registrados</span>
          </div>

          {/* Buscador */}
          <div className="relative mb-4">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-text-4" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por empresa, RUC, sector o contrato…"
              className="w-full pl-8 pr-3 py-2 text-[12px] rounded-[8px] border border-border bg-white placeholder-text-4 focus:outline-none focus:border-orange"
            />
          </div>

          {/* Móvil: cards */}
          <div className="sm:hidden space-y-2">
            {filtered.map(emp => (
              <div key={emp.id} className="rounded-[12px] border border-border px-3 py-2.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[12px] font-bold text-text-1">{emp.nombre}</span>
                  {emp.nombreComercial && emp.nombreComercial !== emp.nombre && (
                    <span className="text-[11px] text-text-5">· {emp.nombreComercial}</span>
                  )}
                </div>
                <div className="text-[12px] text-text-3 mt-0.5">
                  <span className="font-mono font-semibold text-text-2">{emp.ruc}</span>
                  <span className="mx-1.5 text-text-4">·</span>
                  <span className="font-medium">{emp.sector}</span>
                </div>
                <div className="mt-1.5 space-y-0.5 text-[12px] text-text-3">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Mail className="w-3 h-3 shrink-0 text-text-4" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <Phone className="w-3 h-3 shrink-0 text-text-4" />
                    <span className="truncate">{emp.telefono}</span>
                  </div>
                </div>
                {emp.contratos.length > 0 ? (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {emp.contratos.map(c => (
                      <span key={c} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-orange-tint text-[11px] font-semibold text-orange-dark">
                        {c}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="mt-2 block text-[11px] text-text-5 italic">Sin contratos activos</span>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-[12px] text-text-4 text-center py-8">No se encontraron empresas con los filtros aplicados.</div>
            )}
          </div>

          {/* Desktop: tabla */}
          <div className="hidden sm:block overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead className="bg-page-bg">
                <tr className="border-b border-border">
                  {['Empresa', 'RUC', 'Sector', 'Contacto', 'Contratos'].map((h, i) => (
                    <th key={h} className={`text-xs font-semibold text-text-4 uppercase tracking-wide px-4 py-3 ${i === 0 ? 'text-left' : 'text-center'}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(emp => (
                  <tr key={emp.id} className="border-b border-border last:border-0 transition-colors hover:bg-orange-tint/40">
                    <td className="px-4 py-3">
                      <div className="text-[12px] font-bold text-text-1 whitespace-nowrap">{emp.nombre}</div>
                      {emp.nombreComercial && emp.nombreComercial !== emp.nombre && (
                        <div className="text-[11px] text-text-5 whitespace-nowrap">{emp.nombreComercial}</div>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center font-mono text-[12px] font-semibold text-text-2 whitespace-nowrap">{emp.ruc}</td>
                    <td className="px-4 py-3 text-center text-[12px] font-medium text-text-3 whitespace-nowrap">{emp.sector}</td>
                    <td className="px-4 py-3 text-[12px] text-text-3 max-w-[260px]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <Mail className="w-3 h-3 shrink-0 text-text-4" />
                        <span className="truncate">{emp.email}</span>
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5 min-w-0">
                        <Phone className="w-3 h-3 shrink-0 text-text-4" />
                        <span className="truncate">{emp.telefono}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {emp.contratos.length > 0 ? (
                        <div className="flex flex-wrap items-center justify-center gap-1">
                          {emp.contratos.map(c => (
                            <span key={c} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-orange-tint text-[11px] font-semibold text-orange-dark">
                              {c}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-[11px] text-text-5 italic">Sin contratos activos</span>
                      )}
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-[12px] text-text-4">No se encontraron empresas con los filtros aplicados.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}