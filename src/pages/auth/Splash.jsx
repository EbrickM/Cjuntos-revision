import { useState, useEffect } from 'react';
import { useApp } from '../../state/AppContext';
import whiteLogo from '../../assets/bonafide-white_logo.png';

export default function Splash() {
  const { go } = useApp();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const duration = 2500;
    const interval = 25;
    const steps = duration / interval;
    let current = 0;

    const timer = setInterval(() => {
      current += 1;
      const t = current / steps;
      setProgress(Math.min(Math.round((1 - Math.pow(1 - t, 2.5)) * 100), 100));

      if (current >= steps) {
        clearInterval(timer);
        setTimeout(() => go('login'), 400);
      }
    }, interval);

    return () => clearInterval(timer);
  }, [go]);

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: 'linear-gradient(135deg, #C62828 0%, #F57C00 100%)' }}
    >
      <img
        src={whiteLogo}
        alt="Creciendo Juntos"
        className="w-100 object-contain mb-5"
      />

      <p
        className="text-xs font-light tracking-[0.3em] mb-12"
        style={{ color: 'rgba(255,255,255,0.55)' }}
      >
        TU BANCA CERCANA Y CONFIABLE
      </p>

      <div className="w-52 h-[3px] rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.2)' }}>
        <div
          className="h-full rounded-full"
          style={{
            width: `${progress}%`,
            background: 'rgba(255,255,255,0.85)',
            transition: 'width 25ms linear',
          }}
        />
      </div>
    </div>
  );
}
