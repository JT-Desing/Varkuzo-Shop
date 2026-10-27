export type Product = {
  id: string;
  slug: string;
  name: string;
  category: 'Buzos' | 'Camisetas' | 'Pantalones' | 'Accesorios';
  description: string;
  images: string[];
  price: string | null;
  color: string;
  available: boolean;
  demo: boolean;
  colorVariants: { name: string; image: string; variationId?: number }[];
};

export const demoProducts: Product[] = [
  {
    id: 'demo-01', slug: 'buzo-trazo', name: 'Buzo Trazo', category: 'Buzos',
    description: 'Silueta amplia, lavado oscuro y gráfica de pincel que recorre la prenda.',
    images: ['/images/buzo-frente-espalda.png', '/images/buzo-varkuzo-vkz.png'],
    price: null, color: 'Carbón lavado', available: false, demo: true,
    colorVariants: [{ name: 'Carbón lavado', image: '/images/buzo-frente-espalda.png' }, { name: 'Marfil lavado', image: '/images/buzo-trazo-marfil-concepto.png' }],
  },
  {
    id: 'demo-02', slug: 'camiseta-vkz', name: 'Camiseta VKZ', category: 'Camisetas',
    description: 'Gráfica de gran escala sobre algodón de tacto pesado.',
    images: ['/images/camiseta-editorial.png'],
    price: null, color: 'Negro lavado', available: false, demo: true, colorVariants: [],
  },
  {
    id: 'demo-03', slug: 'pantalon-trazo', name: 'Pantalón Trazo', category: 'Pantalones',
    description: 'Denim de silueta amplia con gráfica tonal que recorre las piernas.',
    images: ['/images/pantalon-editorial.png'],
    price: null, color: 'Negro lavado', available: false, demo: true, colorVariants: [],
  },
  {
    id: 'demo-04', slug: 'gorro-vkz', name: 'Gorro VKZ', category: 'Accesorios',
    description: 'Tejido negro con monograma VKZ bordado al frente.',
    images: ['/images/gorro-vkz.png'],
    price: null, color: 'Negro', available: false, demo: true, colorVariants: [],
  },
  {
    id: 'demo-05', slug: 'buzo-firma', name: 'Buzo Firma', category: 'Buzos',
    description: 'Firma Varkuzo al frente y monograma VKZ en la espalda.',
    images: ['/images/buzo-varkuzo-vkz.png', '/images/buzo-frente-espalda.png'],
    price: null, color: 'Negro mineral', available: false, demo: true, colorVariants: [],
  },
];

type WooProduct = {
  id: number; slug: string; name: string; description?: string;
  short_description?: string; images?: { src: string }[];
  prices?: { price: string; currency_symbol: string; currency_minor_unit: number };
  categories?: { name: string }[]; is_in_stock?: boolean;
  type?: string;
  variations?: { id: number; attributes?: { name: string; value: string }[] }[];
  attributes?: { name: string; terms?: { name: string; slug: string }[] }[];
};

type WooVariation = { id: number; images?: { src: string }[]; attributes?: { name: string; value: string }[] };

function colorVariants(item: WooProduct, variations: WooVariation[]) {
  const colorAttribute = item.attributes?.find((attribute) => /colou?r/i.test(attribute.name));
  if (!colorAttribute) return [];
  const byId = new Map(variations.map((variation) => [variation.id, variation]));
  const seenNames = new Set<string>();
  const seenImages = new Set<string>();
  return (item.variations ?? []).flatMap((reference) => {
    const variation = byId.get(reference.id);
    const attribute = (reference.attributes ?? variation?.attributes ?? []).find((entry) => entry.name.toLowerCase() === colorAttribute.name.toLowerCase());
    const value = attribute?.value?.trim();
    const image = variation?.images?.[0]?.src;
    if (!value || !image || seenNames.has(value.toLowerCase()) || seenImages.has(image)) return [];
    seenNames.add(value.toLowerCase());
    seenImages.add(image);
    const name = colorAttribute.terms?.find((term) => term.slug === value || term.name === value)?.name ?? value;
    return [{ name, image, variationId: reference.id }];
  });
}

function stripHtml(value: string) {
  return value.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
}

function mapWooProduct(item: WooProduct, variations: WooVariation[] = []): Product {
  const category = item.categories?.find((c) => /buzo|camiseta|pantal|accesori/i.test(c.name))?.name ?? 'Buzos';
  const normalizedCategory = /camiseta/i.test(category) ? 'Camisetas' : /pantal/i.test(category) ? 'Pantalones' : /accesori/i.test(category) ? 'Accesorios' : 'Buzos';
  const amount = item.prices ? Number(item.prices.price) / 10 ** item.prices.currency_minor_unit : null;
  return {
    id: String(item.id), slug: item.slug, name: stripHtml(item.name), category: normalizedCategory,
    description: stripHtml(item.short_description || item.description || ''),
    images: item.images?.map((image) => image.src).filter(Boolean) ?? [],
    price: amount === null ? null : new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(amount),
    color: 'Ver opciones', available: Boolean(item.is_in_stock), demo: false, colorVariants: colorVariants(item, variations),
  };
}

export async function getProducts(): Promise<Product[]> {
  const base = process.env.WC_STORE_API_URL;
  if (!base) return demoProducts;
  try {
    const response = await fetch(`${base}/products?per_page=24`, { next: { revalidate: 60 } });
    if (!response.ok) return demoProducts;
    const data = (await response.json()) as WooProduct[];
    if (!data.length) return demoProducts;
    return Promise.all(data.map(async (item) => {
      if (item.type !== 'variable' || (item.variations?.length ?? 0) < 2) return mapWooProduct(item);
      try {
        const response = await fetch(`${base}/products?type=variation&parent=${item.id}&per_page=100`, { next: { revalidate: 60 } });
        if (!response.ok) return mapWooProduct(item);
        return mapWooProduct(item, await response.json() as WooVariation[]);
      } catch { return mapWooProduct(item); }
    }));
  } catch {
    return demoProducts;
  }
}

export async function getProduct(slug: string): Promise<Product | undefined> {
  const all = await getProducts();
  return all.find((product) => product.slug === slug);
}
