import { useState, useEffect, useRef } from 'react';

interface TickerItem {
  symbol: string;
  price: string;
  change: string;
  pctChange: string;
  up: boolean;
}

const FALLBACK_DATA: TickerItem[] = [
  { symbol: 'S&P 500', price: '5,234.18', change: '-14.52', pctChange: '-0.28', up: false },
  { symbol: 'FTSE 100', price: '8,164.90', change: '+36.74', pctChange: '+0.45', up: true },
  { symbol: 'EUR/USD', price: '1.08470', change: '-0.0055', pctChange: '-0.51', up: false },
  { symbol: 'GBP/USD', price: '1.2634', change: '+0.0010', pctChange: '+0.08', up: true },
  { symbol: 'Bitcoin', price: '67,432', change: '-128.00', pctChange: '-0.19', up: false },
  { symbol: 'Ethereum', price: '3,521.4', change: '-36.20', pctChange: '-1.02', up: false },
  { symbol: 'Gold', price: '2,342.50', change: '+15.70', pctChange: '+0.67', up: true },
];

function formatNum(n: number, decimals = 2): string {
  return n.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
}

async function fetchLiveData(): Promise<TickerItem[]> {
  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,ripple&vs_currencies=usd&include_24hr_change=true'
    );
    if (!res.ok) return FALLBACK_DATA;
    const data = await res.json();

    const crypto: TickerItem[] = [
      {
        symbol: 'Bitcoin',
        price: formatNum(data.bitcoin.usd),
        change: formatNum(data.bitcoin.usd * data.bitcoin.usd_24h_change / 100),
        pctChange: (data.bitcoin.usd_24h_change >= 0 ? '+' : '') + data.bitcoin.usd_24h_change.toFixed(2),
        up: data.bitcoin.usd_24h_change >= 0,
      },
      {
        symbol: 'Ethereum',
        price: formatNum(data.ethereum.usd),
        change: formatNum(data.ethereum.usd * data.ethereum.usd_24h_change / 100),
        pctChange: (data.ethereum.usd_24h_change >= 0 ? '+' : '') + data.ethereum.usd_24h_change.toFixed(2),
        up: data.ethereum.usd_24h_change >= 0,
      },
      {
        symbol: 'Solana',
        price: formatNum(data.solana.usd),
        change: formatNum(data.solana.usd * data.solana.usd_24h_change / 100),
        pctChange: (data.solana.usd_24h_change >= 0 ? '+' : '') + data.solana.usd_24h_change.toFixed(2),
        up: data.solana.usd_24h_change >= 0,
      },
      {
        symbol: 'XRP',
        price: formatNum(data.ripple.usd, 4),
        change: formatNum(data.ripple.usd * data.ripple.usd_24h_change / 100, 4),
        pctChange: (data.ripple.usd_24h_change >= 0 ? '+' : '') + data.ripple.usd_24h_change.toFixed(2),
        up: data.ripple.usd_24h_change >= 0,
      },
    ];

    // Keep static indices/forex + live crypto
    return [
      FALLBACK_DATA[0], // S&P 500
      FALLBACK_DATA[1], // FTSE 100
      FALLBACK_DATA[2], // EUR/USD
      FALLBACK_DATA[3], // GBP/USD
      ...crypto,
      FALLBACK_DATA[6], // Gold
    ];
  } catch {
    return FALLBACK_DATA;
  }
}

export default function ExchangeRateTicker() {
  const [items, setItems] = useState<TickerItem[]>(FALLBACK_DATA);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchLiveData().then(setItems);
    const interval = setInterval(() => fetchLiveData().then(setItems), 60_000);
    return () => clearInterval(interval);
  }, []);

  // Duplicate for seamless loop
  const doubled = [...items, ...items];

  return (
    <div
      style={{
        overflow: 'hidden',
        borderBottom: '1px solid var(--color-border)',
        fontFamily: 'var(--font-sans)',
      }}
      aria-label="Market data ticker"
    >
      <div
        ref={trackRef}
        className="ticker-track"
        style={{
          display: 'flex',
          alignItems: 'center',
          whiteSpace: 'nowrap',
          padding: '6px 0',
          width: 'max-content',
        }}
      >
        {doubled.map((item, i) => (
          <span
            key={`${item.symbol}-${i}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '0 14px',
              fontSize: '11px',
              lineHeight: 1,
              borderRight: '1px solid var(--color-border)',
            }}
          >
            <span
              style={{
                fontWeight: 600,
                color: 'var(--color-text-primary)',
              }}
            >
              {item.symbol}
            </span>
            <span style={{ color: 'var(--color-text-secondary)' }}>
              {item.price}
            </span>
            <span
              style={{
                fontWeight: 500,
                color: item.up ? '#16A34A' : '#DC2626',
              }}
            >
              {item.change} ({item.pctChange}%)
            </span>
          </span>
        ))}
      </div>

    </div>
  );
}
