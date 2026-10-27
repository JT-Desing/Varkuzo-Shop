'use client';

import { useEffect, useState } from 'react';

export function FavoriteCount({ slug }: { slug: string }) {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    let active = true;
    const update = async () => {
      try {
        const response = await fetch(`/api/favorites?slugs=${encodeURIComponent(slug)}`, { cache: 'no-store' });
        if (!response.ok) return;
        const data = await response.json();
        if (active) setCount(Number(data.counts?.[slug] || 0));
      } catch { /* Keep count hidden if the service is unavailable. */ }
    };
    update();
    window.addEventListener('varkuzo:favorites-changed', update);
    return () => { active = false; window.removeEventListener('varkuzo:favorites-changed', update); };
  }, [slug]);
  return count && count > 0 ? <p className="favorite-count">♥ {new Intl.NumberFormat('es-CO').format(count)} {count === 1 ? 'guardado' : 'guardados'}</p> : null;
}
