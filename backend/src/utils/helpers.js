export const slugify = (text) =>
  String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || `item-${Date.now()}`;

export const orderNumber = () =>
  `ORD-${new Date().getFullYear()}-${crypto.randomUUID().split('-')[0].toUpperCase()}`;

export const trackingNumber = () =>
  `TRK${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 90 + 10)}`;

export const toNumber = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
};

export const paginate = (page = 1, perPage = 12) => {
  const p = Math.max(1, Math.floor(toNumber(page, 1)));
  const per = Math.min(100, Math.max(1, Math.floor(toNumber(perPage, 12))));
  return { page: p, perPage: per, offset: (p - 1) * per };
};

export const round2 = (n) => Math.round(n * 100) / 100;
