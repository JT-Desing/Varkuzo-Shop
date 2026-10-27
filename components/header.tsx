'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { LiquidLogo } from '@/components/liquid-logo';

const links = [
  { href: '/shop', label: 'Todo' },
  { href: '/shop?categoria=Buzos', label: 'Buzos' },
  { href: '/shop?categoria=Camisetas', label: 'Camisetas' },
  { href: '/shop?categoria=Pantalones', label: 'Pantalones' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  return <header className={`site-header ${pathname === '/' ? 'site-header--home' : ''}`}>
    <LiquidLogo onClick={() => setOpen(false)} />
    <nav className={`main-nav ${open ? 'main-nav--open' : ''}`} aria-label="Navegación principal">
      {links.map((link) => <Link key={link.label} href={link.href} onClick={() => setOpen(false)}>{link.label}</Link>)}
      <a href="#historia" onClick={() => setOpen(false)}>La marca</a>
    </nav>
    <div className="header-actions"><Link href="/shop" aria-label="Explorar catálogo" className="search-link">⌕ <span>Buscar</span></Link><span className="header-dot" aria-hidden="true" /><button className="menu-button" type="button" aria-label={open ? 'Cerrar menú' : 'Abrir menú'} aria-expanded={open} onClick={() => setOpen(!open)}>{open ? 'Cerrar' : 'Menú'} <span>{open ? '×' : '+'}</span></button></div>
  </header>;
}
