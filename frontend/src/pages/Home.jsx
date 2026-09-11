import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Truck, ShieldCheck, CreditCard, MessageCircle, ArrowRight, Flame, Sparkles, Heart, Leaf, Home as HomeIcon, Briefcase, Hotel, UtensilsCrossed, PenTool, ChevronRight, Quote } from 'lucide-react';
import api from '../services/api';
import { errorMessage } from '../services/api';
import ProductGrid from '../components/products/ProductGrid';
import { Alert, SectionHeading, Button } from '../components/common/UI';
import { useRecent } from '../hooks/useRecent';

const Hero = ({ content }) => {
  const headline = content.hero_headline || 'Furniture that makes every space feel like home.';
  const words = headline.trim().split(/\s+/);
  const tail = words.slice(-3).join(' ');
  const head = words.slice(0, -3).join(' ');
  return (
  <section className="relative overflow-hidden bg-brand-950">
    <div className="absolute inset-0 bg-gradient-to-br from-brand-950 via-brand-900 to-brand-800" />
    {content.hero_image ? (
      <div className="absolute inset-0">
        <img src={content.hero_image} alt="" className="h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-r from-brand-950/90 via-brand-950/60 to-brand-950/30" />
      </div>
    ) : (
      <div className="dot-grid absolute inset-0 opacity-40" />
    )}
    <div className="pointer-events-none absolute -right-24 top-0 h-[32rem] w-[32rem] rounded-full bg-gold-500/20 blur-3xl animate-float" />
    <div className="pointer-events-none absolute left-1/3 bottom-0 h-72 w-72 rounded-full bg-accent-500/20 blur-3xl" />

    <div className="relative mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-32 lg:px-8">
      <div className="max-w-2xl">
        <span className="reveal inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-gold-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-gold-300">
          <Leaf className="h-3.5 w-3.5" /> Curated for better living
        </span>
        <h1 className="reveal mt-5 font-serif text-4xl font-bold leading-[1.1] text-white sm:text-5xl lg:text-6xl" style={{ animationDelay: '80ms' }}>
          {head} <span className="gradient-text italic">{tail}</span>
        </h1>
        <p className="reveal mt-6 text-lg leading-relaxed text-brand-300" style={{ animationDelay: '160ms' }}>
          {content.hero_subline || 'Discover thoughtfully selected furniture and furnishing essentials designed for homes, workspaces, and the places where life happens.'}
        </p>
        <div className="reveal mt-9 flex flex-wrap gap-4" style={{ animationDelay: '240ms' }}>
          <Link to="/products"><Button variant="gold" size="lg">Shop the Collection <ArrowRight className="h-4 w-4" /></Button></Link>
          <Link to="/products?view=spaces">
            <Button variant="outline" size="lg" className="!border-brand-500 !bg-transparent !text-white hover:!border-gold-400 hover:!text-gold-300">Explore Your Space</Button>
          </Link>
        </div>
        <div className="reveal mt-14 flex gap-10 text-white" style={{ animationDelay: '320ms' }}>
          {[['500+', 'Pieces'], ['50k+', 'Happy Homes'], ['9', 'Spaces & Styles']].map(([n, l]) => (
            <div key={l}><div className="font-serif text-3xl font-bold text-gold-300">{n}</div><div className="text-xs uppercase tracking-wider text-brand-400">{l}</div></div>
          ))}
        </div>
      </div>
    </div>

    <svg className="relative block w-full text-brand-50" viewBox="0 0 1440 60" fill="currentColor"><path d="M0,32L1440,0L1440,60L0,60Z" /></svg>
  </section>
  );
};

const BENEFITS = [
  [Truck, 'Thoughtful Delivery', "From our collection to your space, we'll keep you updated along the way."],
  [ShieldCheck, 'Secure Checkout', 'Shop with confidence through a smooth and secure checkout experience.'],
  [CreditCard, 'Quality You Can Feel', 'Carefully selected pieces designed for everyday living.'],
  [MessageCircle, 'Here When You Need Us', "Need help choosing? We're here to make things easier."],
];

const TrustBenefits = () => (
  <section className="border-b border-brand-200 bg-white">
    <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
      {BENEFITS.map(([Icon, title, text]) => (
        <div key={title} className="flex gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-brand-50 text-accent-600"><Icon className="h-5 w-5" /></span>
          <div>
            <p className="text-sm font-semibold text-brand-900">{title}</p>
            <p className="mt-0.5 text-xs leading-relaxed text-brand-500">{text}</p>
          </div>
        </div>
      ))}
    </div>
  </section>
);

const SPACES = [
  { icon: HomeIcon, to: '/products?category=living-room', title: 'Home', sub: 'Make yourself at home.', text: 'Comfortable, beautiful furniture for everyday moments.', img: 'living-room' },
  { icon: Briefcase, to: '/products?category=office', title: 'Office', sub: 'Make work feel better.', text: 'Functional spaces designed for focus, creativity, and productivity.', img: 'office' },
  { icon: Hotel, to: '/products?category=bedroom', title: 'Hospitality', sub: 'Create spaces that welcome.', text: 'Comfortable and durable furniture designed for memorable experiences.', img: 'bedroom' },
  { icon: UtensilsCrossed, to: '/products?category=kitchen', title: 'Restaurants & Cafés', sub: 'Made for gathering.', text: 'Furniture that becomes part of the experience.', img: 'kitchen' },
];

const ShopBySpace = ({ categories }) => {
  const bySlug = Object.fromEntries((categories || []).map((c) => [c.slug, c]));
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Shop by Space" title="Furniture for every way of living." subtitle="Explore thoughtfully selected pieces for the spaces that matter most." align="center" />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {SPACES.map(({ icon: Icon, to, title, sub, text, img }, i) => {
          const cat = bySlug[img];
          return (
            <Link key={title} to={to} className="card-lift reveal group relative overflow-hidden rounded-2xl border border-brand-200 bg-white shadow-soft" style={{ animationDelay: `${i * 60}ms` }}>
              <div className="aspect-16/9 overflow-hidden bg-brand-100">
                <img src={cat?.image || `/uploads/categories/${img}.svg`} alt={title} className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110" />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-brand-950/85 via-brand-950/20 to-transparent" />
              <div className="absolute bottom-0 p-4">
                <span className="mb-2 grid h-9 w-9 place-items-center rounded-xl bg-white/15 text-gold-300 backdrop-blur"><Icon className="h-4.5 w-4.5" /></span>
                <h3 className="font-semibold text-white">{title}</h3>
                <p className="text-xs font-medium text-gold-300">{sub}</p>
                <p className="mt-1 hidden text-xs leading-relaxed text-brand-200 group-hover:block">{text}</p>
                <p className="mt-2 flex items-center gap-1 text-xs font-bold text-white">Explore <ChevronRight className="h-3 w-3 transition-transform duration-500 group-hover:translate-x-1" /></p>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
};

const COLLECTION_TABS = [
  { key: 'bestsellers', label: 'Bestsellers', icon: Flame, sub: 'The pieces everyone is talking about.', params: { sort: 'popular', perPage: 8 } },
  { key: 'new', label: 'New Arrivals', icon: Sparkles, sub: 'Fresh designs for fresh spaces.', params: { sort: 'newest', perPage: 8 } },
  { key: 'loved', label: 'Most Loved', icon: Heart, sub: 'Customer favorites, chosen again and again.', params: { sort: 'rating', perPage: 8 } },
];

const FeaturedCollections = () => {
  const [tab, setTab] = useState('bestsellers');
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const active = COLLECTION_TABS.find((t) => t.key === tab);
    setLoading(true);
    api.get('/products', { params: active.params })
      .then((d) => setProducts(d.data.products))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Featured Collections" title="Made to be loved." subtitle="Discover the pieces our customers keep coming back to." align="center" />

        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {COLLECTION_TABS.map(({ key, label, icon: Icon }) => (
            <button key={key} onClick={() => setTab(key)}
              className={`btn-shine inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-all duration-500 ${tab === key ? 'bg-brand-900 text-white shadow-md' : 'border border-brand-200 bg-brand-50 text-brand-700 hover:border-accent-500'}`}>
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        <div className="mt-8">
          <ProductGrid products={products} loading={loading} empty="Nothing here yet — check back soon." />
        </div>

        <div className="mt-8 text-center">
          <Link to="/products"><Button variant="outline">Explore the collection <ArrowRight className="h-4 w-4" /></Button></Link>
        </div>
      </div>
    </section>
  );
};

const STYLES = [
  ['Minimal & Modern', 'Clean lines. Calm spaces. Less, but better.', 'minimal'],
  ['Natural & Warm', 'Organic textures and comfortable living.', 'natural'],
  ['Bold & Contemporary', 'Strong shapes for spaces with personality.', 'bold'],
  ['Classic & Timeless', 'Pieces designed to look good for years to come.', 'classic'],
  ['Refined Living', 'Elevated details for beautifully finished spaces.', 'refined'],
];

const ShopByStyle = () => (
  <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
    <SectionHeading eyebrow="Shop by Style" title="Find your style." subtitle="Not sure what you're looking for? Start with a feeling." align="center" />
    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
      {STYLES.map(([title, text, slug], i) => (
        <Link key={slug} to={`/products?search=${encodeURIComponent(title.split(' ')[0])}`}
          className="card-lift reveal group rounded-2xl border border-brand-200 bg-white p-6 text-center shadow-soft" style={{ animationDelay: `${i * 50}ms` }}>
          <span className="font-serif text-2xl font-bold text-brand-200 transition-colors duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:text-gold-400">{String(i + 1).padStart(2, '0')}</span>
          <h3 className="mt-2 font-serif text-base font-semibold text-brand-900">{title}</h3>
          <p className="mt-1.5 text-xs leading-relaxed text-brand-500">{text}</p>
        </Link>
      ))}
    </div>
  </section>
);

const CompleteTheLook = () => (
  <section className="bg-brand-950 py-16">
    <div className="mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.3em] text-gold-400">Complete the look</p>
        <h2 className="mt-3 font-serif text-3xl font-bold text-white sm:text-4xl">A few thoughtful pieces can bring an entire space together.</h2>
        <p className="mt-4 leading-relaxed text-brand-300">
          Viewing a sofa? We'll suggest the coffee table, floor lamp, rug and cushions that complete the room.
          Every piece in our collection is chosen to work beautifully with the others.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link to="/products/aurora-3-seater-fabric-sofa"><Button variant="gold">Shop the look <ArrowRight className="h-4 w-4" /></Button></Link>
          <Link to="/inspiration"><Button variant="outline" className="!border-brand-600 !bg-transparent !text-white hover:!border-gold-400 hover:!text-gold-300">Get inspired</Button></Link>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        {['aurora-3-seater-fabric-sofa', 'oakland-coffee-table', 'arched-floor-lamp', 'shaggy-area-rug-5x8'].map((slug, i) => (
          <Link key={slug} to={`/products/${slug}`} className={`overflow-hidden rounded-2xl border border-brand-700 ${i % 2 ? 'mt-6' : ''}`}>
            <img src={`/uploads/products/${slug}.svg`} alt="" className="h-40 w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] hover:scale-105" />
          </Link>
        ))}
      </div>
    </div>
  </section>
);

const CustomDesignCta = () => (
  <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
    <div className="reveal rounded-3xl border border-brand-200 bg-gradient-to-br from-white to-brand-50 p-10 shadow-soft sm:p-14">
      <div className="grid items-center gap-10 lg:grid-cols-2">
        <div>
          <span className="grid h-14 w-14 place-items-center rounded-2xl bg-brand-900 text-gold-300"><PenTool className="h-6 w-6" /></span>
          <h2 className="mt-5 font-serif text-3xl font-bold text-brand-900 sm:text-4xl">Can't find the perfect fit? Let's create it.</h2>
          <p className="mt-4 leading-relaxed text-brand-600">
            Every space is different. Tell us what you're looking for, and we'll help you find — or create — something that fits.
          </p>
          <Link to="/custom-design" className="mt-7 inline-block">
            <Button variant="primary" size="lg">Start a Custom Request <ArrowRight className="h-4 w-4" /></Button>
          </Link>
        </div>
        <div className="space-y-4">
          {[
            ['1', 'Tell us about your space', 'Share your room, measurements, and what you\u2019re looking for.'],
            ['2', 'Share your style', 'Tell us about your preferred materials, colors, and inspiration.'],
            ['3', "We'll help bring it together", 'Our team will review your request and help you find the right solution.'],
          ].map(([n, title, text]) => (
            <div key={n} className="flex gap-4 rounded-2xl border border-brand-200 bg-white p-5">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gold-500 font-serif text-sm font-bold text-brand-950">{n}</span>
              <div>
                <p className="text-sm font-semibold text-brand-900">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-brand-500">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const INSPIRATION_CARDS = [
  ['Living Better', 'Create a living room you\u2019ll never want to leave.', 'living-room', '/products?category=living-room'],
  ['Rest & Recharge', 'Design a bedroom made for slowing down.', 'bedroom', '/products?category=bedroom'],
  ['Work Better', 'Build a workspace that helps you focus.', 'office', '/products?category=office'],
  ['Gather Together', 'Create a dining space made for sharing moments.', 'kitchen', '/products?category=kitchen'],
];

const InspirationSection = ({ categories }) => {
  const bySlug = Object.fromEntries((categories || []).map((c) => [c.slug, c]));
  return (
    <section className="bg-white py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Inspiration" title="Ideas for every space." subtitle="Discover simple ways to make your space feel more like you." align="center" />
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {INSPIRATION_CARDS.map(([title, text, img, to], i) => (
            <Link key={title} to={to} className="card-lift reveal group relative overflow-hidden rounded-2xl" style={{ animationDelay: `${i * 60}ms` }}>
              <img src={bySlug[img]?.image || `/uploads/categories/${img}.svg`} alt={title} className="h-52 w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-brand-950/85 to-transparent" />
              <div className="absolute bottom-0 p-5">
                <h3 className="font-serif text-lg font-semibold text-white">{title}</h3>
                <p className="mt-1 text-xs text-brand-200">{text}</p>
                <p className="mt-2 flex items-center gap-1 text-xs font-bold text-gold-300">Explore <ChevronRight className="h-3 w-3" /></p>
              </div>
            </Link>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Link to="/inspiration"><Button variant="outline">All inspiration <ArrowRight className="h-4 w-4" /></Button></Link>
        </div>
      </div>
    </section>
  );
};

const QuoteSection = ({ content }) => (
  <section className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6">
    <Quote className="mx-auto h-10 w-10 text-gold-400" />
    <blockquote className="reveal mt-6 font-serif text-2xl italic leading-relaxed text-brand-800 sm:text-3xl">
      &ldquo;{content.quote_text || 'Every space has a story. Make yours worth living in.'}&rdquo;
    </blockquote>
  </section>
);

const ReviewsSection = ({ reviews }) => (
  <section className="bg-white py-16">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Customer Reviews" title="Loved in real homes and real spaces." subtitle="See how Oak & Nest is becoming part of everyday life." align="center" />
      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {reviews.length ? reviews.map((r, i) => (
          <div key={r.id} className="reveal rounded-2xl border border-brand-200 bg-brand-50 p-6" style={{ animationDelay: `${i * 60}ms` }}>
            <div className="flex gap-0.5 text-gold-500">{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</div>
            <p className="mt-3 text-sm leading-relaxed text-brand-700">&ldquo;{r.comment}&rdquo;</p>
            <div className="mt-4 flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-200 text-xs font-bold text-brand-700">
                {r.first_name?.[0]}{r.last_name?.[0]}
              </span>
              <div>
                <p className="text-xs font-semibold text-brand-900">{r.first_name} {r.last_name?.[0]}.</p>
                <p className="text-[10px] font-medium text-accent-600">Verified Customer ✓</p>
              </div>
            </div>
          </div>
        )) : (
          <p className="col-span-3 text-center text-sm text-brand-500">Customer stories will appear here once the community grows.</p>
        )}
      </div>
    </div>
  </section>
);

const TestimonialsSection = ({ testimonials }) => (
  <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
    <SectionHeading eyebrow="Word of Mouth" title="Homes that speak for us." subtitle="Real words from the people living with our pieces." align="center" />
    <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {testimonials.map((t, i) => (
        <div key={t.id} className="card-lift reveal flex flex-col rounded-2xl border border-brand-200 bg-white p-6 shadow-soft" style={{ animationDelay: `${i * 60}ms` }}>
          <div className="flex gap-0.5 text-gold-500">{'★'.repeat(t.rating)}{'☆'.repeat(5 - t.rating)}</div>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-brand-700">&ldquo;{t.quote}&rdquo;</p>
          <div className="mt-5 flex items-center gap-3">
            {t.avatar_image ? (
              <img src={t.avatar_image} alt={t.name} className="h-10 w-10 rounded-full object-cover" />
            ) : (
              <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-950 text-xs font-bold text-gold-300">
                {t.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
              </span>
            )}
            <div>
              <p className="text-sm font-semibold text-brand-900">{t.name}</p>
              <p className="text-[11px] text-brand-500">{[t.role, t.location].filter(Boolean).join(' · ')}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </section>
);

const Newsletter = () => (
  <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
    <SectionHeading eyebrow="Newsletter" title="Stay inspired." subtitle="Get new collections, design ideas, and thoughtful updates delivered to your inbox." align="center" />
    <form className="mx-auto mt-8 flex max-w-md gap-2" onSubmit={(e) => { e.preventDefault(); e.target.reset(); }}>
      <input type="email" required placeholder="Your email address"
        className="w-full rounded-full border border-brand-300 bg-white px-5 py-3 text-sm outline-none transition-colors duration-300 focus:border-accent-500" />
      <Button variant="primary" type="submit" className="shrink-0">Join Oak &amp; Nest <ArrowRight className="h-4 w-4" /></Button>
    </form>
    <p className="mt-3 text-xs text-brand-400">No clutter. Just good ideas and beautiful spaces.</p>
  </section>
);

const RecentlyViewed = () => {
  const { recent } = useRecent();
  if (recent.length === 0) return null;
  return (
    <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
      <div className="flex items-end justify-between">
        <SectionHeading eyebrow="Continue browsing" title="Recently viewed" subtitle="Pick up where you left off." />
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-6">
        {recent.slice(0, 6).map((p) => (
          <Link key={p.id} to={`/products/${p.slug}`} className="card-lift group overflow-hidden rounded-2xl border border-brand-200 bg-white shadow-soft">
            <div className="aspect-4/3 overflow-hidden bg-brand-100">
              <img src={p.main_image} alt={p.name} className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110" />
            </div>
            <p className="line-clamp-1 p-2.5 text-xs font-semibold text-brand-800">{p.name}</p>
          </Link>
        ))}
      </div>
    </section>
  );
};

const DEFAULT_CONTENT = {
  hero_headline: 'Furniture that makes every space',
  hero_subline: 'Discover thoughtfully selected furniture and furnishing essentials designed for homes, workspaces, and the places where life happens.',
  hero_image: null,
  quote_text: 'Every space has a story. Make yours worth living in.',
};

const Home = () => {
  const [reviews, setReviews] = useState([]);
  const [error, setError] = useState(null);
  const [content, setContent] = useState(DEFAULT_CONTENT);
  const [categories, setCategories] = useState([]);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    api.get('/reviews/products/3/reviews')
      .then((d) => setReviews(d.data.reviews.filter((x) => x.rating >= 4).slice(0, 3)))
      .catch((e) => setError(errorMessage(e)));

    api.get('/content')
      .then((d) => setContent((prev) => ({ ...prev, ...d.data.content })))
      .catch(() => {});

    api.get('/categories')
      .then((d) => setCategories(d.data.categories))
      .catch(() => {});

    api.get('/testimonials')
      .then((d) => setTestimonials(d.data.testimonials))
      .catch(() => {});
  }, []);

  return (
    <div>
      <Hero content={content} />
      <TrustBenefits />
      <ShopBySpace categories={categories} />
      <FeaturedCollections />
      <ShopByStyle />
      <CompleteTheLook />
      <CustomDesignCta />
      <InspirationSection categories={categories} />
      <QuoteSection content={content} />
      <TestimonialsSection testimonials={testimonials} />
      <ReviewsSection reviews={reviews} />
      <Newsletter />
      <RecentlyViewed />
      {error && <div className="mx-auto max-w-3xl px-4 pb-8"><Alert>{error}</Alert></div>}
    </div>
  );
};

export default Home;
