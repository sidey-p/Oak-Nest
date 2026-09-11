import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api, { errorMessage } from '../services/api';
import { Alert, Spinner } from '../components/common/UI';
import { formatDate } from '../utils/format';

const TrackOrder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get(`/orders/${id}/tracking`)
      .then((d) => setData(d.data))
      .catch((e) => setError(errorMessage(e)));
  }, [id]);

  if (error) return <div className="mx-auto max-w-3xl px-4 py-16"><Alert>{error}</Alert></div>;
  if (!data) return <div className="min-h-[50vh] grid place-items-center"><Spinner /></div>;

  const { order, timeline } = data;

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <button onClick={() => navigate(-1)} className="underline-grow text-sm font-semibold text-accent-600">← Back</button>

      <div className="mt-4 text-center">
        <h1 className="reveal font-serif text-3xl font-bold text-brand-900">Track Order</h1>
        <p className="mt-1 text-sm text-brand-500">{order.order_number} · Placed {formatDate(order.created_at)}</p>
        {order.tracking_number && (
          <p className="mt-1 text-xs text-brand-400">Courier: {order.courier_name} · Tracking #: {order.tracking_number}</p>
        )}
      </div>

      {order.shipment_status === 'cancelled' ? (
        <div className="mx-auto mt-10 max-w-md rounded-2xl border border-red-200 bg-red-50 p-8 text-center">
          <div className="text-4xl">✕</div>
          <h2 className="mt-3 font-serif text-xl font-bold text-red-800">Order Cancelled</h2>
          <p className="mt-1 text-sm text-red-600">This order was cancelled and will not be delivered.</p>
        </div>
      ) : (
        <>
          {order.current_location && (
            <div className="reveal mx-auto mt-8 max-w-md rounded-2xl border border-brand-200 bg-white p-5 text-center text-sm shadow-soft">
              <p className="text-brand-500 text-xs uppercase tracking-wider font-semibold">Current location</p>
              <p className="mt-1 font-semibold text-brand-900">{order.current_location}</p>
              {order.estimated_delivery && (
                <p className="mt-2 text-xs text-brand-500">Estimated delivery: <span className="font-semibold">{formatDate(order.estimated_delivery)}</span></p>
              )}
            </div>
          )}

          <ol className="mx-auto mt-10 max-w-md">
            {timeline.map((t, i) => (
              <li key={t.step} className="relative flex gap-5 pb-10 last:pb-0">
                {i < timeline.length - 1 && (
                  <div className={`absolute left-[17px] top-9 h-full w-0.5 rounded ${timeline[i + 1].completed ? 'bg-accent-500' : 'bg-brand-200'}`} />
                )}
                <div className={`z-10 grid h-9 w-9 shrink-0 place-items-center rounded-full border-2 text-sm font-bold
                  ${t.completed ? (t.current ? 'border-accent-600 bg-accent-600 text-white animate-pulse' : 'border-accent-500 bg-accent-50 text-accent-700') : 'border-brand-200 bg-white text-brand-300'}`}>
                  {t.completed ? '✓' : i + 1}
                </div>
                <div className="pt-1.5">
                  <p className={`font-semibold ${t.completed ? 'text-brand-900' : 'text-brand-400'}`}>{t.label}</p>
                  {t.current && <p className="text-xs font-semibold text-accent-700">Current status</p>}
                </div>
              </li>
            ))}
          </ol>
        </>
      )}

      <div className="mt-12 text-center">
        <Link to={`/orders/${order.id}`} className="rounded-full border border-brand-300 px-6 py-2.5 text-sm font-semibold transition hover:border-accent-500 hover:bg-white">View Order Details</Link>
      </div>
    </div>
  );
};

export default TrackOrder;
