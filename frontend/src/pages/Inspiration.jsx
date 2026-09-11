import { Link } from 'react-router-dom';
import { ArrowRight, ChevronRight, Leaf, Sofa, BedDouble, Briefcase, UtensilsCrossed, Lightbulb } from 'lucide-react';
import { SectionHeading, Button } from '../components/common/UI';

const CATEGORIES = [
  { icon: Sofa, title: 'Living Better', text: 'Create a living room you\u2019ll never want to leave.', img: 'living-room', to: '/products?category=living-room' },
  { icon: BedDouble, title: 'Rest & Recharge', text: 'Design a bedroom made for slowing down.', img: 'bedroom', to: '/products?category=bedroom' },
  { icon: Briefcase, title: 'Work Better', text: 'Build a workspace that helps you focus.', img: 'office', to: '/products?category=office' },
  { icon: UtensilsCrossed, title: 'Gather Together', text: 'Create a dining space made for sharing moments.', img: 'kitchen', to: '/products?category=kitchen' },
  { icon: Lightbulb, title: 'Light It Right', text: 'Set the mood with warm, layered lighting.', img: 'lighting', to: '/products?category=lighting' },
  { icon: Leaf, title: 'Natural Living', text: 'Warm materials and timeless textures for calm spaces.', img: 'rugs', to: '/products?category=rugs' },
];

const TIPS = [
  ['Start with how you use the space', 'Before choosing furniture, notice how you actually live in the room — morning coffee, movie nights, working from home. The best spaces are built around real moments.'],
  ['Layer textures, not just colors', 'Mix wood, fabric, metal and natural fiber. A room feels finished when your senses have something to discover at every scale.'],
  ['Buy fewer, better pieces', 'One beautiful, well-made table outlives three trendy ones. Choose pieces you\u2019ll want to keep — that\u2019s the most sustainable choice of all.'],
  ['Leave room to breathe', 'Negative space is part of the design. Comfortable rooms aren\u2019t the fullest ones — they\u2019re the ones that give you space to move and rest.'],
];

const Inspiration = () => (
  <div>
    <section className="relative overflow-hidden bg-brand-950">
      <div className="dot-grid absolute inset-0 opacity-40" />
      <div className="pointer-events-none absolute -left-24 bottom-0 h-72 w-72 rounded-full bg-gold-500/20 blur-3xl" />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-gold-500/40 bg-gold-500/10 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.25em] text-gold-300">
          <Leaf className="h-3.5 w-3.5" /> Inspiration
        </span>
        <h1 className="reveal mt-5 max-w-2xl font-serif text-4xl font-bold leading-tight text-white sm:text-5xl">
          Ideas for <span className="gradient-text italic">every space.</span>
        </h1>
        <p className="mt-5 max-w-xl text-lg leading-relaxed text-brand-300">
          Discover simple ways to make your space feel more like you.
        </p>
      </div>
      <svg className="relative block w-full text-brand-50" viewBox="0 0 1440 60" fill="currentColor"><path d="M0,32L1440,0L1440,60L0,60Z" /></svg>
    </section>

    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="Browse" title="Find ideas for your space" subtitle="Thoughtful starting points for rooms made to be lived in." />
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map(({ icon: Icon, title, text, img, to }, i) => (
          <Link key={title} to={to} className="card-lift reveal group relative overflow-hidden rounded-2xl border border-brand-200 shadow-soft" style={{ animationDelay: `${i * 50}ms` }}>
            <div className="aspect-16/9 overflow-hidden bg-brand-100">
              <img src={`/uploads/categories/${img}.svg`} alt={title} className="h-full w-full object-cover transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-110" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-brand-950/85 via-brand-950/20 to-transparent" />
            <div className="absolute bottom-0 p-5">
              <span className="mb-2 grid h-9 w-9 place-items-center rounded-xl bg-white/15 text-gold-300 backdrop-blur"><Icon className="h-4.5 w-4.5" /></span>
              <h3 className="font-serif text-lg font-semibold text-white">{title}</h3>
              <p className="mt-1 text-xs leading-relaxed text-brand-200">{text}</p>
              <p className="mt-2 flex items-center gap-1 text-xs font-bold text-gold-300">Explore <ChevronRight className="h-3 w-3" /></p>
            </div>
          </Link>
        ))}
      </div>
    </section>

    <section className="bg-white py-16">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="Design Notes" title="A few thoughts on making a home" align="center" />
        <div className="mt-10 space-y-8">
          {TIPS.map(([title, text], i) => (
            <div key={title} className="reveal flex gap-5" style={{ animationDelay: `${i * 60}ms` }}>
              <span className="font-serif text-3xl font-bold text-brand-200">{String(i + 1).padStart(2, '0')}</span>
              <div>
                <h3 className="font-serif text-lg font-semibold text-brand-900">{title}</h3>
                <p className="mt-2 leading-relaxed text-brand-600">{text}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <Link to="/products"><Button variant="primary" size="lg">Explore the collection <ArrowRight className="h-4 w-4" /></Button></Link>
        </div>
      </div>
    </section>
  </div>
);

export default Inspiration;
