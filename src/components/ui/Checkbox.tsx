'use client';

import { forwardRef, InputHTMLAttributes } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils/cn';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string | React.ReactNode;
  error?: string;
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ label, error, className, id, ...props }, ref) => {
    const checkboxId = id || `checkbox-${Math.random().toString(36).slice(2)}`;

    return (
      <div className="flex flex-col gap-1">
        <label
          htmlFor={checkboxId}
          className="group flex cursor-pointer items-start gap-3"
        >
          <div className="relative mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center">
            <input
              ref={ref}
              type="checkbox"
              id={checkboxId}
              className="peer sr-only"
              {...props}
            />
            <div
              className={cn(
                'h-5 w-5 rounded-md border-2 border-border bg-background transition-all duration-200',
                'peer-checked:border-primary-600 peer-checked:bg-primary-600',
                'peer-focus-visible:ring-2 peer-focus-visible:ring-primary-500/40 peer-focus-visible:ring-offset-2',
                'group-hover:border-primary-400',
                error && 'border-danger',
                className
              )}
            />
            <Check
              className={cn(
                'absolute h-3.5 w-3.5 scale-0 text-white opacity-0 transition-all duration-200',
                'peer-checked:scale-100 peer-checked:opacity-100'
              )}
              strokeWidth={3}
            />
          </div>
          {label && (
            <span className="text-sm leading-5 text-foreground">{label}</span>
          )}
        </label>
        {error && <p className="ml-8 text-xs text-danger">{error}</p>}
      </div>
    );
  }
);

Checkbox.displayName = 'Checkbox';