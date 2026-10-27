export const FAVORITES_KEY = 'varkuzo:favorites:v1';

export type Favorite = { id: string; slug: string; name: string; image: string; category: string };

export function readFavorites(): Favorite[] {
  if (typeof window === 'undefined') return [];
  try {
    const value = JSON.parse(window.localStorage.getItem(FAVORITES_KEY) || '[]');
    return Array.isArray(value) ? value.filter((item): item is Favorite => Boolean(item && typeof item.slug === 'string' && typeof item.name === 'string')) : [];
  } catch { return []; }
}

export function writeFavorites(items: Favorite[]) {
  window.localStorage.setItem(FAVORITES_KEY, JSON.stringify(items));
  window.dispatchEvent(new Event('varkuzo:favorites-changed'));
}
