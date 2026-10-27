'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LiquidLogo } from '@/components/liquid-logo';
import { readFavorites } from '@/lib/favorites';

const links = [
  { href: '/shop', label: 'Todo' },
  { href: '/shop?categoria=Buzos', label: 'Buzos' },
  { href: '/shop?categoria=Camisetas', label: 'Camisetas' },
  { href: '/shop?categoria=Pantalones', label: 'Pantalones' },
  { href: '/descuentos', label: 'Descuentos' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const [favoriteCount, setFavoriteCount] = useState(0);
  const pathname = usePathname();
  useEffect(() => {
    const update = () => setFavoriteCount(readFavorites().length);
    update();
    window.addEventListener('storage', update);
    window.addEventListener('varkuzo:favorites-changed', update);
    return () => { window.removeEventListener('storage', update); window.removeEventListener('varkuzo:favorites-changed', update); };
  }, []);
  return <header className={`site-header ${pathname === '/' ? 'site-header--home' : ''}`}>
    <LiquidLogo onClick={() => setOpen(false)} />
    <nav className={`main-nav ${open ? 'main-nav--open' : ''}`} aria-label="Navegación principal">
      {links.map((link) => <Link key={link.label} href={link.href} className={link.href === '/descuentos' ? 'nav-discounts' : undefined} onClick={() => setOpen(false)}>{link.label}</Link>)}
      <Link href="/nosotros" onClick={() => setOpen(false)}>La marca</Link>
    </nav>
    <div className="header-actions"><Link href="/shop" aria-label="Explorar catálogo" className="search-link">⌕ <span>Buscar</span></Link><Link href="/favoritos" className="header-favorites" aria-label={`Ver favoritos, ${favoriteCount} guardados`}>♡<span>{favoriteCount > 0 ? favoriteCount : ''}</span></Link><Link href="/cuenta" className="header-account" aria-label="Crear cuenta o administrar mi cuenta"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="12" cy="7" r="3.5"/><path d="M4.5 21v-2.5a7.5 7.5 0 0 1 15 0V21"/></svg></Link><span className="header-dot" aria-hidden="true" /><button className="menu-button" type="button" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? 'Cerrar' : 'Menú'} <span>{open ? '×' : '+'}</span></button></div>
  </header>;
}
