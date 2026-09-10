import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount, wishCount } = useCart();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const link = ({ isActive }) =>
    `text-sm font-medium transition-colors ${isActive ? 'text-accent-600' : 'text-brand-800 hover:text-accent-600'}`;

  return (
    <header className="sticky top-0 z-50 bg-brand-50/95 backdrop-blur border-b border-brand-200">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-800 text-brand-100 font-serif text-lg">FE</span>
              <span className="font-serif text-lg font-semibold tracking-tight text-brand-900 hidden sm:block">Furnishing Essentials</span>
            </Link>
            <div className="hidden md:flex items-center gap-6">
              <NavLink to="/products" className={link}>Shop</NavLink>
              <NavLink to="/custom-design" className={link}>Custom Design</NavLink>
              <NavLink to="/feedback" className={link}>Feedback</NavLink>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <div className="hidden lg:flex items-center rounded-full border border-brand-300 bg-white px-3 py-1.5 w-64 focus-within:border-accent-500">
              <svg className="h-4 w-4 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" /></svg>
              <input
                placeholder="Search furniture..."
                className="w-full bg-transparent pl-2 text-sm outline-none"
                onKeyDown={(e) => { if (e.key === 'Enter' && e.target.value.trim()) navigate(`/products?search=${encodeURIComponent(e.target.value.trim())}`); }}
              />
            </div>

            <Link to="/wishlist" className="relative p-2 rounded-full hover:bg-brand-100" aria-label="Wishlist">
              <svg className="h-5 w-5 text-brand-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              {wishCount > 0 && <span className="absolute -top-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-accent-600 text-[10px] font-bold text-white">{wishCount}</span>}
            </Link>

            <Link to="/cart" className="relative p-2 rounded-full hover:bg-brand-100" aria-label="Cart">
              <svg className="h-5 w-5 text-brand-800" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 grid h-4 w-4 place-items-center rounded-full bg-accent-600 text-[10px] font-bold text-white">{cartCount}</span>}
            </Link>

            {user ? (
              <div className="relative">
                <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 rounded-full border border-brand-300 bg-white py-1.5 pl-3 pr-2 text-sm font-medium hover:border-accent-500">
                  <span className="hidden sm:inline">{user.first_name}</span>
                  <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-700 text-xs font-bold text-white">
                    {user.first_name?.[0]}{user.last_name?.[0]}
                  </span>
                </button>
                {open && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl border border-brand-200 bg-white py-1.5 shadow-lg">
                    {user.role === 'admin' && <Link to="/admin" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm font-medium text-accent-600 hover:bg-brand-50">Admin Dashboard</Link>}
                    <Link to="/profile" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm hover:bg-brand-50">My Profile</Link>
                    <Link to="/orders" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm hover:bg-brand-50">My Orders</Link>
                    <button onClick={handleLogout} className="w-full border-t border-brand-100 px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50">Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="rounded-full bg-brand-800 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700">Login</Link>
            )}

            <button className="md:hidden p-2" onClick={() => setOpen(!open)} aria-label="Menu">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>

        {open && (
          <div className="md:hidden border-t border-brand-200 py-3 flex flex-col gap-3">
            <Link to="/products" onClick={() => setOpen(false)} className="text-sm font-medium">Shop</Link>
            <Link to="/custom-design" onClick={() => setOpen(false)} className="text-sm font-medium">Custom Design</Link>
            <Link to="/feedback" onClick={() => setOpen(false)} className="text-sm font-medium">Feedback</Link>
            {user && <Link to="/orders" onClick={() => setOpen(false)} className="text-sm font-medium">My Orders</Link>}
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
