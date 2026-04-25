'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { siteConfig } from '@/config/site';

interface AuthSplitLayoutProps {
  children: React.ReactNode;
  imageUrl?: string;
  imageAlt?: string;
  quote?: string;
  quoteAuthor?: string;
}

const DEFAULT_IMAGE =
  'https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=1400&q=90';

export function AuthSplitLayout({
  children,
  imageUrl = DEFAULT_IMAGE,
  imageAlt = 'Braids Platform',
  quote = "L'art des tresses, pensé pour vous.",
  quoteAuthor = 'Braids Platform',
}: AuthSplitLayoutProps) {
  const imageRef = useRef<HTMLDivElement>(null);
  const quoteRef = useRef<HTMLDivElement>(null);
  const formSideRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Zoom doux sur l'image
      gsap.fromTo(
        imageRef.current,
        { scale: 1.15, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: 2,
          ease: 'power3.out',
        }
      );

      // Apparition de la citation
      gsap.fromTo(
        quoteRef.current,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1.2,
          delay: 0.6,
          ease: 'power3.out',
        }
      );

      // Apparition du formulaire
      gsap.fromTo(
        formSideRef.current,
        { x: 30, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 1,
          delay: 0.3,
          ease: 'power3.out',
        }
      );

      // Parallax très léger sur l'image au mouvement de la souris
      const handleMouseMove = (e: MouseEvent) => {
        if (!imageRef.current) return;
        const { clientX, clientY } = e;
        const x = (clientX / window.innerWidth - 0.5) * 20;
        const y = (clientY / window.innerHeight - 0.5) * 20;
        gsap.to(imageRef.current, {
          x,
          y,
          duration: 1.2,
          ease: 'power2.out',
        });
      };

      window.addEventListener('mousemove', handleMouseMove);
      return () => window.removeEventListener('mousemove', handleMouseMove);
    });

    return () => ctx.revert();
  }, []);

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* ========================================
          🎨 SIDE GAUCHE — IMAGE DUOTONE
          ======================================== */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block xl:w-[55%]">
        {/* Image avec duotone */}
        <div
          ref={imageRef}
          className="duotone-blue absolute inset-0 -m-4"
          aria-hidden="true"
        >
          <Image
            src={imageUrl}
            alt={imageAlt}
            fill
            sizes="(min-width: 1280px) 55vw, 50vw"
            className="object-cover"
            priority
          />
        </div>

        {/* Grain overlay */}
        <div className="grain-overlay pointer-events-none absolute inset-0" />

        {/* Glow subtil en haut à gauche */}
        <div
          className="pointer-events-none absolute -left-20 -top-20 h-96 w-96 rounded-full opacity-40 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, hsl(var(--color-primary-400)) 0%, transparent 70%)',
          }}
        />

        {/* Contenu au-dessus */}
        <div className="relative z-10 flex h-full flex-col justify-between p-12 text-white">
          {/* Logo en haut */}
          <Link
            href="/"
            className="group flex items-center gap-2.5 transition-opacity hover:opacity-80"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md ring-1 ring-white/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              {siteConfig.name}
            </span>
          </Link>

          {/* Citation en bas */}
          <div ref={quoteRef} className="max-w-lg">
            <div className="mb-4 flex items-center gap-3">
              <div className="h-px flex-1 bg-gradient-to-r from-white/60 to-transparent" />
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-white/70">
                {quoteAuthor}
              </span>
            </div>
            <blockquote className="text-3xl font-light leading-tight tracking-tight text-gradient-premium md:text-4xl xl:text-5xl">
              « {quote} »
            </blockquote>

            {/* Dots décoratifs */}
            <div className="mt-8 flex gap-1.5">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="h-1 w-8 rounded-full bg-white/30 first:bg-white/80"
                  style={{
                    animation: `float ${3 + i}s ease-in-out infinite`,
                    animationDelay: `${i * 0.3}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================
          📝 SIDE DROITE — FORMULAIRE
          ======================================== */}
      <div
        ref={formSideRef}
        className="relative flex w-full flex-col lg:w-1/2 xl:w-[45%]"
      >
        {/* Background décoratif subtil */}
        <div
          className="pointer-events-none absolute right-0 top-0 h-96 w-96 opacity-30 blur-3xl"
          style={{
            background:
              'radial-gradient(circle, hsl(var(--color-primary-200)) 0%, transparent 70%)',
          }}
        />

        {/* Header mobile (logo visible seulement en mobile car caché à gauche) */}
        <div className="flex items-center justify-between p-6 lg:hidden">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <span className="text-base font-semibold">{siteConfig.name}</span>
          </Link>
        </div>

        {/* Bouton retour en haut desktop */}
        <Link
          href="/"
          className="group absolute right-6 top-6 z-20 hidden items-center gap-1.5 rounded-full border border-border bg-background/80 px-4 py-2 text-xs font-medium text-muted-foreground backdrop-blur-sm transition-all hover:border-primary-300 hover:text-primary-700 lg:flex"
        >
          <ArrowLeft className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          Retour à l'accueil
        </Link>

        {/* Contenu */}
        <div className="flex flex-1 items-center justify-center px-6 pb-12 sm:px-12 lg:px-12 xl:px-20">
          <div className="w-full max-w-md">{children}</div>
        </div>

        {/* Footer mini */}
        <div className="border-t border-border/60 px-6 py-4 text-center text-xs text-muted-foreground sm:px-12">
          © {new Date().getFullYear()} {siteConfig.name}. Tous droits réservés.
        </div>
      </div>
    </div>
  );
}