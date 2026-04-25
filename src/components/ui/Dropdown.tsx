'use client';

import { useState, useRef, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

export interface DropdownItem {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  href?: string;
  variant?: 'default' | 'danger';
  separator?: boolean;
}

interface DropdownProps {
  trigger: ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
}

export function Dropdown({ trigger, items, align = 'right' }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div ref={ref} className="relative inline-block">
      <div onClick={() => setOpen((o) => !o)}>{trigger}</div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className={cn(
              'absolute top-full z-40 mt-2 min-w-[180px] overflow-hidden rounded-xl border border-border bg-background p-1.5 shadow-premium',
              align === 'right' ? 'right-0' : 'left-0'
            )}
            role="menu"
          >
            {items.map((item, i) => {
              if (item.separator) {
                return <div key={i} className="my-1 h-px bg-border" />;
              }
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    item.onClick?.();
                    setOpen(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm transition-colors',
                    item.variant === 'danger'
                      ? 'text-danger hover:bg-danger/10'
                      : 'text-foreground hover:bg-muted'
                  )}
                  role="menuitem"
                >
                  {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                  {item.label}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}