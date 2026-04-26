'use client'; 
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Sparkles, Calendar, ShoppingBag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion'; import { cn } from '@/lib/utils/cn';
import { siteConfig } from '@/config/site';
import { publicNavigation } from '@/config/public-navigation';
import { MagneticButton } from '@/components/animations/MagneticButton';
import { MobileMenu } from './MobileMenu'; interface NavbarProps {
    shopEnabled: boolean;
}export function Navbar({ shopEnabled }: NavbarProps) {
    const pathname = usePathname();
    const [scrolled, setScrolled] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false); const nav = [...publicNavigation];
    if (shopEnabled) {
        nav.splice(2, 0, { label: 'Boutique', href: '/boutique' });
    } useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });
        return () => window.removeEventListener('scroll', onScroll);
    }, []); const isActive = (href: string) => {
        if (href === '/') return pathname === '/';
        return pathname.startsWith(href);
    }; return (
        <>
            <header
                className={cn(
                    'fixed inset-x-0 top-0 z-40 transition-all duration-500',
                    scrolled
                        ? 'border-b border-border/40 bg-background/80 backdrop-blur-xl'
                        : 'bg-transparent'
                )}
            >
                <div className="mx-auto flex h-30 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                    {/* Logo */}
                    <Link
                        href="/"
                        className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
                    >
                        {/* <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-white shadow-soft transition-transform group-hover:rotate-12">
                            <Sparkles className="h-4 w-4" />
                        </div>
                        <span className="text-base font-semibold tracking-tight">
                            {siteConfig.name}
                        </span> */}
                        <img src="/assets/img/logo.png" alt="" width={100} />
                    </Link>

                    {/* Desktop nav */}
                    <nav className="hidden items-center gap-1 md:flex">
                        {nav.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    'group relative rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                                    isActive(item.href)
                                        ? 'text-primary-700'
                                        : 'text-foreground/70 hover:text-foreground'
                                )}
                            >
                                {item.label}
                                {isActive(item.href) && (
                                    <motion.span
                                        layoutId="nav-active"
                                        className="absolute inset-x-3 -bottom-px h-0.5 rounded-full bg-gradient-primary"
                                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                                    />
                                )}
                            </Link>
                        ))}
                    </nav>
                    {/* CTAs */}
                    <div className="flex items-center gap-2">
                        <MagneticButton className="hidden md:inline-block" strength={15}>
                            <Link
                                href="/reservation"
                                className="btn-shine inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-5 py-2.5 text-sm font-semibold text-white shadow-premium transition-all hover:shadow-glow"
                            >
                                <Calendar className="h-4 w-4" />
                                Réserver
                            </Link>
                        </MagneticButton>
                        <button
                            type="button"
                            onClick={() => setMobileOpen(true)}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background/60 text-foreground backdrop-blur-md transition-colors hover:bg-muted md:hidden"
                            aria-label="Ouvrir le menu"
                        >
                            <Menu className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </header>
            <MobileMenu
                open={mobileOpen}
                onClose={() => setMobileOpen(false)}
                navigation={nav}
            />
        </>
    );
}