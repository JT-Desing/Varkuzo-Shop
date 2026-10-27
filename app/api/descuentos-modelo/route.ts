import { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id');
  const wordpress = process.env.WC_STORE_API_URL?.replace(/\/wp-json\/wc\/store\/v1\/?$/, '');
  if (!id || !/^\d+$/.test(id) || !wordpress) return new Response('Not found', { status: 404 });
  try {
    const metadata = await fetch(`${wordpress}/wp-json/wp/v2/media/${id}?_fields=source_url,mime_type`, { next: { revalidate: 60 } });
    if (!metadata.ok) return new Response('Not found', { status: 404 });
    const media = await metadata.json() as { source_url?: string; mime_type?: string };
    if (!media.source_url || !media.mime_type?.startsWith('image/')) return new Response('Not found', { status: 404 });
    const assetPath = new URL(media.source_url).pathname;
    if (!assetPath.startsWith('/wp-content/uploads/')) return new Response('Not found', { status: 404 });
    const asset = await fetch(`${wordpress}${assetPath}`, { next: { revalidate: 60 } });
    if (!asset.ok) return new Response('Not found', { status: 404 });
    return new Response(asset.body, { headers: { 'Content-Type': media.mime_type, 'Cache-Control': 'public, max-age=60' } });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
