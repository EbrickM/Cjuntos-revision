import { ArrowLeft } from 'lucide-react';
import { useApp } from '../../state/AppContext';

export default function BackButton({ to, onClick, label = 'Volver', className = '' }) {
  const { go } = useApp();
  const handleClick = onClick ?? (() => go(to));

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`flex items-center gap-1.5 text-xs text-text-4 hover:text-text-1 mb-2 cursor-pointer transition-colors ${className}`}
    >
      <ArrowLeft className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}
