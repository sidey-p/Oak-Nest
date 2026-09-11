import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api, { errorMessage } from '../services/api';
import ProductGrid from '../components/products/ProductGrid';
import ProductFilters from '../components/products/ProductFilters';
import { Alert } from '../components/common/UI';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Products = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [wishlistIds, setWishlistIds] = useState(new Set());
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
            <ProductGrid products={products} loading={loading} wishlistIds={wishlistIds} onWishlist={onWishlist} />

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
      </div>
    </div>
  );
};

export default Products;
