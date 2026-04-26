'use client';

import { Check } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface Step {
  id: number;
  label: string;
}

interface Props {
  steps: Step[];
  current: number;
}

export function BookingProgress({ steps, current }: Props) {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between gap-2">
        {steps.map((step, i) => {
          const completed = current > step.id;
          const active = current === step.id;
          const isLast = i === steps.length - 1;

          return (
            <div key={step.id} className="flex flex-1 items-center gap-2">
              <div className="flex flex-col items-center gap-2">
                <div
                  className={cn(
                    'relative flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-all',
                    completed && 'border-primary-600 bg-gradient-primary text-white',
                    active && 'border-primary-600 bg-background text-primary-600 shadow-glow',
                    !completed && !active && 'border-border bg-background text-muted-foreground'
                  )}
                >
                  {completed ? (
                    <Check className="h-4 w-4" strokeWidth={3} />
                  ) : (
                    step.id
                  )}
                  {active && (
                    <motion.div
                      layoutId="step-pulse"
                      className="absolute inset-0 rounded-full ring-2 ring-primary-500/40"
                      transition={{ type: 'spring' }}
                    />
                  )}
                </div>
                <span
                  className={cn(
                    'hidden text-[10px] font-medium uppercase tracking-wider sm:block',
                    completed || active
                      ? 'text-foreground'
                      : 'text-muted-foreground/60'
                  )}
                >
                  {step.label}
                </span>
              </div>
              {!isLast && (
                <div className="flex-1 self-start pt-4">
                  <div className="relative h-0.5 w-full bg-border">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: completed ? '100%' : '0%' }}
                      transition={{ duration: 0.4, ease: 'easeInOut' }}
                      className="absolute inset-y-0 left-0 bg-gradient-primary"
                    />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}