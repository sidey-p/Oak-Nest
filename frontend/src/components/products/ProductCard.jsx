import { Link } from 'react-router-dom';
import { formatPrice, effectivePrice, discountPercent } from '../../utils/format';
import { useCart } from '../../context/CartContext';
import { useState } from 'react';

const Stars = ({ rating, count }) => (
  <div className="flex items-center gap-1 text-xs">
    <span className="text-amber-500">{'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}</span>
    <span className="text-brand-500">({count})</span>
  </div>
);

const ProductCard = ({ product, onWishlist, wishlisted }) => {
  const { addToCart } = useCart();
  const [msg, setMsg] = useState(null);

  const handleAdd = async () => {
    setMsg(null);
    try {
      await addToCart(product.id);
      setMsg('Added to cart ✓');
      setTimeout(() => setMsg(null), 2000);
    } catch (err) {
      setMsg(err.message);
      setTimeout(() => setMsg(null), 3000);
    }
  };

  const outOfStock = product.stock === 0;

  return (
    <div className="group relative flex flex-col overflow-hidden rounded-2xl border border-brand-200 bg-white shadow-sm transition hover:shadow-lg">
      <Link to={`/products/${product.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-brand-100">
        <img
          src={product.main_image || '/uploads/products/placeholder.svg'}
          alt={product.name}
          className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        {discountPercent(product) > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white">
            -{discountPercent(product)}%
          </span>
        )}
        {outOfStock && (
          <span className="absolute inset-0 grid place-items-center bg-white/70 text-sm font-semibold text-brand-900">Out of Stock</span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/products/${product.slug}`} className="line-clamp-1 text-sm font-semibold text-brand-900 hover:text-accent-600">
            {product.name}
          </Link>
          {onWishlist && (
            <button onClick={() => onWishlist(product.id)} className={`shrink-0 ${wishlisted ? 'text-red-500' : 'text-brand-300 hover:text-red-400'}`} aria-label="Wishlist">
              <svg className="h-5 w-5" fill={wishlisted ? 'currentColor' : 'none'} viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
            </button>
          )}
        </div>
        <p className="mt-0.5 text-xs text-brand-500">{product.brand} · {product.material}</p>
        <Stars rating={Number(product.avg_rating)} count={product.review_count} />
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-bold text-brand-900">{formatPrice(effectivePrice(product))}</span>
          {product.discount_price && <span className="text-xs text-brand-400 line-through">{formatPrice(product.price)}</span>}
        </div>
        <button
          onClick={handleAdd}
          disabled={outOfStock}
          className="mt-3 w-full rounded-lg bg-brand-800 py-2 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Add to Cart
        </button>
        {msg && <p className="mt-2 text-center text-xs font-medium text-accent-600">{msg}</p>}
      </div>
    </div>
  );
};

export default ProductCard;
