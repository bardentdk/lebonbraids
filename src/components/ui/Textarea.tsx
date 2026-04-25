'use client';

import { forwardRef, TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id || `textarea-${label?.replace(/\s+/g, '-').toLowerCase()}`;

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={inputId}
          className={cn(
            'w-full rounded-xl border bg-background px-4 py-3 text-sm text-foreground outline-none transition-all duration-200',
            'placeholder:text-muted-foreground',
            'min-h-[120px] resize-y',
            error
              ? 'border-danger focus:ring-2 focus:ring-danger/20'
              : 'border-border focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20',
            className
          )}
          {...props}
        />
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              className="mt-1.5 flex items-center gap-1.5 text-xs text-danger"
            >
              <AlertCircle className="h-3.5 w-3.5" />
              {error}
            </motion.p>
          )}
          {!error && hint && (
            <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>
          )}
        </AnimatePresence>
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';