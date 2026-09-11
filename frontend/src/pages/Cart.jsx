import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import api, { errorMessage } from '../services/api';
import { Alert, Empty, SectionHeading } from '../components/common/UI';
import { formatPrice, effectivePrice } from '../utils/format';

const Cart = () => {
  const { cart, cartCount, updateQuantity, removeItem, loading } = useCart();
  const navigate = useNavigate();
  const [couponCode, setCouponCode] = useState('');
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [popular, setPopular] = useState([]);

  useEffect(() => {
    if (cartCount === 0) {
      api.get('/products', { params: { sort: 'popular', perPage: 4 } })
        .then((d) => setPopular(d.data.products))
        .catch(() => {});
    }
  }, [cartCount]);

  const totals = cart.totals || {};
  const discount = coupon
    ? (coupon.discount_type === 'percentage'
        ? (totals.subtotal * coupon.discount_value / 100)
        : Math.min(coupon.discount_value, totals.subtotal))
    : 0;
  const grandTotal = coupon ? totals.total - discount : totals.total;

  const applyCoupon = async (e) => {
    e.preventDefault();
    setCouponError(null);
    setCoupon(null);
    try {
      const { data } = await api.post('/coupons/validate', { code: couponCode });
      setCoupon(data.coupon);
    } catch (err) {
      setCouponError(errorMessage(err));
    }
  };

  if (!loading && cartCount === 0) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16">
        <Empty icon={<ShoppingBag className="h-7 w-7 text-brand-500" />} title="Your space is waiting." subtitle="Your cart is empty, but your next favorite piece might be just a click away.">
          <Link to="/products" className="btn-shine inline-block rounded-full bg-brand-900 px-8 py-3 text-sm font-bold text-white hover:bg-brand-800">Explore Furniture →</Link>
        </Empty>

        {popular.length > 0 && (
          <section className="mt-14">
            <SectionHeading eyebrow="Popular right now" title="You might love these too." />
            <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {popular.map((p) => (
                <Link key={p.id} to={`/products/${p.slug}`} className="card-lift group overflow-hidden rounded-2xl border border-brand-200 bg-white shadow-soft">
                  <div className="aspect-4/3 overflow-hidden bg-brand-100">
                    <img src={p.main_image} alt={p.name} className="h-full w-full object-cover transition duration-500 group-hover:scale-110" />
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
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="reveal font-serif text-3xl font-bold text-brand-900">Shopping Cart</h1>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-4">
          {cart.items.map((item, i) => (
            <div key={item.id} className="card-lift reveal flex gap-4 rounded-2xl border border-brand-200 bg-white p-4 shadow-soft" style={{ animationDelay: `${i * 60}ms` }}>
              <Link to={`/products/${item.slug}`} className="h-24 w-28 shrink-0 overflow-hidden rounded-xl bg-brand-100">
                <img src={item.main_image} alt={item.name} className="h-full w-full object-cover transition-transform duration-300 hover:scale-110" />
              </Link>
              <div className="flex flex-1 flex-col">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <Link to={`/products/${item.slug}`} className="text-sm font-semibold text-brand-900 hover:text-accent-600">{item.name}</Link>
                    <p className="text-xs text-brand-500">{item.brand} · {item.material}</p>
                    <p className="mt-1 text-xs text-brand-400">₹{formatPrice(item.price)} each</p>
                  </div>
                  <button onClick={() => removeItem(item.id)} className="text-xs font-semibold text-red-600 hover:underline">Remove</button>
                </div>
                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="flex items-center rounded-full border border-brand-300">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-3 py-1.5 text-brand-600 transition hover:text-brand-900">−</button>
                    <span className="w-8 text-center text-sm font-semibold">{item.quantity}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-3 py-1.5 text-brand-600 transition hover:text-brand-900">+</button>
                  </div>
                  <span className="font-bold text-brand-900">{formatPrice(Number(item.price) * item.quantity)}</span>
                </div>
                {item.quantity > item.stock && (
                  <p className="mt-1 text-xs text-red-600">Only {item.stock} in stock — reduce quantity</p>
                )}
              </div>
            </div>
          ))}
          <Link to="/products" className="underline-grow inline-block text-sm font-semibold text-accent-600">← Continue shopping</Link>
        </div>

        <aside className="reveal h-fit rounded-2xl border border-brand-200 bg-white p-6 shadow-soft lg:sticky lg:top-24">
          <h2 className="font-serif text-lg font-bold text-brand-900">Order Summary</h2>
          <dl className="mt-4 space-y-2.5 text-sm">
            <div className="flex justify-between"><dt className="text-brand-500">Subtotal</dt><dd className="font-semibold">{formatPrice(totals.subtotal)}</dd></div>
            <div className="flex justify-between"><dt className="text-brand-500">Tax (12%)</dt><dd className="font-semibold">{formatPrice(totals.tax)}</dd></div>
            <div className="flex justify-between">
              <dt className="text-brand-500">Shipping</dt>
              <dd className="font-semibold">{totals.shipping === 0 ? 'FREE' : formatPrice(totals.shipping)}</dd>
            </div>
            {coupon && (
              <div className="flex justify-between text-green-700">
                <dt>Coupon ({coupon.code})</dt><dd className="font-semibold">−{formatPrice(discount)}</dd>
              </div>
            )}
            <div className="border-t border-brand-200 pt-3 flex justify-between text-base">
              <dt className="font-bold">Total</dt><dd className="font-bold">{formatPrice(grandTotal)}</dd>
            </div>
          </dl>

          <form onSubmit={applyCoupon} className="mt-4 flex gap-2">
            <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Coupon code"
              className="w-full rounded-full border border-brand-300 px-4 py-2 text-sm outline-none transition-all focus:border-accent-500 focus:shadow-glow" />
            <button className="btn-shine rounded-full bg-brand-800 px-5 text-sm font-semibold text-white transition hover:bg-brand-700">Apply</button>
          </form>
          {couponError && <p className="mt-2 animate-fade-up text-xs text-red-600">{couponError}</p>}
          {coupon && <p className="mt-2 animate-fade-up text-xs text-accent-600">Coupon applied ✓</p>}
          <p className="mt-2 text-[11px] text-brand-400">Try: WELCOME10, FURNISH20, FLAT500</p>

          <button onClick={() => navigate('/checkout', { state: { coupon } })} disabled={loading}
            className="btn-shine mt-5 w-full rounded-full bg-brand-900 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-800 hover:shadow-md disabled:opacity-50">
            Proceed to Checkout
          </button>
        </aside>
      </div>
    </div>
  );
};

export default Cart;
