export const validateAddress = (body, partial = false) => {
  const errors = [];
  const { full_name, phone, address_line1, city, state, postal_code, country } = body;

  if (!partial || full_name !== undefined) {
    if (!full_name || String(full_name).trim().length < 2) errors.push('Full name is required');
  }
  if (!partial || phone !== undefined) {
    if (!phone || !/^[+\d][\d\s-]{6,19}$/.test(String(phone).trim())) errors.push('Valid phone is required');
  }
  if (!partial || address_line1 !== undefined) {
    if (!address_line1 || String(address_line1).trim().length < 5) errors.push('Address line 1 is required (min 5 chars)');
  }
  if (!partial || city !== undefined) {
    if (!city || String(city).trim().length < 2) errors.push('City is required');
  }
  if (!partial || state !== undefined) {
    if (!state || String(state).trim().length < 2) errors.push('State is required');
  }
  if (!partial || postal_code !== undefined) {
    if (!postal_code || !/^[\w\s-]{3,10}$/.test(String(postal_code).trim())) errors.push('Valid postal code is required');
  }
  if (country !== undefined && country !== null && String(country).trim().length === 0) {
    errors.push('Country cannot be empty');
  }
  return errors;
};

export const validateCheckout = (body) => {
  const errors = [];
  const { address_id, payment_method } = body;
  const addrId = Number(address_id);
  if (!Number.isInteger(addrId) || addrId <= 0) errors.push('Valid address is required');
  if (!['cash_on_delivery', 'local_test_payment'].includes(payment_method)) {
    errors.push('Payment method must be cash_on_delivery or local_test_payment');
  }
  if (body.coupon_code !== undefined && body.coupon_code !== null && String(body.coupon_code).trim().length > 50) {
    errors.push('Invalid coupon code');
  }
  return errors;
};

export const validateReview = (body) => {
  const errors = [];
  const rating = Number(body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) errors.push('Rating must be an integer between 1 and 5');
  if (body.comment !== undefined && body.comment !== null && String(body.comment).length > 2000) {
    errors.push('Review comment too long (max 2000 chars)');
  }
  return errors;
};

export const validateCustomDesign = (body) => {
  const errors = [];
  const { name, email, description, budget } = body;
  if (!name || String(name).trim().length < 2) errors.push('Name is required');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) errors.push('Valid email is required');
  if (budget !== undefined && budget !== null && budget !== '') {
    const b = Number(budget);
    if (!Number.isFinite(b) || b < 0) errors.push('Budget must be a non-negative number');
  }
  if (description !== undefined && description !== null && String(description).length > 3000) {
    errors.push('Description too long (max 3000 chars)');
  }
  return errors;
};

export const validateFeedback = (body) => {
  const errors = [];
  if (!body.subject || String(body.subject).trim().length < 3) errors.push('Subject is required (min 3 chars)');
  if (!body.message || String(body.message).trim().length < 10) errors.push('Message is required (min 10 chars)');
  return errors;
};

export const validateCoupon = (body, partial = false) => {
  const errors = [];
  const { code, discount_type, discount_value, minimum_order, expiry_date } = body;
  if (!partial || code !== undefined) {
    if (!code || !/^[A-Za-z0-9_-]{3,50}$/.test(String(code).trim())) errors.push('Coupon code must be 3-50 chars (letters, numbers, - and _)');
  }
  if (!partial || discount_type !== undefined) {
    if (!['percentage', 'fixed'].includes(discount_type)) errors.push('Discount type must be percentage or fixed');
  }
  if (!partial || discount_value !== undefined) {
    const v = Number(discount_value);
    if (!Number.isFinite(v) || v <= 0) errors.push('Discount value must be greater than 0');
    if (discount_type === 'percentage' && v > 100) errors.push('Percentage discount cannot exceed 100');
  }
  if (minimum_order !== undefined && minimum_order !== null && minimum_order !== '') {
    const m = Number(minimum_order);
    if (!Number.isFinite(m) || m < 0) errors.push('Minimum order must be non-negative');
  }
  if (expiry_date !== undefined && expiry_date !== null && expiry_date !== '') {
    if (Number.isNaN(Date.parse(expiry_date))) errors.push('Invalid expiry date');
  }
  return errors;
};
