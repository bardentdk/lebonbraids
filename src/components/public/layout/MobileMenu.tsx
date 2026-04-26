'use client';
import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Calendar, Sparkles } from 'lucide-react';
import { siteConfig } from '@/config/site';
import { cn } from '@/lib/utils/cn'; interface NavItem {
    label: string;
    href: string;
}interface MobileMenuProps {
    open: boolean;
    onClose: () => void;
    navigation: NavItem[];
}export function MobileMenu({ open, onClose, navigation }: MobileMenuProps) {
    const pathname = usePathname(); useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]); useEffect(() => {
        onClose();
    }, [pathname, onClose]); return (
        <AnimatePresence>
            {open && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-primary-950/60 backdrop-blur-sm md:hidden"
                    />
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', stiffness: 380, damping: 36 }}
                        className="fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col bg-background shadow-premium md:hidden"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between border-b border-border px-5 py-4">
                            <Link href="/" className="flex items-center gap-2.5">
                                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-white">
                                    <Sparkles className="h-4 w-4" />
                                </div>
                                <span className="text-base font-semibold">{siteConfig.name}</span>
                            </Link>
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex h-9 w-9 items-center justify-center rounded-xl text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                                aria-label="Fermer"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>        {/* Nav */}
                        <nav className="flex-1 px-5 py-6">
                            <ul className="space-y-1">
                                {navigation.map((item, i) => {
                                    const active = item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);
                                    return (
                                        <motion.li
                                            key={item.href}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: 0.1 + i * 0.05 }}
                                        >
                                            <Link
                                                href={item.href}
                                                className={cn(
                                                    'flex items-center justify-between rounded-xl px-4 py-3 text-base font-medium transition-colors',
                                                    active
                                                        ? 'bg-gradient-primary text-white'
                                                        : 'text-foreground hover:bg-muted'
                                                )}
                                            >
                                                {item.label}
                                            </Link>
                                        </motion.li>
                                    );
                                })}
                            </ul>
                        </nav>        {/* CTA */}
                        <div className="border-t border-border bg-muted/30 p-5">
                            <Link
                                href="/reservation"
                                className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary text-sm font-semibold text-white shadow-premium"
                            >
                                <Calendar className="h-4 w-4" />
                                Réserver maintenant
                            </Link>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}