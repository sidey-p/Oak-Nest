import { useEffect, useState } from 'react';
import api, { errorMessage } from '../../services/api';
import { Alert, Badge, Spinner } from '../../components/common/UI';
import { formatDate } from '../../utils/format';

const empty = { code: '', discount_type: 'percentage', discount_value: '', minimum_order: '0', expiry_date: '', status: 'active' };

const AdminCoupons = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(empty);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/coupons');
      setCoupons(data.coupons);
    } catch (err) {
      setMsg({ type: 'error', text: errorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      if (editing) await api.put(`/coupons/${editing.id}`, form);
      else await api.post('/coupons', form);
      setMsg({ type: 'success', text: `Coupon ${editing ? 'updated' : 'created'} ✓` });
      setForm(empty); setEditing(null);
      load();
    } catch (err) {
      setMsg({ type: 'error', text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete coupon "${c.code}"?`)) return;
    try { await api.delete(`/coupons/${c.id}`); load(); } catch (err) { alert(errorMessage(err)); }
  };

  const toggleStatus = async (c) => {
    try {
      await api.put(`/coupons/${c.id}`, { status: c.status === 'active' ? 'inactive' : 'active' });
      load();
    } catch (err) { alert(errorMessage(err)); }
  };

  if (loading) return <Spinner />;

  const input = 'mt-1.5 w-full rounded-full border border-brand-300 transition hover:border-accent-500 px-3 py-2 text-sm outline-none focus:border-accent-500';

  return (
    <div className="space-y-6">
      <h1 className="reveal font-serif text-2xl font-bold text-brand-900">Coupons</h1>
      {msg && <Alert type={msg.type}>{msg.text}</Alert>}

      <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-brand-200 bg-white p-6 sm:grid-cols-3 lg:grid-cols-6 sm:items-end">
        <div>
          <label className="text-xs font-semibold text-brand-700">Code *</label>
          <input required value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="WELCOME10" className={input} />
        </div>
        <div>
          <label className="text-xs font-semibold text-brand-700">Type</label>
          <select value={form.discount_type} onChange={(e) => setForm({ ...form, discount_type: e.target.value })} className={input}>
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed (₹)</option>
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-brand-700">Value *</label>
          <input required type="number" min="0.01" step="0.01" value={form.discount_value} onChange={(e) => setForm({ ...form, discount_value: e.target.value })} className={input} />
        </div>
        <div>
          <label className="text-xs font-semibold text-brand-700">Min. order (₹)</label>
          <input type="number" min="0" value={form.minimum_order} onChange={(e) => setForm({ ...form, minimum_order: e.target.value })} className={input} />
        </div>
        <div>
          <label className="text-xs font-semibold text-brand-700">Expiry</label>
          <input type="date" value={form.expiry_date} onChange={(e) => setForm({ ...form, expiry_date: e.target.value })} className={input} />
        </div>
        <div className="flex gap-2">
          <button disabled={busy} className="btn-shine rounded-full bg-brand-900 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-brand-800 hover:shadow-md disabled:opacity-50">
            {editing ? 'Update' : 'Create'}
          </button>
          {editing && <button type="button" onClick={() => { setEditing(null); setForm(empty); }} className="rounded-xl border border-brand-300 px-4 py-2.5 text-sm">Cancel</button>}
        </div>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-brand-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-200 bg-brand-50 text-left text-xs uppercase tracking-wide text-brand-500">
              <th className="p-4">Code</th><th className="p-4">Discount</th><th className="p-4">Min. Order</th>
              <th className="p-4">Expiry</th><th className="p-4">Status</th><th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => {
              const expired = c.expiry_date && new Date(c.expiry_date) < new Date();
              return (
                <tr key={c.id} className="border-b border-brand-100 hover:bg-brand-50/50">
                  <td className="p-4 font-mono font-bold">{c.code}</td>
                  <td className="p-4">{c.discount_type === 'percentage' ? `${Number(c.discount_value)}%` : `₹${Number(c.discount_value)}`}</td>
                  <td className="p-4">₹{Number(c.minimum_order).toLocaleString('en-IN')}</td>
                  <td className="p-4 text-xs">{c.expiry_date ? formatDate(c.expiry_date) : '—'} {expired && <span className="text-red-500">(expired)</span>}</td>
                  <td className="p-4"><Badge color={expired ? 'gray' : c.status === 'active' ? 'green' : 'gray'}>{expired ? 'expired' : c.status}</Badge></td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button onClick={() => { setEditing(c); setForm({ code: c.code, discount_type: c.discount_type, discount_value: c.discount_value, minimum_order: c.minimum_order, expiry_date: c.expiry_date?.slice(0, 10) || '', status: c.status }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                        className="rounded-full border border-brand-300 transition hover:border-accent-500 px-3 py-1.5 text-xs font-semibold hover:bg-brand-50">Edit</button>
                      <button onClick={() => toggleStatus(c)} className="rounded-lg border border-amber-200 px-3 py-1.5 text-xs font-semibold text-amber-700 hover:bg-amber-50">
                        {c.status === 'active' ? 'Disable' : 'Enable'}
                      </button>
                      <button onClick={() => remove(c)} className="rounded-full border border-red-200 transition hover:bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCoupons;
