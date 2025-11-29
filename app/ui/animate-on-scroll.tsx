'use client';

import React, { useEffect, useRef, useState } from 'react';

interface AnimateOnScrollProps {
    children: React.ReactNode;
    animation: string;
    delay?: string;
    className?: string;
}

export default function AnimateOnScroll({
    children,
    animation,
    delay = '',
    className = '',
}: AnimateOnScrollProps) {
    const [isVisible, setIsVisible] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px',
            }
        );

        if (ref.current) {
            observer.observe(ref.current);
        }

        return () => {
            if (ref.current) {
                observer.unobserve(ref.current);
            }
        };
    }, []);

    return (
        <div
            ref={ref}
            className={`${className} ${isVisible ? animation : 'opacity-0'} ${isVisible ? delay : ''}`}
        >
            {children}
        </div>
    );
}
