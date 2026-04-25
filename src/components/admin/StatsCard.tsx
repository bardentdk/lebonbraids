'use client';

import { useEffect, useRef, useState } from 'react';
import { Icon, TrendingUp, TrendingDown, type LucideIcon, DollarSign, Calendar, Users, Image } from 'lucide-react';
import { gsap } from 'gsap';
import { cn } from '@/lib/utils/cn';
import { useCountUp } from '@/hooks/useCountUp';
import { formatPrice } from '@/lib/utils/format';

interface StatsCardProps {
  label: string;
  value: number;
  // icon: LucideIcon;
  icon: keyof typeof icons;

  format?: 'number' | 'currency';
  trend?: number;
  trendLabel?: string;
  color?: 'primary' | 'success' | 'warning' | 'danger';
  delay?: number;
}
const icons: Record<string, LucideIcon> = {
  DollarSign,
  Calendar,
  Users,
  TrendingUp,
  Image
};
const colorClasses = {
  primary: {
    bg: 'from-primary-500/10 to-primary-500/0',
    ring: 'ring-primary-500/20',
    icon: 'bg-primary-500/10 text-primary-600',
    orb: 'bg-primary-400',
  },
  success: {
    bg: 'from-success/10 to-success/0',
    ring: 'ring-success/20',
    icon: 'bg-success/10 text-success',
    orb: 'bg-success',
  },
  warning: {
    bg: 'from-warning/10 to-warning/0',
    ring: 'ring-warning/20',
    icon: 'bg-warning/10 text-warning',
    orb: 'bg-warning',
  },
  danger: {
    bg: 'from-danger/10 to-danger/0',
    ring: 'ring-danger/20',
    icon: 'bg-danger/10 text-danger',
    orb: 'bg-danger',
  },
};

export function StatsCard({
  label,
  value,
  icon,
  // icon: Icon,
  // icon: keyof typeof icons,
  format = 'number',
  trend,
  trendLabel,
  color = 'primary',
  delay = 0,
}: StatsCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  const display = useCountUp(value, 1600, inView);
  const colors = colorClasses[color];

  useEffect(() => {
    if (!ref.current) return;
    const el = ref.current;

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          gsap.fromTo(
            el,
            { y: 30, opacity: 0, scale: 0.96 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              duration: 0.8,
              delay,
              ease: 'power3.out',
            }
          );
          obs.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    obs.observe(el);
    return () => obs.disconnect();
  }, [delay]);

  const formatted =
    format === 'currency' ? formatPrice(display) : display.toLocaleString('fr-FR');

  return (
    <div
      ref={ref}
      className="group relative overflow-hidden rounded-2xl border border-border bg-background p-6 shadow-soft transition-all hover:-translate-y-0.5 hover:shadow-premium"
    >
      {/* Gradient background */}
      <div
        className={cn(
          'pointer-events-none absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-500 group-hover:opacity-100',
          colors.bg
        )}
      />

      {/* Orb décorative */}
      <div
        className={cn(
          'pointer-events-none absolute -right-16 -top-16 h-32 w-32 rounded-full opacity-20 blur-3xl transition-transform duration-700 group-hover:scale-125',
          colors.orb
        )}
      />

      <div className="relative">
        <div className="flex items-start justify-between">
          <div
            className={cn(
              'flex h-11 w-11 items-center justify-center rounded-xl ring-1',
              colors.icon,
              colors.ring
            )}
          >
            <Image className="h-5 w-5" />
          </div>
          {trend !== undefined && (
            <div
              className={cn(
                'flex items-center gap-1 rounded-full px-2 py-1 text-xs font-medium',
                trend >= 0
                  ? 'bg-success/10 text-success'
                  : 'bg-danger/10 text-danger'
              )}
            >
              {trend >= 0 ? (
                <TrendingUp className="h-3 w-3" />
              ) : (
                <TrendingDown className="h-3 w-3" />
              )}
              {Math.abs(trend).toFixed(1)}%
            </div>
          )}
        </div>

        <div className="mt-5">
          <div className="text-sm font-medium text-muted-foreground">{label}</div>
          <div className="mt-1 text-3xl font-bold tracking-tight text-foreground">
            {formatted}
          </div>
          {trendLabel && (
            <div className="mt-1 text-xs text-muted-foreground">{trendLabel}</div>
          )}
        </div>
      </div>
    </div>
  );
}