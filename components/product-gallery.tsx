'use client';

import { useEffect, useRef, useState } from 'react';
import type { PointerEvent as ReactPointerEvent, TouchEvent as ReactTouchEvent } from 'react';
import type { Product } from '@/lib/products';
import '@/app/gallery.css';

type Shot = { src: string; alt: string };
type Group = { label: string; shots: Shot[] };

function buildGroups(product: Product): Group[] {
  const labels = ['Vistas principales', 'Producto en uso', 'Detalles'];
  const images = product.images.map((src, index) => ({ src, alt: `${product.name}, fotografía ${index + 1} en color ${product.color}` }));
  const groups: Group[] = [];
  for (let index = 0; index < images.length; index += 2) groups.push({ label: labels[index / 2] || `Vistas ${index / 2 + 1}`, shots: images.slice(index, index + 2) });
  return groups;
}

export function ProductGallery({ product }: { product: Product }) {
  const groups = buildGroups(product);
  const [groupIndex, setGroupIndex] = useState(0);
  const [shotIndex, setShotIndex] = useState(0);
  const [viewer, setViewer] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [scale, setScale] = useState(1);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [pinchStart, setPinchStart] = useState<number | null>(null);
  const opener = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const shots = groups[groupIndex]?.shots || [];
  const allShots = groups.flatMap((group) => group.shots);
  const visible = shots[shotIndex] || shots[0];

  useEffect(() => { setGroupIndex(0); setShotIndex(0); }, [product.id, product.color]);
  useEffect(() => {
    if (!viewer) return;
    closeButton.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setViewer(false);
      if (event.key === 'ArrowRight') setViewerIndex((value) => (value + 1) % allShots.length);
      if (event.key === 'ArrowLeft') setViewerIndex((value) => (value - 1 + allShots.length) % allShots.length);
      if (event.key === 'Tab') {
        const buttons = Array.from(document.querySelectorAll<HTMLButtonElement>('.zoom-overlay button'));
        const current = buttons.indexOf(document.activeElement as HTMLButtonElement);
        if (current < 0) return;
        const next = current + (event.shiftKey ? -1 : 1);
        if (next < 0 || next >= buttons.length) { event.preventDefault(); buttons[(next + buttons.length) % buttons.length]?.focus(); }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => { window.removeEventListener('keydown', onKey); opener.current?.focus(); };
  }, [viewer, allShots.length]);
  const closeViewer = () => { setViewer(false); requestAnimationFrame(() => opener.current?.focus()); };

  if (!visible) return <div className="product-gallery gallery-empty">Fotografías próximamente</div>;

  const changeByPointer = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (event.pointerType === 'touch' || shots.length < 2) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    setShotIndex(event.clientX - bounds.left < bounds.width / 2 ? 0 : 1);
  };
  const selectGroup = (index: number) => { setGroupIndex(index); setShotIndex(0); };
  const openViewer = () => {
    setViewerIndex(groups.slice(0, groupIndex).reduce((total, group) => total + group.shots.length, 0) + shotIndex);
    setScale(1); setViewer(true);
  };
  const stepViewer = (direction: number) => { setViewerIndex((value) => (value + direction + allShots.length) % allShots.length); setScale(1); };
  const handleTouchStart = (event: ReactTouchEvent) => {
    if (event.touches.length === 2) setPinchStart(Math.hypot(event.touches[0].clientX - event.touches[1].clientX, event.touches[0].clientY - event.touches[1].clientY));
    else setTouchStart(event.touches[0]?.clientX ?? null);
  };

  return <div className="product-gallery">
    <div className="gallery-stage">
      <button ref={opener} type="button" className="gallery-main-image" onPointerEnter={changeByPointer} onPointerMove={changeByPointer} onPointerLeave={() => setShotIndex(0)} onClick={openViewer} onTouchStart={handleTouchStart} onTouchEnd={(event) => {
        if (touchStart === null || shots.length < 2) return;
        const delta = (event.changedTouches[0]?.clientX ?? touchStart) - touchStart;
        if (Math.abs(delta) > 35) { event.preventDefault(); setShotIndex(delta < 0 ? 1 : 0); }
        setTouchStart(null);
      }} aria-label={`Ampliar ${visible.alt}`}>
        {shots.map((shot, index) => <img key={shot.src} src={shot.src} alt={index === shotIndex ? shot.alt : ''} aria-hidden={index !== shotIndex} className={index === shotIndex ? 'gallery-shot active' : 'gallery-shot'} loading={groupIndex === 0 ? 'eager' : 'lazy'} fetchPriority={groupIndex === 0 && index === 0 ? 'high' : 'auto'} />)}
      </button>
      <span className="gallery-count">{String(shotIndex + 1).padStart(2, '0')} / {String(shots.length).padStart(2, '0')}</span>
      {shots.length > 1 && <span className="gallery-hint">IZQUIERDA / DERECHA PARA CAMBIAR VISTA</span>}
    </div>
    <div className="gallery-thumbs" aria-label="Grupos de fotografías">{groups.map((group, index) => <button type="button" key={`${group.label}-${index}`} className={index === groupIndex ? 'active' : ''} aria-pressed={index === groupIndex} aria-label={`Ver ${group.label}`} onClick={() => selectGroup(index)}><img src={group.shots[0].src} alt="" loading="lazy" /><span>{group.label}</span></button>)}</div>
    {viewer && <div className="zoom-overlay" role="dialog" aria-modal="true" aria-label={`Imagen ampliada de ${product.name}`} onTouchStart={handleTouchStart} onTouchMove={(event) => {
      if (event.touches.length === 2 && pinchStart) {
        const distance = Math.hypot(event.touches[0].clientX - event.touches[1].clientX, event.touches[0].clientY - event.touches[1].clientY);
        setScale(Math.max(1, Math.min(4, distance / pinchStart)));
      }
    }} onTouchEnd={(event) => {
      if (pinchStart) { setPinchStart(null); return; }
      if (touchStart === null) return;
      const delta = (event.changedTouches[0]?.clientX ?? touchStart) - touchStart;
      if (Math.abs(delta) > 55) stepViewer(delta < 0 ? 1 : -1);
      setTouchStart(null);
    }}>
      <button ref={closeButton} type="button" className="zoom-close" onClick={closeViewer} aria-label="Cerrar visor">×</button>
      {allShots.length > 1 && <button type="button" className="zoom-prev" onClick={() => stepViewer(-1)} aria-label="Imagen anterior">←</button>}
      <img src={allShots[viewerIndex].src} alt={allShots[viewerIndex].alt} style={{ transform: `scale(${scale})` }} onWheel={(event) => setScale((value) => Math.max(1, Math.min(4, value + (event.deltaY < 0 ? .25 : -.25))))} />
      {allShots.length > 1 && <button type="button" className="zoom-next" onClick={() => stepViewer(1)} aria-label="Imagen siguiente">→</button>}
      <div className="zoom-controls"><button type="button" onClick={() => setScale((value) => Math.max(1, value - .25))} aria-label="Alejar">−</button><span>{Math.round(scale * 100)} %</span><button type="button" onClick={() => setScale((value) => Math.min(4, value + .25))} aria-label="Acercar">+</button></div>
    </div>}
  </div>;
}
