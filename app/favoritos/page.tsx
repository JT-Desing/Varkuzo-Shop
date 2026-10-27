import type { Metadata } from 'next';
import { FavoritesList } from '@/components/favorites-list';
import './favorites.css';

export const metadata: Metadata = {
  title: 'Mis favoritos | Varkuzo',
  description: 'Revisa las prendas Varkuzo que guardaste para volver a mirar en este navegador.',
  robots: { index: false, follow: false },
};

export default function FavoritesPage() {
  return <main className="favorites-page"><div className="favorites-hero"><p className="eyebrow red">VARKUZO / TU SELECCIÓN</p><h1>MIS<br />FAVORITOS.</h1><p>Las piezas que te hicieron volver a mirar, juntas en un lugar. Se guardan en este navegador.</p></div><FavoritesList /></main>;
}
