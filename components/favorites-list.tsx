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
  if (items === null) return <p>Cargando favoritos…</p>;
  if (!items.length) return <div className="favorites-empty"><p>Todavía no has guardado ninguna pieza.</p><Link className="button button-solid" href="/shop">EXPLORAR CATÁLOGO <span>↗</span></Link></div>;
  return <div className="favorites-grid">{items.map((item) => <article key={item.slug} className="favorites-item"><Link href={`/producto/${item.slug}`}><img src={item.image} alt={item.name} /><small>{item.category.toUpperCase()}</small><h2>{item.name}</h2></Link><button type="button" onClick={() => writeFavorites(readFavorites().filter((entry) => entry.slug !== item.slug))}>QUITAR DE FAVORITOS ×</button></article>)}</div>;
}
