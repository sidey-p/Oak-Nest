import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../../services/api';
import { Alert, Badge, STATUS_BADGE, Spinner } from '../../components/common/UI';
import { formatPrice, formatDate, titleize } from '../../utils/format';

const STATUS_LIST = ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled'];

const AdminShipments = () => {
  const [shipments, setShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [edit, setEdit] = useState(null);
  const [form, setForm] = useState({ status: '', courier_name: '', tracking_number: '', current_location: '', estimated_delivery: '' });

  const load = async () => {
    try {
      const { data } = await api.get('/admin/shipments');
      setShipments(data.shipments);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const save = async (e) => {
    e.preventDefault();
    try {
      await api.put(`/admin/shipments/${edit.id}`, form);
      setEdit(null);
      load();
    } catch (err) {
      alert(errorMessage(err));
    }
  };

  const startEdit = (s) => {
    setEdit(s);
    setForm({
      status: s.status,
      courier_name: s.courier_name || '',
      tracking_number: s.tracking_number || '',
      current_location: s.current_location || '',
      estimated_delivery: s.estimated_delivery?.slice(0, 10) || '',
    });
  };

  if (loading) return <Spinner />;
  if (error) return <Alert>{error}</Alert>;

  const input = 'mt-1.5 w-full rounded-full border border-brand-300 transition hover:border-accent-500 px-3 py-2 text-sm outline-none focus:border-accent-500';

  return (
    <div className="space-y-6">
      <h1 className="reveal font-serif text-2xl font-bold text-brand-900">Shipping</h1>

      {edit && (
        <form onSubmit={save} className="grid gap-4 rounded-2xl border-2 border-accent-500 bg-white p-6 sm:grid-cols-2 lg:grid-cols-3">
          <h2 className="col-span-full font-serif font-bold">Editing shipment for {edit.order_number}</h2>
          <div>
            <label className="text-xs font-semibold text-brand-700">Status</label>
            <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })} className={input}>
              {STATUS_LIST.map((s) => <option key={s} value={s}>{titleize(s)}</option>)}
            </select>
          </div>
          <div><label className="text-xs font-semibold text-brand-700">Courier</label><input value={form.courier_name} onChange={(e) => setForm({ ...form, courier_name: e.target.value })} className={input} /></div>
          <div><label className="text-xs font-semibold text-brand-700">Tracking #</label><input value={form.tracking_number} onChange={(e) => setForm({ ...form, tracking_number: e.target.value })} className={input} /></div>
          <div><label className="text-xs font-semibold text-brand-700">Current location</label><input value={form.current_location} onChange={(e) => setForm({ ...form, current_location: e.target.value })} className={input} /></div>
          <div><label className="text-xs font-semibold text-brand-700">Est. delivery date</label><input type="date" value={form.estimated_delivery} onChange={(e) => setForm({ ...form, estimated_delivery: e.target.value })} className={input} /></div>
          <div className="col-span-full flex gap-3">
            <button className="btn-shine rounded-full bg-brand-900 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-brand-800 hover:shadow-md">Save Shipment</button>
            <button type="button" onClick={() => setEdit(null)} className="rounded-xl border border-brand-300 px-6 py-2.5 text-sm font-semibold">Cancel</button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto rounded-2xl border border-brand-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-200 bg-brand-50 text-left text-xs uppercase tracking-wide text-brand-500">
              <th className="p-4">Order</th><th className="p-4">Customer</th><th className="p-4">Courier / Tracking</th>
              <th className="p-4">Location</th><th className="p-4">Est. Delivery</th><th className="p-4">Status</th><th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {shipments.map((s) => (
              <tr key={s.id} className="border-b border-brand-100 hover:bg-brand-50/50">
                <td className="p-4"><Link to={`/orders/${s.order_id}`} className="font-semibold text-accent-600 hover:underline">{s.order_number}</Link></td>
                <td className="p-4">{s.customer}</td>
                <td className="p-4 text-xs">{s.courier_name}<br /><span className="font-mono text-brand-500">{s.tracking_number}</span></td>
                <td className="p-4 text-xs">{s.current_location || '—'}</td>
                <td className="p-4 text-xs">{s.estimated_delivery ? formatDate(s.estimated_delivery) : '—'}</td>
                <td className="p-4"><Badge color={STATUS_BADGE[s.status]}>{titleize(s.status)}</Badge></td>
                <td className="p-4"><button onClick={() => startEdit(s)} className="rounded-full border border-brand-300 transition hover:border-accent-500 px-3 py-1.5 text-xs font-semibold hover:bg-brand-100">Update</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminShipments;
