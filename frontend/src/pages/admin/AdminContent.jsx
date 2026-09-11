import { useEffect, useState } from 'react';
import api, { errorMessage } from '../../services/api';
import { Alert, Badge, Spinner } from '../../components/common/UI';
import ImageInput from '../../components/admin/ImageInput';

const emptyTestimonial = { name: '', role: '', location: '', rating: 5, quote: '', sort_order: 0 };

const AdminContent = () => {
  const [content, setContent] = useState({ hero_headline: '', hero_subline: '', quote_text: '', hero_image: null });
  const [heroImageInput, setHeroImageInput] = useState({ file: null, link: '', remove: false });
  const [testimonials, setTestimonials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyTestimonial);
  const [avatarInput, setAvatarInput] = useState({ file: null, link: '', remove: false });

  const input = 'mt-1.5 w-full rounded-full border border-brand-300 transition hover:border-accent-500 px-3 py-2 text-sm outline-none focus:border-accent-500';

  const load = async ({ keepForm = false } = {}) => {
    try {
      const t = await api.get('/admin/testimonials');
      setTestimonials(t.data.testimonials);
      if (!keepForm) {
        const c = await api.get('/content');
        setContent((prev) => ({ ...prev, ...c.data.content }));
      }
    } catch (err) {
      setMsg({ type: 'error', text: errorMessage(err) });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const saveContent = async (e) => {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      const fd = new FormData();
      fd.append('hero_headline', content.hero_headline || '');
      fd.append('hero_subline', content.hero_subline || '');
      fd.append('quote_text', content.quote_text || '');
      if (heroImageInput.file) fd.append('hero_image_file', heroImageInput.file);
      else if (heroImageInput.link) fd.append('hero_image', heroImageInput.link);
      else if (heroImageInput.remove) fd.append('hero_image', '');

      const { data } = await api.put('/content', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setContent((prev) => ({ ...prev, ...data.content }));
      setHeroImageInput({ file: null, link: '', remove: false });
      setMsg({ type: 'success', text: 'Storefront content updated ✓' });
    } catch (err) {
      setMsg({ type: 'error', text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (t) => {
    setEditing(t);
    setForm({ name: t.name, role: t.role || '', location: t.location || '', rating: t.rating, quote: t.quote, sort_order: t.sort_order });
    setAvatarInput({ file: null, link: '', remove: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const submitTestimonial = async (e) => {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v ?? ''));
      if (avatarInput.file) fd.append('avatar_file', avatarInput.file);
      else if (avatarInput.link) fd.append('avatar_image', avatarInput.link);

      if (editing) {
        await api.put(`/admin/testimonials/${editing.id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      } else {
        await api.post('/admin/testimonials', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      setMsg({ type: 'success', text: `Testimonial ${editing ? 'updated' : 'created'} ✓` });
      setEditing(null);
      setForm(emptyTestimonial);
      setAvatarInput({ file: null, link: '', remove: false });
      load({ keepForm: true });
    } catch (err) {
      setMsg({ type: 'error', text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  const remove = async (t) => {
    if (!window.confirm(`Delete testimonial from "${t.name}"?`)) return;
    try {
      await api.delete(`/admin/testimonials/${t.id}`);
      setMsg({ type: 'success', text: 'Testimonial deleted' });
      load({ keepForm: true });
    } catch (err) {
      setMsg({ type: 'error', text: errorMessage(err) });
    }
  };

  const toggleActive = async (t) => {
    try {
      await api.put(`/admin/testimonials/${t.id}`, { is_active: !t.is_active });
      load({ keepForm: true });
    } catch (err) {
      alert(errorMessage(err));
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="reveal font-serif text-2xl font-bold text-brand-900">Storefront Content</h1>
        <p className="text-sm text-brand-500">Edit the homepage hero, quote and testimonials. Upload custom images or paste any image link (Google, Unsplash…) — links are fetched and stored in the database.</p>
      </div>

      {msg && <Alert type={msg.type}>{msg.text}</Alert>}

      {/* ---------- Hero / content ---------- */}
      <form onSubmit={saveContent} className="reveal rounded-2xl border border-brand-200 bg-white p-6 shadow-soft">
        <h2 className="font-serif text-lg font-bold text-brand-900">Homepage Hero &amp; Quote</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="hero_headline" className="text-xs font-semibold text-brand-700">Hero headline</label>
            <input id="hero_headline" value={content.hero_headline || ''} onChange={(e) => setContent({ ...content, hero_headline: e.target.value })} className={input} />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="hero_subline" className="text-xs font-semibold text-brand-700">Hero subline</label>
            <textarea id="hero_subline" rows="2" value={content.hero_subline || ''} onChange={(e) => setContent({ ...content, hero_subline: e.target.value })} className={input} />
          </div>
          <div>
            <label htmlFor="quote_text" className="text-xs font-semibold text-brand-700">Quote section text</label>
            <textarea id="quote_text" rows="2" value={content.quote_text || ''} onChange={(e) => setContent({ ...content, quote_text: e.target.value })} className={input} />
          </div>
          <ImageInput
            label="Hero banner image"
            value={content.hero_image}
            currentHint={content.hero_image ? 'A hero image is currently set — replace it above or remove it.' : 'No hero image set — the default gradient background is used.'}
            onChange={setHeroImageInput}
          />
        </div>
        <button disabled={busy} className="btn-shine mt-4 rounded-full bg-brand-900 px-8 py-2.5 text-sm font-bold text-white transition-all hover:bg-brand-800 hover:shadow-md disabled:opacity-50">
          {busy ? 'Saving...' : 'Save Content'}
        </button>
      </form>

      {/* ---------- Testimonials ---------- */}
      <form onSubmit={submitTestimonial} className="reveal rounded-2xl border border-brand-200 bg-white p-6 shadow-soft">
        <h2 className="font-serif text-lg font-bold text-brand-900">{editing ? `Edit Testimonial — ${editing.name}` : 'Add Testimonial'}</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div><label htmlFor="t_name" className="text-xs font-semibold text-brand-700">Name *</label>
            <input id="t_name" required minLength="2" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={input} /></div>
          <div><label htmlFor="t_role" className="text-xs font-semibold text-brand-700">Role</label>
            <input id="t_role" placeholder="e.g. Homeowner, Architect" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} className={input} /></div>
          <div><label htmlFor="t_location" className="text-xs font-semibold text-brand-700">Location</label>
            <input id="t_location" placeholder="e.g. Bengaluru" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={input} /></div>
          <div>
            <label htmlFor="t_rating" className="text-xs font-semibold text-brand-700">Rating</label>
            <select id="t_rating" value={form.rating} onChange={(e) => setForm({ ...form, rating: Number(e.target.value) })} className={input}>
              {[5, 4, 3, 2, 1].map((r) => <option key={r} value={r}>{'★'.repeat(r)} ({r})</option>)}
            </select>
          </div>
          <div><label htmlFor="t_sort" className="text-xs font-semibold text-brand-700">Sort order</label>
            <input id="t_sort" type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: e.target.value })} className={input} /></div>
          <ImageInput label="Avatar (optional)" value={editing?.avatar_image} onChange={setAvatarInput} />
          <div className="sm:col-span-2 lg:col-span-3"><label htmlFor="t_quote" className="text-xs font-semibold text-brand-700">Quote *</label>
            <textarea id="t_quote" required rows="2" placeholder="What they said about us..." value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} className={input} /></div>
        </div>
        <div className="mt-4 flex gap-3">
          <button disabled={busy} className="btn-shine rounded-full bg-brand-900 px-8 py-2.5 text-sm font-bold text-white transition-all hover:bg-brand-800 hover:shadow-md disabled:opacity-50">
            {busy ? 'Saving...' : editing ? 'Update Testimonial' : 'Create Testimonial'}
          </button>
          {editing && (
            <button type="button" onClick={() => { setEditing(null); setForm(emptyTestimonial); setAvatarInput({ file: null, link: '', remove: false }); }}
              className="rounded-xl border border-brand-300 px-6 py-2.5 text-sm font-semibold">Cancel Edit</button>
          )}
        </div>
      </form>

      <div className="grid gap-4 sm:grid-cols-2">
        {testimonials.map((t) => (
          <div key={t.id} className="card-lift reveal rounded-2xl border border-brand-200 bg-white p-5 shadow-soft">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                {t.avatar_image ? (
                  <img src={t.avatar_image} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
                ) : (
                  <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-950 text-xs font-bold text-gold-300">
                    {t.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
                  </span>
                )}
                <div>
                  <p className="font-semibold text-brand-900">{t.name}</p>
                  <p className="text-xs text-brand-400">{[t.role, t.location].filter(Boolean).join(' · ')}</p>
                </div>
              </div>
              <Badge color={t.is_active ? 'green' : 'gray'}>{t.is_active ? 'live' : 'hidden'}</Badge>
            </div>
            <p className="mt-3 line-clamp-3 text-sm text-brand-600">&ldquo;{t.quote}&rdquo;</p>
            <p className="mt-2 text-xs text-gold-500">{'★'.repeat(t.rating)}<span className="ml-2 text-brand-400">order #{t.sort_order}</span></p>
            <div className="mt-4 flex gap-2">
              <button onClick={() => startEdit(t)} className="rounded-full border border-brand-300 transition hover:border-accent-500 px-3 py-1.5 text-xs font-semibold hover:bg-brand-100">Edit</button>
              <button onClick={() => toggleActive(t)} className="rounded-full border border-brand-300 transition hover:border-accent-500 px-3 py-1.5 text-xs font-semibold hover:bg-brand-100">
                {t.is_active ? 'Hide' : 'Show'}
              </button>
              <button onClick={() => remove(t)} className="rounded-full border border-red-200 transition hover:bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50">Delete</button>
            </div>
          </div>
        ))}
        {!testimonials.length && <p className="col-span-2 rounded-2xl border border-dashed border-brand-300 bg-white p-10 text-center text-sm text-brand-400">No testimonials yet.</p>}
      </div>
    </div>
  );
};

export default AdminContent;
