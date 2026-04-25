'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface AuthHeaderProps {
  title: string;
  subtitle?: string;
  badge?: string;
}

export function AuthHeader({ title, subtitle, badge }: AuthHeaderProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-animate]',
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.12,
          ease: 'power3.out',
        }
      );
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={rootRef} className="mb-8 space-y-3">
      {badge && (
        <div
          data-animate
          className="inline-flex items-center gap-1.5 rounded-full border border-primary-200 bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-500 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary-600" />
          </span>
          {badge}
        </div>
      )}
      <h1
        data-animate
        className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl"
      >
        {title}
      </h1>
      {subtitle && (
        <p data-animate className="text-sm text-muted-foreground sm:text-base">
          {subtitle}
        </p>
      )}
    </div>
  );
}