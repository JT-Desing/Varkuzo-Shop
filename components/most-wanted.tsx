'use client';

import { useEffect, useState } from 'react';
import type { Product } from '@/lib/products';
import { ProductCard } from '@/components/product-card';

export function MostWanted({ products }: { products: Product[] }) {
  const [counts, setCounts] = useState<Record<string, number> | null>(null);
  useEffect(() => {
    let active = true;
    const update = async () => {
      try {
        const response = await fetch(`/api/favorites?slugs=${encodeURIComponent(products.map((product) => product.slug).join(','))}`, { cache: 'no-store' });
        if (!response.ok) return;
        const data = await response.json();
        if (active) setCounts(data.counts || {});
      } catch { /* Never invent a ranking when counts are unavailable. */ }
    };
    update();
    window.addEventListener('varkuzo:favorites-changed', update);
    return () => { active = false; window.removeEventListener('varkuzo:favorites-changed', update); };
  }, [products]);
  const ranked = counts ? products.filter((product) => counts[product.slug] > 0).sort((a, b) => counts[b.slug] - counts[a.slug]).slice(0, 4) : [];
  return <section className="most-wanted section" aria-labelledby="most-wanted-title"><div className="most-wanted-heading"><p className="eyebrow red">VARKUZO / EL BARRIO ELIGE</p><h2 id="most-wanted-title">LOS MÁS<br /><em>A GOGÓ.</em></h2><p>Los más deseados por el barrio.</p></div>{ranked.length ? <div className="product-grid collection-products">{ranked.map((product, index) => <div key={product.slug} className="most-wanted-item"><ProductCard product={product} index={index} /><small>♥ {new Intl.NumberFormat('es-CO').format(counts![product.slug])} {counts![product.slug] === 1 ? 'guardado' : 'guardados'}</small></div>)}</div> : <p className="most-wanted-empty">Cuando el barrio empiece a guardar sus favoritas, las verás aquí.</p>}</section>;
}
