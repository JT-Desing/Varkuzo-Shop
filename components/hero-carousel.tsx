'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const slides = [
  {
    image: '/images/campaign-seated-v3.png',
    alt: 'Modelo Varkuzo sentado en arquitectura urbana, mirando de frente',
    title: 'HECHO PARA DESTACAR',
    artwork: '/images/hecho-para-destacar.png',
    description: 'Ropa que habla más fuerte que el ruido.',
  },
  {
    image: '/images/campaign-hero.png',
    alt: 'Editorial urbana Varkuzo con dos modelos',
    title: 'DE AQUÍ PA’ DONDE SEA',
    artwork: null,
    description: 'Desde Medellín. Con toda la calle por delante.',
  },
];

export function HeroCarousel() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 6000);
    return () => window.clearInterval(timer);
  }, [paused]);

  return (
    <section className="hero hero-carousel" aria-roledescription="carrusel" aria-label="Campañas Varkuzo" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}>
      {slides.map((slide, index) => (
        <div key={slide.title} className={`hero-slide ${active === index ? 'hero-slide--active' : ''}`} aria-hidden={active !== index}>
          <img className="hero-image" src={slide.image} alt={slide.alt} />
          <div className="hero-shade" />
          <div className="hero-meta"><span>MEDELLÍN<br />COLOMBIA</span></div>
          <div className="hero-content">
            <p className="eyebrow">MEDELLÍN / COLOMBIA</p>
            <h1 className="sr-only">{slide.title}</h1>
            {slide.artwork ? <img className="hero-title-art" src={slide.artwork} alt="" /> : <div className="hero-title-second" aria-hidden="true">DE AQUÍ<br />PA’ DONDE<br /><span>SEA.</span></div>}
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
