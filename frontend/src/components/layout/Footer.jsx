import { Link } from 'react-router-dom';

const Footer = () => (
  <footer className="mt-16 bg-brand-950 text-brand-100">
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-100 text-brand-900 font-serif text-lg">FE</span>
            <span className="font-serif text-lg font-semibold">Furnishing Essentials</span>
          </div>
          <p className="mt-4 text-sm text-brand-300 leading-relaxed">
            Premium furnishings for homes, offices, hotels, villas and restaurants. Crafted to last, designed to inspire.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-brand-200">Shop</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/products" className="hover:text-white">All Products</Link></li>
            <li><Link to="/products?category=living-room" className="hover:text-white">Living Room</Link></li>
            <li><Link to="/products?category=bedroom" className="hover:text-white">Bedroom</Link></li>
            <li><Link to="/products?category=office" className="hover:text-white">Office</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-brand-200">Company</h4>
          <ul className="mt-4 space-y-2 text-sm">
            <li><Link to="/custom-design" className="hover:text-white">Custom Design</Link></li>
            <li><Link to="/feedback" className="hover:text-white">Feedback</Link></li>
            <li><Link to="/orders" className="hover:text-white">Track Order</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wider text-brand-200">Newsletter</h4>
          <p className="mt-4 text-sm text-brand-300">Design inspiration, straight to your inbox.</p>
          <form className="mt-3 flex" onSubmit={(e) => { e.preventDefault(); e.target.reset(); }}>
            <input type="email" required placeholder="Your email" className="w-full rounded-l-lg border-0 bg-brand-800 px-3 py-2 text-sm text-white outline-none placeholder:text-brand-400" />
            <button className="rounded-r-lg bg-accent-600 px-4 text-sm font-semibold text-white hover:bg-accent-500">Join</button>
          </form>
        </div>
      </div>
      <div className="mt-12 border-t border-brand-800 pt-6 text-center text-xs text-brand-400">
        &copy; {new Date().getFullYear()} Furnishing Essentials. Local demo — payments simulated.
      </div>
    </div>
  </footer>
);

export default Footer;
