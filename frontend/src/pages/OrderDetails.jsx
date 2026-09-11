import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../services/api';
import { Alert, Badge, STATUS_BADGE, Spinner } from '../components/common/UI';
import { formatPrice, formatDate, titleize } from '../utils/format';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const res = await api.get(`/orders/${id}`);
      setData(res.data);
    } catch (err) {
      setError(errorMessage(err));
    }
  };

  useEffect(() => { load(); }, [id]);

  const cancel = async () => {
    if (!window.confirm('Cancel this order?')) return;
    setBusy(true);
    try {
      await api.put(`/orders/${id}/cancel`);
      load();
    } catch (err) {
      alert(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (error) return <div className="mx-auto max-w-3xl px-4 py-16"><Alert>{error}</Alert></div>;
  if (!data) return <div className="min-h-[50vh] grid place-items-center"><Spinner /></div>;

  const { order, items, payment, shipment } = data;
  const canCancel = ['pending', 'confirmed', 'processing'].includes(order.status);

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <button onClick={() => navigate('/orders')} className="underline-grow text-sm font-semibold text-accent-600">← Back to orders</button>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="reveal font-serif text-3xl font-bold text-brand-900">{order.order_number}</h1>
          <p className="mt-1 text-sm text-brand-500">Placed on {formatDate(order.created_at)}</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge color={STATUS_BADGE[order.status]}>{titleize(order.status)}</Badge>
          <Badge color={STATUS_BADGE[order.payment_status]}>{titleize(order.payment_status)}</Badge>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-6">
          <section className="reveal rounded-2xl border border-brand-200 bg-white p-6 shadow-soft">
            <h2 className="font-serif text-lg font-bold">Items</h2>
            <div className="mt-4 divide-y divide-brand-100">
              {items.map((i) => (
                <div key={i.id} className="flex items-center justify-between py-3 text-sm">
                  <div>
                    <p className="font-semibold text-brand-900">{i.product_name}</p>
                    <p className="text-xs text-brand-500">Qty {i.quantity} × {formatPrice(i.price)}</p>
                  </div>
                  <span className="font-bold">{formatPrice(i.total)}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="reveal rounded-2xl border border-brand-200 bg-white p-6 text-sm shadow-soft">
            <h2 className="font-serif text-lg font-bold">Delivery Address</h2>
            <p className="mt-3 font-semibold text-brand-900">{order.recipient}</p>
            <p className="text-brand-600">{order.address_line1}{order.address_line2 ? `, ${order.address_line2}` : ''}</p>
            <p className="text-brand-600">{order.city}, {order.state} — {order.postal_code}</p>
            <p className="text-brand-600">{order.country} · {order.recipient_phone}</p>
          </section>

          {shipment && (
            <section className="reveal rounded-2xl border border-brand-200 bg-white p-6 text-sm shadow-soft">
              <h2 className="font-serif text-lg font-bold">Shipment</h2>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div><p className="text-brand-500 text-xs">Courier</p><p className="font-semibold">{shipment.courier_name}</p></div>
                <div><p className="text-brand-500 text-xs">Tracking #</p><p className="font-semibold">{shipment.tracking_number}</p></div>
                <div><p className="text-brand-500 text-xs">Current location</p><p className="font-semibold">{shipment.current_location}</p></div>
                <div><p className="text-brand-500 text-xs">Est. delivery</p><p className="font-semibold">{shipment.estimated_delivery ? formatDate(shipment.estimated_delivery) : '—'}</p></div>
              </div>
              <Link to={`/orders/${order.id}/tracking`} className="btn-shine mt-4 inline-block rounded-full bg-brand-900 px-5 py-2 text-xs font-bold text-white transition hover:bg-brand-800">View Tracking Timeline</Link>
            </section>
          )}
        </div>

        <aside className="h-fit space-y-6">
          <div className="reveal rounded-2xl border border-brand-200 bg-white p-6 shadow-soft">
            <h2 className="font-serif text-lg font-bold">Summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-brand-500">Subtotal</dt><dd className="font-semibold">{formatPrice(order.subtotal)}</dd></div>
              {Number(order.discount) > 0 && <div className="flex justify-between text-accent-700"><dt>Discount {order.coupon_code && `(${order.coupon_code})`}</dt><dd className="font-semibold">−{formatPrice(order.discount)}</dd></div>}
              <div className="flex justify-between"><dt className="text-brand-500">Tax</dt><dd className="font-semibold">{formatPrice(order.tax)}</dd></div>
              <div className="flex justify-between"><dt className="text-brand-500">Shipping</dt><dd className="font-semibold">{Number(order.shipping_cost) === 0 ? 'FREE' : formatPrice(order.shipping_cost)}</dd></div>
              <div className="flex justify-between border-t border-brand-200 pt-3 text-base"><dt className="font-bold">Total</dt><dd className="font-bold">{formatPrice(order.total)}</dd></div>
            </dl>
          </div>

          {payment && (
            <div className="reveal rounded-2xl border border-brand-200 bg-white p-6 text-sm shadow-soft">
              <h2 className="font-serif text-lg font-bold">Payment</h2>
              <p className="mt-2 font-semibold">{payment.payment_method === 'cash_on_delivery' ? 'Cash on Delivery' : 'Local Test Payment'}</p>
              <p className="text-xs text-brand-500">Txn: {payment.transaction_id}</p>
              <p className="mt-1 text-xs text-brand-500">Amount: {formatPrice(payment.amount)} · Status: <Badge color={STATUS_BADGE[payment.status]}>{payment.status}</Badge></p>
            </div>
          )}

          {canCancel && (
            <button onClick={cancel} disabled={busy}
              className="w-full rounded-full border-2 border-red-300 py-3 text-sm font-bold text-red-700 transition hover:bg-red-50 disabled:opacity-50">
              {busy ? 'Cancelling...' : 'Cancel Order'}
            </button>
          )}
        </aside>
      </div>
    </div>
  );
};

export default OrderDetails;
