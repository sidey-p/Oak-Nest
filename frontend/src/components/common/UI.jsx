export const Spinner = ({ label = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-brand-500">
    <svg className="h-8 w-8 animate-spin text-brand-400" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
    <span className="text-sm">{label}</span>
  </div>
);

export const Alert = ({ type = 'error', children }) => {
  const styles = {
    error: 'bg-red-50 border-red-300 text-red-800',
    success: 'bg-green-50 border-green-300 text-green-800',
    info: 'bg-blue-50 border-blue-300 text-blue-800',
  };
  return <div className={`rounded-xl border px-4 py-3 text-sm ${styles[type]}`}>{children}</div>;
};

export const Empty = ({ icon = '🛋️', title, subtitle, children }) => (
  <div className="rounded-2xl border border-dashed border-brand-300 bg-white p-12 text-center">
    <div className="text-4xl">{icon}</div>
    <h3 className="mt-3 font-serif text-xl font-semibold text-brand-900">{title}</h3>
    {subtitle && <p className="mt-1 text-sm text-brand-500">{subtitle}</p>}
    {children && <div className="mt-5">{children}</div>}
  </div>
);

export const Badge = ({ color = 'brand', children }) => {
  const colors = {
    brand: 'bg-brand-100 text-brand-800',
    green: 'bg-green-100 text-green-800',
    amber: 'bg-amber-100 text-amber-800',
    red: 'bg-red-100 text-red-800',
    blue: 'bg-blue-100 text-blue-800',
    gray: 'bg-gray-100 text-gray-700',
    purple: 'bg-purple-100 text-purple-800',
  };
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold ${colors[color] || colors.brand}`}>{children}</span>;
};

export const STATUS_BADGE = {
  pending: 'amber', confirmed: 'blue', processing: 'purple', shipped: 'blue',
  out_for_delivery: 'purple', delivered: 'green', cancelled: 'red', returned: 'gray',
  paid: 'green', failed: 'red', refunded: 'amber', new: 'amber', read: 'blue',
  resolved: 'green', approved: 'green', hidden: 'gray', active: 'green', inactive: 'gray',
  under_review: 'blue', quotation_sent: 'purple', accepted: 'green', in_production: 'purple', completed: 'green', rejected: 'red',
};
