import { FavoritesList } from '@/components/favorites-list';

export default function FavoritesPage() {
  return <main className="favorites-page"><p className="eyebrow red">VARKUZO / TU SELECCIÓN</p><h1>FAVORITOS.</h1><p>Guarda las piezas que quieres volver a mirar. Esta lista permanece en este navegador.</p><FavoritesList /></main>;
}
