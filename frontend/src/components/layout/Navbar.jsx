import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Search, Heart, ShoppingBag, Menu, X, ChevronRight, Clock, Home } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useRecent } from '../../hooks/useRecent';

const NAV_LINKS = [
  { to: '/products', label: 'Shop', sub: 'Discover pieces for every room.' },
  { to: '/products?view=spaces', label: 'Shop by Space', sub: 'Find furniture made for the way you live.' },
  { to: '/products?view=collections', label: 'Collections', sub: 'Explore our newest and most-loved pieces.' },
  { to: '/inspiration', label: 'Inspiration', sub: 'Ideas to help bring your space together.' },
  { to: '/custom-design', label: 'Custom Design', sub: "Can't find the perfect fit? Let's create it." },
];

const POPULAR_SEARCHES = ['Sofas', 'Office Chairs', 'Dining Tables', 'Storage', 'Lamps'];
const SPACES = ['living-room', 'bedroom', 'office', 'kitchen'];

const Navbar = () => {
  const { user, logout } = useAuth();
  const { cartCount, wishCount } = useCart();
  const { recent } = useRecent();
  const [open, setOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const searchRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll);
    const onClick = (e) => { if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => { window.removeEventListener('scroll', onScroll); document.removeEventListener('mousedown', onClick); };
  }, []);

  const submitSearch = (value) => {
    const q = (value ?? searchValue).trim();
    if (!q) return;
    setSearchOpen(false);
    navigate(`/products?search=${encodeURIComponent(q)}`);
  };

  const link = ({ isActive }) =>
    `underline-grow text-sm font-semibold tracking-wide transition-colors ${isActive ? 'text-accent-600 active' : 'text-brand-800 hover:text-accent-600'}`;

  return (
    <header className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? 'glass-panel shadow-soft border-b border-brand-200/70' : 'bg-brand-50 border-b border-transparent'}`}>
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-18 items-center justify-between py-2.5">
          {/* Logo */}
          <Link to="/" className="group flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-800 to-brand-950 shadow-soft transition-transform duration-300 group-hover:scale-105 group-hover:-rotate-3">
              <svg viewBox="0 0 24 24" className="h-5 w-5 text-gold-300" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22v-7" /><path d="M9 15h6l3-6-3-4H9L6 9l3 6z" /><path d="M9 9c0-2 1.5-4 3-4" />
              </svg>
            </span>
            <span className="hidden font-serif text-lg font-semibold tracking-tight text-brand-900 sm:block">
              Oak <span className="gradient-text">&amp; Nest</span>
            </span>
          </Link>

          {/* Centered nav */}
          <div className="absolute left-1/2 hidden -translate-x-1/2 items-center gap-7 lg:flex">
            {NAV_LINKS.map((l) => (
              <div key={l.label} className="group relative">
                <NavLink to={l.to} className={link}>{l.label}</NavLink>
                <div className="pointer-events-none absolute left-1/2 top-full z-50 w-56 -translate-x-1/2 pt-3 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:opacity-100">
                  <div className="rounded-2xl border border-brand-200 bg-white p-3 shadow-lift">
                    <p className="rounded-xl bg-brand-50 px-3 py-2 text-xs leading-relaxed text-brand-600">{l.sub}</p>
                    <Link to={l.to} className="mt-1 flex items-center gap-1 rounded-xl px-3 py-2 text-xs font-semibold text-accent-600 hover:bg-brand-50">
                      Explore <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right cluster */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Search */}
            <div ref={searchRef} className="relative hidden sm:block">
              <button onClick={() => setSearchOpen(!searchOpen)} className="rounded-full p-2.5 transition-colors hover:bg-brand-100" aria-label="Search">
                <Search className="h-5 w-5 text-brand-800" />
              </button>

              {searchOpen && (
                <div className="animate-scale-in absolute right-0 top-full z-50 mt-2 w-96 origin-top-right rounded-2xl border border-brand-200 bg-white p-4 shadow-lift">
                  <div className="flex items-center rounded-xl border border-brand-300 px-3 focus-within:border-accent-500">
                    <Search className="h-4 w-4 text-brand-400" />
                    <input
                      autoFocus
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') submitSearch(); }}
                      placeholder="What are you looking for?"
                      className="w-full bg-transparent px-2 py-2.5 text-sm outline-none placeholder:text-brand-400"
                    />
                  </div>

                  <div className="mt-3">
                    <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-400"><Search className="h-3 w-3" /> Popular searches</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {POPULAR_SEARCHES.map((s) => (
                        <button key={s} onClick={() => submitSearch(s)} className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium text-brand-700 transition hover:border-accent-500 hover:text-accent-600">{s}</button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-3">
                    <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-400"><Home className="h-3 w-3" /> Browse by space</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {SPACES.map((s) => (
                        <Link key={s} to={`/products?category=${s}`} onClick={() => setSearchOpen(false)} className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-medium capitalize text-brand-700 transition hover:border-accent-500 hover:text-accent-600">
                          {s.replace('-', ' ')}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {recent.length > 0 && (
                    <div className="mt-3 border-t border-brand-100 pt-3">
                      <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-brand-400"><Clock className="h-3 w-3" /> Recently viewed</p>
                      <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
                        {recent.slice(0, 4).map((p) => (
                          <Link key={p.id} to={`/products/${p.slug}`} onClick={() => setSearchOpen(false)} className="flex w-28 shrink-0 flex-col gap-1">
                            <img src={p.main_image} alt={p.name} className="h-14 w-28 rounded-lg border border-brand-200 object-cover" />
                            <span className="line-clamp-1 text-[10px] font-medium text-brand-700">{p.name}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <Link to="/wishlist" className="group relative rounded-full p-2.5 transition-colors hover:bg-brand-100" aria-label="Wishlist">
              <Heart className="h-5 w-5 text-brand-800 transition-transform group-hover:scale-110" />
              {wishCount > 0 && <span className="absolute -top-0.5 -right-0.5 grid h-4.5 w-4.5 place-items-center rounded-full bg-accent-600 text-[10px] font-bold text-white animate-pop">{wishCount}</span>}
            </Link>

            <Link to="/cart" className="group relative rounded-full p-2.5 transition-colors hover:bg-brand-100" aria-label="Cart">
              <ShoppingBag className="h-5 w-5 text-brand-800 transition-transform group-hover:scale-110" />
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
                    <button onClick={() => { logout(); navigate('/'); }} className="w-full border-t border-brand-100 px-4 py-2 text-left text-sm text-red-700 hover:bg-red-50">Logout</button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login">
                <span className="btn-shine inline-flex items-center rounded-full bg-brand-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-800 hover:shadow-md">Login</span>
              </Link>
            )}

            <button className="rounded-full p-2 md:hidden hover:bg-brand-100" onClick={() => setMenuOpen(!menuOpen)} aria-label="Menu">
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer */}
      <div className={`md:hidden overflow-hidden transition-all duration-300 ease-out ${menuOpen ? 'max-h-96 border-t border-brand-200' : 'max-h-0'}`}>
        <div className="flex flex-col gap-1 bg-brand-50 px-4 py-4">
          <div className="mb-2 flex items-center rounded-xl border border-brand-300 px-3 sm:hidden">
            <Search className="h-4 w-4 text-brand-400" />
            <input placeholder="What are you looking for?" className="w-full bg-transparent px-2 py-2.5 text-sm outline-none"
              onKeyDown={(e) => { if (e.key === 'Enter') { submitSearch(e.target.value); setMenuOpen(false); } } } />
          </div>
          {NAV_LINKS.map((l, i) => (
            <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
              className="animate-slide-in-right rounded-xl px-3 py-2.5 text-sm font-semibold text-brand-800 hover:bg-brand-100"
              style={{ animationDelay: `${i * 60}ms` }}>
              {l.label}
              <span className="ml-2 text-xs font-normal text-brand-400">{l.sub}</span>
            </Link>
          ))}
          {user && <Link to="/orders" onClick={() => setMenuOpen(false)} className="rounded-xl px-3 py-2.5 text-sm font-semibold text-brand-800 hover:bg-brand-100">My Orders</Link>}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
