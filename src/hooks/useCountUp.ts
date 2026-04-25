'use client';

import { useEffect, useRef, useState } from 'react';

export function useCountUp(
  target: number,
  duration = 1500,
  enabled = true
): number {
  const [value, setValue] = useState(0);
  const startRef = useRef<number | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let rafId: number;
    const start = performance.now();
    startRef.current = start;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));
      if (progress < 1) rafId = requestAnimationFrame(tick);
      else setValue(target);
    };

    rafId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafId);
  }, [target, duration, enabled]);

  return value;
}