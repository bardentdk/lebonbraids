'use client';

import { Fragment, ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlay?: boolean;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
  full: 'max-w-6xl',
};

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
  closeOnOverlay = true,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <Fragment>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => closeOnOverlay && onClose()}
            className="fixed inset-0 z-50 bg-primary-950/60 backdrop-blur-sm"
            aria-hidden="true"
          />
          <div
            className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.96 }}
              transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                'relative w-full overflow-hidden rounded-t-3xl bg-background shadow-premium sm:rounded-2xl',
                'flex max-h-[92vh] flex-col',
                sizeClasses[size]
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {(title || description) && (
                <div className="flex items-start justify-between gap-4 border-b border-border px-6 py-4">
                  <div>
                    {title && (
                      <h2 className="text-lg font-semibold tracking-tight">
                        {title}
                      </h2>
                    )}
                    {description && (
                      <p className="mt-0.5 text-sm text-muted-foreground">
                        {description}
                      </p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                    aria-label="Fermer"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>
              {footer && (
                <div className="flex items-center justify-end gap-2 border-t border-border bg-muted/30 px-6 py-4">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </Fragment>
      )}
    </AnimatePresence>
  );
}