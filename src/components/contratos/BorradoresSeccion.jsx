import { useState } from 'react';
import { ChevronRight, Save, Trash2 } from 'lucide-react';
import Badge from '../ui/Badge';
import { listarBorradores, eliminarBorrador } from '../../lib/borradores';
import { contratoService } from '../../services/contrato.service';

// ── Borradores (sección "Mis Contratos") ─────────────────────────────────────
// Muestra los borradores de configuración guardados por el portal (`rol`) con
// "Guardar borrador". Cada tarjeta reabre el wizard en el paso exacto donde se
// guardó. Sin semilla: la lista nace vacía hasta el primer borrador guardado.

const PASOS_TOTALES = { contratante: 3, pyme: 4, proveedor: 3 };

const fmtGuardo = (iso) => {
  if (!iso) return '—';
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${dd}/${mm}/${d.getFullYear()} · ${hh}:${mi}`;
};

export default function BorradoresSeccion({ rol, onContinuar }) {
  const [borradores, setBorradores] = useState(() => listarBorradores(rol));

  const handleEliminar = (contractId) => {
    eliminarBorrador(rol, contractId);
    setBorradores(listarBorradores(rol));
  };

  const pasosTotal = PASOS_TOTALES[rol] ?? 3;

  return (
    <div className="rounded-[14px] px-5 pt-2 pb-5">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <p className="text-[13px] font-bold text-text-1">Borradores</p>
          <p className="text-[11px] text-text-4">Configuraciones de contrato guardadas a medias.</p>
        </div>
        {borradores.length > 0 && (
          <span className="shrink-0 text-[10px] font-bold px-2 py-1 rounded-[6px] bg-orange-tint text-orange-dark">{borradores.length}</span>
        )}
      </div>

      {borradores.length === 0 ? (
        <div className="text-center py-14 border border-dashed border-border rounded-[14px]">
          <Save className="w-6 h-6 text-text-4 mx-auto mb-2" />
          <p className="text-[13px] font-semibold text-text-1">No tienes borradores guardados</p>
          <p className="text-[11px] text-text-4 mt-1 max-w-[380px] mx-auto">
            Entra a "Configurar Contrato" de un contrato pendiente y usa "Guardar borrador" en cualquiera de los pasos.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {borradores.map((b, idx) => {
            const contrato = contratoService.obtener(b.contratoId);
            const titulo = (contrato?.pymeNombre && contrato.pymeNombre !== '—' && contrato.pymeNombre) ||
              (contrato?.contratanteNombre && contrato.contratanteNombre !== '—' && contrato.contratanteNombre) ||
              'Configuración de contrato';
            const pasoActual = Math.min((b.paso ?? 0) + 1, pasosTotal);
            const progreso  = Math.round((pasoActual / pasosTotal) * 100);
            return (
              <div
                key={b.id}
                onClick={() => onContinuar(b)}
                className="relative bg-white rounded-[16px] p-5 cursor-pointer flex flex-col gap-4 transition-all duration-200 hover:scale-[1.015] shadow-[0_3px_10px_rgba(0,0,0,0.10),0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_10px_32px_rgba(224,32,28,0.18),0_4px_14px_rgba(239,122,44,0.12)] card-enter"
                style={{ animationDelay: `${idx * 70}ms` }}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="text-[10px] font-semibold text-text-4">{b.contratoId}</div>
                  <Badge variant="amber">Borrador</Badge>
                </div>

                <div className="min-w-0">
                  <div className="text-[13px] font-bold text-text-1 leading-tight truncate">{titulo}</div>
                  <div className="text-[10px] text-text-5 mt-1">Guardado el {fmtGuardo(b.actualizado)}</div>
                </div>

                {/* Barra de progreso según el paso guardado (mismo diseño que el
                    listado de Mis Contratos) */}
                <div className="mt-auto space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-text-4">Progreso</span>
                    <span className="text-[11px] font-bold" style={{ color: '#EF7A2C' }}>{progreso}%</span>
                  </div>
                  <div className="w-full h-1.5 rounded-full overflow-hidden" style={{ background: '#ECEAE7' }}>
                    <div className="h-full rounded-full"
                         style={{ width: `${progreso}%`, background: 'linear-gradient(90deg, #E0201C, #EF7A2C)' }} />
                  </div>
                  <div className="text-[10px] text-text-5">Paso {pasoActual} de {pasosTotal}</div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-1">
                  <button
                    onClick={e => { e.stopPropagation(); onContinuar(b); }}
                    className="flex items-center gap-0.5 text-[11px] font-semibold text-orange hover:opacity-75 transition cursor-pointer"
                  >
                    Continuar configuración <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); handleEliminar(b.contratoId); }}
                    title="Eliminar borrador"
                    className="p-1.5 rounded-[8px] hover:bg-red-bg transition text-text-4 hover:text-red-text cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}