import Link from 'next/link';
import { getProducts } from '@/lib/products';
import { ProductCard } from '@/components/product-card';
import { HeroCarousel } from '@/components/hero-carousel';
import { ScrollBurn } from '@/components/scroll-burn';
import { MostWanted } from '@/components/most-wanted';
import { LiquidLogo } from '@/components/liquid-logo';
import './scroll-burn.css';

export default async function Home() {
  const products = await getProducts();
  return <main>
    <div className="home-hero-shell">
      <HeroCarousel />
      <div className="ticker" aria-label="Varkuzo, ropa urbana hecha en Medellín"><div className="ticker-track">{Array.from({ length: 4 }).map((_, i) => <span key={i}>VARKUZO <b>✳</b> MEDELLÍN <b>✳</b> ROPA CON CARÁCTER <b>✳</b> HECHO PARA DESTACAR <b>✳</b></span>)}</div></div>
      <ScrollBurn color="#f4f0e9" />
    </div>
    <section className="section collection collection-editorial" id="coleccion"><Link href="/shop" className="collection-all">VER TODO <span>→</span></Link><div className="collection-intro reveal"><p className="eyebrow red">COLECCIÓN VARKUZO</p><h2>PIEZAS<br />ESENCIALES</h2><p>Buzos, camisetas y pantalones amplios.<br />Gráficas hechas para llevarlas a tu manera.</p><span className="collection-rule" /></div><div className="product-grid collection-products">{products.slice(0, 4).map((product, i) => <ProductCard key={product.id} product={product} index={i} />)}</div></section>
    <MostWanted products={products} />
    <section className="home-sale-promo reveal"><div><p className="eyebrow">VARKUZO / DESCUENTOS</p><h2>CUANDO REBAJE,<br /><em>LO VÉS AQUÍ.</em></h2><p>Las rebajas aparecerán aquí cuando haya prendas con descuento activo.</p><Link href="/descuentos" className="button button-outline">IR A DESCUENTOS <span>↗</span></Link></div><img src="/images/descuentos-modelo.png" alt="Modelo de la campaña Varkuzo" loading="lazy" /></section>
    <section className="story-banner reveal"><div className="story-banner-image"><img src="/images/campaign-hero.png" alt="Editorial Varkuzo" loading="lazy" /></div><div className="story-banner-copy"><p className="eyebrow">02 / HECHO DESDE MEDELLÍN</p><h2>DE ESTA<br />CUADRA<br /><em>AL MUNDO.</em></h2><p>El barrio nos enseñó a buscarle la vuelta. Esa inquietud también se viste: prendas amplias, gráficas con intención y detalles que se descubren de cerca.</p><Link href="/shop" className="button button-solid">EXPLORAR EL CATÁLOGO <span>↗</span></Link></div></section>
    <section className="category-section section"><div className="section-heading reveal"><div><p className="eyebrow red">03 / ENCUENTRA TU PIEZA</p><h2>ELIGE TU<br /><em>TERRENO.</em></h2></div></div><div className="category-grid"><Link href="/shop?categoria=Buzos" className="category-tile reveal"><img src="/images/buzo-frente-espalda.png" alt="Buzos Varkuzo" loading="lazy" /><span>BUZOS <b>↗</b></span></Link><Link href="/shop?categoria=Camisetas" className="category-tile reveal"><img src="/images/camiseta-editorial.png" alt="Camisetas Varkuzo" loading="lazy" /><span>CAMISETAS <b>↗</b></span></Link><Link href="/shop?categoria=Pantalones" className="category-tile reveal"><img src="/images/campaign-hero.png" alt="Pantalones Varkuzo" loading="lazy" /><span>PANTALONES <b>↗</b></span></Link></div></section>
    <section className="closing-banner reveal"><p>EL ORIGEN SE LLEVA PUESTO.</p><LiquidLogo href="/shop" className="closing-logo" label="Varkuzo, explorar el catálogo" /><Link href="/shop" className="button button-outline">VER TODAS LAS PIEZAS <span>↗</span></Link></section>
  </main>;
}
