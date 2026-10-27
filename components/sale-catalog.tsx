'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import type { SaleProduct } from '@/lib/sale-products';

const categories = ['Todas', 'Buzos', 'Camisetas', 'Pantalones', 'Accesorios'];
const money = (amount: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);

export function SaleCatalog({ products }: { products: SaleProduct[] }) {
  const [category, setCategory] = useState('Todas');
  const [size, setSize] = useState('Todas');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sort, setSort] = useState('descuento');
  const sizes = useMemo(() => [...new Set(products.flatMap((product) => product.sizes))].sort(), [products]);
  const filtered = useMemo(() => products
    .filter((product) => (category === 'Todas' || product.category === category) && (size === 'Todas' || product.sizes.includes(size)) && (!minPrice || product.currentAmount >= Number(minPrice)) && (!maxPrice || product.currentAmount <= Number(maxPrice)))
    .sort((a, b) => sort === 'precio-asc' ? a.currentAmount - b.currentAmount : sort === 'precio-desc' ? b.currentAmount - a.currentAmount : b.discountPercent - a.discountPercent), [products, category, size, minPrice, maxPrice, sort]);

  return <section className="sale-catalog" id="prendas-en-descuento">
    <div className="sale-catalog-heading"><div><p className="sale-kicker">VARKUZO / PRECIOS ESPECIALES</p><h2>ENCUENTRA TU<br /><em>PRÓXIMA PRENDA.</em></h2></div><p>Filtra por talla, categoría o precio. Solo aparecen prendas con descuento activo en el catálogo.</p></div>
    <div className="sale-toolbar">
      <div className="sale-category-tabs" role="group" aria-label="Filtrar descuentos por categoría">{categories.map((item) => <button type="button" key={item} className={category === item ? 'is-active' : ''} onClick={() => setCategory(item)}>{item}</button>)}</div>
      <div className="sale-selects">
        <label>TALLA<select value={size} onChange={(event) => setSize(event.target.value)}><option value="Todas">Todas</option>{sizes.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
        <label>PRECIO MÍNIMO<input type="number" min="0" inputMode="numeric" value={minPrice} placeholder="Desde" onChange={(event) => setMinPrice(event.target.value)} /></label>
        <label>PRECIO MÁXIMO<input type="number" min="0" inputMode="numeric" value={maxPrice} placeholder="Sin límite" onChange={(event) => setMaxPrice(event.target.value)} /></label>
        <label>ORDENAR<select value={sort} onChange={(event) => setSort(event.target.value)}><option value="descuento">Mayor descuento</option><option value="precio-asc">Menor precio</option><option value="precio-desc">Mayor precio</option></select></label>
      </div>
    </div>
    <p className="sale-results" role="status">{filtered.length} {filtered.length === 1 ? 'PRENDA EN DESCUENTO' : 'PRENDAS EN DESCUENTO'}{minPrice && ` · DESDE ${money(Number(minPrice))}`}{maxPrice && ` · HASTA ${money(Number(maxPrice))}`}</p>
    {filtered.length ? <div className="sale-grid">{filtered.map((product) => <Link className="sale-card" href={`/producto/${product.slug}`} key={product.id}>
      <div className="sale-card-image"><img src={product.images[0] || '/images/campaign-hero.png'} alt={product.name} loading="lazy" /><span>-{product.discountPercent}%</span></div>
      <div className="sale-card-meta"><p>{product.category.toUpperCase()}{product.sizes.length ? ` / ${product.sizes.join(' · ')}` : ''}</p><h3>{product.name}</h3><div><del>{product.regularPrice}</del><strong>{product.price}</strong></div></div>
    </Link>)}</div> : <div className="sale-empty"><p className="sale-kicker">SIN REBAJAS INVENTADAS</p><h3>{products.length ? 'NO HAY PRENDAS CON ESTOS FILTROS.' : 'AÚN NO HAY DESCUENTOS ACTIVOS.'}</h3><p>{products.length ? 'Prueba otra talla, categoría o rango de precio.' : 'Aquí aparecerán automáticamente las prendas que tengan una rebaja vigente en WooCommerce.'}</p>{products.length ? <button type="button" onClick={() => { setCategory('Todas'); setSize('Todas'); setMinPrice(''); setMaxPrice(''); }}>LIMPIAR FILTROS ↗</button> : <Link href="/shop">EXPLORAR CATÁLOGO ↗</Link>}</div>}
  </section>;
}
