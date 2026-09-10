import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api, { errorMessage } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Alert, Badge, Spinner } from '../components/common/UI';
import { formatPrice, formatDate, effectivePrice, discountPercent } from '../utils/format';

const Stars = ({ n, onChange, readOnly }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((i) => (
      <button key={i} type="button" disabled={readOnly} onClick={() => onChange?.(i)}
        className={`text-2xl ${i <= n ? 'text-amber-500' : 'text-brand-200'} ${readOnly ? '' : 'transition hover:scale-110'}`}>
        ★
      </button>
    ))}
  </div>
);

const ProductDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToCart, toggleWishlist } = useCart();

  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [reviews, setReviews] = useState({ reviews: [], stats: { avg_rating: 0, total: 0, distribution: {} } });
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMsg, setActionMsg] = useState(null);
  const [activeImage, setActiveImage] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewMsg, setReviewMsg] = useState(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const { data } = await api.get(`/products/${slug}`);
        setProduct(data.product);
        setImages(data.images.length ? data.images : [{ image_url: data.product.main_image }]);
        const rev = await api.get(`/reviews/products/${data.product.id}/reviews`);
        setReviews(rev.data);
      } catch (err) {
        setError(errorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [slug]);

  if (loading) return <div className="min-h-[50vh] grid place-items-center"><Spinner /></div>;
  if (error) return <div className="mx-auto max-w-3xl px-4 py-16"><Alert>{error}</Alert></div>;
  if (!product) return null;

  const price = effectivePrice(product);
  const outOfStock = product.stock === 0;

  const handleAdd = async () => {
    setActionMsg(null);
    try {
      await addToCart(product.id, qty);
      setActionMsg('Added to cart ✓');
      setTimeout(() => setActionMsg(null), 2500);
    } catch (err) {
      setActionMsg(errorMessage(err));
    }
  };

  const handleWishlist = async () => {
    try {
      await toggleWishlist(product.id);
      setActionMsg('Saved to wishlist ♥');
      setTimeout(() => setActionMsg(null), 2500);
    } catch (err) {
      setActionMsg(errorMessage(err));
    }
  };

  const submitReview = async (e) => {
    e.preventDefault();
    setReviewMsg(null);
    try {
      const { data } = await api.post(`/reviews/products/${product.id}/reviews`, {
        rating: reviewRating, comment: reviewComment,
      });
      setReviewMsg({ type: 'success', text: data.message });
      setShowReviewForm(false);
      const rev = await api.get(`/reviews/products/${product.id}/reviews`);
      setReviews(rev.data);
    } catch (err) {
      setReviewMsg({ type: 'error', text: errorMessage(err) });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <nav className="text-xs text-brand-500">
        <Link to="/products" className="hover:text-accent-600">Shop</Link>
        {' / '}
        <Link to={`/products?category=${product.category_slug}`} className="hover:text-accent-600">{product.category_name}</Link>
        {' / '}
        <span className="text-brand-800">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div>
          <div className="overflow-hidden rounded-2xl border border-brand-200 bg-white">
            <img src={images[activeImage]?.image_url || product.main_image} alt={product.name}
              className="aspect-[4/3] w-full object-cover" />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {images.map((img, i) => (
                <button key={img.id || i} onClick={() => setActiveImage(i)}
                  className={`h-20 w-24 overflow-hidden rounded-xl border-2 ${i === activeImage ? 'border-accent-600' : 'border-transparent'}`}>
                  <img src={img.image_url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center gap-3">
            <Badge>{product.brand}</Badge>
            {product.stock > 0
              ? <Badge color="green">In Stock ({product.stock})</Badge>
              : <Badge color="red">Out of Stock</Badge>}
          </div>
          <h1 className="mt-3 font-serif text-3xl font-bold text-brand-900">{product.name}</h1>
          <div className="mt-2 flex items-center gap-3">
            <Stars n={Math.round(Number(reviews.stats.avg_rating))} readOnly />
            <span className="text-sm text-brand-500">{reviews.stats.avg_rating} ({reviews.stats.total} reviews)</span>
          </div>

          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-3xl font-bold text-brand-900">{formatPrice(price)}</span>
            {product.discount_price && (
              <>
                <span className="text-lg text-brand-400 line-through">{formatPrice(product.price)}</span>
                <Badge color="red">Save {discountPercent(product)}%</Badge>
              </>
            )}
          </div>

          <p className="mt-5 leading-relaxed text-brand-600">{product.description}</p>

          <dl className="mt-6 grid grid-cols-2 gap-4 rounded-xl border border-brand-200 bg-white p-5 text-sm">
            <div><dt className="text-brand-500">Material</dt><dd className="font-semibold text-brand-900">{product.material || '—'}</dd></div>
            <div><dt className="text-brand-500">Brand</dt><dd className="font-semibold text-brand-900">{product.brand || '—'}</dd></div>
            <div><dt className="text-brand-500">Category</dt><dd className="font-semibold text-brand-900">{product.category_name}</dd></div>
            <div><dt className="text-brand-500">SKU</dt><dd className="font-semibold text-brand-900">FE-{String(product.id).padStart(4, '0')}</dd></div>
          </dl>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-xl border border-brand-300 bg-white">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-3 text-lg text-brand-600 hover:text-brand-900">−</button>
              <span className="w-10 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock || 99, qty + 1))} className="px-4 py-3 text-lg text-brand-600 hover:text-brand-900">+</button>
            </div>
            <button onClick={handleAdd} disabled={outOfStock}
              className="flex-1 min-w-[180px] rounded-xl bg-brand-800 px-8 py-3.5 font-semibold text-white hover:bg-brand-700 disabled:opacity-40">
              Add to Cart
            </button>
            <button onClick={handleWishlist} disabled={!user}
              className="rounded-xl border border-brand-300 bg-white px-5 py-3.5 font-medium hover:border-red-300 hover:text-red-500 disabled:opacity-40"
              title={user ? 'Save to wishlist' : 'Login to save'}>
              ♥ Wishlist
            </button>
          </div>
          {actionMsg && <p className="mt-3 text-sm font-medium text-accent-600">{actionMsg}</p>}
          {!user && <p className="mt-3 text-xs text-brand-400"><Link to="/login" className="underline">Login</Link> to add items to cart & wishlist.</p>}
        </div>
      </div>

      {/* Reviews */}
      <section className="mt-16">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold text-brand-900">Customer Reviews</h2>
          {user && !showReviewForm && (
            <button onClick={() => setShowReviewForm(true)} className="rounded-lg border border-brand-300 bg-white px-5 py-2 text-sm font-semibold hover:border-accent-500">
              Write a Review
            </button>
          )}
        </div>

        {reviewMsg && (
          <div className="mt-6"><Alert type={reviewMsg.type}>{reviewMsg.text}</Alert></div>
        )}

        {showReviewForm && (
          <form onSubmit={submitReview} className="mt-6 rounded-2xl border border-brand-200 bg-white p-6">
            <label className="text-sm font-semibold text-brand-800">Your rating</label>
            <div className="mt-2"><Stars n={reviewRating} onChange={setReviewRating} /></div>
            <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} rows="4"
              placeholder="Share your experience with this product..."
              className="mt-4 w-full rounded-xl border border-brand-300 p-3 text-sm outline-none focus:border-accent-500" />
            <div className="mt-4 flex gap-3">
              <button className="rounded-lg bg-brand-800 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">Submit Review</button>
              <button type="button" onClick={() => setShowReviewForm(false)} className="rounded-lg border border-brand-300 px-6 py-2.5 text-sm">Cancel</button>
            </div>
          </form>
        )}

        <div className="mt-6 grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="rounded-2xl border border-brand-200 bg-white p-6 h-fit">
            <div className="text-center">
              <div className="text-4xl font-bold text-brand-900">{reviews.stats.avg_rating}</div>
              <Stars n={Math.round(Number(reviews.stats.avg_rating))} readOnly />
              <p className="mt-1 text-xs text-brand-500">{reviews.stats.total} reviews</p>
            </div>
            <div className="mt-4 space-y-1.5">
              {[5, 4, 3, 2, 1].map((r) => (
                <div key={r} className="flex items-center gap-2 text-xs">
                  <span className="w-3">{r}</span>
                  <div className="h-2 flex-1 rounded-full bg-brand-100">
                    <div className="h-full rounded-full bg-amber-500"
                      style={{ width: `${reviews.stats.total ? ((reviews.stats.distribution[r] || 0) / reviews.stats.total) * 100 : 0}%` }} />
                  </div>
                  <span className="w-6 text-right text-brand-500">{reviews.stats.distribution?.[r] || 0}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            {reviews.reviews.length === 0 && <p className="rounded-2xl border border-dashed border-brand-300 bg-white p-8 text-center text-sm text-brand-500">No reviews yet. Be the first to review!</p>}
            {reviews.reviews.map((r) => (
              <div key={r.id} className="rounded-2xl border border-brand-200 bg-white p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-200 text-sm font-bold text-brand-700">
                      {r.first_name?.[0]}{r.last_name?.[0]}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-brand-900">{r.first_name} {r.last_name}</p>
                      <p className="text-xs text-brand-400">{formatDate(r.created_at)}</p>
                    </div>
                  </div>
                  <Stars n={r.rating} readOnly />
                </div>
                {r.comment && <p className="mt-3 text-sm leading-relaxed text-brand-700">{r.comment}</p>}
                {r.status === 'pending' && <p className="mt-2 text-xs text-amber-600">Pending approval</p>}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default ProductDetails;
