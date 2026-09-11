import { Link } from 'react-router-dom';
import { Leaf, Camera, Globe, Play, AtSign, Truck, ShieldCheck, CreditCard, MessageCircle } from 'lucide-react';

const SHOP_LINKS = [
  ['Living Room', '/products?category=living-room'],
  ['Bedroom', '/products?category=bedroom'],
  ['Office', '/products?category=office'],
  ['Dining', '/products?category=kitchen'],
  ['New Arrivals', '/products?sort=newest'],
  ['Bestsellers', '/products?sort=popular'],
];

const HELP_LINKS = [
  ['Track Your Order', '/orders'],
  ['Delivery Information', '/inspiration'],
  ['Returns & Support', '/feedback'],
  ['FAQs', '/feedback'],
  ['Contact Us', '/feedback'],
];

const DISCOVER_LINKS = [
  ['Inspiration', '/inspiration'],
  ['Shop by Space', '/products?view=spaces'],
  ['Custom Design', '/custom-design'],
  ['About Oak & Nest', '/inspiration'],
];

const Footer = () => (
  <footer className="mt-20 bg-brand-950 text-brand-100">
    {/* Trust strip */}
    <div className="border-b border-brand-800">
      <div className="mx-auto grid max-w-7xl gap-6 px-4 py-10 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
        {[
          [Truck, 'Thoughtful Delivery', "From our collection to your space, we'll keep you updated along the way."],
          [ShieldCheck, 'Secure Checkout', 'Shop with confidence through a smooth and secure checkout experience.'],
          [CreditCard, 'Quality You Can Feel', 'Carefully selected pieces designed for everyday living.'],
          [MessageCircle, 'Here When You Need Us', 'Need help choosing? We\u2019re here to make things easier.'],
        ].map(([Icon, title, text]) => (
          <div key={title} className="flex gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-brand-800/70 text-gold-400">
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-semibold text-white">{title}</p>
              <p className="mt-1 text-xs leading-relaxed text-brand-400">{text}</p>
            </div>
          </div>
        ))}
      </div>
    </div>

    <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
        {/* Brand */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2.5">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-brand-100">
              <Leaf className="h-5 w-5 text-brand-900" />
            </span>
            <div>
              <p className="font-serif text-lg font-semibold text-white">Oak <span className="gradient-text">&amp; Nest</span></p>
              <p className="text-[10px] uppercase tracking-[0.25em] text-gold-400">Designed for the way you live</p>
            </div>
          </div>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-brand-300">
            Thoughtfully selected furniture for spaces made to be lived in. At Oak &amp; Nest, we believe the spaces we live in shape the moments we remember.
          </p>
          <p className="mt-5 text-xs font-semibold uppercase tracking-widest text-brand-400">Follow along for spaces, stories, and inspiration</p>
          <div className="mt-3 flex gap-2">
            {[Camera, Globe, Play, AtSign].map((Icon, i) => (
              <a key={i} href="#" className="grid h-9 w-9 place-items-center rounded-full border border-brand-700 text-brand-300 transition hover:border-gold-400 hover:text-gold-300">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        {[
          ['Shop', SHOP_LINKS],
          ['Help', HELP_LINKS],
          ['Discover', DISCOVER_LINKS],
        ].map(([title, links]) => (
          <div key={title}>
            <h4 className="text-xs font-bold uppercase tracking-[0.25em] text-gold-400">{title}</h4>
            <ul className="mt-5 space-y-2.5 text-sm">
              {links.map(([label, to]) => (
                <li key={label}><Link to={to} className="text-brand-300 transition hover:text-white">{label}</Link></li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-brand-800 pt-6 text-xs text-brand-400 sm:flex-row">
        <p>&copy; {new Date().getFullYear()} Oak &amp; Nest. Make room for what matters.</p>
        <p>Local demo — payments simulated. No cloud service required.</p>
      </div>
    </div>
  </footer>
);

export default Footer;
