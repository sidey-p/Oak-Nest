import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Alert } from '../components/common/UI';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      const user = await login(form.email, form.password);
      navigate(location.state?.from || (user.role === 'admin' ? '/admin' : '/'));
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16">
      <h1 className="text-center font-serif text-3xl font-bold text-brand-900">Welcome Back</h1>
      <p className="mt-2 text-center text-sm text-brand-500">Login to your Furnishing Essentials account</p>

      {error && <div className="mt-6"><Alert>{error}</Alert></div>}

      <form onSubmit={submit} className="mt-8 space-y-5 rounded-2xl border border-brand-200 bg-white p-8 shadow-sm">
        <div>
          <label htmlFor="login-email" className="text-sm font-semibold text-brand-800">Email</label>
          <input id="login-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="mt-1.5 w-full rounded-xl border border-brand-300 px-4 py-3 text-sm outline-none focus:border-accent-500"
            placeholder="you@example.com" />
        </div>
        <div>
          <label htmlFor="login-password" className="text-sm font-semibold text-brand-800">Password</label>
          <input id="login-password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="mt-1.5 w-full rounded-xl border border-brand-300 px-4 py-3 text-sm outline-none focus:border-accent-500"
            placeholder="••••••••" />
        </div>
        <button disabled={busy}
          className="w-full rounded-xl bg-brand-800 py-3.5 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-50">
          {busy ? 'Signing in...' : 'Login'}
        </button>
        <p className="text-center text-sm text-brand-500">
          New here? <Link to="/register" className="font-semibold text-accent-600 hover:underline">Create an account</Link>
        </p>
        <div className="rounded-xl bg-brand-50 p-4 text-xs text-brand-600">
          <p className="font-semibold">Demo accounts (after seeding):</p>
          <p>Admin — admin@furnishing.local / admin123</p>
          <p>Customer — customer@furnishing.local / customer123</p>
        </div>
      </form>
    </div>
  );
};

export default Login;
