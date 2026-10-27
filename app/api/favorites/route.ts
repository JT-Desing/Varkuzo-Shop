import { randomUUID } from 'node:crypto';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

const endpoint = 'http://wordpress/wp-json/varkuzo/v1/favorites';
const validSlug = (value: unknown): value is string => typeof value === 'string' && /^[a-z0-9-]{1,180}$/.test(value);

export async function GET(request: Request) {
  const slugs = (new URL(request.url).searchParams.get('slugs') || '').split(',').filter(validSlug).slice(0, 50);
  if (!slugs.length) return NextResponse.json({ counts: {} });
  try {
    const response = await fetch(`${endpoint}?slugs=${encodeURIComponent(slugs.join(','))}`, { cache: 'no-store' });
    if (!response.ok) throw new Error('WordPress favorites unavailable');
    return NextResponse.json(await response.json(), { headers: { 'Cache-Control': 'no-store' } });
  } catch { return NextResponse.json({ error: 'Conteos no disponibles' }, { status: 503 }); }
}

export async function POST(request: Request) {
  const key = process.env.VARKUZO_FAVORITES_KEY;
  if (!key) return NextResponse.json({ error: 'Favoritos no configurados' }, { status: 503 });
  let body: { slug?: unknown; saved?: unknown };
  try { body = await request.json(); } catch { return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 }); }
  if (!validSlug(body.slug) || typeof body.saved !== 'boolean') return NextResponse.json({ error: 'Solicitud inválida' }, { status: 400 });
  const jar = await cookies();
  const existing = jar.get('varkuzo_visitor')?.value;
  const visitor = existing && /^[a-f0-9-]{36}$/i.test(existing) ? existing : randomUUID();
  try {
    const response = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-varkuzo-internal-key': key, 'x-varkuzo-visitor': visitor }, body: JSON.stringify(body), cache: 'no-store' });
    if (!response.ok) throw new Error('WordPress favorites update failed');
    const result = NextResponse.json(await response.json(), { headers: { 'Cache-Control': 'no-store' } });
    if (!existing) result.cookies.set('varkuzo_visitor', visitor, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 365 });
    return result;
  } catch { return NextResponse.json({ error: 'No se pudo registrar el favorito' }, { status: 503 }); }
}
