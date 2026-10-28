'use client';

import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';

type Slide = { image: string; alt: string; eyebrow: string; title: string; copy: string; location: string };

const campaigns: Record<string, Slide[]> = {
  Buzos: [
    { image: '/images/shop-buzos-01.webp', alt: 'Modelo con buzo negro gráfico bajo una estructura de concreto en Medellín', eyebrow: 'BUZOS / 01', title: '¡DEL BARRIO PERO CON ROPA CHIMBA!', copy: 'Buzos amplios para llevar el barrio con orgullo y a tu manera.', location: 'CONCRETO / MEDELLÍN' },
    { image: '/images/shop-buzos-02.webp', alt: 'Modelo con buzo gris lavado en una calle de Medellín de noche', eyebrow: 'BUZOS / 02', title: 'DE LA CUADRA A LA NOCHE.', copy: 'La misma actitud cuando cae el sol y la ciudad sigue despierta.', location: 'LA NOCHE / MEDELLÍN' },
  ],
  Camisetas: [
    { image: '/images/shop-camisetas-01.webp', alt: 'Modelo con camiseta amplia marfil sentado en una escalera urbana', eyebrow: 'CAMISETAS / 01', title: 'LA CUADRA TIENE ESTILO.', copy: 'Camisetas amplias para salir como sos, sin tanta vuelta.', location: 'LA LOMA / MEDELLÍN' },
    { image: '/images/shop-camisetas-02.webp', alt: 'Modelo con camiseta amplia negra frente a un taller de Medellín', eyebrow: 'CAMISETAS / 02', title: 'PONETE LO QUE TE NAZCA.', copy: 'Gráficas con carácter para hacer tuya cada pinta.', location: 'EL TALLER / MEDELLÍN' },
  ],
  Pantalones: [
    { image: '/images/shop-pantalones-01.webp', alt: 'Modelo caminando con jeans amplios azules sobre una terraza de Medellín', eyebrow: 'PANTALONES / 01', title: 'A TU PASO, A TU MODO.', copy: 'Jeans amplios para recorrer la ciudad sin perder tu estilo.', location: 'LA TERRAZA / MEDELLÍN' },
    { image: '/images/shop-pantalones-02.webp', alt: 'Modelo con jeans negros amplios en una calle empinada de Medellín', eyebrow: 'PANTALONES / 02', title: 'DE LA CUADRA PA’ LEJOS.', copy: 'Pantalones para el camino que estás haciendo tuyo.', location: 'LA CUADRA / MEDELLÍN' },
  ],
  Accesorios: [
    { image: '/images/gorro-vkz.png', alt: 'Gorro negro con el monograma VKZ bordado', eyebrow: 'ACCESORIOS / 01', title: 'EL DETALLE TAMBIÉN HABLA.', copy: 'El toque final de una pinta hecha a tu manera.', location: 'VARKUZO / MEDELLÍN' },
  ],
};

const allSlides = [campaigns.Buzos[0], campaigns.Camisetas[0], campaigns.Pantalones[0]];

export function ShopCategoryHero({ category }: { category: string }) {
  const slides = campaigns[category] ?? allSlides;
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => setActive(0), [category]);
  useEffect(() => {
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(preference.matches);
    update();
    preference.addEventListener('change', update);
    return () => preference.removeEventListener('change', update);
  }, []);
  useEffect(() => {
    if (paused || reducedMotion || slides.length < 2) return;
    const timer = window.setInterval(() => setActive((current) => (current + 1) % slides.length), 7000);
    return () => window.clearInterval(timer);
  }, [category, paused, reducedMotion, slides.length]);

  return <section className="shop-campaign" aria-roledescription="carrusel" aria-label={`Campaña de ${category === 'Todo' ? 'ropa Varkuzo' : category.toLowerCase()}`} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocus={() => setPaused(true)} onBlur={(event) => { if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false); }}>
    {slides.map((slide, index) => <div className={`shop-campaign-slide${index === active ? ' is-active' : ''}`} key={`${category}-${slide.image}`} aria-hidden={index !== active} style={{ '--campaign-image': `url("${slide.image}")` } as CSSProperties}>
      <img src={slide.image} alt={index === active ? slide.alt : ''} className="shop-campaign-image" fetchPriority={index === 0 ? 'high' : undefined} />
      <div className="shop-campaign-shade" />
      <div className={`shop-campaign-content${slide.title.length > 24 ? ' shop-campaign-content--long' : ''}`}>
        <span className="shop-campaign-kicker">VARKUZO / {slide.eyebrow}</span>
        {index === active ? <h1>{slide.title}</h1> : <h2>{slide.title}</h2>}
        <p>{slide.copy}</p>
        <a href="#catalogo" tabIndex={index === active ? 0 : -1} className="shop-campaign-link">EXPLORAR PIEZAS <span aria-hidden="true">↘</span></a>
      </div>
      <span className="shop-campaign-location">{slide.location}</span>
    </div>)}
    <div className="shop-campaign-controls" aria-label="Cambiar imagen de campaña">
      {slides.map((slide, index) => <button key={slide.image} type="button" className={index === active ? 'is-active' : ''} aria-label={`Ver slide ${index + 1} de ${slides.length}: ${slide.title}`} aria-pressed={index === active} onClick={() => setActive(index)}>{String(index + 1).padStart(2, '0')}</button>)}
    </div>
    {slides.length > 1 && <div className={`shop-campaign-progress${paused ? ' is-paused' : ''}`} key={`${category}-${active}`} />}
  </section>;
}
