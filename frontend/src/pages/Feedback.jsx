import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/common/UI';

const Feedback = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({ subject: '', message: '' });
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [mine, setMine] = useState([]);

  const loadMine = async () => {
    if (!user) return;
    try {
      const { data } = await api.get('/feedback/mine');
      setMine(data.feedback);
    } catch {}
  };

  useEffect(() => { loadMine(); }, [user]);

  const submit = async (e) => {
    e.preventDefault();
    setMsg(null);
    setBusy(true);
    try {
      const { data } = await api.post('/feedback', form);
      setMsg({ type: 'success', text: data.message });
      setForm({ subject: '', message: '' });
      loadMine();
    } catch (err) {
      setMsg({ type: 'error', text: errorMessage(err) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      <div className="text-center">
        <h1 className="font-serif text-3xl font-bold text-brand-900">Feedback</h1>
        <p className="mt-2 text-sm text-brand-500">Tell us what you love or what we can do better.</p>
      </div>

      {!user ? (
        <div className="mt-8 rounded-2xl border border-brand-200 bg-white p-8 text-center">
          <p className="text-sm text-brand-600"><Link to="/login" className="font-semibold text-accent-600 underline">Login</Link> to submit feedback.</p>
        </div>
      ) : (
        <>
          {msg && <div className="mt-6"><Alert type={msg.type}>{msg.text}</Alert></div>}

          <form onSubmit={submit} className="mt-8 space-y-4 rounded-2xl border border-brand-200 bg-white p-8">
            <div>
              <label className="text-sm font-semibold">Subject</label>
              <input required minLength="3" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder="Delivery experience, product quality, website..." className="mt-1.5 w-full rounded-xl border border-brand-300 px-4 py-3 text-sm outline-none focus:border-accent-500" />
            </div>
            <div>
              <label className="text-sm font-semibold">Message</label>
              <textarea required minLength="10" rows="5" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-brand-300 px-4 py-3 text-sm outline-none focus:border-accent-500" />
            </div>
            <button disabled={busy} className="rounded-xl bg-brand-800 px-8 py-3 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50">
              {busy ? 'Sending...' : 'Submit Feedback'}
            </button>
          </form>

          {mine.length > 0 && (
            <section className="mt-10">
              <h2 className="font-serif text-xl font-bold">Your previous feedback</h2>
              <div className="mt-4 space-y-3">
                {mine.map((f) => (
                  <div key={f.id} className="rounded-xl border border-brand-200 bg-white p-4 text-sm">
                    <div className="flex justify-between">
                      <span className="font-semibold">{f.subject}</span>
                      <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-bold uppercase">{f.status}</span>
                    </div>
                    <p className="mt-1 text-brand-600">{f.message}</p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default Feedback;
