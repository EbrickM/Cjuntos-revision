import { useEffect } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

export default function Toast({ toast, onDismiss }) {
  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(onDismiss, 4500);
    return () => clearTimeout(t);
  }, [toast, onDismiss]);

  if (!toast) return null;

  const ok = toast.type === 'success';

  return (
    <div className="fixed bottom-6 right-6 z-[200] toast-in">
      <div className={`flex items-start gap-3 px-4 py-3.5 rounded-[12px] shadow-xl border max-w-[360px] ${
        ok ? 'bg-green-bg border-green-border text-green-text' : 'bg-red-bg border-red/30 text-red-text'
      }`}>
        {ok
          ? <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          : <XCircle     className="w-5 h-5 shrink-0 mt-0.5" />
        }
        <p className="text-[13px] font-medium flex-1 leading-snug">{toast.message}</p>
        <button onClick={onDismiss} className="shrink-0 opacity-50 hover:opacity-100 transition cursor-pointer">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
