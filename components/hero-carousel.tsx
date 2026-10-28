'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const slides = [
  {
    image: '/images/campaign-seated-v3.png',
    alt: 'Modelo Varkuzo sentado en arquitectura urbana, mirando de frente',
    title: 'HECHO PARA DESTACAR',
    titleArt: '/images/hecho-para-destacar.png',
    description: 'Del barrio de Medellín a tu forma de vestir.',
  },
  {
    image: '/images/campaign-hero.png',
    alt: 'Editorial urbana Varkuzo con dos modelos',
    title: 'DE AQUÍ PA’ DONDE SEA',
    titleArt: '/images/de-aqui-pa-donde-sea.png',
    description: 'De esta cuadra salen ideas para ir más lejos.',
  },
];

export function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [scrollPaused, setScrollPaused] = useState(false);
  const [fontReady, setFontReady] = useState(false);

  useEffect(() => {
    let mounted = true;
    document.fonts.load('360px "Varkuzo Brocha"', slides[0].title).then(() => {
      if (mounted && document.fonts.check('360px "Varkuzo Brocha"', slides[0].title)) setFontReady(true);
    });
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const update = () => setScrollPaused(window.scrollY > 30);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  useEffect(() => {
    if (paused || scrollPaused) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 6000);
    return () => window.clearInterval(timer);
  }, [paused, scrollPaused]);

  return (
    <section className="hero hero-carousel" aria-roledescription="carrusel" aria-label="Campañas Varkuzo" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}>
      {slides.map((slide, index) => (
        <div key={slide.title} className={`hero-slide ${active === index ? 'hero-slide--active' : ''}`} aria-hidden={active !== index}>
          <img className="hero-image" src={slide.image} alt={slide.alt} />
          <div className="hero-shade" />
          <div className="hero-meta"><span>MEDELLÍN<br />COLOMBIA</span></div>
          <div className="hero-content">
            <p className="eyebrow">MEDELLÍN / COLOMBIA</p>
            {active === index
              ? <h1 className={`hero-title-logo-font hero-title-logo-font--${index} ${fontReady ? '' : 'hero-title-logo-font--loading'}`}><span className={fontReady ? '' : 'sr-only'}>{slide.title}</span>{!fontReady && <img src={slide.titleArt} alt="" aria-hidden="true" />}</h1>
              : <h2 className={`hero-title-logo-font hero-title-logo-font--${index} ${fontReady ? '' : 'hero-title-logo-font--loading'}`}><span className={fontReady ? '' : 'sr-only'}>{slide.title}</span>{!fontReady && <img src={slide.titleArt} alt="" aria-hidden="true" />}</h2>}
            <p>{slide.description}</p>
            <Link href="/shop" className="button button-outline" tabIndex={active === index ? 0 : -1}>EXPLORAR COLECCIÓN <span>→</span></Link>
          </div>
        </div>
      ))}
      <div className="hero-carousel-controls" aria-label="Controles del carrusel">
        {slides.map((slide, index) => <button type="button" key={slide.title} onClick={() => setActive(index)} className={active === index ? 'active' : ''} aria-label={`Mostrar banner ${index + 1}: ${slide.title}`} aria-pressed={active === index}>{String(index + 1).padStart(2, '0')}</button>)}
      </div>
      <div className="hero-carousel-progress" key={active + '-' + paused} style={{ animationPlayState: paused ? 'paused' : 'running' }} />
    </section>
  );
}
