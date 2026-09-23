import { Eye } from 'lucide-react';
import { useApp } from '../../state/AppContext';
import AppShell from '../../components/layout/AppShell';
import Badge from '../../components/ui/Badge';

// ── PROVEEDORES ──
export default function EmpProv() {
  const { go } = useApp();

  const provs = [
    ['Tradex','TR','Construcción','45 emp.','b-green','Verde','820'],
    ['Conexxia Bata','CB','Tecnología','12 emp.','b-green','Verde','820'],
    ['Conexxia','CX','Transporte','28 emp.','b-green','Verde','790'],
    ['Conexxia Agro','CA','Agricultura','8 emp.','b-yellow','Amarillo','610'],
    ['Mader. Bata','MB','Maderería','23 emp.','b-green','Verde','750'],
    ['MH Logística','MH','Logística','15 emp.','b-red','Rojo','320'],
  ];

  const scoreBarColor = (score) =>
    parseInt(score) < 500 ? '#E0201C' : parseInt(score) < 700 ? '#C68A1D' : '#EF7A2C';

  return (
    <AppShell active="empProv" role="contratante" title="Proveedores" sub="Directorio">
      <div className="fade-in">
        <div className="bg-white rounded-[14px] border border-border overflow-x-auto">
          {/* Header */}
          <div className="min-w-[640px] grid [grid-template-columns:3fr_1.5fr_1.2fr_1fr_1fr_1fr] bg-page-bg px-4 py-2.5 border-b border-border">
            <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide">Proveedor</span>
            <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Sector</span>
            <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Empleados</span>
            <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Score</span>
            <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Semáforo</span>
            <span className="text-[11px] font-semibold text-text-4 uppercase tracking-wide text-center">Acciones</span>
          </div>

          {provs.map(([name, ini, sec, emp, cls, sem, score]) => (
            <div
              key={name}
              onClick={() => go('empProvPerfil')}
              className="min-w-[640px] grid [grid-template-columns:3fr_1.5fr_1.2fr_1fr_1fr_1fr] px-4 py-3 border-b border-border last:border-0 cursor-pointer transition-all duration-150 hover:scale-[1.01] hover:shadow-[0_4px_14px_rgba(0,0,0,0.08)] hover:z-10 relative bg-white items-center gap-3"
            >
              {/* Proveedor */}
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-[8px] bg-gradient-to-br from-orange to-orange-dark flex items-center justify-center text-white font-bold text-[11px] shrink-0">
                  {ini}
                </div>
                <div className="min-w-0">
                  <div className="text-[13px] font-bold text-text-1 leading-tight truncate">{name}</div>
                  <div className="text-[11px] text-text-4">{sec}</div>
                </div>
              </div>

              {/* Sector */}
              <span className="text-[12px] text-text-3 text-center">{sec}</span>

              {/* Empleados */}
              <span className="text-[12px] text-text-3 text-center">{emp}</span>

              {/* Score */}
              <div className="flex justify-center">
                <div>
                  <div className="text-[12px] font-semibold text-text-1">{score}/1000</div>
                  <div className="h-1.5 w-20 rounded-full mt-1" style={{ background: '#ECEAE7' }}>
                    <div className="h-full rounded-full" style={{ width: `${parseInt(score) / 10}%`, background: scoreBarColor(score) }} />
                  </div>
                </div>
              </div>

              {/* Semáforo */}
              <div className="flex justify-center">
                <Badge variant={cls.replace('b-', '')}>{sem}</Badge>
              </div>

              {/* Acciones */}
              <div className="flex justify-center">
                <button
                  onClick={(e) => { e.stopPropagation(); go('empProvPerfil'); }}
                  className="p-1.5 rounded-[8px] hover:bg-orange-tint transition text-text-4 hover:text-orange cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
