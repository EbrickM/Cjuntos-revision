import { useState, useEffect, useRef } from 'react';

function easeOutExpo(t) {
  return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

/**
 * Animates a number from 0 to `target` using easeOutExpo.
 * @param {number} target   Final value
 * @param {number} duration Animation duration in ms
 * @param {number} delay    Delay before starting in ms
 */
export function useCountUp(target, duration = 1600, delay = 0) {
  const [value, setValue] = useState(0);
  const rafRef   = useRef(null);
  const startRef = useRef(null);

  useEffect(() => {
    let timeoutId;
    startRef.current = null;

    function tick(ts) {
      if (!startRef.current) startRef.current = ts;
      const progress = Math.min((ts - startRef.current) / duration, 1);
      setValue(Math.round(easeOutExpo(progress) * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }

    timeoutId = setTimeout(() => {
      rafRef.current = requestAnimationFrame(tick);
    }, delay);

    return () => {
      clearTimeout(timeoutId);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [target, duration, delay]);

  return value;
}
