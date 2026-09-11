const safeImagePath = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const v = String(value).trim();
  if (!v.startsWith('/uploads/')) return undefined; // invalid
  if (v.includes('..')) return undefined;
  return v;
};

export const validateProduct = (body, partial = false) => {
  const errors = [];
  const { name, category_id, price, stock, material, brand, status, discount_price, description } = body;

  if (!partial || name !== undefined) {
    if (!name || String(name).trim().length < 3) errors.push('Product name is required (min 3 chars)');
  }
  if (!partial || category_id !== undefined) {
    const catId = Number(category_id);
    if (!Number.isInteger(catId) || catId <= 0) errors.push('Valid category is required');
  }
  if (!partial || price !== undefined) {
    const p = Number(price);
    if (!Number.isFinite(p) || p < 0) errors.push('Price must be a non-negative number');
  }
  if (!partial || stock !== undefined) {
    const s = Number(stock);
    if (!Number.isInteger(s) || s < 0) errors.push('Stock must be a non-negative integer');
  }
  if (discount_price !== undefined && discount_price !== null && discount_price !== '') {
    const d = Number(discount_price);
    if (!Number.isFinite(d) || d < 0) errors.push('Discount price must be a non-negative number');
    if (Number.isFinite(Number(price)) && d >= Number(price)) errors.push('Discount price must be lower than price');
  }
  if (material !== undefined && material !== null && String(material).trim().length === 0) {
    errors.push('Material cannot be empty');
  }
  if (brand !== undefined && brand !== null && String(brand).trim().length === 0) {
    errors.push('Brand cannot be empty');
  }
  if (status !== undefined && !['active', 'draft', 'archived'].includes(status)) {
    errors.push('Status must be active, draft or archived');
  }
  if (description !== undefined && description !== null && String(description).length > 5000) {
    errors.push('Description too long (max 5000 chars)');
  }
  if (body.main_image !== undefined && body.main_image !== null && body.main_image !== '') {
    if (safeImagePath(body.main_image) === undefined) {
      errors.push('Image must be an uploaded file (use the image upload) or a /uploads/ path');
    }
  }

  return errors;
};

export const validateCategory = (body, partial = false) => {
  const errors = [];
  const { name, description, image } = body;
  if (!partial || name !== undefined) {
    if (!name || String(name).trim().length < 3) errors.push('Category name is required (min 3 chars)');
    if (String(name || '').trim().length > 100) errors.push('Category name too long (max 100 chars)');
  }
  if (image !== undefined && image !== null && image !== '') {
    if (safeImagePath(image) === undefined) {
      errors.push('Category image must be a /uploads/ path');
    }
  }
  if (description !== undefined && description !== null && String(description).length > 1000) {
    errors.push('Description too long (max 1000 chars)');
  }
  return errors;
};
