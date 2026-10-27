import type { Metadata } from 'next';
import { getProducts } from '@/lib/products';
import { ShopClient } from '@/components/shop-client';

const categories = ['Buzos', 'Camisetas', 'Pantalones', 'Accesorios'];

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ categoria?: string }> }): Promise<Metadata> {
  const { categoria } = await searchParams;
  const category = categories.includes(categoria || '') ? categoria : null;
  return {
    title: category ? `${category} urbanos | Varkuzo Medellín` : 'Catálogo de ropa urbana | Varkuzo Medellín',
    description: category
      ? `Explora ${category?.toLowerCase()} de estilo urbano en Varkuzo, marca nacida en Medellín. Mira los diseños, colores y detalles de cada prenda.`
      : 'Explora buzos, camisetas, pantalones y accesorios de Varkuzo. Ropa urbana inspirada en el barrio de Medellín; conoce las piezas de la marca.',
  };
}

export default async function ShopPage({ searchParams }: { searchParams: Promise<{ categoria?: string }> }) {
  const products = await getProducts();
  const params = await searchParams;
  return <main className="shop-page"><div className="shop-hero"><div><p className="eyebrow">VARKUZO / CATÁLOGO</p><h1>ENCUENTRA<br /><em>TU PIEZA.</em></h1></div><p>Buzos, camisetas y pantalones para llevar el barrio a tu manera. Mira los detalles y elige la pieza que va con vos.</p><span className="shop-hero-index">001 — 003</span></div><ShopClient products={products} initialCategory={params.categoria || 'Todo'} /><div className="shop-end-banner reveal"><span>DE ESTA CUADRA PA’ DONDE SEA</span><strong>VARKUZO</strong><span>MEDELLÍN / COLOMBIA</span></div></main>;
}
