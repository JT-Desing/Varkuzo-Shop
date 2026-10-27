import Link from 'next/link';
import type { Product } from '@/lib/products';

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  return <Link href={`/producto/${product.slug}`} className="product-card reveal" style={{ transitionDelay: `${Math.min(index % 4, 3) * 80}ms` }}>
    <div className="product-card-image"><img src={product.images[0] || '/images/campaign-hero.png'} alt={product.name} loading="lazy" /><span className="product-card-arrow" aria-hidden="true">↗</span>{product.demo && <span className="product-badge">CONCEPTO</span>}</div>
    <div className="product-card-info"><div><small>{product.category.toUpperCase()}</small><h3>{product.name}</h3></div><span>{product.price || 'Próximamente'}</span></div>
  </Link>;
}
