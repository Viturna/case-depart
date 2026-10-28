import { notFound } from 'next/navigation';
import ProductDetailClient from '@/components/ProductDetailClient';
import productsData from '@/data/products.json';
import { ProductItem } from '@/components/Card';

export function generateStaticParams() {
  const allProducts = productsData as ProductItem[];
  return allProducts.map((p) => ({
    slug: p.slug,
  }));
}

interface ProductPageProps {
  params: {
    slug: string;
  };
}

export default function ProductDetailPage({ params }: ProductPageProps) {
  const allProducts = productsData as ProductItem[];
  const product = allProducts.find((p) => p.slug === params.slug);

  if (!product) {
    notFound();
  }

  return <ProductDetailClient product={product} allProducts={allProducts} />;
}
