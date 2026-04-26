'use client'; 
import { ReactNode, useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger'; interface ScrollRevealProps {
    children: ReactNode;
    className?: string;
    delay?: number;
    duration?: number;
    y?: number;
    stagger?: boolean;
    staggerSelector?: string;
}export function ScrollReveal({
    children,
    className,
    delay = 0,
    duration = 0.9,
    y = 40,
    stagger = false,
    staggerSelector = '[data-reveal-item]',
}: ScrollRevealProps) {
    const ref = useRef<HTMLDivElement>(null); useEffect(() => {
        if (!ref.current) return;
        gsap.registerPlugin(ScrollTrigger);

        const ctx = gsap.context(() => {
            const targets = stagger ? staggerSelector : ref.current;
            gsap.fromTo(
                targets!,
                { y, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration,
                    delay,
                    stagger: stagger ? 0.1 : 0,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: ref.current,
                        start: 'top 85%',
                        toggleActions: 'play none none none',
                    },
                }
            );
        }, ref);
        return () => ctx.revert();
    }, [delay, duration, y, stagger, staggerSelector]); return (
        <div ref={ref} className={className}>
            {children}
        </div>
    );
}