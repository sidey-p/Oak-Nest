import ProductCard from './ProductCard';

const ProductGrid = ({ products, onWishlist, wishlistIds, loading, empty = 'No products found.' }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="overflow-hidden rounded-2xl border border-brand-200 bg-white">
            <div className="aspect-4/3 skeleton-shimmer" />
            <div className="space-y-2 p-4">
              <div className="h-4 w-3/4 rounded skeleton-shimmer" />
              <div className="h-3 w-1/2 rounded skeleton-shimmer" />
              <div className="h-8 rounded skeleton-shimmer" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products?.length) {
    return <div className="animate-fade-up rounded-2xl border border-dashed border-brand-300 bg-white/70 p-12 text-center text-brand-500">{empty}</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((p, i) => (
        <div key={p.id} className="reveal" style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}>
          <ProductCard product={p} onWishlist={onWishlist} wishlisted={wishlistIds?.has(p.id)} />
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;
