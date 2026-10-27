'use client';

import { useEffect, useMemo, useState } from 'react';
import type { Product } from '@/lib/products';
import { ProductCard } from './product-card';

const categories = ['Todo', 'Buzos', 'Camisetas', 'Pantalones', 'Accesorios'];

export function ShopClient({ products, initialCategory }: { products: Product[]; initialCategory: string }) {
  const [category, setCategory] = useState(categories.includes(initialCategory) ? initialCategory : 'Todo');
  const [query, setQuery] = useState('');
  useEffect(() => {
    const syncCategory = () => {
      const fromUrl = new URLSearchParams(window.location.search).get('categoria') || 'Todo';
      setCategory(categories.includes(fromUrl) ? fromUrl : 'Todo');
    };
    syncCategory();
    window.addEventListener('popstate', syncCategory);
    return () => window.removeEventListener('popstate', syncCategory);
  }, [initialCategory]);
  const filtered = useMemo(() => products.filter((product) => (category === 'Todo' || product.category === category) && product.name.toLocaleLowerCase('es').includes(query.toLocaleLowerCase('es'))), [products, category, query]);
  const multiColor = filtered.filter((product) => (product.colorVariants?.length ?? 0) >= 2);
  const singleColor = filtered.filter((product) => (product.colorVariants?.length ?? 0) < 2);
  function selectCategory(value: string) {
    setCategory(value);
    const url = value === 'Todo' ? '/shop' : `/shop?categoria=${encodeURIComponent(value)}`;
    window.history.replaceState(null, '', url);
  }
  return <section className="shop-content section"><div className="shop-toolbar"><div className="filter-tabs" role="group" aria-label="Filtrar por categoría">{categories.map((item) => <button type="button" key={item} className={item === category ? 'active' : ''} onClick={() => selectCategory(item)}>{item}</button>)}</div><label className="shop-search"><span className="sr-only">Buscar productos</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar una pieza" /><span>⌕</span></label></div><div className="shop-count"><span>{filtered.length} {filtered.length === 1 ? 'PIEZA' : 'PIEZAS'}</span><span>{products[0]?.demo ? 'CATÁLOGO DE DEMOSTRACIÓN' : 'CATÁLOGO DISPONIBLE'}</span></div>{filtered.length ? <div key={`${category}-${query}`}>
    {multiColor.length > 0 && <div className="shop-variant-row"><h2>VARIOS <span>COLORES</span></h2><div className="product-grid shop-grid">{multiColor.map((product, i) => <ProductCard key={product.id} product={product} index={i} />)}</div></div>}
    {singleColor.length > 0 && <div className="shop-variant-row"><h2>COLOR <span>ÚNICO</span></h2><div className="product-grid shop-grid">{singleColor.map((product, i) => <ProductCard key={product.id} product={product} index={i} />)}</div></div>}
  </div> : <div className="empty-state"><h2>AÚN NO HAY PIEZAS AQUÍ.</h2><p>Prueba otra categoría o búsqueda.</p><button type="button" className="text-link" onClick={() => { setCategory('Todo'); setQuery(''); window.history.replaceState(null, '', '/shop'); }}>VER TODO ↗</button></div>}</section>;
}
