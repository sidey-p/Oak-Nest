import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../../services/api';
import { Alert, Badge, STATUS_BADGE, Spinner } from '../../components/common/UI';
import { formatPrice, formatDateTime, titleize } from '../../utils/format';

const STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'];

const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get('/admin/orders', { params: filter ? { status: filter } : {} });
      setOrders(data.orders);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (order, status) => {
    try {
      await api.put(`/admin/orders/${order.id}/status`, { status });
      setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status } : o)));
    } catch (err) {
      alert(errorMessage(err));
    }
  };

  const shown = orders.filter((o) =>
    !search || o.order_number.toLowerCase().includes(search.toLowerCase())
      || o.customer?.toLowerCase().includes(search.toLowerCase())
      || o.customer_email?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Spinner />;
  if (error) return <Alert>{error}</Alert>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="reveal font-serif text-2xl font-bold text-brand-900">Orders</h1>
          <p className="text-sm text-brand-500">{orders.length} orders</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search order/customer..."
            className="w-56 rounded-full border border-brand-300 transition hover:border-accent-500 px-3 py-2 text-sm outline-none focus:border-accent-500" />
          <select value={filter} onChange={(e) => setFilter(e.target.value)}
            className="rounded-lg border border-brand-300 bg-white px-3 py-2 text-sm outline-none focus:border-accent-500">
            <option value="">All statuses</option>
            {STATUSES.map((s) => <option key={s} value={s}>{titleize(s)}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {shown.map((o) => (
          <div key={o.id} className="rounded-2xl border border-brand-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 p-5">
              <div>
                <p className="font-bold text-brand-900">{o.order_number}</p>
                <p className="text-xs text-brand-500">
                  {o.customer} · {formatDateTime(o.created_at)} · <Link to={`/orders/${o.id}`} className="underline hover:text-accent-600">details</Link>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-bold">{formatPrice(o.total)}</span>
                <Badge color={STATUS_BADGE[o.payment_status]}>{o.payment_status}</Badge>
                <Badge color={STATUS_BADGE[o.status]}>{titleize(o.status)}</Badge>
                <select value={o.status} onChange={(e) => updateStatus(o, e.target.value)}
                  className="rounded-lg border border-brand-300 bg-white px-2 py-1.5 text-xs font-semibold outline-none focus:border-accent-500">
                  {STATUSES.map((s) => <option key={s} value={s}>{titleize(s)}</option>)}
                </select>
              </div>
            </div>
          </div>
        ))}
        {shown.length === 0 && <p className="rounded-2xl border border-dashed border-brand-300 bg-white p-10 text-center text-sm text-brand-400">No orders match this filter.</p>}
      </div>
    </div>
  );
};

export default AdminOrders;
