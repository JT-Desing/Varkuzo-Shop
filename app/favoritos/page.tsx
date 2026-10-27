import type { Metadata } from 'next';
import { FavoritesList } from '@/components/favorites-list';

export const metadata: Metadata = {
  title: 'Mis favoritos | Varkuzo',
  description: 'Revisa las prendas Varkuzo que guardaste para volver a mirar en este navegador.',
  robots: { index: false, follow: false },
};

export default function FavoritesPage() {
  return <main className="favorites-page"><p className="eyebrow red">VARKUZO / TU SELECCIÓN</p><h1>FAVORITOS.</h1><p>Las piezas que te hicieron volver a mirar, juntas en un lugar. Se guardan solo en este navegador.</p><FavoritesList /></main>;
}
