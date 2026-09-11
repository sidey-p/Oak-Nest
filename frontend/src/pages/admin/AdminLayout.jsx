import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const LINKS = [
  ['.', 'Dashboard', 'M3 12l9-9 9 9M5 10v10a1 1 0 001 1h4v-6h4v6h4a1 1 0 001-1V10'],
  ['products', 'Products', 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4'],
  ['categories', 'Categories', 'M4 6h16M4 12h16M4 18h10'],
  ['orders', 'Orders', 'M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z'],
  ['customers', 'Customers', 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5 5 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z'],
  ['payments', 'Payments', 'M3 10h18M7 15h2m4 0h2M5 5h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2z'],
  ['shipments', 'Shipping', 'M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6 0a1 1 0 001 1h1M5 17a2 2 0 102 0m10 0a2 2 0 102 0'],
  ['reviews', 'Reviews', 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.284 3.958a1 1 0 00.95.69h4.154c.969 0 1.371 1.24.588 1.81l-3.357 2.44a1 1 0 00-.363 1.118l1.284 3.958c.3.921-.755 1.688-1.539 1.118l-3.357-2.44a1 1 0 00-1.176 0l-3.357 2.44c-.783.57-1.838-.197-1.539-1.118l1.284-3.958a1 1 0 00-.363-1.118L2.98 9.385c-.783-.57-.38-1.81.588-1.81h4.154a1 1 0 00.95-.69l1.284-3.958z'],
  ['coupons', 'Coupons', 'M7 7h.01M7 3h5a1.99 1.99 0 011.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.99 1.99 0 013 12V7a4 4 0 014-4z'],
  ['custom-requests', 'Custom Requests', 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'],
  ['feedback', 'Feedback', 'M7 8h10M7 12h6m-6 8l3-3h6a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v9a2 2 0 002 2h2v2a1 1 0 001.555.832z'],
];

const AdminLayout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-brand-50">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-brand-800 bg-brand-950 md:flex">
        <div className="flex h-16 items-center gap-2.5 border-b border-brand-800 px-5">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-brand-700 to-brand-900 font-serif text-lg text-gold-300 shadow-soft">FE</span>
          <div>
            <p className="text-sm font-bold text-white">Admin</p>
            <p className="text-[10px] uppercase tracking-wider text-brand-400">Furnishing Essentials</p>
          </div>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {LINKS.map(([to, label, path], i) => (
            <NavLink key={to} to={to === '.' ? '/admin' : `/admin/${to}`} end={to === '.'}
              className={({ isActive }) =>
                `animate-slide-in-right flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-200 ${isActive ? 'bg-gradient-to-r from-brand-700 to-brand-800 text-white shadow-soft' : 'text-brand-300 hover:bg-brand-900 hover:text-white'}`}
              style={{ animationDelay: `${i * 30}ms` }}>
              <svg className="h-4.5 w-4.5 shrink-0" style={{ width: 18, height: 18 }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d={path} /></svg>
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-brand-800 p-4">
          <div className="mb-3 flex items-center gap-3 px-1">
            <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-gold-400 to-gold-600 text-xs font-bold text-brand-950">
              {user?.first_name?.[0]}{user?.last_name?.[0]}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-white">{user?.first_name} {user?.last_name}</p>
              <p className="truncate text-[10px] text-brand-400">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => navigate('/')} className="flex-1 rounded-full border border-brand-700 py-2 text-xs font-semibold text-brand-200 transition hover:bg-brand-800">Storefront</button>
            <button onClick={() => { logout(); navigate('/'); }} className="flex-1 rounded-full border border-red-900 py-2 text-xs font-semibold text-red-400 transition hover:bg-red-950">Logout</button>
          </div>
        </div>
      </aside>

      <div className="flex-1">
        <header className="glass-panel flex h-16 items-center justify-between border-b border-brand-200 px-6">
          <p className="font-serif text-lg font-semibold text-brand-900 md:hidden">Admin Panel</p>
          <p className="hidden text-sm text-brand-500 md:block">Signed in as administrator</p>
          <div className="flex gap-2 md:hidden">
            <button onClick={() => navigate('/')} className="rounded-full border border-brand-300 px-3 py-1.5 text-xs font-semibold">Store</button>
            <button onClick={() => { logout(); navigate('/'); }} className="rounded-full border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-600">Logout</button>
          </div>
        </header>
        <main className="animate-fade-in overflow-x-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
