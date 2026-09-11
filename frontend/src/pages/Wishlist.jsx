import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../services/api';
import { Heart } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { Empty, Spinner } from '../components/common/UI';
import { formatPrice, effectivePrice } from '../utils/format';

const Wishlist = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState(null);
  const { addToCart, removeFromWishlist } = useCart();
  const navigate = useNavigate();

  const load = async () => {
    try {
      const { data } = await api.get('/wishlist');
      setItems(data.items);
    } catch (err) {
      setMsg(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const move = async (p) => {
    try {
      await addToCart(p.product_id);
      await removeFromWishlist(p.product_id);
      setItems((prev) => prev.filter((i) => i.product_id !== p.product_id));
    } catch (err) {
      alert(errorMessage(err));
    }
  };

  const remove = async (p) => {
    await removeFromWishlist(p.product_id);
    setItems((prev) => prev.filter((i) => i.product_id !== p.product_id));
  };

  if (loading) return <div className="min-h-[50vh] grid place-items-center"><Spinner /></div>;

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <h1 className="reveal font-serif text-3xl font-bold text-brand-900">My Wishlist</h1>

      {items.length === 0 ? (
        <div className="mt-10">
          <Empty icon={<Heart className="h-7 w-7 text-brand-500" />} title="Save the pieces you love." subtitle="Your wishlist is the perfect place to collect ideas for your future space.">
            <Link to="/products" className="btn-shine rounded-full bg-brand-900 px-8 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-brand-800 hover:shadow-md">Explore the Collection →</Link>
          </Empty>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((p) => (
            <div key={p.product_id} className="card-lift flex flex-col overflow-hidden rounded-2xl border border-brand-200 bg-white shadow-soft">
              <Link to={`/products/${p.slug}`} className="aspect-[4/3] overflow-hidden bg-brand-100">
                <img src={p.main_image} alt={p.name} className="h-full w-full object-cover transition-transform duration-300 hover:scale-105" />
              </Link>
              <div className="flex flex-1 flex-col p-4">
                <Link to={`/products/${p.slug}`} className="line-clamp-1 text-sm font-semibold hover:text-accent-600">{p.name}</Link>
                <p className="mt-0.5 text-xs text-brand-500">{p.brand}</p>
                <p className="mt-1 font-bold">{formatPrice(effectivePrice(p))}</p>
                <div className="mt-3 flex flex-col gap-2">
                  <button onClick={() => move(p)} disabled={p.stock === 0}
                    className="btn-shine rounded-full bg-brand-900 py-2 text-xs font-bold text-white transition-all hover:bg-brand-800 disabled:opacity-40">
                    {p.stock === 0 ? 'Out of Stock' : 'Move to Cart'}
                  </button>
                  <button onClick={() => remove(p)} className="rounded-full border border-brand-300 py-2 text-xs font-semibold text-red-600 transition hover:border-red-300 hover:bg-red-50">Remove</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Wishlist;
