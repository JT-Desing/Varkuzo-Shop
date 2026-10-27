'use client';

import { useEffect, useState } from 'react';
import type { Product } from '@/lib/products';
import { readFavorites, writeFavorites } from '@/lib/favorites';

export function FavoriteButton({ product, compact = false }: { product: Product; compact?: boolean }) {
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    const update = () => setSaved(readFavorites().some((item) => item.slug === product.slug));
    update();
    window.addEventListener('storage', update);
    window.addEventListener('varkuzo:favorites-changed', update);
    return () => { window.removeEventListener('storage', update); window.removeEventListener('varkuzo:favorites-changed', update); };
  }, [product.slug]);
  async function toggle() {
    const items = readFavorites();
    const next = !saved;
    writeFavorites(next ? [...items.filter((item) => item.slug !== product.slug), { id: product.id, slug: product.slug, name: product.name, image: product.images[0] || '', category: product.category }] : items.filter((item) => item.slug !== product.slug));
    try {
      const response = await fetch('/api/favorites', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ slug: product.slug, saved: next }) });
      if (response.ok) window.dispatchEvent(new Event('varkuzo:favorites-changed'));
    } catch { /* Local list remains usable if WordPress is offline. */ }
  }
  return <button type="button" className={`favorite-button${saved ? ' is-saved' : ''}${compact ? ' favorite-button--compact' : ''}`} onClick={toggle} aria-pressed={saved} aria-label={saved ? `Quitar ${product.name} de favoritos` : `Guardar ${product.name} en favoritos`} title={saved ? 'Quitar de favoritos' : 'Guardar en favoritos'}>
    <svg viewBox="0 0 24 24" width="27" height="27" aria-hidden="true"><path d="M20.8 8.3c0 4.1-5.2 8.4-8.8 11.1C8.4 16.7 3.2 12.4 3.2 8.3c0-2.4 1.8-4.2 4.1-4.2 2 0 3.4 1.1 4.7 2.8 1.3-1.7 2.7-2.8 4.7-2.8 2.3 0 4.1 1.8 4.1 4.2Z" fill={saved ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" /></svg>
  </button>;
}
