import { useEffect, useState } from 'react';

const ProductFilters = ({ initial = {}, categories, materials, onApply }) => {
  const [search, setSearch] = useState(initial.search || '');
  const [category, setCategory] = useState(initial.category || '');
  const [minPrice, setMinPrice] = useState(initial.minPrice || '');
  const [maxPrice, setMaxPrice] = useState(initial.maxPrice || '');
  const [material, setMaterial] = useState(initial.material || '');
  const [sort, setSort] = useState(initial.sort || '');

  useEffect(() => {
    setSearch(initial.search || '');
    setCategory(initial.category || '');
    setMinPrice(initial.minPrice || '');
    setMaxPrice(initial.maxPrice || '');
    setMaterial(initial.material || '');
  }, [initial]);

  const apply = (e) => {
    e?.preventDefault();
    onApply({ search, category, minPrice, maxPrice, material, sort });
  };

  const reset = () => {
    setSearch(''); setCategory(''); setMinPrice(''); setMaxPrice(''); setMaterial(''); setSort('');
    onApply({ search: '', category: '', minPrice: '', maxPrice: '', material: '', sort: '' });
  };

  return (
    <form onSubmit={apply} className="space-y-5 rounded-2xl border border-brand-200 bg-white p-5">
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-brand-600">Search</label>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="sofa, oak, lamp..."
          className="mt-1.5 w-full rounded-lg border border-brand-300 px-3 py-2 text-sm outline-none focus:border-accent-500" />
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-brand-600">Category</label>
        <select value={category} onChange={(e) => setCategory(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-brand-300 bg-white px-3 py-2 text-sm outline-none focus:border-accent-500">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-brand-600">Price range (₹)</label>
        <div className="mt-1.5 flex gap-2">
          <input type="number" min="0" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} placeholder="Min"
            className="w-full rounded-lg border border-brand-300 px-3 py-2 text-sm outline-none focus:border-accent-500" />
          <input type="number" min="0" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Max"
            className="w-full rounded-lg border border-brand-300 px-3 py-2 text-sm outline-none focus:border-accent-500" />
        </div>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-brand-600">Material</label>
        <select value={material} onChange={(e) => setMaterial(e.target.value)}
          className="mt-1.5 w-full rounded-lg border border-brand-300 bg-white px-3 py-2 text-sm outline-none focus:border-accent-500">
          <option value="">All materials</option>
          {materials.map((m) => <option key={m} value={m}>{m}</option>)}
        </select>
      </div>

      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-brand-600">Sort by</label>
        <select value={sort} onChange={(e) => { setSort(e.target.value); onApply({ search, category, minPrice, maxPrice, material, sort: e.target.value }); }}
          className="mt-1.5 w-full rounded-lg border border-brand-300 bg-white px-3 py-2 text-sm outline-none focus:border-accent-500">
          <option value="">Default</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="newest">Newest</option>
          <option value="popular">Most Reviewed</option>
          <option value="rating">Top Rated</option>
        </select>
      </div>

      <div className="flex gap-2">
        <button type="submit" className="flex-1 rounded-lg bg-brand-800 py-2.5 text-sm font-semibold text-white hover:bg-brand-700">Apply Filters</button>
        <button type="button" onClick={reset} className="rounded-lg border border-brand-300 px-4 py-2.5 text-sm font-medium hover:bg-brand-50">Reset</button>
      </div>
    </form>
  );
};

export default ProductFilters;
