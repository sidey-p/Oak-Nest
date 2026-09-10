import { useEffect, useState } from 'react';
import api, { errorMessage } from '../../services/api';
import { Alert, Badge, Spinner } from '../../components/common/UI';
import { formatPrice, formatDate } from '../../utils/format';

const AdminCustomers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    try {
      const { data } = await api.get('/admin/users');
      setUsers(data.users);
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const toggle = async (u) => {
    if (!window.confirm(`${u.is_active ? 'Deactivate' : 'Activate'} account "${u.email}"?`)) return;
    try {
      await api.put(`/admin/users/${u.id}/toggle-active`);
      load();
    } catch (err) {
      alert(errorMessage(err));
    }
  };

  const shown = users.filter((u) => u.role === 'customer' &&
    (!search || `${u.first_name} ${u.last_name} ${u.email}`.toLowerCase().includes(search.toLowerCase())));

  if (loading) return <Spinner />;
  if (error) return <Alert>{error}</Alert>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl font-bold text-brand-900">Customers</h1>
          <p className="text-sm text-brand-500">{shown.length} registered customers</p>
        </div>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search customers..."
          className="w-64 rounded-lg border border-brand-300 px-3 py-2 text-sm outline-none focus:border-accent-500" />
      </div>

      <div className="overflow-x-auto rounded-2xl border border-brand-200 bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-brand-200 bg-brand-50 text-left text-xs uppercase tracking-wide text-brand-500">
              <th className="p-4">Customer</th><th className="p-4">Contact</th><th className="p-4">Joined</th>
              <th className="p-4">Orders</th><th className="p-4">Lifetime Value</th><th className="p-4">Status</th><th className="p-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((u) => (
              <tr key={u.id} className="border-b border-brand-100 hover:bg-brand-50/50">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-brand-200 text-xs font-bold text-brand-700">
                      {u.first_name?.[0]}{u.last_name?.[0]}
                    </span>
                    <div>
                      <p className="font-semibold text-brand-900">{u.first_name} {u.last_name}</p>
                      <p className="text-xs text-brand-400">ID #{u.id}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4"><p>{u.email}</p><p className="text-xs text-brand-400">{u.phone || '—'}</p></td>
                <td className="p-4 text-brand-500">{formatDate(u.created_at)}</td>
                <td className="p-4 font-semibold">{u.order_count}</td>
                <td className="p-4 font-bold">{formatPrice(u.lifetime_value)}</td>
                <td className="p-4"><Badge color={u.is_active ? 'green' : 'gray'}>{u.is_active ? 'Active' : 'Deactivated'}</Badge></td>
                <td className="p-4">
                  <button onClick={() => toggle(u)}
                    className={`rounded-lg border px-3 py-1.5 text-xs font-semibold ${u.is_active ? 'border-red-200 text-red-600 hover:bg-red-50' : 'border-green-200 text-green-700 hover:bg-green-50'}`}>
                    {u.is_active ? 'Deactivate' : 'Activate'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminCustomers;
