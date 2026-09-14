import { LogOut } from 'lucide-react';

export default function LogoutConfirmModal({ isOpen, onClose, onConfirm }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 mx-auto mb-5 rounded-full bg-orange-tint flex items-center justify-center">
          <LogOut className="w-8 h-8 text-orange" />
        </div>

        <h3 className="text-xl font-bold text-text-1 mb-2">¿Cerrar sesión?</h3>
        <p className="text-text-3 text-sm leading-relaxed mb-8">
          Tendrás que volver a verificar tu identidad la próxima vez que quieras acceder.
        </p>

        <div className="flex flex-col gap-3">
          <button
            onClick={onConfirm}
            className="w-full h-11 text-white font-semibold text-sm rounded-[8px] cursor-pointer transition-all duration-200"
            style={{ background: 'var(--bonafide-red)', boxShadow: '0 4px 16px rgba(224,32,28,0.32)' }}
          >
            Cerrar sesión
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
