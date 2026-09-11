import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/common/UI';

const Register = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', phone: '', password: '', confirm: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirm) return setError('Passwords do not match');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setBusy(true);
    try {
      await register({ first_name: form.first_name, last_name: form.last_name, email: form.email, phone: form.phone, password: form.password });
      navigate('/');
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="relative mx-auto max-w-md overflow-hidden px-4 py-16">
      <div className="pointer-events-none absolute -top-10 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-gold-300/20 blur-3xl" />
      <h1 className="reveal text-center font-serif text-3xl font-bold text-brand-900">Create Account</h1>
      <p className="reveal mt-2 text-center text-sm text-brand-500" style={{ animationDelay: '60ms' }}>Join Oak &amp; Nest — make room for what matters.</p>

      {error && <div className="mt-6"><Alert>{error}</Alert></div>}

      <form onSubmit={submit} className="reveal relative mt-8 space-y-5 rounded-2xl border border-brand-200 bg-white p-8 shadow-lift" style={{ animationDelay: '120ms' }}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="reg-first" className="text-sm font-semibold text-brand-800">First name</label>
            <input id="reg-first" required minLength="2" value={form.first_name} onChange={set('first_name')}
              className="mt-1.5 w-full rounded-xl border border-brand-300 px-4 py-3 text-sm outline-none transition-all focus:border-accent-500 focus:shadow-glow" />
          </div>
          <div>
            <label htmlFor="reg-last" className="text-sm font-semibold text-brand-800">Last name</label>
            <input id="reg-last" required minLength="2" value={form.last_name} onChange={set('last_name')}
              className="mt-1.5 w-full rounded-xl border border-brand-300 px-4 py-3 text-sm outline-none transition-all focus:border-accent-500 focus:shadow-glow" />
          </div>
        </div>
        <div>
          <label htmlFor="reg-email" className="text-sm font-semibold text-brand-800">Email</label>
          <input id="reg-email" type="email" required value={form.email} onChange={set('email')}
            className="mt-1.5 w-full rounded-xl border border-brand-300 px-4 py-3 text-sm outline-none transition-all focus:border-accent-500 focus:shadow-glow" />
        </div>
        <div>
          <label htmlFor="reg-phone" className="text-sm font-semibold text-brand-800">Phone <span className="font-normal text-brand-400">(optional)</span></label>
          <input id="reg-phone" value={form.phone} onChange={set('phone')} placeholder="+91 90000 00000"
            className="mt-1.5 w-full rounded-xl border border-brand-300 px-4 py-3 text-sm outline-none transition-all focus:border-accent-500 focus:shadow-glow" />
        </div>
        <div>
          <label htmlFor="reg-password" className="text-sm font-semibold text-brand-800">Password</label>
          <input id="reg-password" type="password" required value={form.password} onChange={set('password')}
            className="mt-1.5 w-full rounded-xl border border-brand-300 px-4 py-3 text-sm outline-none transition-all focus:border-accent-500 focus:shadow-glow" />
        </div>
        <div>
          <label htmlFor="reg-confirm" className="text-sm font-semibold text-brand-800">Confirm password</label>
          <input id="reg-confirm" type="password" required value={form.confirm} onChange={set('confirm')}
            className="mt-1.5 w-full rounded-xl border border-brand-300 px-4 py-3 text-sm outline-none transition-all focus:border-accent-500 focus:shadow-glow" />
        </div>
        <button disabled={busy} className="btn-shine w-full rounded-full bg-brand-900 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-800 hover:shadow-md disabled:opacity-50">
          {busy ? 'Creating account...' : 'Create Account'}
        </button>
        <p className="text-center text-sm text-brand-500">
          Already registered? <Link to="/login" className="underline-grow font-semibold text-accent-600">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
