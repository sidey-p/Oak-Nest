import { useEffect, useState } from 'react';
import api, { errorMessage } from '../../services/api';
import { Alert, Badge, STATUS_BADGE, Spinner } from '../../components/common/UI';
import { formatPrice, formatDateTime, titleize } from '../../utils/format';

const STATUSES = ['new', 'under_review', 'quotation_sent', 'accepted', 'in_production', 'completed', 'rejected'];

const AdminCustomRequests = () => {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ status: '', admin_notes: '' });
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/custom-designs');
      setRequests(data.requests);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.put(`/custom-designs/${edit.id}`, form);
      setEdit(null);
      load();
    } catch (err) {
      alert(errorMessage(err));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <Alert>{error}</Alert>;

  return (
    <div className="space-y-6">
      <h1 className="reveal font-serif text-2xl font-bold text-brand-900">Custom Design Requests</h1>

      {edit && (
        <form onSubmit={save} className="space-y-4 rounded-2xl border-2 border-accent-500 bg-white p-6">
          <h2 className="font-serif font-bold">Update request #{edit.id} — {edit.name}</h2>
          <div className="grid gap-4 sm:grid-cols-[200px_1fr]">
            <div>
              <label className="text-xs font-semibold text-brand-700">Status</label>
              <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="mt-1.5 w-full rounded-full border border-brand-300 transition hover:border-accent-500 px-3 py-2 text-sm outline-none focus:border-accent-500">
                {STATUSES.map((s) => <option key={s} value={s}>{titleize(s)}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold text-brand-700">Admin notes (visible to customer)</label>
              <textarea rows="3" value={form.admin_notes} onChange={(e) => setForm({ ...form, admin_notes: e.target.value })}
                className="mt-1.5 w-full rounded-full border border-brand-300 transition hover:border-accent-500 px-3 py-2 text-sm outline-none focus:border-accent-500" />
            </div>
          </div>
          <div className="flex gap-3">
            <button disabled={busy} className="btn-shine rounded-full bg-brand-900 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-brand-800 hover:shadow-md">Save</button>
            <button type="button" onClick={() => setEdit(null)} className="rounded-xl border border-brand-300 px-6 py-2.5 text-sm font-semibold">Cancel</button>
          </div>
        </form>
      )}

      <div className="space-y-4">
        {requests.map((r) => (
          <div key={r.id} className="card-lift reveal rounded-2xl border border-brand-200 bg-white p-5 shadow-soft">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-brand-900">{r.name} <span className="text-xs font-normal text-brand-400">({r.email})</span></p>
                <p className="text-xs text-brand-500">{titleize(r.room_type)} · {titleize(r.furniture_type)} · {r.dimensions || '—'}</p>
                <p className="mt-1 text-xs text-brand-400">{formatDateTime(r.created_at)} · Budget: {r.budget ? formatPrice(r.budget) : '—'}</p>
              </div>
              <Badge color={STATUS_BADGE[r.status]}>{titleize(r.status)}</Badge>
            </div>
            {r.material && <p className="mt-2 text-xs text-brand-500">Material: <strong>{r.material}</strong> · Color: <strong>{r.preferred_color || '—'}</strong></p>}
            {r.description && <p className="mt-3 rounded-xl bg-brand-50 p-3 text-sm text-brand-700">{r.description}</p>}
            {r.reference_image && <img src={r.reference_image} alt="Reference" className="mt-3 h-32 w-48 rounded-xl border border-brand-200 object-cover" />}
            {r.admin_notes && <p className="mt-3 rounded-xl bg-accent-500/10 p-3 text-xs text-brand-700"><strong>Notes:</strong> {r.admin_notes}</p>}
            <button onClick={() => { setEdit(r); setForm({ status: r.status, admin_notes: r.admin_notes || '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="mt-4 rounded-full border border-brand-300 transition hover:border-accent-500 px-4 py-2 text-xs font-semibold hover:bg-brand-50">
              Update Status & Notes
            </button>
          </div>
        ))}
        {requests.length === 0 && <p className="rounded-2xl border border-dashed border-brand-300 bg-white p-10 text-center text-sm text-brand-400">No custom design requests yet.</p>}
      </div>
    </div>
  );
};

export default AdminCustomRequests;
