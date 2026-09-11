import { query } from '../config/db.js';
import { badRequest, notFound } from '../middleware/errors.js';
import { validateCategory } from '../validators/catalogValidators.js';
import { slugify } from '../utils/helpers.js';
import { resolveImageInput } from '../utils/images.js';

export const listCategories = async (req, res) => {
  const result = await query(
    `SELECT c.*,
            (SELECT COUNT(*) FROM products p WHERE p.category_id = c.id AND p.status = 'active') AS product_count
     FROM categories c ORDER BY c.name ASC`,
  );
  res.json({ success: true, categories: result.rows });
};

export const getCategory = async (req, res) => {
  const idOrSlug = req.params.id;
  const isNumeric = /^\d+$/.test(idOrSlug);
  const result = await query(
    isNumeric
      ? 'SELECT * FROM categories WHERE id = $1'
      : 'SELECT * FROM categories WHERE slug = $1',
    [idOrSlug],
  );
  if (!result.rows[0]) throw notFound('Category not found');
  res.json({ success: true, category: result.rows[0] });
};

export const createCategory = async (req, res) => {
  const errors = validateCategory(req.body);
  if (errors.length) throw badRequest(errors.join('; '));

  const { name, description, image } = req.body;
  let slug = slugify(name);
  const clash = await query('SELECT id FROM categories WHERE slug = $1', [slug]);
  if (clash.rows.length) slug = `${slug}-${Date.now().toString().slice(-4)}`;

  const resolvedImage = image !== undefined && image !== null && String(image).trim() !== ''
    ? await resolveImageInput(image)
    : null;

  const result = await query(
    `INSERT INTO categories (name, slug, description, image)
     VALUES ($1, $2, $3, $4) RETURNING *`,
    [String(name).trim(), slug, description?.trim() || null, resolvedImage],
  );
  res.status(201).json({ success: true, message: 'Category created', category: result.rows[0] });
};

export const updateCategory = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw badRequest('Invalid category id');

  const existing = await query('SELECT * FROM categories WHERE id = $1', [id]);
  if (!existing.rows[0]) throw notFound('Category not found');

  const errors = validateCategory(req.body, true);
  if (errors.length) throw badRequest(errors.join('; '));

  const { name, description, image } = req.body;

  let resolvedImage;
  if (image === undefined) {
    resolvedImage = existing.rows[0].image;
  } else if (image === null || String(image).trim() === '') {
    resolvedImage = null; // explicit clear
  } else {
    resolvedImage = await resolveImageInput(image);
  }

  const result = await query(
    `UPDATE categories SET
       name = COALESCE($1, name),
       description = COALESCE($2, description),
       image = $3
     WHERE id = $4 RETURNING *`,
    [
      name !== undefined ? String(name).trim() : null,
      description !== undefined ? description : null,
      resolvedImage,
      id,
    ],
  );
  res.json({ success: true, message: 'Category updated', category: result.rows[0] });
};

export const deleteCategory = async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) throw badRequest('Invalid category id');

  const used = await query('SELECT COUNT(*) AS n FROM products WHERE category_id = $1', [id]);
  if (Number(used.rows[0].n) > 0) {
    throw badRequest('Cannot delete: category still has products. Move or delete them first.');
  }

  const result = await query('DELETE FROM categories WHERE id = $1 RETURNING id', [id]);
  if (!result.rows[0]) throw notFound('Category not found');
  res.json({ success: true, message: 'Category deleted' });
};
