'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';

interface SwitchProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string;
  description?: string;
}

export const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  ({ label, description, className, id, ...props }, ref) => {
    const inputId = id || `switch-${Math.random().toString(36).slice(2)}`;

    return (
      <label
        htmlFor={inputId}
        className="flex cursor-pointer items-start gap-3"
      >
        <div className="relative mt-0.5">
          <input
            ref={ref}
            id={inputId}
            type="checkbox"
            className="peer sr-only"
            {...props}
          />
          <div
            className={cn(
              'h-6 w-11 rounded-full bg-muted transition-colors duration-200',
              'peer-checked:bg-primary-600 peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500/40 peer-focus-visible:ring-offset-2',
              className
            )}
          />
          <div
            className={cn(
              'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform duration-200',
              'peer-checked:translate-x-5'
            )}
          />
        </div>
        {(label || description) && (
          <div className="flex-1">
            {label && (
              <div className="text-sm font-medium leading-tight">{label}</div>
            )}
            {description && (
              <div className="mt-0.5 text-xs text-muted-foreground">
                {description}
              </div>
            )}
          </div>
        )}
      </label>
    );
  }
);

Switch.displayName = 'Switch';