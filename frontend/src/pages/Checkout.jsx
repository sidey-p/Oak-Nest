import { useEffect, useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import api, { errorMessage } from '../services/api';
import { useCart } from '../context/CartContext';
import { Alert, Spinner } from '../components/common/UI';
import { formatPrice } from '../utils/format';

const STEPS = ['Delivery Details', 'Review Your Order', 'Payment', 'Order Confirmed'];

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const passedCoupon = location.state?.coupon || null;
  const { cart, cartCount, refreshCart, cartReady } = useCart();

  const [step, setStep] = useState(0);
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddrForm, setShowAddrForm] = useState(false);
  const [addrForm, setAddrForm] = useState({ full_name: '', phone: '', address_line1: '', address_line2: '', city: '', state: '', postal_code: '', country: 'India', is_default: false });
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [card, setCard] = useState({ card_number: '4111 1111 1111 1111', name_on_card: '', expiry: '12/30', cvv: '123' });
  const [coupon, setCoupon] = useState(passedCoupon);
  const [couponCode, setCouponCode] = useState(passedCoupon?.code || '');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get('/addresses');
        setAddresses(data.addresses);
        if (data.addresses.length) setSelectedAddress(data.addresses.find((a) => a.is_default)?.id || data.addresses[0].id);
      } catch (err) {
        setError(errorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    if (!loading && cartReady && cartCount === 0 && !placedOrder) navigate('/cart');
  }, [cartCount, loading, placedOrder, cartReady]);

  const totals = cart.totals || {};
  const discount = coupon
    ? (coupon.discount_type === 'percentage' ? totals.subtotal * coupon.discount_value / 100 : Math.min(coupon.discount_value, totals.subtotal))
    : 0;
  const grandTotal = coupon ? totals.total - discount : totals.total;

  const saveAddress = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const { data } = await api.post('/addresses', addrForm);
      setAddresses((prev) => [data.address, ...prev]);
      setSelectedAddress(data.address.id);
      setShowAddrForm(false);
      setAddrForm({ full_name: '', phone: '', address_line1: '', address_line2: '', city: '', state: '', postal_code: '', country: 'India', is_default: false });
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  const applyCoupon = async () => {
    setError(null);
    try {
      const { data } = await api.post('/coupons/validate', { code: couponCode });
      setCoupon(data.coupon);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  const placeOrder = async () => {
    setError(null);
    setBusy(true);
    try {
      const body = {
        address_id: selectedAddress,
        payment_method: paymentMethod,
        coupon_code: coupon?.code || null,
      };
      if (paymentMethod === 'local_test_payment') body.card_details = card;
      const { data } = await api.post('/orders', body);
      setPlacedOrder(data.order);
      setStep(3);
      refreshCart();
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <div className="min-h-[50vh] grid place-items-center"><Spinner /></div>;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="reveal font-serif text-3xl font-bold text-brand-900">Checkout</h1>
      <p className="reveal mt-1 text-sm text-brand-500" style={{ animationDelay: '60ms' }}>You're almost there — your space is about to get better.</p>

      <ol className="reveal mt-8 flex items-center">
        {STEPS.map((s, i) => (
          <li key={s} className="flex flex-1 items-center last:flex-none">
            <div className="flex flex-col items-center">
              <span className={`grid h-9 w-9 place-items-center rounded-full text-sm font-bold shadow-sm transition-all duration-300 ${i < step ? 'bg-accent-600 text-white scale-100' : i === step ? 'bg-brand-900 text-white scale-110 shadow-glow' : 'bg-brand-200 text-brand-500'}`}>
                {i < step ? '✓' : i + 1}
              </span>
              <span className="mt-1.5 text-[11px] font-semibold uppercase tracking-wide text-brand-600">{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`mx-2 h-0.5 flex-1 rounded transition-colors duration-500 ${i < step ? 'bg-accent-600' : 'bg-brand-200'}`} />}
          </li>
        ))}
      </ol>

      {error && <div className="mt-6"><Alert>{error}</Alert></div>}

      {/* STEP 0 — ADDRESS */}
      {step === 0 && (
        <section className="reveal mt-8 space-y-4">
          {addresses.map((a) => (
            <label key={a.id} className={`flex cursor-pointer gap-4 rounded-2xl border-2 p-5 shadow-soft transition-all ${selectedAddress === a.id ? 'border-accent-600 bg-white shadow-glow' : 'border-brand-200 bg-white hover:border-brand-400'}`}>
              <input type="radio" checked={selectedAddress === a.id} onChange={() => setSelectedAddress(a.id)} className="mt-1" />
              <div className="flex-1 text-sm">
                <p className="font-semibold text-brand-900">{a.full_name} {a.is_default && <span className="ml-2 rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold text-green-700">DEFAULT</span>}</p>
                <p className="text-brand-600">{a.address_line1}{a.address_line2 ? `, ${a.address_line2}` : ''}</p>
                <p className="text-brand-600">{a.city}, {a.state} — {a.postal_code}</p>
                <p className="text-brand-500">{a.phone}</p>
              </div>
            </label>
          ))}

          {showAddrForm ? (
            <form onSubmit={saveAddress} className="space-y-4 rounded-2xl border border-brand-200 bg-white p-6">
              <div className="grid gap-4 sm:grid-cols-2">
                <input required placeholder="Full name" value={addrForm.full_name} onChange={(e) => setAddrForm({ ...addrForm, full_name: e.target.value })} className="rounded-lg border border-brand-300 px-3 py-2.5 text-sm outline-none focus:border-accent-500" />
                <input required placeholder="Phone" value={addrForm.phone} onChange={(e) => setAddrForm({ ...addrForm, phone: e.target.value })} className="rounded-lg border border-brand-300 px-3 py-2.5 text-sm outline-none focus:border-accent-500" />
              </div>
              <input required placeholder="Address line 1" value={addrForm.address_line1} onChange={(e) => setAddrForm({ ...addrForm, address_line1: e.target.value })} className="w-full rounded-lg border border-brand-300 px-3 py-2.5 text-sm outline-none focus:border-accent-500" />
              <input placeholder="Address line 2 (optional)" value={addrForm.address_line2} onChange={(e) => setAddrForm({ ...addrForm, address_line2: e.target.value })} className="w-full rounded-lg border border-brand-300 px-3 py-2.5 text-sm outline-none focus:border-accent-500" />
              <div className="grid gap-4 sm:grid-cols-4">
                <input required placeholder="City" value={addrForm.city} onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })} className="rounded-lg border border-brand-300 px-3 py-2.5 text-sm outline-none focus:border-accent-500" />
                <input required placeholder="State" value={addrForm.state} onChange={(e) => setAddrForm({ ...addrForm, state: e.target.value })} className="rounded-lg border border-brand-300 px-3 py-2.5 text-sm outline-none focus:border-accent-500" />
                <input required placeholder="PIN code" value={addrForm.postal_code} onChange={(e) => setAddrForm({ ...addrForm, postal_code: e.target.value })} className="rounded-lg border border-brand-300 px-3 py-2.5 text-sm outline-none focus:border-accent-500" />
                <input placeholder="Country" value={addrForm.country} onChange={(e) => setAddrForm({ ...addrForm, country: e.target.value })} className="rounded-lg border border-brand-300 px-3 py-2.5 text-sm outline-none focus:border-accent-500" />
              </div>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={addrForm.is_default} onChange={(e) => setAddrForm({ ...addrForm, is_default: e.target.checked })} /> Set as default address</label>
              <div className="flex gap-3">
                <button disabled={busy} className="rounded-lg bg-brand-800 px-6 py-2.5 text-sm font-bold text-white hover:bg-brand-700">Save Address</button>
                <button type="button" onClick={() => setShowAddrForm(false)} className="rounded-lg border border-brand-300 px-6 py-2.5 text-sm">Cancel</button>
              </div>
            </form>
          ) : (
            <button onClick={() => setShowAddrForm(true)} className="w-full rounded-2xl border-2 border-dashed border-brand-300 py-4 text-sm font-semibold text-brand-600 hover:border-accent-500 hover:text-accent-600">
              + Add New Address
            </button>
          )}

          <button disabled={!selectedAddress} onClick={() => setStep(1)}
            className="btn-shine w-full rounded-full bg-brand-900 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-800 hover:shadow-md disabled:opacity-40">
            Continue to Order Summary
          </button>
        </section>
      )}

      {/* STEP 1 — SUMMARY */}
      {step === 1 && (
        <section className="reveal mt-8 rounded-2xl border border-brand-200 bg-white p-6 shadow-soft">
          <h2 className="font-serif text-lg font-bold">Items ({cartCount})</h2>
          <div className="mt-4 divide-y divide-brand-100">
            {cart.items.map((i) => (
              <div key={i.id} className="flex items-center gap-4 py-3">
                <img src={i.main_image} alt={i.name} className="h-14 w-16 rounded-lg object-cover" />
                <div className="flex-1 text-sm">
                  <p className="font-semibold">{i.name}</p>
                  <p className="text-xs text-brand-500">Qty {i.quantity} × {formatPrice(i.price)}</p>
                </div>
                <span className="text-sm font-bold">{formatPrice(Number(i.price) * i.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 flex gap-2">
            <input value={couponCode} onChange={(e) => setCouponCode(e.target.value.toUpperCase())} placeholder="Coupon code"
              className="w-48 rounded-lg border border-brand-300 px-3 py-2 text-sm outline-none focus:border-accent-500" />
            <button onClick={applyCoupon} className="rounded-lg bg-brand-700 px-4 text-sm font-semibold text-white hover:bg-brand-600">Apply</button>
            {coupon && <span className="self-center text-xs text-green-700">{coupon.code} applied ✓ <button onClick={() => { setCoupon(null); setCouponCode(''); }} className="underline">remove</button></span>}
          </div>

          <dl className="mt-5 space-y-2 border-t border-brand-100 pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-brand-500">Subtotal</dt><dd className="font-semibold">{formatPrice(totals.subtotal)}</dd></div>
            {coupon && <div className="flex justify-between text-green-700"><dt>Discount ({coupon.code})</dt><dd className="font-semibold">−{formatPrice(discount)}</dd></div>}
            <div className="flex justify-between"><dt className="text-brand-500">Tax (12%)</dt><dd className="font-semibold">{formatPrice(totals.tax)}</dd></div>
            <div className="flex justify-between"><dt className="text-brand-500">Shipping</dt><dd className="font-semibold">{totals.shipping === 0 ? 'FREE' : formatPrice(totals.shipping)}</dd></div>
            <div className="flex justify-between border-t border-brand-200 pt-3 text-base"><dt className="font-bold">Total</dt><dd className="font-bold">{formatPrice(grandTotal)}</dd></div>
          </dl>

          <div className="mt-6 flex gap-3">
            <button onClick={() => setStep(0)} className="rounded-full border border-brand-300 px-6 py-3 text-sm font-semibold transition hover:bg-brand-50">← Back</button>
            <button onClick={() => setStep(2)} className="btn-shine flex-1 rounded-full bg-brand-900 py-3 text-sm font-bold text-white transition hover:bg-brand-800">Continue to Payment</button>
          </div>
        </section>
      )}

      {/* STEP 2 — PAYMENT */}
      {step === 2 && (
        <section className="reveal mt-8 space-y-4">
          <div className={`cursor-pointer rounded-2xl border-2 p-5 shadow-soft transition-all ${paymentMethod === 'cash_on_delivery' ? 'border-accent-600 bg-white shadow-glow' : 'border-brand-200 bg-white hover:border-brand-400'}`} onClick={() => setPaymentMethod('cash_on_delivery')}>
            <div className="flex items-center gap-3">
              <input type="radio" checked={paymentMethod === 'cash_on_delivery'} onChange={() => {}} />
              <div>
                <p className="font-semibold text-brand-900">💵 Cash on Delivery</p>
                <p className="text-xs text-brand-500">Pay in cash when your order arrives at your door.</p>
              </div>
            </div>
          </div>

          <div className={`cursor-pointer rounded-2xl border-2 p-5 shadow-soft transition-all ${paymentMethod === 'local_test_payment' ? 'border-accent-600 bg-white shadow-glow' : 'border-brand-200 bg-white hover:border-brand-400'}`} onClick={() => setPaymentMethod('local_test_payment')}>
            <div className="flex items-center gap-3">
              <input type="radio" checked={paymentMethod === 'local_test_payment'} onChange={() => {}} />
              <div>
                <p className="font-semibold text-brand-900">💳 Local Test Payment <span className="ml-1 rounded bg-purple-100 px-1.5 py-0.5 text-[10px] font-bold text-purple-700">SIMULATED</span></p>
                <p className="text-xs text-brand-500">No real gateway — validates locally and marks the order paid.</p>
              </div>
            </div>
            {paymentMethod === 'local_test_payment' && (
              <div className="mt-4 grid gap-3 border-t border-brand-100 pt-4 sm:grid-cols-2" onClick={(e) => e.stopPropagation()}>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-brand-700">Card number</label>
                  <input value={card.card_number} onChange={(e) => setCard({ ...card, card_number: e.target.value })} placeholder="4111 1111 1111 1111"
                    className="mt-1 w-full rounded-lg border border-brand-300 px-3 py-2.5 text-sm outline-none focus:border-accent-500" />
                </div>
                <div className="sm:col-span-2">
                  <label className="text-xs font-semibold text-brand-700">Name on card</label>
                  <input value={card.name_on_card} onChange={(e) => setCard({ ...card, name_on_card: e.target.value })} placeholder="Test User"
                    className="mt-1 w-full rounded-lg border border-brand-300 px-3 py-2.5 text-sm outline-none focus:border-accent-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-brand-700">Expiry (MM/YY)</label>
                  <input value={card.expiry} onChange={(e) => setCard({ ...card, expiry: e.target.value })} placeholder="12/30"
                    className="mt-1 w-full rounded-lg border border-brand-300 px-3 py-2.5 text-sm outline-none focus:border-accent-500" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-brand-700">CVV</label>
                  <input value={card.cvv} onChange={(e) => setCard({ ...card, cvv: e.target.value })} placeholder="123"
                    className="mt-1 w-full rounded-lg border border-brand-300 px-3 py-2.5 text-sm outline-none focus:border-accent-500" />
                </div>
                <p className="sm:col-span-2 text-[11px] text-brand-400">Demo mode: use test card 4111 1111 1111 1111. No money is charged.</p>
              </div>
            )}
          </div>

          <div className="rounded-2xl bg-brand-100 p-5 text-sm">
            <div className="flex justify-between font-bold"><span>Total payable</span><span>{formatPrice(grandTotal)}</span></div>
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="rounded-full border border-brand-300 px-6 py-3 text-sm font-semibold transition hover:bg-brand-50">← Back</button>
            <button onClick={placeOrder} disabled={busy}
              className="btn-shine flex-1 rounded-full bg-accent-600 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-accent-700 hover:shadow-md disabled:opacity-50">
              {busy ? 'Processing...' : paymentMethod === 'cash_on_delivery' ? `Place Order (COD)` : `Pay ${formatPrice(grandTotal)}`}
            </button>
          </div>
        </section>
      )}

      {/* STEP 3 — DONE */}
      {step === 3 && placedOrder && (
        <section className="mt-10 text-center">
          <div className="animate-pop mx-auto grid h-20 w-20 place-items-center rounded-full bg-accent-50 text-4xl text-accent-600 shadow-glow">✓</div>
          <h2 className="reveal mt-6 font-serif text-3xl font-bold text-brand-900" style={{ animationDelay: '100ms' }}>Your order is confirmed!</h2>
          <p className="reveal mt-2 text-brand-600" style={{ animationDelay: '160ms' }}>Thank you for choosing Oak &amp; Nest. We'll keep you updated every step of the way.</p>
          <div className="reveal mx-auto mt-6 max-w-md rounded-2xl border border-brand-200 bg-white p-6 text-sm shadow-soft" style={{ animationDelay: '220ms' }}>
            <p className="text-brand-500">Order number</p>
            <p className="text-xl font-bold text-brand-900">{placedOrder.order_number}</p>
            <dl className="mt-4 space-y-1.5 text-left">
              <div className="flex justify-between"><dt className="text-brand-500">Total</dt><dd className="font-bold">{formatPrice(placedOrder.total)}</dd></div>
              <div className="flex justify-between"><dt className="text-brand-500">Payment</dt><dd className="font-semibold">{placedOrder.payment_status === 'paid' ? 'Paid (simulated)' : 'Cash on Delivery'}</dd></div>
              <div className="flex justify-between"><dt className="text-brand-500">Status</dt><dd className="font-semibold capitalize">{placedOrder.status}</dd></div>
            </dl>
          </div>
          <div className="reveal mt-8 flex justify-center gap-3" style={{ animationDelay: '280ms' }}>
            <Link to="/orders" className="btn-shine rounded-full bg-brand-900 px-8 py-3 text-sm font-bold text-white transition hover:bg-brand-800">View My Orders</Link>
            <Link to={`/orders/${placedOrder.id}/tracking`} className="rounded-full border border-brand-300 px-8 py-3 text-sm font-bold text-brand-800 transition hover:bg-white">Track Order</Link>
          </div>
        </section>
      )}
    </div>
  );
};

export default Checkout;
