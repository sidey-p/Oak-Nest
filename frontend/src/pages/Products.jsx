import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Scale, X, Check, Minus } from 'lucide-react';
import api, { errorMessage } from '../services/api';
import ProductGrid from '../components/products/ProductGrid';
import ProductFilters from '../components/products/ProductFilters';
import { Alert, Button } from '../components/common/UI';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { formatPrice, effectivePrice } from '../utils/format';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlistIds, setWishlistIds] = useState(new Set());
  const [compare, setCompare] = useState([]);
  const [compareOpen, setCompareOpen] = useState(false);
  const { toggleWishlist } = useCart();
  const { user } = useAuth();

  const filters = Object.fromEntries(searchParams.entries());

  useEffect(() => {
    api.get('/categories').then((d) => setCategories(d.data.categories)).catch(() => {});
    api.get('/products/meta/materials').then((d) => setMaterials(d.data.materials)).catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      api.get('/wishlist').then((d) => setWishlistIds(new Set(d.data.items.map((i) => i.product_id)))).catch(() => {});
    } else {
      setWishlistIds(new Set());
    }
  }, [user]);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data } = await api.get('/products', { params: { ...filters, perPage: 12 } });
      setProducts(data.products);
      setPagination(data.pagination);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [JSON.stringify(filters)]);

  useEffect(() => { loadProducts(); }, [loadProducts]);

  const applyFilters = (f) => {
    const next = {};
    Object.entries(f).forEach(([k, v]) => { if (v !== '' && v !== undefined) next[k] = v; });
    if (!next.page) next.page = 1;
    setSearchParams(next);
  };

  const goToPage = (p) => setSearchParams({ ...filters, page: p });

  const onWishlist = async (id) => {
    try {
      if (wishlistIds.has(id)) {
        await api.delete(`/wishlist/${id}`);
        setWishlistIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
      } else {
        await toggleWishlist(id);
        setWishlistIds((prev) => new Set([...prev, id]));
      }
    } catch (err) {
      alert(errorMessage(err));
    }
  };

  const toggleCompare = (p) => {
    setCompare((prev) => {
      if (prev.find((x) => x.id === p.id)) return prev.filter((x) => x.id !== p.id);
      if (prev.length >= 3) return [...prev.slice(1), p];
      return [...prev, p];
    });
  };

  return (
    <div className="relative">
      <div className="border-b border-brand-200 bg-gradient-to-br from-brand-900 to-brand-800 py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="reveal text-xs font-bold uppercase tracking-[0.3em] text-gold-300">Full catalogue</p>
          <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
            <h1 className="reveal font-serif text-3xl font-bold text-white sm:text-4xl" style={{ animationDelay: '60ms' }}>Shop Furniture</h1>
            {filters.search && (
              <Link to="/products" className="underline-grow text-sm text-brand-300 hover:text-gold-300">Clear search</Link>
            )}
          </div>
          <p className="mt-1 text-sm text-brand-300">{pagination.total} products found</p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {error && <div className="mb-6"><Alert>{error}</Alert></div>}

        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="lg:sticky lg:top-24 h-fit">
            <ProductFilters initial={filters} categories={categories} materials={materials} onApply={applyFilters} />
          </aside>
          <div>
            {!loading && products.length === 0 ? (
              <div className="animate-fade-up rounded-3xl border border-dashed border-brand-300 bg-white/70 p-12 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-100 text-3xl"><Scale className="h-7 w-7 text-brand-400" /></div>
                <h3 className="mt-4 font-serif text-xl font-semibold text-brand-900">We couldn't find that piece.</h3>
                <p className="mt-1 text-sm text-brand-500">Try another search, browse a category, or discover something unexpected.</p>
                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <Link to="/products"><Button variant="primary">Browse collections</Button></Link>
                  <Link to="/products?sort=popular"><Button variant="outline">Explore bestsellers</Button></Link>
                </div>
              </div>
            ) : (
              <>
                <ProductGrid
                  products={products}
                  loading={loading}
                  wishlistIds={wishlistIds}
                  onWishlist={onWishlist}
                  compareList={compare.map((c) => c.id)}
                  onCompare={toggleCompare}
                />
              </>
            )}

            {pagination.totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                <button disabled={pagination.page <= 1} onClick={() => goToPage(pagination.page - 1)}
                  className="rounded-full border border-brand-300 px-4 py-2 text-sm transition hover:border-accent-500 hover:bg-white disabled:opacity-40">← Prev</button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => goToPage(p)}
                    className={`h-9 w-9 rounded-full text-sm font-semibold transition-all ${p === pagination.page ? 'bg-brand-900 text-white shadow-soft scale-105' : 'border border-brand-300 hover:border-accent-500 hover:bg-white'}`}>
                    {p}
                  </button>
                ))}
                <button disabled={pagination.page >= pagination.totalPages} onClick={() => goToPage(pagination.page + 1)}
                  className="rounded-full border border-brand-300 px-4 py-2 text-sm transition hover:border-accent-500 hover:bg-white disabled:opacity-40">Next →</button>
              </div>
            )}
          </div>
        </div>

        {/* Compare bar + table */}
        {compare.length > 0 && (
          <div className="animate-fade-up fixed bottom-4 left-1/2 z-40 w-[calc(100%-2rem)] max-w-2xl -translate-x-1/2">
            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-brand-200 bg-white p-4 shadow-lift">
              <div className="flex gap-2 overflow-x-auto">
                {compare.map((p) => (
                  <span key={p.id} className="flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700">
                    {p.name.length > 18 ? `${p.name.slice(0, 18)}…` : p.name}
                    <button onClick={() => toggleCompare(p)} className="text-brand-400 hover:text-red-500"><X className="h-3 w-3" /></button>
                  </span>
                ))}
              </div>
              <div className="ml-auto flex items-center gap-2">
                <span className="hidden text-[10px] font-bold uppercase tracking-wider text-brand-400 sm:block">{compare.length}/3 selected</span>
                <button onClick={() => setCompare([])} className="text-xs font-semibold text-brand-500 hover:underline">Clear</button>
                {compare.length >= 2 && (
                  <Link to="/products?compare=1" state={{ compare }} onClick={(e) => { e.preventDefault(); setCompareOpen(true); }}
                    className="btn-shine inline-flex items-center gap-1.5 rounded-full bg-brand-900 px-4 py-2 text-xs font-bold text-white hover:bg-brand-800">
                    <Scale className="h-3.5 w-3.5" /> Compare
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comparison table */}
      {compareOpen && compare.length >= 2 && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-brand-950/60 p-4 backdrop-blur-sm" onClick={() => setCompareOpen(false)}>
          <div className="animate-scale-in max-h-[85vh] w-full max-w-3xl overflow-auto rounded-3xl border border-brand-200 bg-white p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-xl font-bold text-brand-900">Compare pieces</h3>
              <button onClick={() => setCompareOpen(false)} className="rounded-full p-2 hover:bg-brand-100"><X className="h-5 w-5" /></button>
            </div>
            <table className="mt-4 w-full text-sm">
              <thead>
                <tr>
                  <th className="w-32 p-2 text-left text-xs uppercase tracking-wider text-brand-400">Feature</th>
                  {compare.map((p) => (
                    <th key={p.id} className="p-2 text-left">
                      <img src={p.main_image} alt="" className="h-20 w-24 rounded-lg object-cover" />
                      <p className="mt-1.5 line-clamp-1 text-xs font-semibold text-brand-900">{p.name}</p>
                      <p className="text-xs font-bold text-brand-700">{formatPrice(effectivePrice(p))}</p>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100">
                {[
                  ['Material', (p) => p.material || '—'],
                  ['Best for', (p) => p.category_name],
                  ['Brand', (p) => p.brand || '—'],
                  ['Rating', (p) => `★ ${Number(p.avg_rating || 0).toFixed(1)} (${p.review_count})`],
                  ['Availability', (p) => (p.stock > 0 ? (p.stock <= 5 ? `Only ${p.stock} left` : 'In stock') : 'Out of stock')],
                ].map(([label, fn]) => (
                  <tr key={label}>
                    <td className="p-2 text-xs font-semibold uppercase tracking-wide text-brand-400">{label}</td>
                    {compare.map((p) => (
                      <td key={p.id} className="p-2 text-brand-800">{fn(p)}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
