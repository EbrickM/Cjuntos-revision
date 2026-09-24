import { Trash2, AlertTriangle } from 'lucide-react';

// ── Confirmación de eliminación (directorios de Empresas Contratadas /
// Proveedores / Suministradores) ────────────────────────────────────────────
// Mismo patrón visual que LogoutConfirmModal. Si la entidad está ligada a un
// contrato (`contratoVinculado`), se agrega un aviso "Importante" — siempre
// debe salir el modal de confirmación, pero ese aviso solo cuando aplica.
export default function ConfirmarEliminarModal({ nombre, tipoEntidad, contratoVinculado, onConfirm, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-red-bg flex items-center justify-center">
          <Trash2 className="w-8 h-8 text-red-text" />
        </div>

        <h3 className="text-xl font-bold text-text-1 mb-2">¿Eliminar {tipoEntidad.toLowerCase()}?</h3>
        <p className="text-text-3 text-sm leading-relaxed mb-4">
          Vas a eliminar a <span className="font-semibold text-text-1">{nombre}</span> de tu directorio. Esta acción no se puede deshacer.
        </p>

        {contratoVinculado && (
          <div className="flex items-start gap-2.5 text-left bg-red-bg border border-red/20 rounded-[12px] px-4 py-3 mb-6">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-text" />
            <p className="text-[12px] text-red-text leading-relaxed">
              <span className="font-bold">Importante:</span> Este {tipoEntidad.toLowerCase()} está añadido al contrato <span className="font-mono font-semibold">{contratoVinculado}</span>.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="w-full h-11 text-white font-semibold text-sm rounded-[8px] cursor-pointer transition-all duration-200"
            style={{ background: 'var(--bonafide-red)', boxShadow: '0 4px 16px rgba(224,32,28,0.32)' }}
          >
            Eliminar
          </button>
          <button
            onClick={onClose}
            className="text-sm text-text-3 hover:text-text-1 transition-colors cursor-pointer font-medium"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
