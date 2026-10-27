import { getProducts } from '@/lib/products';
import { ShopClient } from '@/components/shop-client';

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const products = await getProducts();
  const params = await searchParams;
  return <main className="shop-page"><div className="shop-hero"><div><p className="eyebrow">VARKUZO / CATÁLOGO</p><h1>ENCUENTRA<br /><em>TU PIEZA.</em></h1></div><p>De lo esencial a lo inesperado. Cada prenda tiene su propia voz.</p><span className="shop-hero-index">001 — 003</span></div><ShopClient products={products} initialCategory={params.categoria || 'Todo'} /><div className="shop-end-banner reveal"><span>LA CALLE ES EL INICIO</span><strong>VARKUZO</strong><span>MEDELLÍN / COLOMBIA</span></div></main>;
}
