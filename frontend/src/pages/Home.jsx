import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { errorMessage } from '../services/api';
import ProductGrid from '../components/products/ProductGrid';
import { Alert, Spinner, SectionHeading, Button, FeatureFlag } from '../components/common/UI';

const Hero = () => (
  <section className="relative overflow-hidden bg-brand-950">
    <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800" />
    <div className="dot-grid absolute inset-0 opacity-40" />
    <div className="pointer-events-none absolute -right-24 top-0 h-[32rem] w-[32rem] rounded-full bg-gold-500/20 blur-3xl animate-float" />
    <div className="pointer-events-none absolute left-1/3 bottom-0 h-72 w-72 rounded-full bg-accent-500/20 blur-3xl" />

    <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      <div className="max-w-2xl">
        <span className="reveal inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-gold-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-gold-300">
          Crafted for every space
        </span>
        <h1 className="reveal mt-5 font-serif text-4xl font-bold leading-[1.1] text-white sm:text-5xl lg:text-6xl" style={{ animationDelay: '80ms' }}>
          Furnish your world with <span className="gradient-text italic">timeless elegance</span>
        </h1>
        <p className="reveal mt-6 text-lg leading-relaxed text-brand-300" style={{ animationDelay: '160ms' }}>
          From cozy homes to grand hotels — discover premium furniture, lighting, rugs and décor, thoughtfully curated and built to last generations.
        </p>
        <div className="reveal mt-9 flex flex-wrap gap-4" style={{ animationDelay: '240ms' }}>
          <Link to="/products"><Button variant="gold" size="lg">Explore Collection</Button></Link>
          <Link to="/custom-design">
            <Button variant="outline" size="lg" className="!border-brand-500 !bg-transparent !text-white hover:!border-gold-400 hover:!text-gold-300">Custom Furniture</Button>
          </Link>
        </div>
        <div className="reveal mt-14 flex gap-10 text-white" style={{ animationDelay: '320ms' }}>
          {[['500+', 'Products'], ['50k+', 'Happy Homes'], ['9', 'Categories']].map(([n, l]) => (
            <div key={l}><div className="font-serif text-3xl font-bold text-gold-300">{n}</div><div className="text-xs uppercase tracking-wider text-brand-400">{l}</div></div>
          ))}
        </div>
      </div>
    </div>

    <svg className="relative block w-full text-brand-50" viewBox="0 0 1440 60" fill="currentColor"><path d="M0,32L1440,0L1440,60L0,60Z" /></svg>
  </section>
);

const WHY = [
  ['🪚', 'Artisan Craftsmanship', 'Every piece is crafted by skilled artisans using sustainably sourced materials.'],
  ['🚚', 'White-Glove Delivery', 'Free delivery above ₹5,000 with careful assembly at your doorstep.'],
  ['🛡️', '5-Year Warranty', 'We stand behind our furniture with industry-leading coverage.'],
  ['🧑‍🎨', 'Personal Design Help', 'Free consultation from our in-house interior design team.'],
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

      {/* Trust marquee strip — placeholder for real brand/partner logos */}
      <div className="border-b border-brand-200 bg-white py-4">
        <div className="relative overflow-hidden">
          <div className="flex w-max gap-16 animate-marquee whitespace-nowrap text-sm font-semibold uppercase tracking-widest text-brand-300">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex gap-16">
                {['As featured in', 'Home & Décor', 'Livspace Partner', 'ArchDigest Pick', 'Hospitality Weekly', 'Studio Choice'].map((t) => (
                  <span key={t}>{t}</span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Browse" title="Shop by Category" subtitle="Everything for every room, in one place" align="center" />
        {loading ? <Spinner /> : (
          <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3">
            {categories.map((c, i) => (
              <Link key={c.id} to={`/products?category=${c.slug}`}
                className="card-lift reveal group relative overflow-hidden rounded-2xl border border-brand-200 bg-white shadow-soft"
                style={{ animationDelay: `${i * 50}ms` }}>
                <div className="aspect-16/9 overflow-hidden bg-brand-100">
                  <img src={c.image} alt={c.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-brand-950/85 via-brand-950/20 to-transparent" />
                <div className="absolute bottom-0 p-4 transition-transform duration-300 group-hover:-translate-y-1">
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
            <SectionHeading eyebrow="Top rated" title="Featured Products" subtitle="Loved and rated highly by our customers" />
            <Link to="/products" className="underline-grow shrink-0 text-sm font-semibold text-accent-600">View all →</Link>
          </div>
          {error && <div className="mt-6"><Alert>{error}</Alert></div>}
          <div className="mt-8">
            <ProductGrid products={featured} loading={loading} />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Trending" title="Best Sellers" subtitle="Loved most by the community" />
        <div className="mt-8">
          <ProductGrid products={bestSellers} loading={loading} />
        </div>
      </section>

      <section className="relative overflow-hidden bg-brand-900 py-16">
        <div className="dot-grid absolute inset-0 opacity-30" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Our Promise" title="Why Choose Us" align="center" />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {WHY.map(([icon, title, text], i) => (
              <div key={title} className="card-lift reveal rounded-2xl border border-brand-700 bg-brand-800/60 p-6 text-center" style={{ animationDelay: `${i * 80}ms` }}>
                <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold-500/15 text-2xl">
                  {icon}
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
          <div className="reveal">
            <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent-600">Design Inspiration</p>
            <h2 className="mt-3 font-serif text-3xl font-bold text-brand-900">Your space, reimagined</h2>
            <p className="mt-4 leading-relaxed text-brand-600">
              Whether it's a warm family living room, a focused office nook, or a boutique hotel lobby — our collections
              are designed to work together beautifully. Explore curated pieces and get inspired.
            </p>
            <ul className="mt-6 space-y-3 text-sm text-brand-700">
              <li className="flex gap-3"><span className="text-accent-600">✓</span> Free swatches and material samples</li>
              <li className="flex gap-3"><span className="text-accent-600">✓</span> Room visualizer consultation with designers</li>
              <li className="flex gap-3 items-center"><span className="text-accent-600">✓</span> Bulk & hotel project pricing <FeatureFlag label="AR Room Preview — add feature" /></li>
            </ul>
            <Link to="/custom-design" className="mt-8 inline-block"><Button variant="primary" size="lg">Start a Custom Project</Button></Link>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {['living-room', 'bedroom', 'lighting', 'rugs'].map((slug, i) => (
              <div key={slug} className={`card-lift reveal overflow-hidden rounded-2xl shadow-soft ${i % 2 ? 'mt-6' : ''}`} style={{ animationDelay: `${i * 90}ms` }}>
                <img src={`/uploads/categories/${slug}.svg`} alt={slug} className="h-44 w-full object-cover transition-transform duration-500 hover:scale-110" />
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Testimonials" title="What Our Customers Say" align="center" />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {reviews.length ? reviews.map((r, i) => (
              <div key={r.id} className="card-lift reveal rounded-2xl border border-brand-200 bg-brand-50 p-6" style={{ animationDelay: `${i * 90}ms` }}>
                <div className="text-gold-500">{'★'.repeat(r.rating)}</div>
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
