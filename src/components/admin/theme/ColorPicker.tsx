'use client';

import { useState, useRef, useEffect } from 'react';
import { HexColorPicker, HexColorInput } from 'react-colorful';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (hex: string) => void;
  description?: string;
}

export function ColorPicker({ label, value, onChange, description }: ColorPickerProps) {
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
    <div ref={ref} className="relative">
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        {description && (
          <span className="text-xs text-muted-foreground">{description}</span>
        )}
      </div>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'group flex w-full items-center gap-3 rounded-xl border border-border bg-background px-3 py-2.5 transition-all',
          'hover:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20',
          open && 'border-primary-500 ring-2 ring-primary-500/20'
        )}
      >
        <div
          className="h-7 w-7 flex-shrink-0 rounded-lg ring-1 ring-inset ring-black/10 transition-transform group-hover:scale-105"
          style={{ backgroundColor: value }}
        />
        <span className="flex-1 text-left font-mono text-sm uppercase">{value}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-background p-3 shadow-premium"
          >
            <HexColorPicker color={value} onChange={onChange} style={{ width: '100%' }} />
            <div className="mt-3">
              <HexColorInput
                prefixed
                color={value}
                onChange={onChange}
                className="h-10 w-full rounded-lg border border-border bg-muted/40 px-3 font-mono text-sm uppercase outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}