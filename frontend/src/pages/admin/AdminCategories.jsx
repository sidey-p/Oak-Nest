import { useEffect, useState } from 'react';
import api, { errorMessage } from '../../services/api';
import { Alert, Spinner } from '../../components/common/UI';

const emptyForm = { name: '', description: '', image: '' };

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const { data } = await api.get('/categories');
      setCategories(data.categories);
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
      if (editing) {
        await api.put(`/categories/${editing.id}`, form);
      } else {
        await api.post('/categories', form);
      }
      setMsg({ type: 'success', text: `Category ${editing ? 'updated' : 'created'} ✓` });
      setForm(emptyForm); setEditing(null);
      load();
    } catch (err) {
      setMsg({ type: 'error', text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete category "${c.name}"?`)) return;
    try {
      await api.delete(`/categories/${c.id}`);
      load();
    } catch (err) {
      setMsg({ type: 'error', text: errorMessage(err) });
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <h1 className="reveal font-serif text-2xl font-bold text-brand-900">Categories</h1>
      {msg && <Alert type={msg.type}>{msg.text}</Alert>}

      <form onSubmit={submit} className="grid gap-4 rounded-2xl border border-brand-200 bg-white p-6 sm:grid-cols-[1fr_1fr_2fr_auto] sm:items-end">
        <div>
          <label className="text-xs font-semibold text-brand-700">Name *</label>
          <input required minLength="3" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="mt-1.5 w-full rounded-full border border-brand-300 transition hover:border-accent-500 px-3 py-2 text-sm outline-none focus:border-accent-500" />
        </div>
        <div>
          <label className="text-xs font-semibold text-brand-700">Image path <span className="font-normal text-brand-400">(/uploads/...)</span></label>
          <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="/uploads/categories/living-room.svg"
            className="mt-1.5 w-full rounded-full border border-brand-300 transition hover:border-accent-500 px-3 py-2 text-sm outline-none focus:border-accent-500" />
        </div>
        <div>
          <label className="text-xs font-semibold text-brand-700">Description</label>
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="mt-1.5 w-full rounded-full border border-brand-300 transition hover:border-accent-500 px-3 py-2 text-sm outline-none focus:border-accent-500" />
        </div>
        <div className="flex gap-2">
          <button disabled={busy} className="btn-shine rounded-full bg-brand-900 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-brand-800 hover:shadow-md disabled:opacity-50">
            {editing ? 'Update' : 'Create'}
          </button>
          {editing && <button type="button" onClick={() => { setEditing(null); setForm(emptyForm); }} className="rounded-xl border border-brand-300 px-4 py-2.5 text-sm">Cancel</button>}
        </div>
      </form>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c) => (
          <div key={c.id} className="card-lift reveal rounded-2xl border border-brand-200 bg-white p-5 shadow-soft">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-brand-900">{c.name}</h3>
                <p className="text-xs text-brand-400">/{c.slug}</p>
              </div>
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold text-brand-600">{c.product_count} products</span>
            </div>
            <p className="mt-2 line-clamp-2 text-xs text-brand-500">{c.description || 'No description'}</p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => { setEditing(c); setForm({ name: c.name, description: c.description || '', image: c.image || '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                className="rounded-full border border-brand-300 transition hover:border-accent-500 px-3 py-1.5 text-xs font-semibold hover:bg-brand-50">Edit</button>
              <button onClick={() => remove(c)} className="rounded-full border border-red-200 transition hover:bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminCategories;
