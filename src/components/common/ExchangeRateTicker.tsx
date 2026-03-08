const TICKER_DATA = [
  { symbol: 'BTC', name: 'Bitcoin', price: '67,432.18', change: '+2.34', up: true },
  { symbol: 'ETH', name: 'Ethereum', price: '3,521.45', change: '+1.12', up: true },
  { symbol: 'S&P 500', name: 'S&P 500', price: '5,234.18', change: '-0.28', up: false },
  { symbol: 'FTSE 100', name: 'FTSE 100', price: '8,164.90', change: '+0.45', up: true },
  { symbol: 'GOLD', name: 'Gold', price: '2,342.50', change: '+0.67', up: true },
  { symbol: 'EUR/USD', name: 'EUR/USD', price: '1.0847', change: '-0.15', up: false },
  { symbol: 'GBP/USD', name: 'GBP/USD', price: '1.2634', change: '+0.08', up: true },
  { symbol: 'USD/JPY', name: 'USD/JPY', price: '154.32', change: '+0.42', up: true },
];

export default function ExchangeRateTicker() {
  // Duplicate items for seamless infinite scroll
  const items = [...TICKER_DATA, ...TICKER_DATA];

  return (
    <div
      className="overflow-hidden py-1.5 text-xs"
      style={{
        backgroundColor: 'var(--color-secondary)',
        fontFamily: 'var(--font-mono)',
      }}
      aria-label="Market data ticker"
    >
      <div className="ticker-track flex items-center gap-8 whitespace-nowrap">
        {items.map((item, i) => (
          <span key={`${item.symbol}-${i}`} className="flex items-center gap-2">
            <span className="font-semibold text-white">{item.symbol}</span>
            <span className="text-neutral-400">{item.price}</span>
            <span
              className="font-medium"
              style={{ color: item.up ? '#4ADE80' : '#F87171' }}
            >
              {item.up ? '\u25B2' : '\u25BC'} {item.change}%
            </span>
          </span>
        ))}
      </div>

      <style>{`
        @keyframes ticker-scroll {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .ticker-track {
          animation: ticker-scroll 30s linear infinite;
          width: max-content;
        }

        .ticker-track:hover {
          animation-play-state: paused;
        }

        @media (prefers-reduced-motion: reduce) {
          .ticker-track {
            animation: none;
            overflow-x: auto;
          }
        }
      `}</style>
    </div>
  );
}
