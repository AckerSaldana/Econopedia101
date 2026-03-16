export const prerender = false;

let cache: { data: unknown; ts: number } | null = null;
const TTL = 60_000; // 60 seconds

export async function GET() {
  if (cache && Date.now() - cache.ts < TTL) {
    return Response.json(cache.data);
  }

  try {
    const res = await fetch(
      'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana,ripple&vs_currencies=usd&include_24hr_change=true',
      { headers: { Accept: 'application/json' } },
    );

    if (!res.ok) {
      if (cache) return Response.json(cache.data);
      return Response.json({ error: 'upstream error' }, { status: 502 });
    }

    const data = await res.json();
    cache = { data, ts: Date.now() };
    return Response.json(data);
  } catch {
    if (cache) return Response.json(cache.data);
    return Response.json({ error: 'fetch failed' }, { status: 502 });
  }
}
