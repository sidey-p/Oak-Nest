import { Link } from 'react-router-dom';
import { formatPrice, effectivePrice, discountPercent } from '../../utils/format';
import { useCart } from '../../context/CartContext';
import { useState } from 'react';

const Stars = ({ rating, count }) => (
  <div className="flex items-center gap-1 text-xs">
    <span className="text-gold-500">{'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}</span>
    <span className="text-brand-400">({count})</span>
  </div>
);

const ProductCard = ({ product, onWishlist, wishlisted }) => {
  const { addToCart } = useCart();
  const [msg, setMsg] = useState(null);
  const [adding, setAdding] = useState(false);

  const handleAdd = async () => {
    setMsg(null);
    setAdding(true);
    try {
      await addToCart(product.id);
      setMsg('Added to cart ✓');
      setTimeout(() => setMsg(null), 2000);
    } catch (err) {
      setMsg(err.message);
      setTimeout(() => setMsg(null), 3000);
    } finally {
      setAdding(false);
    }
  };

  const outOfStock = product.stock === 0;

  return (
    <div className="card-lift group relative flex flex-col overflow-hidden rounded-2xl border border-brand-200 bg-white shadow-soft">
      <Link to={`/products/${product.slug}`} className="relative block aspect-4/3 overflow-hidden bg-brand-100">
        <img
          src={product.main_image || '/uploads/products/placeholder.svg'}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        {discountPercent(product) > 0 && (
          <span className="animate-pop absolute left-3 top-3 rounded-full bg-red-600 px-2.5 py-1 text-xs font-bold text-white shadow-sm">
            -{discountPercent(product)}%
          </span>
        )}
        {outOfStock && (
          <span className="absolute inset-0 grid place-items-center bg-white/75 text-sm font-semibold text-brand-900 backdrop-blur-[2px]">Out of Stock</span>
        )}
        <span className="absolute bottom-3 left-1/2 -translate-x-1/2 translate-y-3 rounded-full bg-brand-950/85 px-3 py-1 text-[11px] font-semibold text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          Quick view
        </span>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <Link to={`/products/${product.slug}`} className="line-clamp-1 text-sm font-semibold text-brand-900 hover:text-accent-600">
            {product.name}
          </Link>
          {onWishlist && (
            <button onClick={() => onWishlist(product.id)} className={`shrink-0 transition-transform hover:scale-125 ${wishlisted ? 'text-red-500' : 'text-brand-300 hover:text-red-400'}`} aria-label="Wishlist">
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
          disabled={outOfStock || adding}
          className="btn-shine mt-3 w-full rounded-lg bg-brand-900 py-2 text-sm font-semibold text-white transition-all duration-300 hover:bg-brand-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-40"
        >
          {adding ? 'Adding…' : 'Add to Cart'}
        </button>
        {msg && <p className="mt-2 animate-fade-up text-center text-xs font-medium text-accent-600">{msg}</p>}
      </div>
    </div>
  );
};

export default ProductCard;
