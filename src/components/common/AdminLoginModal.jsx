import { useState } from 'react';
import { X, ShieldCheck, User, Lock, Eye, EyeOff } from 'lucide-react';
import Button from '../ui/Button';

export default function AdminLoginModal({ isOpen, onClose, onVerify }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error,    setError]    = useState('');

  if (!isOpen) return null;

  const handleClose = () => {
    setUsername('');
    setPassword('');
    setShowPass(false);
    setError('');
    onClose();
  };

  const handleSubmit = () => {
    if (!username.trim() || !password.trim()) {
      setError('Completa todos los campos para continuar.');
      return;
    }
    setError('');
    onVerify({ username, password });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8 relative">

        {/* Cerrar */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 hover:bg-page-bg rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-5 h-5 text-text-3" />
        </button>

        {/* Icono */}
        <div className="flex justify-center mb-5">
          <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange to-orange-dark flex items-center justify-center">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
        </div>

        {/* Encabezado */}
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-text-1 mb-1">Acceso Administrador</h2>
          <p className="text-sm text-text-3">
            Ingresa tus credenciales de administrador para continuar
          </p>
        </div>

        {/* Campo usuario */}
        <div className="flex flex-col gap-1.5 mb-4">
          <label className="text-[12px] font-semibold text-text-2">Usuario</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="usuario.admin"
              className="h-12 w-full border-2 border-input-border rounded-lg pl-11 pr-4 text-[14px] text-text-1 bg-[#FAFAFA] outline-none transition-all focus:border-orange focus:bg-white focus:shadow-[0_0_0_3px_rgba(198,40,40,0.12)]"
            />
          </div>
        </div>

        {/* Campo contraseña */}
        <div className="flex flex-col gap-1.5 mb-6">
          <label className="text-[12px] font-semibold text-text-2">Contraseña</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-4" />
            <input
              type={showPass ? 'text' : 'password'}
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              placeholder="••••••••"
              className="h-12 w-full border-2 border-input-border rounded-lg pl-11 pr-11 text-[14px] text-text-1 bg-[#FAFAFA] outline-none transition-all focus:border-orange focus:bg-white focus:shadow-[0_0_0_3px_rgba(198,40,40,0.12)]"
            />
            <button
              type="button"
              onClick={() => setShowPass(v => !v)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-text-4 hover:text-text-2 transition-colors cursor-pointer"
            >
              {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-xs text-red-text bg-red-bg border border-red/20 rounded-lg px-3 py-2 mb-4">
            {error}
          </p>
        )}

        <Button onClick={handleSubmit} full className="h-[48px]">
          Iniciar sesión
        </Button>

        <div className="text-center mt-5">
          <button
            onClick={handleClose}
            className="text-sm text-text-3 hover:text-orange transition-colors cursor-pointer font-medium"
          >
            ← Volver
          </button>
        </div>
      </div>
    </div>
  );
}
