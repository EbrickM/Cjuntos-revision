import { useEffect } from 'react';
import { useApp } from '../../state/AppContext';
import logoCircle from '../../assets/logo_circle.png';
import logoText   from '../../assets/logo_text.png';

export default function Splash() {
  const { go } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => go('login'), 4500);
    return () => clearTimeout(timer);
  }, [go]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-5">

      <img
        src={logoCircle}
        alt=""
        className="w-60 h-60 object-contain"
        style={{ animation: 'spin 1.2s linear infinite' }}
      />

      <img
        src={logoText}
        alt="Bonafide"
        className="w-150 object-contain"
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
