'use client'; 
import { ReactNode, useRef } from 'react';
import { gsap } from 'gsap'; interface MagneticButtonProps {
    children: ReactNode;
    className?: string;
    strength?: number;
}export function MagneticButton({
    children,
    className,
    strength = 25,
}: MagneticButtonProps) {
    const ref = useRef<HTMLDivElement>(null); const handleMouseMove = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const rect = ref.current.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(ref.current, {
            x: (x / rect.width) * strength,
            y: (y / rect.height) * strength,
            duration: 0.6,
            ease: 'power3.out',
        });
    }; const handleMouseLeave = () => {
        if (!ref.current) return;
        gsap.to(ref.current, {
            x: 0,
            y: 0,
            duration: 0.8,
            ease: 'elastic.out(1, 0.4)',
        });
    }; return (
        <div
            ref={ref}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            className={className}
            style={{ display: 'inline-block' }}
        >
            {children}
        </div>
    );
}