import { Building2 } from 'lucide-react';
import { EMPRESAS_CONTRATANTES } from './fondeadorShared';

// ── Filtro general por Empresa Contratante ────────────────────────────────────
// Reutilizado en Contratos/Facturas/IPIs/Registros: al elegir un cliente, la
// tabla de esa pantalla se limita a lo relacionado con él.
export default function FiltroClienteSelect({ value, onChange }) {
  return (
    <div className="relative flex items-center shrink-0">
      <Building2 className="absolute left-2.5 w-3.5 h-3.5 pointer-events-none shrink-0 text-text-4" />
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        title="Filtrar por Empresa Contratante"
        className="h-8 pl-8 pr-7 text-[11px] font-medium rounded-[8px] border border-border bg-white text-text-3 focus:outline-none focus:border-orange transition cursor-pointer appearance-none"
        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='10' height='6' viewBox='0 0 10 6'%3E%3Cpath d='M1 1l4 4 4-4' stroke='%23A9A6A1' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 8px center' }}
      >
        <option value="">Todos los clientes</option>
        {EMPRESAS_CONTRATANTES.map(e => <option key={e.id} value={e.nombre}>{e.nombre}</option>)}
      </select>
    </div>
  );
}
