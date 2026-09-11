import { useEffect, useState } from 'react';
import api, { errorMessage } from '../../services/api';
import { Alert, Badge, Spinner } from '../../components/common/UI';
import { formatDateTime } from '../../utils/format';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');

  const load = async () => {
    try {
      const { data } = await api.get('/admin/reviews', { params: filter ? { status: filter } : {} });
      setReviews(data.reviews);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const moderate = async (r, status) => {
    try {
      await api.put(`/admin/reviews/${r.id}/status`, { status });
      load();
    } catch (err) {
      alert(errorMessage(err));
    }
  };

  const remove = async (r) => {
    if (!window.confirm('Permanently delete this review?')) return;
    try {
      await api.delete(`/admin/reviews/${r.id}`);
      load();
    } catch (err) {
      alert(errorMessage(err));
    }
  };

  if (loading) return <Spinner />;
  if (error) return <Alert>{error}</Alert>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="reveal font-serif text-2xl font-bold text-brand-900">Reviews</h1>
          <p className="text-sm text-brand-500">{reviews.length} reviews — moderate before they appear on the storefront</p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-brand-300 bg-white px-3 py-2 text-sm outline-none focus:border-accent-500">
          <option value="">All</option>
          {['pending', 'approved', 'hidden'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        {reviews.map((r) => (
          <div key={r.id} className="card-lift reveal rounded-2xl border border-brand-200 bg-white p-5 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-brand-900">{r.product_name}</p>
                <p className="text-xs text-brand-400">by {r.reviewer} · {formatDateTime(r.created_at)}</p>
                <div className="mt-1.5 text-amber-500">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
              </div>
              <Badge color={r.status === 'approved' ? 'green' : r.status === 'pending' ? 'amber' : 'gray'}>{r.status}</Badge>
            </div>
            {r.comment && <p className="mt-3 rounded-xl bg-brand-50 p-3 text-sm text-brand-700">"{r.comment}"</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              {r.status !== 'approved' && <button onClick={() => moderate(r, 'approved')} className="rounded-lg border border-green-200 px-3 py-1.5 text-xs font-semibold text-accent-700 hover:bg-green-50">Approve</button>}
              {r.status !== 'hidden' && <button onClick={() => moderate(r, 'hidden')} className="rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50">Hide</button>}
              <button onClick={() => remove(r)} className="rounded-full border border-red-200 transition hover:bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button>
            </div>
          </div>
        ))}
        {reviews.length === 0 && <p className="rounded-2xl border border-dashed border-brand-300 bg-white p-10 text-center text-sm text-brand-400">No reviews found for this filter.</p>}
      </div>
    </div>
  );
};

export default AdminReviews;
