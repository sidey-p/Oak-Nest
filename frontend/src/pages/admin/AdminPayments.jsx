import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../../services/api';
import { Alert, Badge, STATUS_BADGE, Spinner } from '../../components/common/UI';
import { formatPrice, formatDateTime } from '../../utils/format';

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');

  useEffect(() => {
    const params = filter ? { status: filter } : {};
    api.get('/admin/payments', { params })
      .then((d) => setPayments(d.data.payments))
      .catch((e) => setError(errorMessage(e)))
      .finally(() => setLoading(false));
  }, [filter]);

  if (loading) return <Spinner />;
  if (error) return <Alert>{error}</Alert>;

  const totalCollected = payments.filter((p) => p.status === 'paid').reduce((s, p) => s + Number(p.amount), 0);
  const pendingCod = payments.filter((p) => p.status === 'pending').reduce((s, p) => s + Number(p.amount), 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-brand-900">Payments</h1>
          <p className="text-sm text-brand-500">
            Collected: <span className="font-bold text-green-700">{formatPrice(totalCollected)}</span>
            {' · '}Pending (COD): <span className="font-bold text-amber-700">{formatPrice(pendingCod)}</span>
          </p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-brand-300 bg-white px-3 py-2 text-sm outline-none focus:border-accent-500">
          <option value="">All statuses</option>
          {['paid', 'pending', 'failed', 'refunded'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-brand-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-200 bg-brand-50 text-left text-xs uppercase tracking-wide text-brand-500">
              <th className="p-4">Transaction</th><th className="p-4">Order</th><th className="p-4">Customer</th>
              <th className="p-4">Method</th><th className="p-4">Amount</th><th className="p-4">Date</th><th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.id} className="border-b border-brand-100 hover:bg-brand-50/50">
                <td className="p-4 font-mono text-xs">{p.transaction_id}</td>
                <td className="p-4"><Link to={`/orders/${p.order_id}`} className="font-semibold text-accent-600 hover:underline">{p.order_number}</Link></td>
                <td className="p-4">{p.customer}</td>
                <td className="p-4 text-xs">{p.payment_method === 'cash_on_delivery' ? '💵 COD' : '💳 Test Payment'}</td>
                <td className="p-4 font-bold">{formatPrice(p.amount)}</td>
                <td className="p-4 text-brand-500 text-xs">{formatDateTime(p.created_at)}</td>
                <td className="p-4"><Badge color={STATUS_BADGE[p.status]}>{p.status}</Badge></td>
              </tr>
            ))}
            {payments.length === 0 && (
              <tr><td colSpan="7" className="p-10 text-center text-sm text-brand-400">No payment records.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPayments;
