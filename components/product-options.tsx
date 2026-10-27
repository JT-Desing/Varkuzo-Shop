'use client';

import { useState } from 'react';
import type { Product } from '@/lib/products';
import { SizeGuide } from './size-guide';

export function ProductOptions({ product }: { product: Product }) {
  const [size, setSize] = useState<string | null>(null);
  const sizes = ['S', 'M', 'L', 'XL'];
  return <div className="product-options"><div className="size-label-row"><p className="option-label">TALLA <span>{size || 'Selecciona una talla'}</span></p><SizeGuide product={product} /></div><div className="size-options">{sizes.map((item) => <button type="button" key={item} aria-pressed={size === item} className={size === item ? 'selected' : ''} onClick={() => setSize(item)}>{item}</button>)}</div><p className="availability">{product.demo ? 'CONCEPTO EN DESARROLLO' : product.available ? 'DISPONIBLE' : 'AGOTADO'}</p><button type="button" className="button button-buy" disabled>{product.demo ? 'COMPRA DISPONIBLE MÁS ADELANTE' : 'CARRITO EN PREPARACIÓN'} <span>→</span></button><p className="demo-note">Esta vista muestra el diseño de compra. Aún no procesa pedidos ni pagos.</p></div>;
}
