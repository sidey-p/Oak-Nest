import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { errorMessage } from '../services/api';
import ProductGrid from '../components/products/ProductGrid';
import { Alert, Spinner } from '../components/common/UI';
import { formatPrice, effectivePrice } from '../utils/format';

const Hero = () => (
  <section className="relative overflow-hidden bg-brand-900">
    <div className="absolute inset-0 bg-gradient-to-r from-brand-950 via-brand-900 to-brand-800" />
    <div className="absolute right-0 top-0 h-full w-1/2 opacity-25" style={{ backgroundImage: 'radial-gradient(circle at 70% 40%, #b08968 0%, transparent 55%)' }} />
    <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 sm:py-28 lg:px-8">
      <div className="max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-brand-300">Crafted for every space</p>
        <h1 className="mt-4 font-serif text-4xl font-bold leading-tight text-white sm:text-5xl lg:text-6xl">
          Furnish your world with <span className="text-brand-300">timeless elegance</span>
        </h1>
        <p className="mt-6 text-lg leading-relaxed text-brand-200">
          From cozy homes to grand hotels — discover premium furniture, lighting, rugs and décor, thoughtfully curated and built to last generations.
        </p>
        <div className="mt-9 flex flex-wrap gap-4">
          <Link to="/products" className="rounded-full bg-brand-300 px-8 py-3.5 text-sm font-bold text-brand-950 shadow-lg transition hover:bg-brand-200">
            Explore Collection
          </Link>
          <Link to="/custom-design" className="rounded-full border border-brand-400 px-8 py-3.5 text-sm font-bold text-white transition hover:bg-brand-800">
            Custom Furniture
          </Link>
        </div>
        <div className="mt-12 flex gap-10 text-white">
          {[['500+', 'Products'], ['50k+', 'Happy Homes'], ['9', 'Categories']].map(([n, l]) => (
            <div key={l}><div className="text-2xl font-bold">{n}</div><div className="text-xs uppercase tracking-wider text-brand-300">{l}</div></div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const WHY = [
  ['artisan', 'Artisan Craftsmanship', 'Every piece is crafted by skilled artisans using sustainably sourced materials.'],
  ['delivery', 'White-Glove Delivery', 'Free delivery above ₹5,000 with careful assembly at your doorstep.'],
  ['warranty', '5-Year Warranty', 'We stand behind our furniture with industry-leading coverage.'],
  ['support', 'Personal Design Help', 'Free consultation from our in-house interior design team.'],
];

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [f, b, c, r] = await Promise.all([
          api.get('/products', { params: { sort: 'rating', perPage: 8 } }),
          api.get('/products', { params: { sort: 'popular', perPage: 4 } }),
          api.get('/categories'),
          api.get('/reviews/products/3/reviews'),
        ]);
        setFeatured(f.data.products);
        setBestSellers(b.data.products);
        setCategories(c.data.categories.filter((x) => x.product_count > 0).slice(0, 9));
        setReviews(r.data.reviews.filter((x) => x.rating >= 4).slice(0, 3));
      } catch (err) {
        setError(errorMessage(err));
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div>
      <Hero />

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <h2 className="font-serif text-3xl font-bold text-brand-900">Shop by Category</h2>
          <p className="mt-2 text-brand-500">Everything for every room, in one place</p>
        </div>
        {loading ? <Spinner /> : (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
            {categories.map((c) => (
              <Link key={c.id} to={`/products?category=${c.slug}`}
                className="group relative overflow-hidden rounded-2xl border border-brand-200 bg-white shadow-sm transition hover:shadow-lg">
                <div className="aspect-[16/9] overflow-hidden bg-brand-100">
                  <img src={c.image} alt={c.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-brand-950/80 via-brand-950/20 to-transparent" />
                <div className="absolute bottom-0 p-4">
                  <h3 className="font-semibold text-white">{c.name}</h3>
                  <p className="text-xs text-brand-200">{c.product_count} products</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="font-serif text-3xl font-bold text-brand-900">Featured Products</h2>
              <p className="mt-2 text-brand-500">Top rated by our customers</p>
            </div>
            <Link to="/products" className="text-sm font-semibold text-accent-600 hover:underline">View all →</Link>
          </div>
          {error && <div className="mt-6"><Alert>{error}</Alert></div>}
          <div className="mt-8">
            <ProductGrid products={featured} loading={loading} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="font-serif text-3xl font-bold text-brand-900">Best Sellers</h2>
            <p className="mt-2 text-brand-500">Loved most by the community</p>
          </div>
        </div>
        <div className="mt-8">
          <ProductGrid products={bestSellers} loading={loading} />
        </div>
      </section>

      <section className="bg-brand-900 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-serif text-3xl font-bold text-white">Why Choose Us</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map(([icon, title, text]) => (
              <div key={title} className="rounded-2xl border border-brand-700 bg-brand-800/60 p-6 text-center">
                <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-brand-300/20 text-xl">
                  {icon === 'artisan' ? '🪚' : icon === 'delivery' ? '🚚' : icon === 'warranty' ? '🛡️' : '🧑‍🎨'}
                </div>
                <h3 className="mt-4 font-semibold text-white">{title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-300">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-accent-600">Design Inspiration</p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-brand-900">Your space, reimagined</h2>
            <p className="mt-4 leading-relaxed text-brand-600">
              Whether it's a warm family living room, a focused office nook, or a boutique hotel lobby — our collections
              are designed to work together beautifully. Explore curated pieces and get inspired.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-brand-700">
              <li className="flex gap-3"><span className="text-accent-600">✓</span> Free swatches and material samples</li>
              <li className="flex gap-3"><span className="text-accent-600">✓</span> Room visualizer consultation with designers</li>
              <li className="flex gap-3"><span className="text-accent-600">✓</span> Bulk & hotel project pricing</li>
            </ul>
            <Link to="/custom-design" className="mt-8 inline-block rounded-full bg-brand-800 px-8 py-3 text-sm font-bold text-white hover:bg-brand-700">
              Start a Custom Project
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {['living-room', 'bedroom', 'lighting', 'rugs'].map((slug, i) => (
              <div key={slug} className={`overflow-hidden rounded-2xl ${i % 2 ? 'mt-6' : ''}`}>
                <img src={`/uploads/categories/${slug}.svg`} alt={slug} className="h-44 w-full object-cover" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-center font-serif text-3xl font-bold text-brand-900">What Our Customers Say</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {reviews.length ? reviews.map((r) => (
              <div key={r.id} className="rounded-2xl border border-brand-200 bg-brand-50 p-6">
                <div className="text-amber-500">{'★'.repeat(r.rating)}</div>
                <p className="mt-3 text-sm leading-relaxed text-brand-700">"{r.comment}"</p>
                <p className="mt-4 text-xs font-semibold text-brand-900">— {r.first_name} {r.last_name?.[0]}.</p>
              </div>
            )) : (
              <p className="col-span-3 text-center text-sm text-brand-500">Customer reviews will appear here once the database is seeded.</p>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
