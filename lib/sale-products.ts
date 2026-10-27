import type { Product } from './products';

export type SaleProduct = Product & {
  currentAmount: number;
  regularAmount: number;
  discountPercent: number;
  regularPrice: string;
  sizes: string[];
};

type StoreProduct = {
  id: number;
  type?: string;
  slug: string;
  name: string;
  short_description?: string;
  description?: string;
  on_sale?: boolean;
  is_in_stock?: boolean;
  images?: { src: string }[];
  categories?: { name: string }[];
  attributes?: { name: string; terms?: { name: string }[] }[];
  variation?: { attribute: string; value: string }[];
  prices?: { price: string; regular_price: string; currency_minor_unit: number };
};

const money = (amount: number) => new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount);
const plain = (value: string) => value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();

function mapSale(item: StoreProduct, parent?: StoreProduct): SaleProduct | null {
  const prices = item.prices;
  if (!item.on_sale || !item.is_in_stock || !prices) return null;
  const divisor = 10 ** prices.currency_minor_unit;
  const currentAmount = Number(prices.price) / divisor;
  const regularAmount = Number(prices.regular_price) / divisor;
  if (!Number.isFinite(currentAmount) || !Number.isFinite(regularAmount) || currentAmount <= 0 || regularAmount <= currentAmount) return null;
  const categoryName = (parent ?? item).categories?.find((category) => /buzo|camiseta|pantal|accesori/i.test(category.name))?.name ?? 'Buzos';
  const category: Product['category'] = /camiseta/i.test(categoryName) ? 'Camisetas' : /pantal/i.test(categoryName) ? 'Pantalones' : /accesori/i.test(categoryName) ? 'Accesorios' : 'Buzos';
  return {
    id: String(parent?.id ?? item.id), slug: parent?.slug ?? item.slug, name: plain(parent?.name ?? item.name), category,
    description: plain(parent?.short_description || parent?.description || item.short_description || item.description || ''),
    images: (item.images?.length ? item.images : parent?.images)?.map((image) => image.src).filter(Boolean) ?? [],
    price: money(currentAmount), regularPrice: money(regularAmount), currentAmount, regularAmount,
    discountPercent: Math.round((1 - currentAmount / regularAmount) * 100),
    sizes: item.variation?.filter((attribute) => /talla|size/i.test(attribute.attribute)).map((attribute) => attribute.value) ?? item.attributes?.filter((attribute) => /talla|size/i.test(attribute.name)).flatMap((attribute) => attribute.terms?.map((term) => term.name) ?? []) ?? [],
    color: 'Ver opciones', available: true, demo: false, colorVariants: [],
  };
}

export async function getSaleProducts(): Promise<SaleProduct[]> {
  const base = process.env.WC_STORE_API_URL;
  if (!base) return [];
  try {
    const results: SaleProduct[] = [];
    for (let page = 1; page <= 5; page++) {
      const response = await fetch(`${base}/products?on_sale=true&per_page=100&page=${page}`, { next: { revalidate: 60 } });
      if (!response.ok) break;
      const data = await response.json() as StoreProduct[];
      const mapped = await Promise.all(data.map(async (item) => {
        if (item.type !== 'variable') return mapSale(item);
        try {
          const variantsResponse = await fetch(`${base}/products?type=variation&parent=${item.id}&on_sale=true&per_page=100`, { next: { revalidate: 60 } });
          if (!variantsResponse.ok) return null;
          const variants = await variantsResponse.json() as StoreProduct[];
          const eligible = variants.map((variant) => mapSale(variant, item)).filter((product): product is SaleProduct => product !== null);
          if (!eligible.length) return null;
          const lowest = eligible.reduce((best, product) => product.currentAmount < best.currentAmount ? product : best);
          return { ...lowest, sizes: [...new Set(eligible.flatMap((product) => product.sizes))] };
        } catch { return null; }
      }));
      results.push(...mapped.filter((product): product is SaleProduct => product !== null));
      if (data.length < 100) break;
    }
    return results;
  } catch {
    return [];
  }
}
