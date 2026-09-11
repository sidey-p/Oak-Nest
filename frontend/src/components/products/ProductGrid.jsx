import ProductCard from './ProductCard';

const ProductGrid = ({ products, onWishlist, wishlistIds, loading, onCompare, compareList, empty = 'No products found.' }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="animate-pulse rounded-2xl border border-brand-200 bg-white">
            <div className="aspect-4/3 rounded-t-2xl bg-brand-100" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-3/4 rounded bg-brand-100" />
              <div className="h-3 w-1/2 rounded bg-brand-100" />
              <div className="h-8 rounded bg-brand-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products?.length) {
    return <div className="rounded-2xl border border-dashed border-brand-300 bg-white p-12 text-center text-brand-500">{empty}</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p) => (
        <ProductCard
          key={p.id}
          product={p}
          onWishlist={onWishlist}
          wishlisted={wishlistIds?.has(p.id)}
          onCompare={onCompare}
          comparing={compareList?.includes(p.id)}
        />
      ))}
    </div>
  );
};

export default ProductGrid;
