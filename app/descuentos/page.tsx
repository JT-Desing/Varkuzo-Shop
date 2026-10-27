import type { Metadata } from 'next';
import { getSaleProducts } from '@/lib/sale-products';
import { RotatingDiscountRing } from '@/components/rotating-discount-ring';
import { SaleCatalog } from '@/components/sale-catalog';
import './sale.css';

export const metadata: Metadata = {
  title: 'Descuentos | Varkuzo',
  description: 'Explora prendas Varkuzo con descuentos vigentes y precios reales del catálogo.',
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
  const percentages = [...new Set(products.map((product) => product.discountPercent))].sort((a, b) => b - a).slice(0, 3);
  const words = percentages.length ? ['DESCUENTOS', ...percentages.map((percent) => `${percent}% DESCUENTO`), 'VARKUZO'] : ['DESCUENTOS', 'PRECIO REAL', 'VARKUZO'];
  return <main className="sale-page">
    <section className="sale-hero" aria-labelledby="sale-title">
      <div className="sale-hero-copy"><p className="sale-kicker">VARKUZO / MEDELLÍN</p><h1 id="sale-title">DESCUEN<br /><em>TOS.</em></h1><p>BUENAS PIEZAS. PRECIOS QUE SE MUEVEN CONTIGO.</p><a className="sale-cta" href="#prendas-en-descuento">EXPLORAR DESCUENTOS <span aria-hidden="true">↘</span></a><span className="sale-hero-index">EDICIÓN / PRECIOS REALES</span></div>
      <RotatingDiscountRing words={words} image={image} imageAlt="Modelo con ropa urbana Varkuzo" />
      <span className="sale-hero-side" aria-hidden="true">LA CALLE TAMBIÉN TIENE PORTE · VARKUZO</span>
    </section>
    <SaleCatalog products={products} />
  </main>;
}
