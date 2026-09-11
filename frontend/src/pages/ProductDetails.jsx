import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Truck, Heart, ShoppingBag, Check, ArrowRight, Ruler, Package, Sparkles, MessageCircle } from 'lucide-react';
import api, { errorMessage } from '../services/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useRecent } from '../hooks/useRecent';
import { Alert, Badge, Spinner, SectionHeading } from '../components/common/UI';
import { formatPrice, formatDate, effectivePrice, discountPercent } from '../utils/format';

const Stars = ({ n, onChange, readOnly }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((i) => (
      <button key={i} type="button" disabled={readOnly} onClick={() => onChange?.(i)}
        className={`text-2xl transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${i <= n ? 'text-gold-500' : 'text-brand-200'} ${readOnly ? '' : 'hover:scale-125'}`}>
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
  const { addRecent } = useRecent();

  const [product, setProduct] = useState(null);
  const [images, setImages] = useState([]);
  const [reviews, setReviews] = useState({ reviews: [], stats: { avg_rating: 0, total: 0, distribution: {} } });
  const [related, setRelated] = useState([]);
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
        addRecent({ id: data.product.id, slug: data.product.slug, name: data.product.name, main_image: data.product.main_image, price: data.product.price, discount_price: data.product.discount_price });
        const [rev, rel] = await Promise.all([
          api.get(`/reviews/products/${data.product.id}/reviews`),
          api.get('/products', { params: { category: data.product.category_id, perPage: 4 } }),
        ]);
        setReviews(rev.data);
        setRelated(rel.data.products.filter((p) => p.id !== data.product.id).slice(0, 4));
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
      <nav className="animate-fade-in text-xs text-brand-500">
        <Link to="/products" className="underline-grow hover:text-accent-600">Shop</Link>
        {' / '}
        <Link to={`/products?category=${product.category_slug}`} className="underline-grow hover:text-accent-600">{product.category_name}</Link>
        {' / '}
        <span className="text-brand-800">{product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="reveal">
          <div className="group overflow-hidden rounded-2xl border border-brand-200 bg-white shadow-soft">
            <img src={images[activeImage]?.image_url || product.main_image} alt={product.name}
              className="aspect-4/3 w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-105" />
          </div>
          {images.length > 1 && (
            <div className="mt-3 flex gap-3">
              {images.map((img, i) => (
                <button key={img.id || i} onClick={() => setActiveImage(i)}
                  className={`h-20 w-24 overflow-hidden rounded-xl border-2 transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] ${i === activeImage ? 'border-accent-600 shadow-glow' : 'border-transparent opacity-70 hover:opacity-100'}`}>
                  <img src={img.image_url} alt="" className="h-full w-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="reveal" style={{ animationDelay: '100ms' }}>
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

          {/* Why You'll Love It */}
          <div className="mt-6 rounded-2xl border border-gold-400/40 bg-gold-300/15 p-5">
            <p className="flex items-center gap-2 text-sm font-semibold text-brand-900"><Sparkles className="h-4 w-4 text-gold-600" /> Why you'll love it</p>
            <p className="mt-2 text-xs leading-relaxed text-brand-600">
              Designed for everyday comfort with a timeless look that fits naturally into modern spaces.
            </p>
            <ul className="mt-3 grid gap-1.5 text-xs text-brand-700 sm:grid-cols-2">
              {['Comfortable for everyday use', 'Thoughtfully designed', 'Built for lasting use', 'Easy to style with your existing space'].map((b) => (
                <li key={b} className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 shrink-0 text-accent-600" /> {b}</li>
              ))}
            </ul>
          </div>

          {/* Good to Know */}
          <dl className="mt-6 grid grid-cols-2 gap-4 rounded-2xl border border-brand-200 bg-white p-5 text-sm">
            <div><dt className="flex items-center gap-1.5 text-brand-500"><Ruler className="h-3.5 w-3.5" /> Material</dt><dd className="font-semibold text-brand-900">{product.material || '—'}</dd></div>
            <div><dt className="flex items-center gap-1.5 text-brand-500"><Package className="h-3.5 w-3.5" /> Brand</dt><dd className="font-semibold text-brand-900">{product.brand || '—'}</dd></div>
            <div><dt className="text-brand-500">Category</dt><dd className="font-semibold text-brand-900">{product.category_name}</dd></div>
            <div><dt className="text-brand-500">SKU</dt><dd className="font-semibold text-brand-900">ON-{String(product.id).padStart(4, '0')}</dd></div>
          </dl>

          {/* Delivery estimate */}
          <div className="mt-4 flex items-center gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4 text-sm">
            <Truck className="h-5 w-5 shrink-0 text-accent-600" />
            <p className="text-brand-700"><span className="font-semibold">Estimated delivery: 5–7 business days.</span> We'll keep you updated every step of the way.</p>
          </div>

          <div className="mt-7 flex flex-wrap items-center gap-4">
            <div className="flex items-center rounded-full border border-brand-300 bg-white shadow-soft">
              <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-3 text-lg text-brand-600 transition hover:text-brand-900">−</button>
              <span className="w-10 text-center font-semibold">{qty}</span>
              <button onClick={() => setQty(Math.min(product.stock || 99, qty + 1))} className="px-4 py-3 text-lg text-brand-600 transition hover:text-brand-900">+</button>
            </div>
            <button onClick={handleAdd} disabled={outOfStock}
              className="btn-shine flex-1 min-w-[180px] rounded-full bg-brand-900 px-8 py-3.5 font-semibold text-white shadow-sm transition-all hover:bg-brand-800 hover:shadow-md disabled:opacity-40">
              <span className="inline-flex items-center gap-2"><ShoppingBag className="h-4 w-4" /> Add to your space</span>
            </button>
            <button onClick={handleWishlist} disabled={!user}
              className="rounded-full border border-brand-300 bg-white px-5 py-3.5 font-medium transition hover:border-red-300 hover:text-red-500 disabled:opacity-40"
              title={user ? 'Save for later' : 'Login to save'}>
              <span className="inline-flex items-center gap-2"><Heart className="h-4 w-4" /> Save for later</span>
            </button>
          </div>
          {actionMsg && <p className="mt-3 animate-fade-up text-sm font-medium text-accent-600">{actionMsg}</p>}
          {!user && <p className="mt-3 text-xs text-brand-400"><Link to="/login" className="underline">Login</Link> to save pieces & create orders.</p>}
        </div>
      </div>

      {/* Complete the Look */}
      {related.length > 0 && (
        <section className="mt-16">
          <SectionHeading eyebrow="You might love these too" title="Complete the look." subtitle="A few thoughtful pieces can bring an entire space together." />
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((p) => (
              <Link key={p.id} to={`/products/${p.slug}`} className="card-lift group overflow-hidden rounded-2xl border border-brand-200 bg-white shadow-soft">
                <div className="aspect-4/3 overflow-hidden bg-brand-100">
                  <img src={p.main_image} alt={p.name} className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110" />
                </div>
                <div className="p-4">
                  <p className="line-clamp-1 text-sm font-semibold text-brand-900">{p.name}</p>
                  <p className="mt-1 text-sm font-bold text-brand-700">{formatPrice(effectivePrice(p))}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Reviews */}
      <section className="mt-16">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-2xl font-bold text-brand-900">Loved in real homes</h2>
          {user && !showReviewForm && (
            <button onClick={() => setShowReviewForm(true)} className="rounded-full border border-brand-300 bg-white px-5 py-2 text-sm font-semibold transition hover:border-accent-500 hover:shadow-soft">
              Write a Review
            </button>
          )}
        </div>

        {reviewMsg && (
          <div className="mt-6"><Alert type={reviewMsg.type}>{reviewMsg.text}</Alert></div>
        )}

        {showReviewForm && (
          <form onSubmit={submitReview} className="reveal mt-6 rounded-2xl border border-brand-200 bg-white p-6 shadow-soft">
            <label className="text-sm font-semibold text-brand-800">Your rating</label>
            <div className="mt-2"><Stars n={reviewRating} onChange={setReviewRating} /></div>
            <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} rows="4"
              placeholder="Share your experience with this product..."
              className="mt-4 w-full rounded-xl border border-brand-300 p-3 text-sm outline-none focus:border-accent-500" />
            <div className="mt-4 flex gap-3">
              <button className="btn-shine rounded-full bg-brand-900 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800">Submit Review</button>
              <button type="button" onClick={() => setShowReviewForm(false)} className="rounded-full border border-brand-300 px-6 py-2.5 text-sm transition hover:bg-brand-50">Cancel</button>
            </div>
          </form>
        )}

        <div className="mt-6 grid gap-4 lg:grid-cols-[280px_1fr]">
          <div className="reveal rounded-2xl border border-brand-200 bg-white p-6 h-fit shadow-soft">
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
                    <div className="h-full rounded-full bg-gold-500 transition-all duration-1000 ease-[cubic-bezier(0.22,1,0.36,1)]"
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
              <div key={r.id} className="card-lift rounded-2xl border border-brand-200 bg-white p-5 shadow-soft">
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
