import { useApp } from '../../state/AppContext';
import Logo from '../../components/layout/Logo';

export default function Splash() {
  const { go } = useApp();
  return (
    <div
      onClick={() => go('login')}
      className="h-screen bg-gradient-to-br from-[#FFFAF8] to-[#FFF5F0] flex flex-col items-center justify-center cursor-pointer fade-in"
    >
      <div className="w-20 h-20 bg-gradient-to-br from-orange to-orange-dark rounded-[20px] flex items-center justify-center text-[36px] mb-5 shadow-[0_8px_24px_rgba(232,82,26,.3)]">
        🎯
      </div>
      <Logo size={32} />
      <div className="text-[14px] text-text-4 mt-1">Cadena de Suministro Inteligente</div>
      <div className="text-[12px] text-text-5 mt-0.5">Guinea Ecuatorial</div>
      <div className="mt-12 w-[200px] h-1 bg-border rounded-full overflow-hidden">
        <div className="h-full bg-orange rounded-full" style={{ animation: 'load 2s ease infinite' }} />
      </div>
      <div className="text-[11px] text-text-5 mt-12">Powered by Bonafide Microbank</div>
      <div className="text-[11px] text-text-5 mt-1">Toca para continuar</div>
    </div>
  );
}
