import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="relative mt-20 bg-brand-950 text-brand-100 overflow-hidden">
    <div className="pointer-events-none absolute -top-24 right-0 h-72 w-72 rounded-full bg-accent-600/20 blur-3xl" />
    <div className="pointer-events-none absolute -bottom-24 left-0 h-72 w-72 rounded-full bg-gold-500/10 blur-3xl" />

    {/* Floating newsletter card */}
    <div className="relative mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
      <div className="reveal -translate-y-10 rounded-3xl border border-brand-800 bg-gradient-to-br from-brand-900 to-brand-800 p-6 shadow-lift sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-5">
        <div>
          <h3 className="font-serif text-xl font-bold text-white sm:text-2xl">Design inspiration, straight to your inbox</h3>
          <p className="mt-1 text-sm text-brand-300">Join 12,000+ subscribers. No spam, just great interiors.</p>
        </div>
        <form className="flex w-full max-w-sm shrink-0" onSubmit={(e) => { e.preventDefault(); e.target.reset(); }}>
          <input type="email" required placeholder="Your email" className="w-full rounded-l-full border border-brand-700 bg-brand-950/60 px-4 py-2.5 text-sm text-white outline-none placeholder:text-brand-500 focus:border-gold-500" />
          <button className="btn-shine rounded-r-full bg-gold-500 px-5 text-sm font-bold text-brand-950 transition hover:bg-gold-400">Join</button>
        </form>
      </div>
    </div>

    <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-2 sm:px-6 lg:px-8">
      <div className="grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-100 font-serif text-lg text-brand-900">FE</span>
            <span className="font-serif text-lg font-semibold">Furnishing Essentials</span>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-brand-400">
            Premium furnishings for homes, offices, hotels, villas and restaurants. Crafted to last, designed to inspire.
          </p>
          <div className="mt-5 flex gap-3">
            {['IG', 'FB', 'PT', 'X'].map((s) => (
              <span key={s} className="grid h-8 w-8 cursor-pointer place-items-center rounded-full border border-brand-700 text-[10px] font-bold text-brand-300 transition hover:border-gold-500 hover:text-gold-400">{s}</span>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-brand-200">Shop</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-brand-400">
            <li><Link to="/products" className="underline-grow hover:text-white">All Products</Link></li>
            <li><Link to="/products?category=living-room" className="underline-grow hover:text-white">Living Room</Link></li>
            <li><Link to="/products?category=bedroom" className="underline-grow hover:text-white">Bedroom</Link></li>
            <li><Link to="/products?category=office" className="underline-grow hover:text-white">Office</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-brand-200">Company</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-brand-400">
            <li><Link to="/custom-design" className="underline-grow hover:text-white">Custom Design</Link></li>
            <li><Link to="/feedback" className="underline-grow hover:text-white">Feedback</Link></li>
            <li><Link to="/orders" className="underline-grow hover:text-white">Track Order</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-brand-200">Get in touch</h4>
          <ul className="mt-4 space-y-2.5 text-sm text-brand-400">
            <li>hello@furnishingessentials.demo</li>
            <li>+91 98765 43210</li>
            <li>Mon – Sat, 9am – 7pm</li>
          </ul>
        </div>
      </div>
      <div className="mt-12 flex flex-col items-center gap-2 border-t border-brand-800 pt-6 text-center text-xs text-brand-500 sm:flex-row sm:justify-between">
        <span>&copy; {new Date().getFullYear()} Furnishing Essentials. Local demo — payments simulated.</span>
        <span className="flex gap-4"><span className="hover:text-brand-300 cursor-pointer">Privacy</span><span className="hover:text-brand-300 cursor-pointer">Terms</span></span>
      </div>
    </div>
  </footer>
);

export default Footer;
