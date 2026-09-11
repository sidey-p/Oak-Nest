import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const NAV_LINKS = [
  { to: '/products', label: 'Shop' },
  { to: '/custom-design', label: 'Custom Design' },
  { to: '/feedback', label: 'Feedback' },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount, wishCount } = useCart();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const link = ({ isActive }) =>
    `underline-grow text-sm font-semibold tracking-wide transition-colors ${isActive ? 'text-accent-600 active' : 'text-brand-800 hover:text-accent-600'}`;

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${scrolled ? 'glass-panel shadow-soft border-b border-brand-200/70' : 'bg-brand-50 border-b border-transparent'}`}>
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between py-2.5">
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-800 to-brand-950 font-serif text-lg text-gold-300 shadow-soft transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
              FE
            </span>
            <span className="hidden font-serif text-lg font-semibold tracking-tight text-brand-900 sm:block">
              Furnishing <span className="gradient-text">Essentials</span>
            </span>
          </Link>

          {/* Centered nav */}
          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-8 md:flex">
            {NAV_LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} className={link}>{l.label}</NavLink>
            ))}
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            <div className="hidden lg:flex items-center rounded-full border border-brand-300 bg-white/70 px-3.5 py-2 w-60 transition-all duration-300 focus-within:w-72 focus-within:border-accent-500 focus-within:shadow-glow">
              <svg className="h-4 w-4 shrink-0 text-brand-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" /></svg>
              <input
                placeholder="Search furniture..."
                className="w-full bg-transparent pl-2 text-sm outline-none placeholder:text-brand-400"
                onKeyDown={(e) => { if (e.key === 'Enter' && e.target.value.trim()) navigate(`/products?search=${encodeURIComponent(e.target.value.trim())}`); }}
              />
            </div>

            <Link to="/wishlist" className="group relative rounded-full p-2.5 transition-colors hover:bg-brand-100" aria-label="Wishlist">
              <svg className="h-5 w-5 text-brand-800 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
              {wishCount > 0 && <span className="absolute -top-0.5 -right-0.5 grid h-4.5 w-4.5 place-items-center rounded-full bg-accent-600 text-[10px] font-bold text-white animate-pop">{wishCount}</span>}
            </Link>

            <Link to="/cart" className="group relative rounded-full p-2.5 transition-colors hover:bg-brand-100" aria-label="Cart">
              <svg className="h-5 w-5 text-brand-800 transition-transform group-hover:scale-110" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              {cartCount > 0 && <span className="absolute -top-0.5 -right-0.5 grid h-4.5 w-4.5 place-items-center rounded-full bg-accent-600 text-[10px] font-bold text-white animate-pop">{cartCount}</span>}
            </Link>

            {user ? (
              <div className="relative">
                <button onClick={() => setOpen(!open)} className="flex items-center gap-1.5 rounded-full border border-brand-300 bg-white py-1.5 pl-3 pr-2 text-sm font-medium transition-all hover:border-accent-500 hover:shadow-soft">
                  <span className="hidden sm:inline">{user.first_name}</span>
                  <span className="grid h-6.5 w-6.5 place-items-center rounded-full bg-gradient-to-br from-brand-700 to-brand-900 text-xs font-bold text-gold-200">
                    {user.first_name?.[0]}{user.last_name?.[0]}
                  </span>
                </button>
                {open && (
                  <div className="animate-scale-in absolute right-0 mt-2 w-52 origin-top-right rounded-2xl border border-brand-200 bg-white py-1.5 shadow-lift">
                    {user.role === 'admin' && <Link to="/admin" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm font-semibold text-accent-600 hover:bg-brand-50">Admin Dashboard</Link>}
                    <Link to="/profile" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm hover:bg-brand-50">My Profile</Link>
                    <Link to="/orders" onClick={() => setOpen(false)} className="block px-4 py-2 text-sm hover:bg-brand-50">My Orders</Link>
                    <button onClick={handleLogout} className="w-full border-t border-brand-100 px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50">Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <span className="btn-shine inline-flex items-center rounded-full bg-brand-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800 hover:shadow-md">Login</span>
              </Link>
            )}

            <button className="rounded-full p-2 md:hidden hover:bg-brand-100" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              <svg className={`h-5 w-5 transition-transform duration-300 ${menuOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {menuOpen
                  ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  : <path strokeLinecap="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${menuOpen ? 'max-h-72 border-t border-brand-200' : 'max-h-0'}`}>
        <div className="flex flex-col gap-1 px-4 py-4 bg-brand-50">
          {NAV_LINKS.map((l, i) => (
            <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
              className="animate-slide-in-right rounded-xl px-3 py-2.5 text-sm font-semibold text-brand-800 hover:bg-brand-100"
              style={{ animationDelay: `${i * 60}ms` }}>
              {l.label}
            </Link>
          ))}
          {user && <Link to="/orders" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-semibold text-brand-800 hover:bg-brand-100">My Orders</Link>}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
