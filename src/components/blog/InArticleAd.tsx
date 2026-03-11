import { useEffect, useRef } from 'react';

interface Props {
  index: number;
}

export default function InArticleAd({ index }: Props) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (pushed.current || !adRef.current) return;
    const pubId = (import.meta as any).env?.PUBLIC_ADSENSE_PUB_ID;
    if (!pubId) return;

    try {
      ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      pushed.current = true;
    } catch {
      // AdSense not loaded yet or ad blocker active
    }
  }, []);

  const pubId = (import.meta as any).env?.PUBLIC_ADSENSE_PUB_ID;
  if (!pubId) return null;

  return (
    <div
      style={{
        marginTop: '2rem',
        marginBottom: '2rem',
        textAlign: 'center',
        minHeight: '100px',
      }}
      aria-hidden="true"
    >
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block', textAlign: 'center' }}
        data-ad-client={pubId}
        data-ad-layout="in-article"
        data-ad-format="fluid"
        data-ad-slot={`in-article-${index}`}
      />
    </div>
  );
}
