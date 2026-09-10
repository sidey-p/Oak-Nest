import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errorMessage } from '../../services/api';
import { Alert, Spinner, STATUS_BADGE, Badge } from '../../components/common/UI';
import { formatPrice, formatDate } from '../../utils/format';

const StatCard = ({ label, value, icon, tone, to }) => (
  <Link to={to || '#'} className="rounded-2xl border border-brand-200 bg-white p-5 transition hover:shadow-md">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-400">{label}</p>
        <p className="mt-1.5 text-2xl font-bold text-brand-900">{value}</p>
      </div>
      <span className={`grid h-11 w-11 place-items-center rounded-xl text-xl ${tone}`}>{icon}</span>
    </div>
  </Link>
);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/admin/dashboard')
      .then((d) => setData(d.data))
      .catch((e) => setError(errorMessage(e)));
  }, []);

  if (error) return <Alert>{error}</Alert>;
  if (!data) return <Spinner label="Loading dashboard..." />;

  const { stats, recent_orders, top_products, sales_by_category } = data;
  const maxRevenue = Math.max(...sales_by_category.map((c) => Number(c.revenue)), 1);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-2xl font-bold text-brand-900">Dashboard</h1>
        <p className="mt-1 text-sm text-brand-500">Overview of your store — all data from the local database.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Total Sales" value={formatPrice(stats.total_sales)} icon="💰" tone="bg-green-100" />
        <StatCard label="Orders" value={stats.total_orders} icon="📦" tone="bg-blue-100" to="/admin/orders" />
        <StatCard label="Customers" value={stats.total_customers} icon="👥" tone="bg-purple-100" to="/admin/customers" />
        <StatCard label="Products" value={stats.total_products} icon="🛋️" tone="bg-amber-100" to="/admin/products" />
        <StatCard label="Pending Orders" value={stats.pending_orders} icon="⏳" tone="bg-amber-100" to="/admin/orders" />
        <StatCard label="Low Stock Items" value={stats.low_stock_products} icon="⚠️" tone="bg-red-100" to="/admin/products" />
        <StatCard label="Reviews Awaiting" value={stats.pending_reviews} icon="⭐" tone="bg-yellow-100" to="/admin/reviews" />
        <StatCard label="Design Requests" value={stats.open_design_requests} icon="🎨" tone="bg-pink-100" to="/admin/custom-requests" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-brand-200 bg-white p-6">
          <h2 className="font-serif text-lg font-bold text-brand-900">Sales by Category</h2>
          <div className="mt-4 space-y-3">
            {sales_by_category.map((c) => (
              <div key={c.name}>
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-brand-700">{c.name}</span>
                  <span className="text-brand-500">{formatPrice(c.revenue)}</span>
                </div>
                <div className="mt-1 h-2.5 rounded-full bg-brand-100">
                  <div className="h-full rounded-full bg-gradient-to-r from-brand-600 to-brand-400"
                    style={{ width: `${(Number(c.revenue) / maxRevenue) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-brand-200 bg-white p-6">
          <h2 className="font-serif text-lg font-bold text-brand-900">Top Products</h2>
          <div className="mt-4 space-y-3">
            {top_products.length === 0 && <p className="text-sm text-brand-400">No sales data yet.</p>}
            {top_products.map((p, i) => (
              <div key={p.id} className="flex items-center gap-3">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">{i + 1}</span>
                <img src={p.main_image} alt="" className="h-10 w-12 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-brand-900">{p.name}</p>
                  <p className="text-xs text-brand-400">{p.sold} sold</p>
                </div>
                <span className="text-sm font-bold">{formatPrice(p.revenue)}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-brand-200 bg-white p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-serif text-lg font-bold text-brand-900">Recent Orders</h2>
          <Link to="/admin/orders" className="text-xs font-semibold text-accent-600 hover:underline">View all →</Link>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-200 text-left text-xs uppercase tracking-wide text-brand-400">
                <th className="pb-2">Order</th><th className="pb-2">Customer</th><th className="pb-2">Date</th><th className="pb-2">Total</th><th className="pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {recent_orders.map((o) => (
                <tr key={o.id} className="border-b border-brand-100">
                  <td className="py-3 font-semibold text-brand-900">{o.order_number}</td>
                  <td className="py-3">{o.customer}</td>
                  <td className="py-3 text-brand-500">{formatDate(o.created_at)}</td>
                  <td className="py-3 font-bold">{formatPrice(o.total)}</td>
                  <td className="py-3"><Badge color={STATUS_BADGE[o.status]}>{o.status.replace(/_/g, ' ')}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
