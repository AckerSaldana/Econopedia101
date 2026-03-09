import { useRef, useEffect, useState, type ReactNode } from 'react';

interface FadeInProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'left' | 'right';
  className?: string;
}

export default function FadeIn({
  children,
  delay = 0,
  direction = 'up',
  className = '',
}: FadeInProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mq.matches);

    if (mq.matches) {
      setIsVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const translateMap = {
    up: 'translateY(20px)',
    left: 'translateX(20px)',
    right: 'translateX(-20px)',
  };

  const style: React.CSSProperties = prefersReducedMotion
    ? {}
    : {
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? 'none' : translateMap[direction],
        transition: `opacity 0.5s ease ${delay}s, transform 0.5s ease ${delay}s`,
      };

  return (
    <div ref={ref} style={style} className={className}>
      {children}
    </div>
  );
}
