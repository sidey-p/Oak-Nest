import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/common/UI';

const ROOMS = ['living_room', 'bedroom', 'office', 'kitchen', 'dining', 'hotel_suite', 'restaurant', 'cafeteria', 'outdoor', 'other'];
const TYPES = ['sofa', 'bed', 'wardrobe', 'dining_table', 'chair', 'desk', 'cabinet', 'shelf', 'curtains', 'rug', 'lighting', 'other'];

const CustomDesign = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: user ? `${user.first_name} ${user.last_name}` : '',
    email: user?.email || '',
    phone: user?.phone || '',
    room_type: 'living_room',
    furniture_type: 'sofa',
    dimensions: '',
    material: '',
    preferred_color: '',
    budget: '',
    description: '',
  });
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const input = 'mt-1.5 w-full rounded-xl border border-brand-300 px-4 py-3 text-sm outline-none transition-all focus:border-accent-500 focus:shadow-glow';

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('reference_image', file);
      const { data } = await api.post('/custom-designs', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setMsg({ type: 'success', text: data.message });
      setForm({ ...form, dimensions: '', material: '', preferred_color: '', budget: '', description: '' });
      setFile(null);
      setTimeout(() => navigate('/'), 3000);
    } catch (err) {
      setMsg({ type: 'error', text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative mx-auto max-w-3xl overflow-hidden px-4 py-12 sm:px-6">
      <div className="pointer-events-none absolute -top-16 right-0 h-72 w-72 rounded-full bg-gold-300/20 blur-3xl" />
      <div className="reveal text-center">
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent-600">Bespoke Furniture</p>
        <h1 className="mt-3 font-serif text-4xl font-bold text-brand-900">Custom Design Request</h1>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-relaxed text-brand-500">
          Tell us about your dream furniture — dimensions, material, color, budget — and our craftsmen will craft it for you.
          Attach a reference image to help us visualize your idea.
        </p>
      </div>

      {msg && <div className="mt-6"><Alert type={msg.type}>{msg.text}</Alert></div>}

      <form onSubmit={submit} className="reveal relative mt-8 grid gap-5 rounded-2xl border border-brand-200 bg-white p-8 shadow-lift sm:grid-cols-2" style={{ animationDelay: '100ms' }}>
        <div><label className="text-sm font-semibold">Your name *</label><input required value={form.name} onChange={set('name')} className={input} /></div>
        <div><label className="text-sm font-semibold">Email *</label><input type="email" required value={form.email} onChange={set('email')} className={input} /></div>
        <div><label className="text-sm font-semibold">Phone</label><input value={form.phone} onChange={set('phone')} placeholder="+91 ..." className={input} /></div>
        <div><label className="text-sm font-semibold">Budget (₹)</label><input type="number" min="0" value={form.budget} onChange={set('budget')} className={input} /></div>
        <div>
          <label className="text-sm font-semibold">Room type</label>
          <select value={form.room_type} onChange={set('room_type')} className={input}>
            {ROOMS.map((r) => <option key={r} value={r}>{r.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-semibold">Furniture type</label>
          <select value={form.furniture_type} onChange={set('furniture_type')} className={input}>
            {TYPES.map((t) => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
        <div><label className="text-sm font-semibold">Dimensions</label><input value={form.dimensions} onChange={set('dimensions')} placeholder="e.g. 220cm × 95cm × 85cm" className={input} /></div>
        <div><label className="text-sm font-semibold">Preferred material</label><input value={form.material} onChange={set('material')} placeholder="Sheesham wood, velvet..." className={input} /></div>
        <div><label className="text-sm font-semibold">Preferred color</label><input value={form.preferred_color} onChange={set('preferred_color')} placeholder="Charcoal grey" className={input} /></div>
        <div>
          <label className="text-sm font-semibold">Reference image <span className="font-normal text-brand-400">(optional)</span></label>
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])} className="mt-1.5 w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-brand-100 file:px-4 file:py-2 file:text-sm file:font-semibold" />
        </div>
        <div className="sm:col-span-2">
          <label className="text-sm font-semibold">Describe your requirement</label>
          <textarea value={form.description} onChange={set('description')} rows="5" className={input}
            placeholder="Tell us about the style, storage needs, fabric preferences, inspiration links..." />
        </div>
        <div className="sm:col-span-2">
          <button disabled={busy} className="btn-shine w-full rounded-full bg-brand-900 py-4 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-800 hover:shadow-md disabled:opacity-50">
            {busy ? 'Submitting...' : 'Submit Request'}
          </button>
          <p className="mt-3 text-center text-xs text-brand-400">Our design team responds within 48 hours with a quotation.</p>
        </div>
      </form>
    </div>
  );
};

export default CustomDesign;
