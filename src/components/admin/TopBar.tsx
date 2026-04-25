'use client';

import { Menu, Search, Bell } from 'lucide-react';
import { useUIStore } from '@/store/ui-store';
import { Breadcrumb } from './Breadcrumb';
import { UserMenu } from './UserMenu';

interface TopBarProps {
  user: {
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    avatarUrl?: string | null;
    role: string;
  };
}

export function TopBar({ user }: TopBarProps) {
  const { setSidebarMobileOpen } = useUIStore();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Menu mobile */}
        <button
          type="button"
          onClick={() => setSidebarMobileOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Breadcrumb */}
        <div className="hidden flex-1 sm:block">
          <Breadcrumb />
        </div>
        <div className="flex-1 sm:hidden" />

        {/* Search (desktop) */}
        <div className="relative hidden max-w-xs flex-1 md:block">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Rechercher..."
            className="h-10 w-full rounded-xl border border-border bg-muted/40 pl-10 pr-4 text-sm outline-none transition-colors focus:border-primary-400 focus:bg-background focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        {/* Notifications */}
        <button
          type="button"
          className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label="Notifications"
        >
          <Bell className="h-[18px] w-[18px]" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-danger ring-2 ring-background" />
        </button>

        {/* User menu */}
        <UserMenu user={user} />
      </div>
    </header>
  );
}