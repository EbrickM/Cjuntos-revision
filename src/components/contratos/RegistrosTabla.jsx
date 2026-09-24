import { useState } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Layers2 } from 'lucide-react';
import Badge from '../ui/Badge';

const ASUNTO_BADGE = {
  contrato: 'slate',
  facturas: 'orange',
  administración: 'blue',
  cliente: 'gold',
  indicación: 'red',
};

const asuntoBadge = (a) => ASUNTO_BADGE[a] ?? 'slate';

const parseDate = (d) => {
  if (!d) return '';
  const [dd, mm, yyyy] = (d || '').split('/');
  return `${yyyy ?? ''}-${mm ?? ''}-${dd ?? ''}`;
};

// Tabla compartida de la pestaña "Registros" de los detalles de contrato
// (Contratante / PYME / Proveedor / Fondeador).
export default function RegistrosTabla({ registros = [], titulo = 'Registros', sub = 'Todos los movimientos y actuaciones de las partes sobre este contrato', noAnim = false }) {
  const [sort, setSort]     = useState({ key: null, dir: 'asc' });
  const [groupBy, setGroupBy] = useState(null);

  const toggleSort  = (key) => setSort(s =>
    s.key !== key ? { key, dir: 'asc' }
    : s.dir === 'asc' ? { key, dir: 'desc' }
    : { key: null, dir: 'asc' }
  );
  const toggleGroup = (key) => setGroupBy(g => g === key ? null : key);
  const sortIcon    = (k) => sort.key !== k
    ? <ArrowUpDown className="w-3 h-3 shrink-0 opacity-30" />
    : sort.dir === 'asc'
      ? <ArrowUp className="w-3 h-3 shrink-0 text-orange" />
      : <ArrowDown className="w-3 h-3 shrink-0 text-orange" />;
  const groupIcon   = (k) => <Layers2 className={`w-3 h-3 shrink-0 ${groupBy === k ? 'text-orange' : 'opacity-30'}`} />;

  const sorted = (() => {
    const ek = groupBy || sort.key;
    if (!ek) return registros;
    const dir = groupBy ? 1 : (sort.dir === 'asc' ? 1 : -1);
    return [...registros].sort((a, b) => {
      if (ek === 'referente') return dir * (a.referente ?? '').localeCompare(b.referente ?? '');
      if (ek === 'fecha')     return dir * parseDate(a.fecha).localeCompare(parseDate(b.fecha));
      if (ek === 'asunto')    return dir * (a.asunto ?? '').localeCompare(b.asunto ?? '');
      return 0;
    });
  })();

  return (
    <div className={`bg-white rounded-[14px] border border-border p-5 ${noAnim ? '' : 'card-enter'}`}>
      <div className="flex items-center justify-between gap-2 mb-4">
        <div>
          <div className="text-[14px] font-bold text-text-1">{titulo} ({registros.length})</div>
          <div className="text-[11px] text-text-4">{sub}</div>
        </div>
      </div>

      {registros.length === 0 ? (
        <div className="py-10 flex flex-col items-center gap-2" style={{ color: '#A9A6A1' }}>
          <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M12 7v5l4 2" />
          </svg>
          <p className="text-[13px] font-semibold">Aún no hay registros para este contrato</p>
        </div>
      ) : (
        <>
          {/* Móvil: cards */}
          <div className="sm:hidden space-y-2">
            {registros.map((r, i) => (
              <div key={i} className="rounded-[12px] border border-border p-3.5 flex flex-col gap-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-[13px] font-bold text-text-1 truncate">{r.referente}</p>
                    <p className="text-[10px] font-mono" style={{ color: '#A9A6A1' }}>{r.fecha}</p>
                  </div>
                  <Badge variant={asuntoBadge(r.asunto)} className="capitalize shrink-0">{r.asunto}</Badge>
                </div>
                <p className="text-[12px] text-text-2 leading-relaxed pt-1.5 border-t border-border">{r.registro}</p>
              </div>
            ))}
          </div>

          {/* Desktop: tabla con sort/group */}
          <div className="hidden sm:block overflow-x-auto">
            <div className="min-w-[720px] grid [grid-template-columns:1.4fr_0.9fr_1fr_2.5fr] bg-page-bg px-4 py-2.5 border-b border-border gap-3 items-center">
              <button onClick={() => toggleGroup('referente')}
                className={`text-[11px] font-semibold uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1 ${groupBy === 'referente' ? 'text-orange' : 'text-text-4'}`}>
                Referente {groupIcon('referente')}
              </button>
              <button onClick={() => toggleSort('fecha')}
                className="text-[11px] font-semibold text-text-4 uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1">
                Fecha {sortIcon('fecha')}
              </button>
              <button onClick={() => toggleGroup('asunto')}
                className={`text-[11px] font-semibold uppercase tracking-wide flex items-center gap-1 cursor-pointer hover:text-text-1 ${groupBy === 'asunto' ? 'text-orange' : 'text-text-4'}`}>
                Asunto {groupIcon('asunto')}
              </button>
              <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide">Registro</span>
            </div>
            {sorted.flatMap((r, i) => {
              const gVal = groupBy === 'referente' ? (r.referente || '—')
                         : groupBy === 'asunto'    ? (r.asunto    || '—')
                         : null;
              const prevGVal = i === 0 ? null
                : groupBy === 'referente' ? (sorted[i - 1].referente || '—')
                : groupBy === 'asunto'    ? (sorted[i - 1].asunto    || '—')
                : null;
              const isNewGroup = gVal !== null && (i === 0 || gVal !== prevGVal);
              const groupSep = isNewGroup ? [
                <div key={`grp-${i}`} className="min-w-[720px] px-4 py-1.5 bg-orange-tint/20 border-b border-orange/20">
                  <span className="text-[11px] font-bold text-orange capitalize">{gVal}</span>
                </div>,
              ] : [];
              const rowDiv = (
                <div
                  key={i}
                  className="min-w-[720px] grid [grid-template-columns:1.4fr_0.9fr_1fr_2.5fr] px-4 py-3 border-b border-border last:border-0 hover:bg-orange-tint/40 transition-colors items-start gap-3"
                >
                  <div className="text-[12px] font-semibold text-text-1">{r.referente}</div>
                  <div className="text-[12px] font-mono whitespace-nowrap" style={{ color: '#A9A6A1' }}>{r.fecha}</div>
                  <div><Badge variant={asuntoBadge(r.asunto)} className="capitalize">{r.asunto}</Badge></div>
                  <div className="text-[12px] text-text-2 leading-relaxed">{r.registro}</div>
                </div>
              );
              return [...groupSep, rowDiv];
            })}
          </div>
        </>
      )}
    </div>
  );
}
