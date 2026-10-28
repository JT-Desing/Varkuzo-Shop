'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import './mobile-dock.css';

type IconName = 'search' | 'heart' | 'user' | 'menu' | 'close';

function Icon({ name }: { name: IconName }) {
  const paths: Record<IconName, React.ReactNode> = {
    search: <><circle cx="10.8" cy="10.8" r="6.8" /><path d="m16 16 4.5 4.5" /></>,
    heart: <path d="M20.2 8.4c0 4.4-8.2 10.6-8.2 10.6S3.8 12.8 3.8 8.4a4.5 4.5 0 0 1 8.2-2.5 4.5 4.5 0 0 1 8.2 2.5Z" />,
    user: <><circle cx="12" cy="7" r="3.5" /><path d="M4.5 21v-2.5a7.5 7.5 0 0 1 15 0V21" /></>,
    menu: <><path d="M4 6h16M4 12h16M4 18h16" /></>,
    close: <path d="M5 5 19 19M19 5 5 19" />,
  };
  return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export function MobileDock() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const [atFooter, setAtFooter] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(false);
    let frame = 0;
    const update = () => {
      frame = 0;
      const first = document.querySelector('main')?.firstElementChild;
      // Keep the floating navigation off the first banner, then reveal it
      // once that banner has left the top navigation area.
      setVisible(first ? first.getBoundingClientRect().bottom <= 80 : window.scrollY > 180);
      const footer = document.querySelector('footer');
      setAtFooter(Boolean(footer && footer.getBoundingClientRect().top < window.innerHeight - 80));
    };
    const schedule = () => { if (!frame) frame = window.requestAnimationFrame(update); };
    update();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    const lateCheck = window.setTimeout(update, 350);
    return () => {
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      window.clearTimeout(lateCheck);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [pathname]);

  useEffect(() => {
    if (!visible) setOpen(false);
  }, [visible]);

  useEffect(() => {
    const close = (event: KeyboardEvent) => { if (event.key === 'Escape') setOpen(false); };
    window.addEventListener('keydown', close);
    return () => window.removeEventListener('keydown', close);
  }, []);

  return <div className={`mobile-dock ${visible ? 'mobile-dock--visible' : ''} ${atFooter ? 'mobile-dock--footer' : ''}`} aria-hidden={!visible}>
    {open && <nav className="mobile-dock-panel" aria-label="Menú móvil rápido">
      <Link href="/shop" onClick={() => setOpen(false)}>Todo el catálogo</Link>
      <Link href="/shop?categoria=Buzos" onClick={() => setOpen(false)}>Buzos</Link>
      <Link href="/shop?categoria=Camisetas" onClick={() => setOpen(false)}>Camisetas</Link>
      <Link href="/shop?categoria=Pantalones" onClick={() => setOpen(false)}>Pantalones</Link>
      <Link href="/descuentos" onClick={() => setOpen(false)}>Descuentos</Link>
      <Link href="/nosotros" onClick={() => setOpen(false)}>La marca</Link>
    </nav>}
    <div className="mobile-dock-bar">
      {!atFooter && <>
        <Link href="/shop" aria-label="Buscar productos" tabIndex={visible ? 0 : -1}><Icon name="search" /></Link>
        <Link href="/favoritos" aria-label="Mis favoritos" tabIndex={visible ? 0 : -1}><Icon name="heart" /></Link>
        <Link href="/cuenta" aria-label="Mi cuenta" tabIndex={visible ? 0 : -1}><Icon name="user" /></Link>
      </>}
      <button type="button" aria-label={open ? 'Cerrar menú rápido' : 'Abrir menú rápido'} aria-expanded={open} tabIndex={visible ? 0 : -1} onClick={() => setOpen(!open)}><Icon name={open ? 'close' : 'menu'} /></button>
    </div>
  </div>;
}
