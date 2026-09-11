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
    <div className="grid min-h-[80vh] lg:grid-cols-2">
      {/* Visual side */}
      <div className="relative hidden overflow-hidden bg-brand-950 lg:block">
        <div className="dot-grid absolute inset-0 opacity-40" />
        <div className="pointer-events-none absolute -right-20 top-10 h-96 w-96 rounded-full bg-gold-500/20 blur-3xl animate-float" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-800 to-brand-950 font-serif text-lg text-gold-300 shadow-soft">FE</span>
            <span className="font-serif text-lg font-semibold text-white">Oak <span className="gradient-text">&amp; Nest</span></span>
          </Link>
          <div className="reveal">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold-300">Welcome back</p>
            <h2 className="mt-3 font-serif text-4xl font-bold leading-tight text-white">Timeless pieces, <span className="gradient-text italic">waiting for you.</span></h2>
            <p className="mt-4 max-w-sm text-brand-300">Sign in to track orders, manage your wishlist, and pick up right where you left off.</p>
          </div>
          <p className="text-xs text-brand-500">&copy; {new Date().getFullYear()} Oak &amp; Nest. Make room for what matters.</p>
        </div>
      </div>

      {/* Form side */}
      <div className="flex flex-col justify-center px-4 py-16 sm:px-10 lg:px-16">
        <div className="reveal mx-auto w-full max-w-md">
          <h1 className="font-serif text-3xl font-bold text-brand-900">Welcome Back</h1>
          <p className="mt-2 text-sm text-brand-500">Welcome back to Oak &amp; Nest</p>

          {error && <div className="mt-6"><Alert>{error}</Alert></div>}

          <form onSubmit={submit} className="mt-8 space-y-5">
            <div>
              <label htmlFor="login-email" className="text-sm font-semibold text-brand-800">Email</label>
              <input id="login-email" type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-brand-300 px-4 py-3 text-sm outline-none transition-all focus:border-accent-500 focus:shadow-glow"
                placeholder="you@example.com" />
            </div>
            <div>
              <label htmlFor="login-password" className="text-sm font-semibold text-brand-800">Password</label>
              <input id="login-password" type="password" required value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                className="mt-1.5 w-full rounded-xl border border-brand-300 px-4 py-3 text-sm outline-none transition-all focus:border-accent-500 focus:shadow-glow"
                placeholder="••••••••" />
            </div>
            <button disabled={busy}
              className="btn-shine w-full rounded-full bg-brand-900 py-3.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-800 hover:shadow-md disabled:opacity-50">
              {busy ? 'Signing in...' : 'Login'}
            </button>
            <p className="text-center text-sm text-brand-500">
              New here? <Link to="/register" className="underline-grow font-semibold text-accent-600">Create an account</Link>
            </p>
            <div className="rounded-xl border border-dashed border-brand-300 bg-brand-50 p-4 text-xs text-brand-600">
              <p className="font-semibold">Demo customer account:</p>
              <p>customer@furnishing.local / customer123</p>
              <p className="mt-1 text-brand-400">Admin credentials are provided separately and must be kept private.</p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
