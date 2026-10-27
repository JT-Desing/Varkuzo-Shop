import type { ReactNode } from 'react';
import type { Product } from '@/lib/products';
import Link from 'next/link';

type IconName = 'spark' | 'diamond' | 'globe' | 'city' | 'truck' | 'shirt' | 'care' | 'question' | 'cube' | 'photo';

export function ProductIcon({ name, size = 25 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    spark: <path d="M12 2c.7 6 2 8.2 8 10-6 1.8-7.3 4-8 10-.7-6-2-8.2-8-10 6-1.8 7.3-4 8-10Z" />,
    diamond: <><path d="m3 9 4-6h10l4 6-9 12L3 9Z" /><path d="M3 9h18M7 3l5 18 5-18" /></>,
    globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c-5 5-5 13 0 18M12 3c5 5 5 13 0 18" /></>,
    city: <><path d="M3 21V9h5v12M8 21V3h8v18M16 21v-9h5v9M1 21h22M11 6h2m-2 4h2m-2 4h2" /></>,
    truck: <><path d="M2 5h12v12H2V5Zm12 4h4l4 4v4h-8V9Z" /><circle cx="6" cy="18" r="2" /><circle cx="18" cy="18" r="2" /></>,
    shirt: <path d="m7 3 5 2 5-2 5 4-3 4-2-1v11H7V10l-2 1-3-4 5-4Z" />,
    care: <><path d="M3 8 5 19h14l2-11M3 8c2-2 4 2 6 0s4 2 6 0 4 2 6 0" /></>,
    question: <><circle cx="12" cy="12" r="9" /><path d="M9.5 9a2.5 2.5 0 1 1 3.8 2.1c-.9.6-1.3 1.1-1.3 2.4M12 17h.01" /></>,
    cube: <><path d="m12 2 9 5v10l-9 5-9-5V7l9-5ZM3 7l9 5 9-5M12 12v10" /></>,
    photo: <><rect x="2" y="4" width="20" height="16" rx="2" /><circle cx="8" cy="9" r="1.5" /><path d="m3 18 6-6 4 4 3-3 5 5" /></>,
  };
  return <svg className="product-icon" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.55" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[name]}</svg>;
}

export function ProductViewTabs() {
  return <div className="product-view-tabs" role="group" aria-label="Modo de visualización"><span className="view-active"><ProductIcon name="photo" size={17} /> VER FOTOS</span><button type="button" disabled aria-label="Explorar 3D, próximamente" title="Visor 3D en desarrollo"><ProductIcon name="cube" size={17} /> EXPLORAR 3D <small>PRÓXIMAMENTE</small></button></div>;
}

export function ProductBenefits() {
  const items: { icon: IconName; title: string; detail: string }[] = [
    { icon: 'spark', title: 'DISEÑO ORIGINAL', detail: 'Gráficas propias' },
    { icon: 'diamond', title: 'CALIDAD PREMIUM', detail: 'Materiales por confirmar' },
    { icon: 'globe', title: 'ENVÍOS NACIONALES', detail: 'Próximamente' },
    { icon: 'city', title: 'MEDELLÍN', detail: 'Nuestra casa' },
  ];
  return <div className="product-benefits" aria-label="Sobre Varkuzo">{items.map((item) => <div className="product-benefit" key={item.title}><ProductIcon name={item.icon} size={29} /><div><strong>{item.title}</strong><span>{item.detail}</span></div></div>)}</div>;
}

export function ProductInformation({ product }: { product: Product }) {
  return <div className="product-information">
    <details className="delivery-card"><summary><ProductIcon name="truck" size={26} /><span><strong>Entrega en Medellín y área metropolitana</strong><small>Plazo y tarifa por confirmar antes de habilitar compras.</small></span><span className="accordion-chevron">⌄</span></summary><p>Estamos preparando las entregas locales. Al activar la tienda, mostraremos cobertura, costo y fecha estimada antes de confirmar cada pedido.</p></details>
    <details className="info-accordion"><summary><ProductIcon name="shirt" size={20} /><span>Fit y detalles</span><span className="accordion-chevron">⌄</span></summary><p>{product.description} El corte, gramaje y medidas exactas se confirmarán con la muestra física.</p></details>
    <details className="info-accordion"><summary><ProductIcon name="care" size={20} /><span>Materiales y cuidado</span><span className="accordion-chevron">⌄</span></summary><p>La composición textil y los cuidados de lavado se publicarán al cerrar la ficha técnica de esta prenda.</p></details>
    <details className="info-accordion"><summary><ProductIcon name="truck" size={20} /><span>Envíos y devoluciones</span><span className="accordion-chevron">⌄</span></summary><p>La primera etapa cubrirá Medellín y el área metropolitana. Las condiciones de devolución se publicarán antes de aceptar pedidos.</p></details>
    <div className="product-faq"><h2>PREGUNTAS FRECUENTES</h2><details className="info-accordion"><summary><ProductIcon name="question" size={17} /><span>¿Cómo elijo mi talla?</span><span className="accordion-chevron">⌄</span></summary><p>Abre la guía de tallas y compara las medidas de la prenda con una que ya tengas. Las medidas por talla se publicarán antes de la venta.</p></details><details className="info-accordion"><summary><ProductIcon name="question" size={17} /><span>¿Puedo ver la prenda en 3D?</span><span className="accordion-chevron">⌄</span></summary><p>El visor 3D está en desarrollo. Cada modelo se publicará cuando su representación haya sido revisada frente a la prenda física.</p></details><details className="info-accordion"><summary><ProductIcon name="question" size={17} /><span>¿Cuándo estarán disponibles los envíos?</span><span className="accordion-chevron">⌄</span></summary><p>Comenzaremos con Medellín y el área metropolitana. Anunciaremos fecha de lanzamiento y cobertura confirmada en la tienda.</p></details><Link href="/ayuda" className="product-help-link">VER TODA LA AYUDA ↗</Link></div>
  </div>;
}
