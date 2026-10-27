import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProduct } from '@/lib/products';
import { ProductGallery } from '@/components/product-gallery';
import { ProductOptions } from '@/components/product-options';
import { FavoriteButton } from '@/components/favorite-button';
import { ProductBenefits, ProductInformation, ProductViewTabs } from '@/components/product-info';
import './product-detail.css';

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();
  return <main className="product-page">
    <div className="product-layout product-layout-ref">
      <div className="product-visual-column"><ProductGallery product={product} /><ProductBenefits /></div>
      <div className="product-detail">
        <div className="detail-topline"><nav className="detail-breadcrumb" aria-label="Ruta de navegación"><Link href="/">INICIO</Link><span>/</span><Link href="/shop">{product.category.toUpperCase()}</Link><span>/</span><span>{product.name.toUpperCase()}</span></nav><ProductViewTabs /></div>
        <div className="detail-title-line"><div><h1>{product.name}</h1><p className="detail-brand">V A R K U Z O</p></div><FavoriteButton product={product} /></div>
        <p className="product-detail-price">{product.price || 'PRECIO POR DEFINIR'}</p>
        <p className="product-description">{product.description}</p>
        <div className="product-rule" />
        <p className="option-label">COLOR <span>{product.color}</span></p>
        <span className="color-swatch" title={product.color} />
        <ProductOptions product={product} />
        <ProductInformation product={product} />
      </div>
    </div>
  </main>;
}
