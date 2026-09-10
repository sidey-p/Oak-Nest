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
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-center font-serif text-3xl font-bold text-brand-900">Create Account</h1>
      <p className="mt-2 text-center text-sm text-brand-500">Join Furnishing Essentials today</p>

      {error && <div className="mt-6"><Alert>{error}</Alert></div>}

      <form onSubmit={submit} className="mt-8 space-y-5 rounded-2xl border border-brand-200 bg-white p-8 shadow-sm">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="reg-first" className="text-sm font-semibold text-brand-800">First name</label>
            <input id="reg-first" required minLength="2" value={form.first_name} onChange={set('first_name')}
              className="mt-1.5 w-full rounded-xl border border-brand-300 px-4 py-3 text-sm outline-none focus:border-accent-500" />
          </div>
          <div>
            <label htmlFor="reg-last" className="text-sm font-semibold text-brand-800">Last name</label>
            <input id="reg-last" required minLength="2" value={form.last_name} onChange={set('last_name')}
              className="mt-1.5 w-full rounded-xl border border-brand-300 px-4 py-3 text-sm outline-none focus:border-accent-500" />
          </div>
        </div>
        <div>
          <label htmlFor="reg-email" className="text-sm font-semibold text-brand-800">Email</label>
          <input id="reg-email" type="email" required value={form.email} onChange={set('email')}
            className="mt-1.5 w-full rounded-xl border border-brand-300 px-4 py-3 text-sm outline-none focus:border-accent-500" />
        </div>
        <div>
          <label htmlFor="reg-phone" className="text-sm font-semibold text-brand-800">Phone <span className="font-normal text-brand-400">(optional)</span></label>
          <input id="reg-phone" value={form.phone} onChange={set('phone')} placeholder="+91 90000 00000"
            className="mt-1.5 w-full rounded-xl border border-brand-300 px-4 py-3 text-sm outline-none focus:border-accent-500" />
        </div>
        <div>
          <label htmlFor="reg-password" className="text-sm font-semibold text-brand-800">Password</label>
          <input id="reg-password" type="password" required value={form.password} onChange={set('password')}
            className="mt-1.5 w-full rounded-xl border border-brand-300 px-4 py-3 text-sm outline-none focus:border-accent-500" />
        </div>
        <div>
          <label htmlFor="reg-confirm" className="text-sm font-semibold text-brand-800">Confirm password</label>
          <input id="reg-confirm" type="password" required value={form.confirm} onChange={set('confirm')}
            className="mt-1.5 w-full rounded-xl border border-brand-300 px-4 py-3 text-sm outline-none focus:border-accent-500" />
        </div>
        <button disabled={busy} className="w-full rounded-xl bg-brand-800 py-3.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50">
          {busy ? 'Creating account...' : 'Create Account'}
        </button>
        <p className="text-center text-sm text-brand-500">
          Already registered? <Link to="/login" className="font-semibold text-accent-600 hover:underline">Login</Link>
        </p>
      </form>
    </div>
  );
};

export default Register;
