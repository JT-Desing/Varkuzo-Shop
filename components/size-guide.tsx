'use client';

import { useEffect, useRef, useState } from 'react';
import type { Product } from '@/lib/products';

export function SizeGuide({ product }: { product: Product }) {
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const node = dialog.current;
    if (!node) return;
    if (open && !node.open) node.showModal();
    if (!open && node.open) node.close();
  }, [open]);
  const measurements = product.category === 'Pantalones' ? ['Cintura', 'Cadera', 'Largo total'] : ['Pecho', 'Largo', 'Manga'];
  return <><button type="button" className="size-guide-trigger" onClick={() => setOpen(true)}>GUÍA DE TALLAS <span aria-hidden="true">▤</span></button>
    <dialog ref={dialog} className="size-guide-dialog" onClose={() => setOpen(false)} aria-labelledby="size-guide-title"><div className="size-guide-content"><button type="button" className="size-guide-close" onClick={() => setOpen(false)} aria-label="Cerrar guía de tallas">×</button><p className="eyebrow red">VARKUZO / AJUSTE</p><h2 id="size-guide-title">GUÍA DE TALLAS.</h2><p>Elige por medidas de la prenda, no por la talla que usas habitualmente. Extiéndela sobre una superficie plana y compárala con una prenda tuya que te quede bien.</p><ol><li><strong>{measurements[0]}:</strong> mide de lado a lado y multiplica por dos.</li><li><strong>{measurements[1]}:</strong> mide desde la costura superior hasta el extremo inferior.</li><li><strong>{measurements[2]}:</strong> mide la longitud completa siguiendo la costura.</li></ol><div className="size-table-wrap"><table><caption>Medidas en centímetros de {product.name}</caption><thead><tr><th>Talla</th>{measurements.map((item) => <th key={item}>{item}</th>)}</tr></thead><tbody>{['S', 'M', 'L', 'XL'].map((size) => <tr key={size}><th>{size}</th>{measurements.map((item) => <td key={item}>Por medir</td>)}</tr>)}</tbody></table></div><p className="size-guide-note">Las medidas definitivas se publicarán después de medir cada talla de la prenda física. La guía queda preparada para esos datos antes de habilitar la compra.</p></div></dialog>
  </>;
}
