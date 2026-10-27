'use client';

import { useState } from 'react';
import type { Product } from '@/lib/products';

export function ProductGallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const [zoom, setZoom] = useState(false);
  const images = product.images.length ? product.images : ['/images/campaign-hero.png'];
  const next = () => setActive((value) => (value + 1) % images.length);
  return <div className="product-gallery"><div className="gallery-thumbs">{images.map((image, i) => <button type="button" key={`${image}-${i}`} className={i === active ? 'active' : ''} onClick={() => setActive(i)} aria-label={`Ver imagen ${i + 1}`}><img src={image} alt="" /></button>)}</div><div className="gallery-stage"><button type="button" className="gallery-main-image" onClick={() => setZoom(true)} aria-label="Ampliar imagen"><img key={active} src={images[active]} alt={`${product.name}, vista ${active + 1}`} /></button>{images.length > 1 && <button type="button" className="gallery-next" onClick={next} aria-label="Siguiente imagen">→</button>}<span className="gallery-count">{String(active + 1).padStart(2, '0')} / {String(images.length).padStart(2, '0')}</span></div>{zoom && <div className="zoom-overlay" role="dialog" aria-modal="true" aria-label="Imagen ampliada" onClick={() => setZoom(false)}><button type="button" aria-label="Cerrar" onClick={() => setZoom(false)}>×</button><img src={images[active]} alt={`${product.name}, imagen ampliada`} /></div>}</div>;
}
