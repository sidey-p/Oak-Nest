import { Link } from 'react-router-dom';

const NotFound = () => (
  <div className="mx-auto max-w-xl px-4 py-24 text-center">
    <p className="font-serif text-8xl font-bold text-brand-300">404</p>
    <h1 className="mt-4 font-serif text-2xl font-bold text-brand-900">Page not found</h1>
    <p className="mt-2 text-sm text-brand-500">The page you are looking for doesn't exist or has moved.</p>
    <Link to="/" className="mt-8 inline-block rounded-full bg-brand-800 px-8 py-3 text-sm font-bold text-white hover:bg-brand-700">
      Back to Home
    </Link>
  </div>
);

export default NotFound;
