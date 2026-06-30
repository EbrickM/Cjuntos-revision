import { useEffect } from 'react';
import { useApp } from '../../state/AppContext';
import isotipo   from '../../assets/isotipo-blanco.png';
import logoTexto from '../../assets/logo-texto-blanco.png';

export default function Splash() {
  const { go } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => go('login'), 4500);
    return () => clearTimeout(timer);
  }, [go]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center gap-6"
      style={{ background: 'linear-gradient(135deg, #e0201c 0%, #ef7a2c 100%)' }}
    >
      <img
        src={isotipo}
        alt=""
        className="w-32 h-32 sm:w-44 sm:h-44 object-contain"
        style={{ animation: 'spin 1.2s linear infinite' }}
      />

      <img
        src={logoTexto}
        alt="Bonafide"
        className="w-56 sm:w-72 object-contain"
      />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
