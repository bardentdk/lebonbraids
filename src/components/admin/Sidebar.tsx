'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { gsap } from 'gsap';
import { Sparkles, ChevronsLeft, X, Lock } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

import { cn } from '@/lib/utils/cn';
import { siteConfig } from '@/config/site';
import { adminNavigation } from '@/config/admin-navigation';
import { useUIStore } from '@/store/ui-store';

const SHOP_ITEMS = ['/admin/produits', '/admin/stocks', '/admin/commandes'];

interface SidebarProps {
  shopEnabled: boolean;
}

export function Sidebar({ shopEnabled }: SidebarProps) {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar, sidebarMobileOpen, setSidebarMobileOpen } =
    useUIStore();
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!navRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-nav-group]',
        { x: -20, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power3.out',
        }
      );
    }, navRef);
    return () => ctx.revert();
  }, []);

  useEffect(() => {
    setSidebarMobileOpen(false);
  }, [pathname, setSidebarMobileOpen]);

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  return (
    <>
      <AnimatePresence>
        {sidebarMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarMobileOpen(false)}
            className="fixed inset-0 z-40 bg-primary-950/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside
        ref={navRef}
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-background transition-all duration-300',
          'lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
          sidebarCollapsed ? 'lg:w-[76px]' : 'lg:w-[260px]',
          sidebarMobileOpen
            ? 'w-[280px] translate-x-0'
            : 'w-[280px] -translate-x-full'
        )}
      >
        <div
          className={cn(
            'flex h-30 items-center border-b border-border px-4',
            sidebarCollapsed ? 'justify-center' : 'justify-center'
          )}
        >
          <Link href="/admin" className="flex text-center items-center gap-2.5 transition-opacity hover:opacity-80">
            {/* <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-gradient-primary text-white shadow-soft">
              <Sparkles className="h-4 w-4" />
            </div>
            {!sidebarCollapsed && (
              <span className="whitespace-nowrap text-sm font-semibold tracking-tight">
                {siteConfig.name}
              </span>
            )} */}
            <div className='flex justify-center text-center'>
              <img src="/assets/img/logo.png" alt="" width={100} />
            </div>
          </Link>
          <button
            type="button"
            onClick={() => setSidebarMobileOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-5">
          <ul className="flex flex-col gap-6">
            {adminNavigation.map((group) => (
              <li key={group.label} data-nav-group>
                {!sidebarCollapsed && (
                  <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {group.label}
                  </div>
                )}
                <ul className="flex flex-col gap-0.5">
                  {group.items.map((item) => {
                    const active = isActive(item.href);
                    const Icon = item.icon;
                    const isShopItem = SHOP_ITEMS.includes(item.href);
                    const disabled = isShopItem && !shopEnabled;

                    if (disabled) {
                      return (
                        <li key={item.href}>
                          <div
                            className={cn(
                              'group flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium opacity-50',
                              sidebarCollapsed && 'justify-center'
                            )}
                            title={
                              sidebarCollapsed
                                ? `${item.label} (boutique désactivée)`
                                : 'Active la boutique dans Paramètres'
                            }
                          >
                            <Icon className="h-[18px] w-[18px] flex-shrink-0 text-muted-foreground" />
                            {!sidebarCollapsed && (
                              <>
                                <span className="truncate">{item.label}</span>
                                <Lock className="ml-auto h-3.5 w-3.5 text-muted-foreground" />
                              </>
                            )}
                          </div>
                        </li>
                      );
                    }

                    return (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            'group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                            active
                              ? 'bg-gradient-primary text-white shadow-soft'
                              : 'text-foreground/70 hover:bg-muted hover:text-foreground',
                            sidebarCollapsed && 'justify-center'
                          )}
                          title={sidebarCollapsed ? item.label : undefined}
                        >
                          <Icon
                            className={cn(
                              'h-[18px] w-[18px] flex-shrink-0 transition-transform',
                              active ? 'text-white' : 'text-muted-foreground group-hover:text-primary-600',
                              'group-hover:scale-110'
                            )}
                          />
                          {!sidebarCollapsed && (
                            <span className="truncate">{item.label}</span>
                          )}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
          </ul>
        </nav>

        <div className="hidden border-t border-border p-3 lg:block">
          <button
            type="button"
            onClick={toggleSidebar}
            className={cn(
              'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-muted hover:text-foreground',
              sidebarCollapsed && 'justify-center'
            )}
          >
            <ChevronsLeft
              className={cn('h-4 w-4 transition-transform', sidebarCollapsed && 'rotate-180')}
            />
            {!sidebarCollapsed && <span>Replier</span>}
          </button>
        </div>
      </aside>
    </>
  );
}