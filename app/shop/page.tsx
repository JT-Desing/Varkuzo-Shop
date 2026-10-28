import type { Metadata } from 'next';
import { getProducts } from '@/lib/products';
import { ShopClient } from '@/components/shop-client';
import { LiquidLogo } from '@/components/liquid-logo';
import './shop-hero.css';

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
  return <main className="shop-page"><ShopClient products={products} initialCategory={params.categoria || 'Todo'} /><div className="shop-end-banner reveal"><span>DE ESTA CUADRA PA’ DONDE SEA</span><LiquidLogo className="shop-end-logo" label="Varkuzo, volver al inicio" /><span>MEDELLÍN / COLOMBIA</span></div></main>;
}
