'use client'; import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ArrowRight, Calendar, Sparkles, Star } from 'lucide-react';
import { MagneticButton } from '@/components/animations/MagneticButton'; export function Hero() {
    const rootRef = useRef<HTMLDivElement>(null);
    const orbsRef = useRef<HTMLDivElement>(null); useEffect(() => {
        if (!rootRef.current) return; const ctx = gsap.context(() => {
            // Timeline d'apparition
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } }); tl.from('[data-hero-badge]', {
                y: 30,
                opacity: 0,
                duration: 0.8,
            })
                .from(
                    '[data-hero-title-line]',
                    {
                        y: 80,
                        opacity: 0,
                        duration: 1.1,
                        stagger: 0.15,
                    },
                    '-=0.3'
                )
                .from(
                    '[data-hero-desc]',
                    {
                        y: 30,
                        opacity: 0,
                        duration: 0.8,
                    },
                    '-=0.5'
                )
                .from(
                    '[data-hero-cta]',
                    {
                        y: 20,
                        opacity: 0,
                        duration: 0.7,
                        stagger: 0.1,
                    },
                    '-=0.4'
                )
                .from(
                    '[data-hero-stat]',
                    {
                        scale: 0.8,
                        opacity: 0,
                        duration: 0.6,
                        stagger: 0.1,
                        ease: 'back.out(1.7)',
                    },
                    '-=0.3'
                );  // Floating orbs (parallax léger sur scroll)
            const handleScroll = () => {
                if (!orbsRef.current) return;
                const offset = window.scrollY * 0.4;
                gsap.to(orbsRef.current.children, {
                    y: offset,
                    duration: 0.8,
                    ease: 'power2.out',
                    stagger: 0.1,
                });
            }; window.addEventListener('scroll', handleScroll, { passive: true });
            return () => window.removeEventListener('scroll', handleScroll);
        }, rootRef); return () => ctx.revert();
    }, []); return (
        <section
            ref={rootRef}
            className="relative overflow-hidden pt-12 pb-20 sm:pt-20 lg:pt-28 lg:pb-32"
        >
            {/* Fond animé */}
            <div ref={orbsRef} className="pointer-events-none absolute inset-0 -z-10" aria-hidden="true">
                <div
                    className="absolute -top-32 left-[20%] h-[500px] w-[500px] rounded-full opacity-40 blur-3xl"
                    style={{
                        background:
                            'radial-gradient(circle, hsl(var(--color-primary-400)) 0%, transparent 60%)',
                        animation: 'float 8s ease-in-out infinite',
                    }}
                />
                <div
                    className="absolute right-[5%] top-32 h-[400px] w-[400px] rounded-full opacity-30 blur-3xl"
                    style={{
                        background:
                            'radial-gradient(circle, hsl(var(--color-secondary-500)) 0%, transparent 60%)',
                        animation: 'float 10s ease-in-out infinite reverse',
                    }}
                />
                <div
                    className="absolute bottom-0 left-[40%] h-[400px] w-[400px] rounded-full opacity-25 blur-3xl"
                    style={{
                        background:
                            'radial-gradient(circle, hsl(var(--color-accent)) 0%, transparent 60%)',
                        animation: 'float 12s ease-in-out infinite',
                    }}
                />
            </div>  {/* Pattern dots */}
            <div
                className="pointer-events-none absolute inset-0 -z-10 opacity-30"
                aria-hidden="true"
                style={{
                    backgroundImage:
                        'radial-gradient(circle, hsl(var(--color-primary-200)) 1px, transparent 1px)',
                    backgroundSize: '32px 32px',
                }}
            />  <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="text-center">
                    {/* Badge */}
                    <div data-hero-badge className="inline-flex items-center gap-2 rounded-full border border-primary-200 bg-primary-50/80 px-4 py-1.5 text-sm font-medium text-primary-700 backdrop-blur-sm">
                        <span className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-500 opacity-75" />
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-600" />
                        </span>
                        Nouveaux créneaux disponibles cette semaine
                    </div>      {/* Title */}
                    <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl xl:text-8xl">
                        <span data-hero-title-line className="block">
                            L'art des tresses
                        </span>
                        <span data-hero-title-line className="text-gradient block pb-3">
                            à votre image
                        </span>
                    </h1>      {/* Description */}
                    <p
                        data-hero-desc
                        className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl"
                    >
                        Box braids, knotless, twists, soins capillaires...
                        Réservez en quelques clics et offrez à vos cheveux ce qu'ils méritent. ✨
                    </p>      {/* CTAs */}
                    <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <div data-hero-cta>
                            <MagneticButton strength={20}>
                                <Link
                                    href="/reservation"
                                    className="btn-shine group inline-flex items-center gap-2 rounded-2xl bg-gradient-primary px-7 py-4 text-base font-semibold text-white shadow-premium transition-all hover:shadow-glow"
                                >
                                    <Calendar className="h-5 w-5 transition-transform group-hover:scale-110" />
                                    Réserver maintenant
                                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                            </MagneticButton>
                        </div>
                        <div data-hero-cta>
                            <Link
                                href="/prestations"
                                className="inline-flex items-center gap-2 rounded-2xl border border-border bg-background/80 px-7 py-4 text-base font-medium backdrop-blur-md transition-all hover:border-primary-400 hover:bg-background"
                            >
                                <Sparkles className="h-4 w-4 text-primary-600" />
                                Découvrir les prestations
                            </Link>
                        </div>
                    </div>      {/* Quick stats */}
                    <div className="mt-16 grid grid-cols-3 gap-4 sm:gap-8">
                        <HeroStat
                            value="500+"
                            label="Clientes satisfaites"
                        />
                        <HeroStat
                            value="4.9"
                            label="Note moyenne"
                            icon={<Star className="h-3.5 w-3.5 fill-secondary-500 text-secondary-500" />}
                        />
                        <HeroStat
                            value="3 ans"
                            label="D'expertise"
                        />
                    </div>
                </div>
            </div>
        </section>
    );
}
function HeroStat({
    value,
    label,
    icon,
}: {
    value: string;
    label: string;
    icon?: React.ReactNode;
}) {
    return (
        <div data-hero-stat className="rounded-2xl border border-border/60 bg-background/40 p-3 backdrop-blur-md sm:p-5">
            <div className="flex items-center justify-center gap-1.5 text-2xl font-bold tabular-nums sm:text-3xl">
                {value}
                {icon}
            </div>
            <div className="mt-1 text-xs text-muted-foreground sm:text-sm">{label}</div>
        </div>
    );
}