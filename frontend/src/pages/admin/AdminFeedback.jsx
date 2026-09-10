import { useEffect, useState } from 'react';
import api, { errorMessage } from '../../services/api';
import { Alert, Badge, Spinner } from '../../components/common/UI';
import { formatDateTime } from '../../utils/format';

const AdminFeedback = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('');

  const load = async () => {
    try {
      const { data } = await api.get('/admin/feedback', { params: filter ? { status: filter } : {} });
      setItems(data.feedback);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filter]);

  const setStatus = async (f, status) => {
    try {
      await api.put(`/admin/feedback/${f.id}/status`, { status });
      load();
    } catch (err) {
      alert(errorMessage(err));
    }
  };

  const remove = async (f) => {
    if (!window.confirm('Delete this feedback?')) return;
    try { await api.delete(`/admin/feedback/${f.id}`); load(); } catch (err) { alert(errorMessage(err)); }
  };

  if (loading) return <Spinner />;
  if (error) return <Alert>{error}</Alert>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-brand-900">Feedback</h1>
          <p className="text-sm text-brand-500">{items.length} messages from customers</p>
        </div>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}
          className="rounded-lg border border-brand-300 bg-white px-3 py-2 text-sm outline-none focus:border-accent-500">
          <option value="">All</option>
          {['new', 'read', 'resolved'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="space-y-4">
        {items.map((f) => (
          <div key={f.id} className="rounded-2xl border border-brand-200 bg-white p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-brand-900">{f.subject}</p>
                <p className="text-xs text-brand-400">{f.user_name || 'Anonymous'} · {f.user_email || ''} · {formatDateTime(f.created_at)}</p>
              </div>
              <Badge color={f.status === 'resolved' ? 'green' : f.status === 'read' ? 'blue' : 'amber'}>{f.status}</Badge>
            </div>
            <p className="mt-3 rounded-xl bg-brand-50 p-3 text-sm text-brand-700">{f.message}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {f.status === 'new' && <button onClick={() => setStatus(f, 'read')} className="rounded-lg border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50">Mark Read</button>}
              {f.status !== 'resolved' && <button onClick={() => setStatus(f, 'resolved')} className="rounded-lg border border-green-200 px-3 py-1.5 text-xs font-semibold text-green-700 hover:bg-green-50">Resolve</button>}
              <button onClick={() => remove(f)} className="rounded-lg border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button>
            </div>
          </div>
        ))}
        {items.length === 0 && <p className="rounded-2xl border border-dashed border-brand-300 bg-white p-10 text-center text-sm text-brand-400">No feedback yet.</p>}
      </div>
    </div>
  );
};

export default AdminFeedback;
