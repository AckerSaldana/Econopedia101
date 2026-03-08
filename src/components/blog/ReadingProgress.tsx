import { useState, useEffect } from 'react';

export default function ReadingProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const updateProgress = () => {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? (scrollTop / docHeight) * 100 : 0);
    };
    window.addEventListener('scroll', updateProgress, { passive: true });
    return () => window.removeEventListener('scroll', updateProgress);
  }, []);

  return (
    <div
      className="fixed top-0 left-0 w-full h-0.5 z-[60]"
      style={{ backgroundColor: 'transparent' }}
    >
      <div
        className="h-full transition-[width] duration-150"
        style={{ width: `${progress}%`, backgroundColor: 'var(--color-accent)' }}
      />
    </div>
  );
}
