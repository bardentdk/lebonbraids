'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { Check, Clock, Sparkles } from 'lucide-react';
import { gsap } from 'gsap';

import { cn } from '@/lib/utils/cn';
import { formatPrice, formatDuration } from '@/lib/utils/format';

interface Service {
    id: string;
    name: string;
    short_description: string | null;
    price: number;
    duration_minutes: number;
    cover_image_url: string | null;
    category?: { name: string } | null;
}

interface Props {
    services: Service[];
    selectedIds: string[];
    onToggle: (id: string) => void;
}

export function StepServices({ services, selectedIds, onToggle }: Props) {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!ref.current) return;
        const ctx = gsap.context(() => {
            gsap.fromTo(
                '[data-service]',
                { opacity: 0, y: 20 },
                {
                    opacity: 1,
                    y: 0,
                    duration: 0.5,
                    stagger: 0.06,
                    ease: 'power3.out',
                }
            );
        }, ref);
        return () => ctx.revert();
    }, []);

    return (
        <div ref={ref}>
            <div className="mb-6">
                <h2 className="text-2xl font-bold tracking-tight">
                    Quelle prestation souhaites-tu ?
                </h2>
                <p className="mt-1.5 text-sm text-muted-foreground">
                    Tu peux en sélectionner plusieurs si tu veux les combiner.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                {services.map((s) => {
                    const selected = selectedIds.includes(s.id);
                    return (
                        <button
                            key={s.id}
                            type="button"
                            data-service
                            onClick={() => onToggle(s.id)}
                            className={cn(
                                'group relative flex gap-3 overflow-hidden rounded-2xl border-2 p-3 text-left transition-all',
                                selected
                                    ? 'border-primary-500 bg-primary-50/50 shadow-soft'
                                    : 'border-border bg-background hover:border-primary-300 hover:shadow-soft'
                            )}
                        >
                            {/* Checkbox */}
                            <div
                                className={cn(
                                    'absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full border-2 transition-all',
                                    selected
                                        ? 'border-primary-600 bg-primary-600 scale-110'
                                        : 'border-border bg-background group-hover:border-primary-400'
                                )}
                            >
                                {selected && <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />}
                            </div>

                            {/* Image */}
                            <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-primary">
                                {s.cover_image_url ? (
                                    <Image
                                        src={s.cover_image_url}
                                        alt={s.name}
                                        fill
                                        sizes="96px"
                                        className="object-cover transition-transform duration-500 group-hover:scale-110"
                                    />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-white/40">
                                        <Sparkles className="h-8 w-8" />
                                    </div>
                                )}
                            </div>

                            {/* Infos */}
                            <div className="min-w-0 flex-1 pr-7">
                                {s.category && (
                                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                                        {s.category.name}
                                    </span>
                                )}
                                <h3 className="line-clamp-2 text-sm font-semibold leading-tight">
                                    {s.name}
                                </h3>
                                <div className="mt-1.5 flex items-baseline gap-2">
                                    <span className="text-base font-bold tabular-nums text-primary-700">
                                        {formatPrice(Number(s.price))}
                                    </span>
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        {formatDuration(s.duration_minutes)}
                                    </span>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}