import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../services/api';
import { Badge, STATUS_BADGE, Spinner, Empty } from '../components/common/UI';
import { formatPrice, formatDate } from '../utils/format';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/orders')
      .then((d) => setOrders(d.data.orders))
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="min-h-[50vh] grid place-items-center"><Spinner /></div>;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <h1 className="reveal font-serif text-3xl font-bold text-brand-900">My Orders</h1>
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {orders.length === 0 ? (
        <div className="mt-10">
          <Empty icon="📦" title="No orders yet" subtitle="When you place an order, it will show up here.">
            <Link to="/products" className="btn-shine rounded-full bg-brand-900 px-8 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-800 hover:shadow-md">Start Shopping</Link>
          </Empty>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((o) => (
            <div key={o.id} className="card-lift reveal rounded-2xl border border-brand-200 bg-white p-5 shadow-soft">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-bold text-brand-900">{o.order_number}</p>
                  <p className="text-xs text-brand-500">Placed {formatDate(o.created_at)} · {o.items_count ?? ''}</p>
                </div>
                <Badge color={STATUS_BADGE[o.status]}>{o.status.replace(/_/g, ' ')}</Badge>
              </div>
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm">
                  <span className="text-brand-500">Total </span>
                  <span className="font-bold">{formatPrice(o.total)}</span>
                  <span className="ml-3 text-brand-500">Payment: </span>
                  <span className={`font-semibold ${o.payment_status === 'paid' ? 'text-accent-700' : 'text-amber-700'}`}>{o.payment_status}</span>
                </div>
                <div className="flex gap-2">
                  <Link to={`/orders/${o.id}`} className="rounded-full border border-brand-300 px-4 py-2 text-xs font-semibold transition hover:border-accent-500 hover:bg-brand-50">View Details</Link>
                  <Link to={`/orders/${o.id}/tracking`} className="btn-shine rounded-full bg-brand-900 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-800">Track</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Orders;
