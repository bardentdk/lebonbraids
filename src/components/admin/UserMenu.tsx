'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils/cn';

interface UserMenuProps {
  user: {
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
    role: string;
  };
}

export function UserMenu({ user }: UserMenuProps) {
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

  const initials =
    `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() ||
    user.email[0].toUpperCase();

  const displayName =
    user.firstName || user.lastName
      ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
      : user.email;

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'flex items-center gap-2.5 rounded-xl border border-transparent p-1.5 pr-3 transition-all',
          'hover:border-border hover:bg-muted',
          open && 'border-border bg-muted'
        )}
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary text-sm font-semibold text-white">
          {initials}
        </div>
        <div className="hidden text-left sm:block">
          <div className="text-sm font-medium leading-tight">{displayName}</div>
          <div className="text-xs capitalize text-muted-foreground">
            {user.role}
          </div>
        </div>
        <ChevronDown
          className={cn(
            'hidden h-4 w-4 text-muted-foreground transition-transform sm:block',
            open && 'rotate-180'
          )}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-64 overflow-hidden rounded-2xl border border-border bg-background shadow-premium"
            role="menu"
          >
            <div className="border-b border-border p-4">
              <div className="text-sm font-medium">{displayName}</div>
              <div className="truncate text-xs text-muted-foreground">
                {user.email}
              </div>
            </div>
            <div className="p-1.5">
              <Link
                href="/admin/parametres"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
                role="menuitem"
              >
                <Settings className="h-4 w-4 text-muted-foreground" />
                Paramètres
              </Link>
              <Link
                href="/account"
                className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors hover:bg-muted"
                role="menuitem"
              >
                <User className="h-4 w-4 text-muted-foreground" />
                Mon profil
              </Link>
            </div>
            <div className="border-t border-border p-1.5">
              <form action="/api/auth/signout" method="POST">
                <button
                  type="submit"
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm text-danger transition-colors hover:bg-danger/10"
                  role="menuitem"
                >
                  <LogOut className="h-4 w-4" />
                  Se déconnecter
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}