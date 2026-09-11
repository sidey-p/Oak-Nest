import { Link } from 'react-router-dom';
import { Heart, Eye, ShoppingBag, Check } from 'lucide-react';
import { formatPrice, effectivePrice, discountPercent } from '../../utils/format';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { useState } from 'react';

export const productTag = (p) => {
  if (p.stock > 0 && p.stock <= 5) return { label: 'Limited Stock', cls: 'bg-red-600 text-white' };
  const ageDays = (Date.now() - new Date(p.created_at)) / 86400000;
  if (ageDays <= 30) return { label: 'New', cls: 'bg-gold-500 text-brand-950' };
  if (Number(p.avg_rating) >= 4.5 && Number(p.review_count) >= 2) return { label: 'Most Loved', cls: 'bg-accent-600 text-white' };
  if (Number(p.review_count) >= 2) return { label: 'Bestseller', cls: 'bg-brand-900 text-white' };
  return null;
};

const Stars = ({ rating, count }) => (
  <div className="flex items-center gap-1 text-xs">
    <span className="text-gold-500">{'★'.repeat(Math.round(rating))}{'☆'.repeat(5 - Math.round(rating))}</span>
    {count > 0 && <span className="text-brand-500">{Number(rating).toFixed(1)} ({count})</span>}
  </div>
);

const ProductCard = ({ product, onWishlist, wishlisted, onQuickView, onCompare, comparing }) => {
  const { addToCart } = useCart();
  const { user } = useAuth();
  const [msg, setMsg] = useState(null);
  const tag = productTag(product);
  const outOfStock = product.stock === 0;

  const handleAdd = async () => {
    setMsg(null);
    try {
      await addToCart(product.id);
      setMsg('Added to your space');
      setTimeout(() => setMsg(null), 2000);
    } catch (err) {
      setMsg(err.message);
      setTimeout(() => setMsg(null), 3000);
    }
  };

  const handleWishlist = async () => {
    if (!onWishlist) return;
    await onWishlist(product.id);
  };

  return (
    <div className="card-lift group relative flex flex-col overflow-hidden rounded-2xl border border-brand-200 bg-white shadow-soft">
      <Link to={`/products/${product.slug}`} className="relative block aspect-4/3 overflow-hidden bg-brand-100">
        <img
          src={product.main_image || '/uploads/products/placeholder.svg'}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => { e.currentTarget.style.display = 'none'; }}
        />
        {discountPercent(product) > 0 && (
          <span className="absolute left-3 top-3 rounded-full bg-brand-950/80 px-2.5 py-1 text-[10px] font-bold text-gold-300">
            Save {discountPercent(product)}%
          </span>
        )}
        {outOfStock && (
          <span className="absolute inset-0 grid place-items-center bg-white/70 text-sm font-semibold text-brand-900">Currently unavailable</span>
        )}

        {/* Hover actions */}
        <div className="absolute right-3 top-3 flex flex-col gap-1.5 opacity-0 transition-all duration-300 group-hover:opacity-100">
          {onQuickView && (
            <button onClick={(e) => { e.preventDefault(); onQuickView(product); }} title="Quick view"
              className="grid h-9 w-9 place-items-center rounded-full bg-white/95 text-brand-800 shadow-soft transition hover:bg-brand-100">
              <Eye className="h-4 w-4" />
            </button>
          )}
          {onWishlist && (
            <button onClick={(e) => { e.preventDefault(); handleWishlist(); }} title={wishlisted ? 'Saved' : 'Save for later'}
              className={`grid h-9 w-9 place-items-center rounded-full shadow-soft transition ${wishlisted ? 'bg-red-500 text-white' : 'bg-white/95 text-brand-800 hover:bg-red-50 hover:text-red-500'}`}>
              <Heart className={`h-4 w-4 ${wishlisted ? 'fill-current' : ''}`} />
            </button>
          )}
          {!outOfStock && (
            <button onClick={(e) => { e.preventDefault(); handleAdd(); }} title="Add to your space"
              className="grid h-9 w-9 place-items-center rounded-full bg-brand-900 text-white shadow-soft transition hover:bg-brand-800">
              <ShoppingBag className="h-4 w-4" />
            </button>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        {tag && <span className={`mb-2 w-fit rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${tag.cls}`}>{tag.label}</span>}
        <Link to={`/products/${product.slug}`} className="line-clamp-1 text-sm font-semibold text-brand-900 transition hover:text-accent-600">
          {product.name}
        </Link>
        <p className="mt-0.5 line-clamp-1 text-xs text-brand-500">{product.category_name}</p>
        <Stars rating={Number(product.avg_rating)} count={Number(product.review_count)} />
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-base font-bold text-brand-900">{formatPrice(effectivePrice(product))}</span>
          {product.discount_price && <span className="text-xs text-brand-400 line-through">{formatPrice(product.price)}</span>}
        </div>

        <div className="mt-2 flex items-center justify-between text-xs">
          {outOfStock
            ? <span className="text-red-600">Out of stock</span>
            : <span className="flex items-center gap-1 text-accent-700"><span className="h-1.5 w-1.5 rounded-full bg-accent-500" /> In stock</span>}
          {onCompare && !outOfStock && (
            <label className="flex cursor-pointer items-center gap-1 text-brand-500 hover:text-accent-600" onClick={(e) => e.preventDefault()}>
              <input type="checkbox" checked={!!comparing} onChange={() => onCompare(product)} className="h-3.5 w-3.5 accent-accent-600" />
              Compare
            </label>
          )}
        </div>

        <button
          onClick={handleAdd}
          disabled={outOfStock}
          className="btn-shine mt-3 w-full rounded-full bg-brand-900 py-2.5 text-sm font-semibold text-white transition-all hover:bg-brand-800 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {outOfStock ? 'Unavailable' : 'Add to your space'}
        </button>
        {msg && <p className="mt-2 flex items-center justify-center gap-1 text-center text-xs font-medium text-accent-600"><Check className="h-3 w-3" /> {msg}</p>}
        {!user && <p className="mt-1.5 text-center text-[10px] text-brand-400"><Link to="/login" className="underline">Login</Link> to save &amp; order</p>}
      </div>
    </div>
  );
};

export default ProductCard;
