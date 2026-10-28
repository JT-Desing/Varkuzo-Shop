import { NextResponse } from 'next/server';

const endpoint = 'http://wordpress/wp-json/varkuzo/v1/newsletter';

export async function POST(request: Request) {
  const key = process.env.VARKUZO_NEWSLETTER_KEY;
  if (!key) return NextResponse.json({ error: 'El registro todavía no está disponible.' }, { status: 503 });
  let body: { email?: unknown; consent?: unknown; source?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 400 }); }
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : '';
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || body.consent !== true || !['entry', 'cart'].includes(String(body.source))) {
    return NextResponse.json({ error: 'Revisa tu correo y marca la autorización.' }, { status: 400 });
  }
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || '';
  const clientIp = /^[\da-f:.]{3,45}$/i.test(forwarded) ? forwarded : 'unknown';
  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-varkuzo-internal-key': key, 'x-varkuzo-client-ip': clientIp },
      body: JSON.stringify({ email, consent: true, source: body.source }),
      cache: 'no-store',
    });
    const result = await response.json();
    if (!response.ok) return NextResponse.json({ error: result?.message || 'No pudimos guardar tu correo.' }, { status: response.status });
    return NextResponse.json({ subscribed: true, discountPercent: 10 }, { headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return NextResponse.json({ error: 'El registro no está disponible en este momento.' }, { status: 503 });
  }
}
