import type { Metadata } from 'next';
import { getSaleProducts } from '@/lib/sale-products';
import { RotatingDiscountRing } from '@/components/rotating-discount-ring';
import { SaleCatalog } from '@/components/sale-catalog';
import { ScrollBurn } from '@/components/scroll-burn';
import '../scroll-burn.css';
import './sale.css';

export const metadata: Metadata = {
  title: 'Descuentos en ropa urbana | Varkuzo Medellín',
  description: 'Consulta las prendas Varkuzo que tengan descuento activo. Filtra por categoría, talla y precio; las rebajas aparecen cuando estén disponibles en la tienda.',
};

async function getHeroImage() {
  const wordpress = process.env.WC_STORE_API_URL?.replace(/\/wp-json\/wc\/store\/v1\/?$/, '');
  if (!wordpress) return '/images/descuentos-modelo.png';
  try {
    const pageResponse = await fetch(`${wordpress}/wp-json/wp/v2/pages?slug=descuentos&_fields=featured_media`, { next: { revalidate: 60 } });
    if (!pageResponse.ok) return '/images/descuentos-modelo.png';
    const pages = await pageResponse.json() as { featured_media: number }[];
    if (!pages[0]?.featured_media) return '/images/descuentos-modelo.png';
    return `/api/descuentos-modelo?id=${pages[0].featured_media}`;
  } catch {
    return '/images/descuentos-modelo.png';
  }
}

export default async function DiscountsPage() {
  const [products, image] = await Promise.all([getSaleProducts(), getHeroImage()]);
  const words = ['VARKUZO •', 'DESCUENTOS •', 'SALE •'];
  return <main className="sale-page">
    <section className="sale-hero" aria-labelledby="sale-title">
      <div className="sale-hero-copy"><p className="sale-kicker">VARKUZO / MEDELLÍN</p><h1 id="sale-title">DESCUENTOS<span>.</span></h1><p>Cuando una pieza baje de precio, la vas a encontrar aquí.</p><a className="sale-cta" href="#prendas-en-descuento">EXPLORAR DESCUENTOS <span aria-hidden="true">↘</span></a><span className="sale-hero-index">REBAJAS ACTIVAS / SIN PRECIOS INVENTADOS</span></div>
      <RotatingDiscountRing words={words} image={image} imageAlt="Modelo con ropa urbana Varkuzo" />
      <span className="sale-hero-side" aria-hidden="true">LA CALLE TAMBIÉN TIENE PORTE · VARKUZO</span>
      <ScrollBurn color="#f3f0ea" start={0.12} end={0.82} blobSize={66} seed={31} />
    </section>
    <SaleCatalog products={products} />
  </main>;
}
