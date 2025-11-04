import type { VercelRequest, VercelResponse } from '@vercel/node';

let cache: { at: number; data: any } | null = null;

export default async function handler(_req: VercelRequest, res: VercelResponse) {
  try {
    const now = Date.now();
    if (!cache || (now - cache.at) > 12 * 60 * 60 * 1000) {
      const r = await fetch('https://api.exchangerate.host/latest?base=USD', { cache: 'no-store' });
      if (!r.ok) throw new Error(`FX upstream error ${r.status}`);
      const data = await r.json();
      cache = { at: now, data };
    }
    res.status(200).json(cache.data);
  } catch (e: any) {
    // Fallback آمن في حال تعطل المصدر
    res.status(200).json({ base: 'USD', rates: { OMR: 0.385, AED: 3.673 }, fallback: true, error: e?.message });
  }
}
