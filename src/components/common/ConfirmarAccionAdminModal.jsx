import { CheckCircle2, XCircle } from 'lucide-react';

// Confirmación genérica para que Bonafide (Admin) apruebe o rechace el alta de
// una entidad (Empresa Contratada / Proveedor / Suministrador) notificada
// desde el portal que la agregó. Mismo estilo que ConfirmarEliminarModal /
// LogoutConfirmModal.
export default function ConfirmarAccionAdminModal({ tipo, notif, onConfirm, onClose }) {
  const esAprobar = tipo === 'aprobar';
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className={`w-16 h-16 mx-auto mb-5 rounded-full flex items-center justify-center ${esAprobar ? 'bg-green-bg' : 'bg-red-bg'}`}>
          {esAprobar
            ? <CheckCircle2 className="w-8 h-8 text-green-text" />
            : <XCircle className="w-8 h-8 text-red-text" />}
        </div>

        <h3 className="text-xl font-bold text-text-1 mb-2">
          {esAprobar ? '¿Aprobar esta alta?' : '¿Rechazar esta alta?'}
        </h3>
        <p className="text-text-3 text-sm leading-relaxed mb-8">
          {esAprobar ? (
            <>Confirmas que <span className="font-semibold text-text-1">{notif.nombreEntidad}</span> queda aprobado como {notif.tipoEntidad.toLowerCase()} de {notif.rolLabel.toLowerCase()}.</>
          ) : (
            <>Se eliminará a <span className="font-semibold text-text-1">{notif.nombreEntidad}</span> del directorio. Esta acción no se puede deshacer.</>
          )}
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="w-full h-11 text-white font-semibold text-sm rounded-[8px] cursor-pointer transition-all duration-200"
            style={esAprobar
              ? { background: '#2E7D5B', boxShadow: '0 4px 16px rgba(46,125,91,0.32)' }
              : { background: 'var(--bonafide-red)', boxShadow: '0 4px 16px rgba(224,32,28,0.32)' }}
          >
            {esAprobar ? 'Aprobar' : 'Rechazar'}
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
