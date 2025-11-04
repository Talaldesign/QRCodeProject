import type { VercelRequest, VercelResponse } from '@vercel/node';

async function getAvgPrice(country: string, cat: string) {
  const map: any = { OM: { main: 2.800, drink: 1.000, dessert: 1.500, side: 0.800 } };
  return map[country]?.[cat] ?? 2.500;
}

// Placeholder AI → استبدله لاحقًا بـ OpenAI
async function generateCopy({ hint, lang }: { hint?: string; lang: 'ar' | 'en' }) {
  const title = lang === 'ar' ? 'طبق مقترح' : 'Suggested Dish';
  const description = lang === 'ar'
    ? 'وصف جذاب موجز يعتمد على نوع الطبق.'
    : 'A concise, appealing description based on the dish.';
  return { title, description };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method Not Allowed' });
  const body = typeof req.body === 'string' ? JSON.parse(req.body) : (req.body || {});
  const { country_code = 'OM', category = 'main', base_lang = 'ar', hint } = body;

  const avg = await getAvgPrice(country_code, category);
  const { title, description } = await generateCopy({ hint, lang: base_lang });
  res.status(200).json({ suggested_price: +avg.toFixed(3), title, description });
}
