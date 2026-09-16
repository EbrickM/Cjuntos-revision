import { useState, useRef, useEffect } from 'react';

// Pagina un arreglo ya filtrado/ordenado por el llamador, cargando de a
// `pageSize` elementos cada vez que el sentinel (el div al final de la lista)
// entra en el viewport. `delay` es solo para simular una llamada a backend en
// desarrollo — se debe dejar en 0 en todas las pantallas reales para que,
// cuando exista backend, los datos se muestren apenas lleguen y no haya una
// espera artificial metida desde el frontend.
export function useInfiniteScroll(items, { pageSize = 10, delay = 0, resetKey } = {}) {
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [prevResetKey, setPrevResetKey] = useState(resetKey);
  const sentinelRef = useRef(null);
  const loadingRef = useRef(false);

  // Reinicia a la página 1 cuando cambia resetKey (p. ej. un término de
  // búsqueda) — ajustar el estado durante el render, en vez de en un efecto,
  // evita un render en cascada innecesario.
  if (resetKey !== prevResetKey) {
    setPrevResetKey(resetKey);
    setPage(1);
  }

  const visibleItems = items.slice(0, page * pageSize);
  const hasMore = visibleItems.length < items.length;

  useEffect(() => {
    if (!hasMore) return undefined;
    const node = sentinelRef.current;
    if (!node) return undefined;

    const observer = new IntersectionObserver((entries) => {
      if (!entries[0].isIntersecting || loadingRef.current) return;
      loadingRef.current = true;
      setLoading(true);
      const advance = () => {
        setPage(p => p + 1);
        setLoading(false);
        loadingRef.current = false;
      };
      if (delay > 0) setTimeout(advance, delay);
      else advance();
    }, { rootMargin: '200px' });

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, delay, visibleItems.length]);

  return { visibleItems, hasMore, loading, sentinelRef };
}
