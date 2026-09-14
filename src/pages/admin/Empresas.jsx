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

  const conContratosActivos = empresas.filter(e => e.contratos.length > 0).length;
  const sinContratosActivos = empresas.filter(e => e.contratos.length === 0).length;

  return (
    <AppShell active="adminEmpresas" role="admin" title="Empresas Contratantes" sub="Directorio de empresas contratantes">
      <div className="fade-in space-y-5">

        {/* Resumen */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { value: empresas.length,  label: 'Total de empresas',                     cls: 'text-text-1' },
            { value: conContratosActivos, label: 'Asociadas a contratos activos',      cls: 'text-orange' },
            { value: sinContratosActivos, label: 'No asociadas a contratos activos',   cls: 'text-text-4' },
          ].map(({ value, label, cls }) => (
            <div key={label} className="bg-white rounded-[14px] border border-border p-4">
              <div className={`text-[32px] font-extrabold leading-none mb-1 ${cls}`}>{value}</div>
              <div className="text-[12px] text-text-4">{label}</div>
            </div>
          ))}
        </div>

        {/* Lista */}
        <div className="bg-white rounded-[14px] border border-border p-5">
          <div className="mb-4">
            <div className="text-[14px] font-bold">Directorio de Empresas Contratantes</div>
            <div className="text-[12px] text-text-4">Todas las empresas contratantes registradas en la plataforma.</div>
          </div>

          <div className="space-y-3">
            {empresas.map(emp => (
              <div
                key={emp.id}
                className="bg-white rounded-[16px] p-4 flex items-start gap-4 shadow-[0_3px_10px_rgba(0,0,0,0.10),0_1px_4px_rgba(0,0,0,0.06)]"
              >
                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 mb-0.5 flex-wrap">
                    <span className="text-[14px] font-bold text-text-1">{emp.nombre}</span>
                    {emp.nombreComercial && emp.nombreComercial !== emp.nombre && (
                      <span className="text-[11px] text-text-5">· {emp.nombreComercial}</span>
                    )}
                  </div>
                  <div className="text-[12px] text-text-4 mb-2">
                    <span className="font-mono">{emp.ruc}</span>
                    <span className="mx-1.5 text-text-5">·</span>
                    <span className="font-medium">{emp.sector}</span>
                  </div>
                  <div className="flex flex-wrap gap-x-5 gap-y-0.5 text-[11px] text-text-5 mb-3">
                    {emp.email    && <span>✉ {emp.email}</span>}
                    {emp.telefono && <span>📞 {emp.telefono}</span>}
                  </div>

                  {/* Contratos asociados */}
                  {emp.contratos.length > 0 ? (
                    <div className="flex flex-wrap gap-1.5">
                      {emp.contratos.map(c => (
                        <span key={c} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[6px] bg-orange-tint text-[11px] font-semibold text-orange-dark">
                          {c}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-[11px] text-text-5 italic">Sin contratos activos</span>
                  )}
                </div>

                {/* Conteo contratos */}
                <div className="shrink-0 text-right min-w-[52px]">
                  <div className={`text-[22px] font-extrabold leading-tight ${emp.contratos.length > 0 ? 'text-orange-dark' : 'text-text-5'}`}>
                    {emp.contratos.length}
                  </div>
                  <div className="text-[10px] font-semibold text-text-5 uppercase tracking-wide">
                    {emp.contratos.length === 1 ? 'contrato' : 'contratos'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
