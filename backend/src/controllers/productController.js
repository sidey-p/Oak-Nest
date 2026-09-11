import { query } from '../config/db.js';
import { badRequest, notFound } from '../middleware/errors.js';
import { validateProduct } from '../validators/catalogValidators.js';
import { slugify, paginate, toNumber } from '../utils/helpers.js';
import { publicImageUrl } from '../middleware/upload.js';
import { dataUriFromBuffer, resolveImageInput } from '../utils/images.js';

const SELECT_BASE = `
  SELECT p.*,
         c.name AS category_name,
         c.slug AS category_slug,
         COALESCE((SELECT ROUND(AVG(r.rating), 1) FROM reviews r WHERE r.product_id = p.id AND r.status = 'approved'), 0) AS avg_rating,
         COALESCE((SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id AND r.status = 'approved'), 0) AS review_count
  FROM products p
  JOIN categories c ON c.id = p.category_id
`;

const SELECT_ONE = `
  SELECT p.*,
         c.name AS category_name,
         c.slug AS category_slug,
         COALESCE((SELECT ROUND(AVG(r.rating), 1) FROM reviews r WHERE r.product_id = p.id AND r.status = 'approved'), 0) AS avg_rating,
         COALESCE((SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id AND r.status = 'approved'), 0) AS review_count
  FROM products p
  JOIN categories c ON c.id = p.category_id
`;

export const listProducts = async (req, res) => {
  const { search, category, minPrice, maxPrice, material, brand, sort, status } = req.query;
  const { page, perPage, offset } = paginate(req.query.page, req.query.perPage);

  const where = [];
  const params = [];

  if (req.user?.role !== 'admin') {
    where.push(`p.status = 'active'`);
  } else if (status) {
    where.push(`p.status = $${params.length + 1}`);
    params.push(String(status));
  }

  if (search) {
    params.push(`%${search.toLowerCase()}%`);
    const i = params.length;
    where.push(`(LOWER(p.name) LIKE $${i} OR LOWER(p.description) LIKE $${i} OR LOWER(p.brand) LIKE $${i} OR LOWER(p.material) LIKE $${i})`);
  }

  if (category) {
    if (/^\d+$/.test(String(category))) {
      where.push(`p.category_id = $${params.length + 1}`);
      params.push(Number(category));
    } else {
      where.push(`c.slug = $${params.length + 1}`);
      params.push(String(category));
    }
  }

  if (minPrice !== undefined && minPrice !== '') {
    where.push(`COALESCE(p.discount_price, p.price) >= $${params.length + 1}`);
    params.push(toNumber(minPrice));
  }
  if (maxPrice !== undefined && maxPrice !== '') {
    where.push(`COALESCE(p.discount_price, p.price) <= $${params.length + 1}`);
    params.push(toNumber(maxPrice));
  }
  if (material) {
    where.push(`LOWER(p.material) = LOWER($${params.length + 1})`);
    params.push(String(material));
  }
  if (brand) {
    where.push(`LOWER(p.brand) = LOWER($${params.length + 1}`);
    params.push(String(brand));
  }

  const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const sortMap = {
    price_asc: 'COALESCE(p.discount_price, p.price) ASC',
    price_desc: 'COALESCE(p.discount_price, p.price) DESC',
    newest: 'p.created_at DESC',
    oldest: 'p.created_at ASC',
    name_asc: 'p.name ASC',
    name_desc: 'p.name DESC',
    rating: 'avg_rating DESC, review_count DESC',
    popular: 'review_count DESC, avg_rating DESC',
  };
  const orderBy = sortMap[sort] || 'p.id ASC';

  const countResult = await query(
    `SELECT COUNT(*) AS total FROM products p JOIN categories c ON c.id = p.category_id ${whereClause}`,
    params,
  );
  const total = Number(countResult.rows[0].total);

  const result = await query(
    `${SELECT_BASE} ${whereClause} ORDER BY ${orderBy} LIMIT $${params.length + 1} OFFSET $${params.length + 2}`,
    [...params, perPage, offset],
  );

  res.json({
    success: true,
    products: result.rows,
    pagination: { page, perPage, total, totalPages: Math.ceil(total / perPage) },
  });
};

export const getProduct = async (req, res) => {
  const idOrSlug = req.params.id;
  const isNumeric = /^\d+$/.test(idOrSlug);

  const result = await query(
    `${SELECT_ONE} WHERE ${isNumeric ? 'p.id = $1' : 'p.slug = $1'} LIMIT 1`,
    [idOrSlug],
  );
  if (!result.rows[0]) throw notFound('Product not found');

  const images = await query(
    'SELECT id, image_url, is_primary FROM product_images WHERE product_id = $1 ORDER BY is_primary DESC, id ASC',
    [result.rows[0].id],
  );

  res.json({ success: true, product: result.rows[0], images: images.rows });
};

export const createProduct = async (req, res) => {
  const errors = validateProduct(req.body);
  if (errors.length) throw badRequest(errors.join('; '));

  const { name, category_id, description, brand, material, price, discount_price, stock, status } = req.body;

  const cat = await query('SELECT id FROM categories WHERE id = $1', [Number(category_id)]);
  if (!cat.rows[0]) throw badRequest('Category not found');

  let slug = slugify(name);
  const clash = await query('SELECT id FROM products WHERE slug = $1', [slug]);
  if (clash.rows.length) slug = `${slug}-${Date.now().toString().slice(-4)}`;

  let mainImage = null;
  if (req.file) {
    mainImage = dataUriFromBuffer(req.file.buffer, req.file.mimetype);
  } else if (req.body.main_image !== undefined) {
    mainImage = await resolveImageInput(req.body.main_image);
  }

  const result = await query(
    `INSERT INTO products (category_id, name, slug, description, brand, material, price, discount_price, stock, main_image, status)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
    [
      Number(category_id),
      String(name).trim(),
      slug,
      description?.trim() || null,
      brand?.trim() || null,
      material?.trim() || null,
      Number(price),
      discount_price === undefined || discount_price === null || discount_price === '' ? null : Number(discount_price),
      Number(stock ?? 0),
      mainImage,
      status || 'active',
    ],
  );

  if (mainImage) {
    await query('INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, TRUE)', [
      result.rows[0].id,
      mainImage,
    ]);
  }

  res.status(201).json({ success: true, message: 'Product created', product: result.rows[0] });
};

export const updateProduct = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw badRequest('Invalid product id');

  const existing = await query('SELECT * FROM products WHERE id = $1', [id]);
  if (!existing.rows[0]) throw notFound('Product not found');

  const merged = { ...existing.rows[0], ...req.body };
  const errors = validateProduct({ ...merged, price: merged.price, discount_price: merged.discount_price }, true);
  if (errors.length) throw badRequest(errors.join('; '));

  const { name, description, brand, material, price, discount_price, stock, status, category_id } = req.body;

  let mainImage = existing.rows[0].main_image;
  if (req.file) {
    mainImage = dataUriFromBuffer(req.file.buffer, req.file.mimetype);
  } else if (req.body.main_image !== undefined && String(req.body.main_image).trim() !== '') {
    mainImage = await resolveImageInput(req.body.main_image);
  }

  const result = await query(
    `UPDATE products SET
       name = COALESCE($1, name),
       description = COALESCE($2, description),
       brand = COALESCE($3, brand),
       material = COALESCE($4, material),
       price = COALESCE($5, price),
       discount_price = $6,
       stock = COALESCE($7, stock),
       status = COALESCE($8, status),
       category_id = COALESCE($9, category_id),
       main_image = $10
     WHERE id = $11 RETURNING *`,
    [
      name !== undefined ? String(name).trim() : null,
      description !== undefined ? description : null,
      brand !== undefined ? brand : null,
      material !== undefined ? material : null,
      price !== undefined ? Number(price) : null,
      discount_price === undefined ? existing.rows[0].discount_price : (discount_price === null || discount_price === '' ? null : Number(discount_price)),
      stock !== undefined ? Number(stock) : null,
      status !== undefined ? status : null,
      category_id !== undefined ? Number(category_id) : null,
      mainImage,
      id,
    ],
  );

  if (req.file) {
    await query('UPDATE product_images SET is_primary = FALSE WHERE product_id = $1', [id]);
    await query('INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, TRUE)', [
      id,
      mainImage,
    ]);
  }

  res.json({ success: true, message: 'Product updated', product: result.rows[0] });
};

export const deleteProduct = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw badRequest('Invalid product id');

  const inOrders = await query('SELECT COUNT(*) AS n FROM order_items WHERE product_id = $1', [id]);
  if (Number(inOrders.rows[0].n) > 0) {
    const result = await query("UPDATE products SET status = 'archived' WHERE id = $1 RETURNING *", [id]);
    if (!result.rows[0]) throw notFound('Product not found');
    return res.json({
      success: true,
      message: 'Product has order history — archived instead of deleted to preserve records',
      product: result.rows[0],
    });
  }

  const result = await query('DELETE FROM products WHERE id = $1 RETURNING id', [id]);
  if (!result.rows[0]) throw notFound('Product not found');
  res.json({ success: true, message: 'Product deleted' });
};

export const updateStock = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw badRequest('Invalid product id');

  const stock = Number(req.body?.stock);
  if (!Number.isInteger(stock) || stock < 0) throw badRequest('Stock must be a non-negative integer');

  const result = await query('UPDATE products SET stock = $1 WHERE id = $2 RETURNING *', [stock, id]);
  if (!result.rows[0]) throw notFound('Product not found');
  res.json({ success: true, message: 'Stock updated', product: result.rows[0] });
};

export const addProductImage = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw badRequest('Invalid product id');

  const exists = await query('SELECT id, main_image FROM products WHERE id = $1', [id]);
  if (!exists.rows[0]) throw notFound('Product not found');

  let url;
  if (req.file) {
    url = dataUriFromBuffer(req.file.buffer, req.file.mimetype);
  } else {
    url = await resolveImageInput(req.body?.image_url);
    if (!url) throw badRequest('Provide an image file or an image link');
  }

  const count = await query('SELECT COUNT(*) AS n FROM product_images WHERE product_id = $1', [id]);
  const isFirst = Number(count.rows[0].n) === 0 && !exists.rows[0].main_image;

  const result = await query(
    'INSERT INTO product_images (product_id, image_url, is_primary) VALUES ($1, $2, $3) RETURNING *',
    [id, url, isFirst],
  );

  if (isFirst) {
    await query('UPDATE products SET main_image = $1 WHERE id = $2', [url, id]);
  }

  res.status(201).json({ success: true, message: 'Image added', image: result.rows[0] });
};

export const listMaterials = async (req, res) => {
  const result = await query(
    "SELECT DISTINCT material FROM products WHERE material IS NOT NULL AND status = 'active' ORDER BY material ASC",
  );
  res.json({ success: true, materials: result.rows.map((r) => r.material) });
};

export const listBrands = async (req, res) => {
  const result = await query(
    "SELECT DISTINCT brand FROM products WHERE brand IS NOT NULL AND status = 'active' ORDER BY brand ASC",
  );
  res.json({ success: true, brands: result.rows.map((r) => r.brand) });
};
