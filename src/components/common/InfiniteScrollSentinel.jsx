import { Loader2 } from 'lucide-react';

// Div invisible que dispara la siguiente página de useInfiniteScroll al
// entrar en el viewport, con un loader inline mientras carga. No renderiza
// nada una vez que ya no quedan más elementos por cargar.
export default function InfiniteScrollSentinel({ sentinelRef, loading, hasMore, className = 'col-span-full' }) {
  if (!hasMore) return null;
  return (
    <div ref={sentinelRef} className={`flex items-center justify-center py-6 ${className}`}>
      {loading && (
        <div className="flex items-center gap-2 text-[12px] font-medium" style={{ color: 'var(--bonafide-orange)' }}>
          <Loader2 className="w-4 h-4 animate-spin" />
          Cargando más…
        </div>
      )}
    </div>
  );
}
