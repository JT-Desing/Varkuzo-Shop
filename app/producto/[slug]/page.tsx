import { notFound } from 'next/navigation';
import { getProduct } from '@/lib/products';
import { ProductGallery } from '@/components/product-gallery';
import { ProductOptions } from '@/components/product-options';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  return <main className="product-page"><div className="product-breadcrumb"><a href="/shop">CATÁLOGO</a><span>/</span><span>{product.category.toUpperCase()}</span><span>/</span><span>{product.name.toUpperCase()}</span></div><div className="product-layout"><ProductGallery product={product} /><div className="product-detail"><p className="eyebrow red">VARKUZO / {product.category.toUpperCase()}</p><h1>{product.name}</h1><p className="product-detail-price">{product.price || 'PRECIO POR DEFINIR'}</p><p className="product-description">{product.description}</p><div className="product-rule" /><p className="option-label">COLOR <span>{product.color}</span></p><span className="color-swatch" title={product.color} /><ProductOptions product={product} /><div className="product-rule" /><details className="product-accordion"><summary>AJUSTE Y DETALLES <span>+</span></summary><p>Diseño conceptual de silueta amplia. Materiales, medidas y tabla de tallas se definirán con las prendas reales.</p></details><details className="product-accordion"><summary>MATERIALES Y CUIDADOS <span>+</span></summary><p>La composición textil y las instrucciones de cuidado se publicarán al confirmar la producción.</p></details><details className="product-accordion"><summary>ENTREGA <span>+</span></summary><p>La tienda comenzará atendiendo Medellín y el área metropolitana. Las condiciones definitivas se mostrarán antes de habilitar compras.</p></details></div></div></main>;
}
