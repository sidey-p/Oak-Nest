export const Spinner = ({ label = 'Loading...' }) => (
  <div className="flex flex-col items-center justify-center gap-3 py-16 text-brand-500">
    <div className="relative h-10 w-10">
      <span className="absolute inset-0 rounded-full border-2 border-brand-200" />
      <span className="absolute inset-0 rounded-full border-2 border-t-accent-600 border-r-transparent border-b-transparent border-l-transparent animate-spin" />
    </div>
    <span className="text-sm animate-fade-in">{label}</span>
  </div>
);

export const Alert = ({ type = 'error', children }) => {
  const styles = {
    error: 'bg-red-50 border-red-200 text-red-800',
    success: 'bg-accent-50 border-accent-400/40 text-accent-700',
    info: 'bg-blue-50 border-blue-200 text-blue-800',
  };
  const icons = { error: '⚠️', success: '✓', info: 'ℹ️' };
  return (
    <div className={`animate-fade-up flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm shadow-sm ${styles[type]}`}>
      <span className="mt-px">{icons[type]}</span>
      <span>{children}</span>
    </div>
  );
};

export const Empty = ({ icon = '🛋️', title, subtitle, children }) => (
  <div className="animate-fade-up rounded-3xl border border-dashed border-brand-300 bg-white/70 p-12 text-center">
    <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-brand-100 text-3xl animate-float">{icon}</div>
    <h3 className="mt-4 font-serif text-xl font-semibold text-brand-900">{title}</h3>
    {subtitle && <p className="mt-1 text-sm text-brand-500">{subtitle}</p>}
    {children && <div className="mt-5">{children}</div>}
  </div>
);

export const Badge = ({ color = 'brand', children }) => {
  const colors = {
    brand: 'bg-brand-100 text-brand-800',
    green: 'bg-accent-50 text-accent-700',
    amber: 'bg-gold-300/40 text-gold-600',
    red: 'bg-red-100 text-red-800',
    blue: 'bg-blue-100 text-blue-800',
    gray: 'bg-gray-100 text-gray-700',
    purple: 'bg-purple-100 text-purple-800',
  };
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide ${colors[color] || colors.brand}`}>{children}</span>;
};

export const STATUS_BADGE = {
  pending: 'amber', confirmed: 'blue', processing: 'purple', shipped: 'blue',
  out_for_delivery: 'purple', delivered: 'green', cancelled: 'red', returned: 'gray',
  paid: 'green', failed: 'red', refunded: 'amber', new: 'amber', read: 'blue',
  resolved: 'green', approved: 'green', hidden: 'gray', active: 'green', inactive: 'gray',
  under_review: 'blue', quotation_sent: 'purple', accepted: 'green', in_production: 'purple', completed: 'green', rejected: 'red',
};

/* --- New premium primitives, free to use across pages --- */

export const Button = ({ as: As = 'button', variant = 'primary', size = 'md', className = '', children, ...props }) => {
  const variants = {
    primary: 'bg-brand-900 text-white hover:bg-brand-800',
    accent: 'bg-accent-600 text-white hover:bg-accent-700',
    outline: 'border border-brand-300 text-brand-900 hover:border-accent-500 hover:text-accent-600 bg-white',
    ghost: 'text-brand-800 hover:bg-brand-100',
    gold: 'bg-gold-500 text-brand-950 hover:bg-gold-400',
  };
  const sizes = { sm: 'px-4 py-2 text-xs', md: 'px-6 py-2.5 text-sm', lg: 'px-8 py-3.5 text-sm' };
  return (
    <As
      className={`btn-shine inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-all duration-300 shadow-sm hover:shadow-md active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-40 ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </As>
  );
};

export const Card = ({ className = '', hover = true, children, ...props }) => (
  <div className={`rounded-2xl border border-brand-200 bg-white shadow-soft ${hover ? 'card-lift' : ''} ${className}`} {...props}>
    {children}
  </div>
);

export const SectionHeading = ({ eyebrow, title, subtitle, align = 'left' }) => (
  <div className={`reveal ${align === 'center' ? 'text-center' : ''}`}>
    {eyebrow && <p className="text-xs font-bold uppercase tracking-[0.3em] text-accent-600">{eyebrow}</p>}
    <h2 className="mt-2 font-serif text-3xl font-bold text-brand-900 sm:text-4xl">{title}</h2>
    {subtitle && <p className={`mt-3 text-brand-500 ${align === 'center' ? 'mx-auto max-w-xl' : 'max-w-xl'}`}>{subtitle}</p>}
  </div>
);

export const FeatureFlag = ({ label = 'Coming soon' }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-gold-500/60 bg-gold-300/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-gold-600">
    <span className="h-1.5 w-1.5 rounded-full bg-gold-500 animate-pulse" /> {label}
  </span>
);
