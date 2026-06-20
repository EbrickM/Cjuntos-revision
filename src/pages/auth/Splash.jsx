import { useEffect } from 'react';
import { useApp } from '../../state/AppContext';
import whiteLogo from '../../assets/bmori_white_logo.png';

export default function Splash() {
  const { go } = useApp();

  useEffect(() => {
    const timer = setTimeout(() => go('login'), 4000);
    return () => clearTimeout(timer);
  }, [go]);

  return (
    <div className="h-screen flex flex-col items-center justify-center fade-in" style={{ background: 'linear-gradient(135deg, #C62828 0%, #F57C00 100%)' }}>
      <img src={whiteLogo} alt="B-Morï" className="w-48" />
      <div className="mt-10 w-[200px] h-1 bg-white/30 rounded-full overflow-hidden">
        <div
          className="h-full bg-white rounded-full"
          style={{ animation: 'load-fill 4s ease forwards' }}
        />
      </div>
    </div>
  );
}
