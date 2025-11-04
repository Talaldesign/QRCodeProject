import type { VercelRequest, VercelResponse } from '@vercel/node';

function ccToCurrency(cc: string) {
  const map: Record<string, string> = {
    OM:'OMR', AE:'AED', SA:'SAR', KW:'KWD', QA:'QAR', BH:'BHD',
    US:'USD', GB:'GBP', EU:'EUR', MY:'MYR'
  };
  return map[cc] || 'USD';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const al = (req.headers['accept-language'] as string) || '';
    const lang = al.toLowerCase().startsWith('ar') ? 'ar' : 'en';

    const ipRaw = (req.headers['x-forwarded-for'] as string) || '';
    const ip = ipRaw.split(',')[0]?.trim() || '';

    const key = process.env.IPDATA_API_KEY; // إن وضعته في Vercel، سيُستخدم
    if (key) {
      const r1 = await fetch(`https://api.ipdata.co/${ip}?api-key=${key}`, { cache: 'no-store' });
      if (r1.ok) {
        const g = await r1.json();
        const country = String(g?.country_code || 'OM').toUpperCase();
        const currency = ccToCurrency(country);
        const timezone = g?.time_zone?.name || 'Asia/Muscat';
        return res.status(200).json({ lang, country, currency, timezone, source: 'ipdata' });
      }
    }

    // Fallback مجاني
    const r2 = await fetch(`https://ipapi.co/${ip}/json/`, { cache: 'no-store' });
    const g2 = await r2.json();
    const country = String(g2?.country || 'OM').toUpperCase();
    const currency = ccToCurrency(country);
    const timezone = g2?.timezone || 'Asia/Muscat';
    return res.status(200).json({ lang, country, currency, timezone, source: 'ipapi' });

  } catch {
    return res.status(200).json({ lang: 'ar', country: 'OM', currency: 'OMR', timezone: 'Asia/Muscat', source: 'fallback' });
  }
}
