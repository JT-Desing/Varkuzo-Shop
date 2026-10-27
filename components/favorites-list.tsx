'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { readFavorites, writeFavorites } from '@/lib/favorites';
import type { Favorite } from '@/lib/favorites';

export function FavoritesList() {
  const [items, setItems] = useState<Favorite[] | null>(null);
  useEffect(() => {
    const update = () => setItems(readFavorites());
    update();
    window.addEventListener('storage', update);
    window.addEventListener('varkuzo:favorites-changed', update);
    return () => { window.removeEventListener('storage', update); window.removeEventListener('varkuzo:favorites-changed', update); };
  }, []);
  async function remove(slug: string) {
    writeFavorites(readFavorites().filter((item) => item.slug !== slug));
    try { await fetch('/api/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug, saved: false }) }); } catch { /* Keep the local list usable offline. */ }
  }
  if (items === null) return <p className="favorites-loading">Cargando tus piezas…</p>;
  if (!items.length) return <div className="favorites-empty"><span aria-hidden="true">♡</span><h2>POR AQUÍ TODAVÍA NO HAY NINGUNA.</h2><p>Explora el catálogo y toca el corazón de una prenda para guardarla aquí.</p><Link className="button button-solid" href="/shop">EXPLORAR CATÁLOGO <span>↗</span></Link></div>;
  return <><p className="favorites-total">{items.length} {items.length === 1 ? 'PIEZA GUARDADA' : 'PIEZAS GUARDADAS'}</p><div className="favorites-grid">{items.map((item) => <article key={item.slug} className="favorites-item"><Link href={`/producto/${item.slug}`} className="favorites-item-link"><div className="favorites-item-image"><img src={item.image} alt={item.name} /><span>VER PRENDA ↗</span></div><small>{item.category.toUpperCase()}</small><h2>{item.name}</h2></Link><button type="button" onClick={() => remove(item.slug)} aria-label={`Quitar ${item.name} de favoritos`}>QUITAR DE FAVORITOS ×</button></article>)}</div></>;
}
