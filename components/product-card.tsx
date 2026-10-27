'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import type { Product } from '@/lib/products';
import './product-card.css';

export function ProductCard({ product, index = 0 }: { product: Product; index?: number }) {
  const variants = product.colorVariants ?? [];
  const canCompare = variants.length >= 2;
  const [comparing, setComparing] = useState(false);
  const [first, setFirst] = useState(0);
  const [second, setSecond] = useState(1);
  const [mobileView, setMobileView] = useState(0);
  const mediaRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLImageElement>(null);
  const motion = useRef({ x: 0, y: 0, radius: 0, targetX: 0, targetY: 0, targetRadius: 0, frame: 0 });

  useEffect(() => () => cancelAnimationFrame(motion.current.frame), []);

  function animate() {
    const state = motion.current;
    state.x += (state.targetX - state.x) * 0.23;
    state.y += (state.targetY - state.y) * 0.23;
    state.radius += (state.targetRadius - state.radius) * 0.2;
    if (overlayRef.current) overlayRef.current.style.maskImage = `radial-gradient(circle at ${state.x}px ${state.y}px, black ${Math.max(0, state.radius - 4)}px, transparent ${state.radius + 4}px)`;
    if (Math.abs(state.targetX - state.x) > 0.3 || Math.abs(state.targetY - state.y) > 0.3 || Math.abs(state.targetRadius - state.radius) > 0.3) state.frame = requestAnimationFrame(animate);
    else state.frame = 0;
  }

  function updatePointer(event: PointerEvent<HTMLDivElement>, entering = false) {
    if (!comparing || event.pointerType === 'touch') return;
    const bounds = mediaRef.current?.getBoundingClientRect();
    if (!bounds) return;
    const state = motion.current;
    state.targetX = event.clientX - bounds.left;
    state.targetY = event.clientY - bounds.top;
    if (entering) { state.x = state.targetX; state.y = state.targetY; state.targetRadius = 130; }
    if (!state.frame) state.frame = requestAnimationFrame(animate);
  }

  function leavePointer() {
    motion.current.targetRadius = 0;
    if (!motion.current.frame) motion.current.frame = requestAnimationFrame(animate);
  }

  const firstImage = canCompare ? variants[first].image : product.images[0] || '/images/campaign-hero.png';
  const secondImage = canCompare ? variants[second].image : '';

  return <article className="product-card reveal" style={{ transitionDelay: `${Math.min(index % 4, 3) * 80}ms` }}>
    <Link href={`/producto/${product.slug}`} className="product-card-link" aria-label={`Ver ${product.name}`}>
      <div ref={mediaRef} className={`product-card-image${comparing ? ' is-comparing' : ''}`} onPointerEnter={(event) => updatePointer(event, true)} onPointerMove={updatePointer} onPointerLeave={leavePointer}>
        <img className="product-card-base" src={comparing ? (mobileView === 1 ? secondImage : firstImage) : product.images[0] || '/images/campaign-hero.png'} alt={product.name} loading="lazy" />
        {comparing && <img ref={overlayRef} className="product-card-reveal" src={secondImage} alt="" aria-hidden="true" loading="lazy" />}
        <span className="product-card-arrow" aria-hidden="true">↗</span>{product.demo && <span className="product-badge">CONCEPTO</span>}
      </div>
      <div className="product-card-info"><div><small>{product.category.toUpperCase()}</small><h3>{product.name}</h3></div><span>{product.price || 'Próximamente'}</span></div>
    </Link>
    {canCompare && <div className="product-compare">
      <button type="button" className="compare-toggle" aria-expanded={comparing} onClick={() => { setComparing((value) => !value); setMobileView(0); leavePointer(); }}>{comparing ? 'CERRAR COMPARACIÓN' : `COMPARAR ${variants.length} COLORES`} <span aria-hidden="true">↗</span></button>
      {comparing && <div className="compare-controls" aria-label={`Comparar colores de ${product.name}`}>
        <label>COLOR 1<select value={first} onChange={(event) => { const next = Number(event.target.value); setFirst(next); if (next === second) setSecond(first); setMobileView(0); }}>{variants.map((variant, i) => <option key={`${variant.name}-${i}`} value={i}>{variant.name}</option>)}</select></label>
        <label>COLOR 2<select value={second} onChange={(event) => { const next = Number(event.target.value); setSecond(next); if (next === first) setFirst(second); setMobileView(0); }}>{variants.map((variant, i) => <option key={`${variant.name}-${i}`} value={i}>{variant.name}</option>)}</select></label>
        <p className="compare-hint">Mueve el cursor sobre la foto para revelar el segundo color.</p>
        <div className="compare-mobile" role="group" aria-label="Ver cada color"><button type="button" aria-pressed={mobileView === 0} onClick={() => setMobileView(0)}>{variants[first].name}</button><button type="button" aria-pressed={mobileView === 1} onClick={() => setMobileView(1)}>{variants[second].name}</button></div>
      </div>}
    </div>}
  </article>;
}
