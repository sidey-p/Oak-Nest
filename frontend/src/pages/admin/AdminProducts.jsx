import { useEffect, useState, useCallback } from 'react';
import api, { errorMessage } from '../../services/api';
import { Alert, Badge, Spinner } from '../../components/common/UI';
import { formatPrice } from '../../utils/format';

const emptyForm = { name: '', category_id: '', description: '', brand: '', material: '', price: '', discount_price: '', stock: 0, status: 'active' };

const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [msg, setMsg] = useState(null);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [file, setFile] = useState(null);
  const [search, setSearch] = useState('');
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    try {
      const [p, c] = await Promise.all([
        api.get('/products', { params: { perPage: 100, status: 'active' } }),
        api.get('/categories'),
      ]);
      setProducts(p.data.products);
      setCategories(c.data.categories);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // load all products including drafts/archived (admin sees all via /admin products list)
  useEffect(() => {
    api.get('/products', { params: { perPage: 100 } })
      .then((d) => setProducts(d.data.products))
      .catch(() => {});
  }, []);

  const input = 'mt-1.5 w-full rounded-full border border-brand-300 transition hover:border-accent-500 px-3 py-2 text-sm outline-none focus:border-accent-500';

  const startEdit = (p) => {
    setEditing(p);
    setForm({
      name: p.name, category_id: p.category_id, description: p.description || '',
      brand: p.brand || '', material: p.material || '', price: p.price,
      discount_price: p.discount_price || '', stock: p.stock, status: p.status,
    });
    setFile(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ''));
      if (file) fd.append('image', file);
      if (editing) {
        await api.put(`/products/${editing.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/products', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setMsg({ type: 'success', text: `Product ${editing ? 'updated' : 'created'} ✓` });
      setForm(emptyForm); setEditing(null); setFile(null);
      api.get('/products', { params: { perPage: 100 } }).then((d) => setProducts(d.data.products));
    } catch (err) {
      setMsg({ type: 'error', text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (p) => {
    if (!window.confirm(`Delete "${p.name}"?`)) return;
    try {
      const { data } = await api.delete(`/products/${p.id}`);
      setMsg({ type: 'success', text: data.message });
      api.get('/products', { params: { perPage: 100 } }).then((d) => setProducts(d.data.products));
    } catch (err) {
      setMsg({ type: 'error', text: errorMessage(err) });
    }
  };

  const updateStock = async (p, stock) => {
    try {
      await api.put(`/products/${p.id}/stock`, { stock: Number(stock) });
      setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, stock: Number(stock) } : x)));
    } catch (err) {
      alert(errorMessage(err));
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) || (p.brand || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="reveal font-serif text-2xl font-bold text-brand-900">Products</h1>
          <p className="text-sm text-brand-500">{products.length} products in catalog</p>
        </div>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search products..."
          className="w-64 rounded-full border border-brand-300 transition hover:border-accent-500 px-3 py-2 text-sm outline-none focus:border-accent-500" />
      </div>

      {error && <Alert>{error}</Alert>}
      {msg && <Alert type={msg.type}>{msg.text}</Alert>}

      <form onSubmit={submit} className="reveal rounded-2xl border border-brand-200 bg-white p-6 shadow-soft">
        <h2 className="font-serif text-lg font-bold">{editing ? `Edit: ${editing.name}` : 'Add New Product'}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="lg:col-span-2"><label className="text-xs font-semibold text-brand-700">Name *</label><input required minLength="3" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={input} /></div>
          <div>
            <label className="text-xs font-semibold text-brand-700">Category *</label>
            <select required value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className={input}>
              <option value="">Select category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div><label className="text-xs font-semibold text-brand-700">Brand</label><input value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} className={input} /></div>
          <div><label className="text-xs font-semibold text-brand-700">Material</label><input value={form.material} onChange={(e) => setForm({ ...form, material: e.target.value })} className={input} /></div>
          <div><label className="text-xs font-semibold text-brand-700">Price (₹) *</label><input required type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} className={input} /></div>
          <div><label className="text-xs font-semibold text-brand-700">Discount price (₹)</label><input type="number" min="0" step="0.01" value={form.discount_price} onChange={(e) => setForm({ ...form, discount_price: e.target.value })} className={input} /></div>
          <div><label className="text-xs font-semibold text-brand-700">Stock *</label><input required type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} className={input} /></div>
          <div>
            <label className="text-xs font-semibold text-brand-700">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={input}>
              <option value="active">Active</option><option value="draft">Draft</option><option value="archived">Archived</option>
            </select>
          </div>
          <div className="lg:col-span-2">
            <label className="text-xs font-semibold text-brand-700">Main image {editing && <span className="font-normal text-brand-400">(leave empty to keep current)</span>}</label>
            <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="mt-1.5 w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold" />
          </div>
          <div className="lg:col-span-3"><label className="text-xs font-semibold text-brand-700">Description</label><textarea rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={input} /></div>
        </div>
        <div className="mt-4 flex gap-3">
          <button disabled={busy} className="btn-shine rounded-full bg-brand-900 px-8 py-2.5 text-sm font-bold text-white transition-all hover:bg-brand-800 hover:shadow-md disabled:opacity-50">
            {busy ? 'Saving...' : editing ? 'Update Product' : 'Create Product'}
          </button>
          {editing && (
            <button type="button" onClick={() => { setEditing(null); setForm(emptyForm); setFile(null); }} className="rounded-xl border border-brand-300 px-6 py-2.5 text-sm font-semibold">
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-brand-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-200 bg-brand-50 text-left text-xs uppercase tracking-wide text-brand-500">
              <th className="p-4">Product</th><th className="p-4">Category</th><th className="p-4">Price</th>
              <th className="p-4">Stock</th><th className="p-4">Status</th><th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="border-b border-brand-100 hover:bg-brand-50/50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={p.main_image} alt="" className="h-10 w-12 rounded-lg object-cover" />
                    <div>
                      <p className="font-semibold text-brand-900">{p.name}</p>
                      <p className="text-xs text-brand-400">{p.brand}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-brand-600">{p.category_name}</td>
                <td className="p-4">
                  <span className="font-bold">{formatPrice(p.discount_price ?? p.price)}</span>
                  {p.discount_price && <span className="ml-1 text-xs text-brand-400 line-through">{formatPrice(p.price)}</span>}
                </td>
                <td className="p-4">
                  <input type="number" defaultValue={p.stock} min="0" onBlur={(e) => e.target.value != p.stock && updateStock(p, e.target.value)}
                    className={`w-20 rounded-lg border px-2 py-1.5 text-sm ${p.stock <= 5 ? 'border-red-300 text-red-700' : 'border-brand-300'}`} />
                </td>
                <td className="p-4"><Badge color={p.status === 'active' ? 'green' : p.status === 'draft' ? 'amber' : 'gray'}>{p.status}</Badge></td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button onClick={() => startEdit(p)} className="rounded-full border border-brand-300 transition hover:border-accent-500 px-3 py-1.5 text-xs font-semibold hover:bg-brand-100">Edit</button>
                    <button onClick={() => remove(p)} className="rounded-full border border-red-200 transition hover:bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminProducts;
