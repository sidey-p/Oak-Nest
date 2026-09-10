export const validateRegister = (body) => {
  const errors = [];
  const { first_name, last_name, email, password, phone } = body;

  if (!first_name || String(first_name).trim().length < 2) errors.push('First name is required (min 2 chars)');
  if (!last_name || String(last_name).trim().length < 2) errors.push('Last name is required (min 2 chars)');
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email))) errors.push('Valid email is required');
  if (!password || String(password).length < 6) errors.push('Password must be at least 6 characters');
  if (phone && String(phone).trim() && !/^[+\d][\d\s-]{6,19}$/.test(String(phone).trim())) errors.push('Invalid phone number format');

  return errors;
};

export const validateLogin = (body) => {
  const errors = [];
  if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(body.email))) errors.push('Valid email is required');
  if (!body.password) errors.push('Password is required');
  return errors;
};

export const validateProfileUpdate = (body) => {
  const errors = [];
  const { first_name, last_name, phone } = body;
  if (first_name !== undefined && String(first_name).trim().length < 2) errors.push('First name must be at least 2 characters');
  if (last_name !== undefined && String(last_name).trim().length < 2) errors.push('Last name must be at least 2 characters');
  if (phone !== undefined && String(phone).trim() && !/^[+\d][\d\s-]{6,19}$/.test(String(phone).trim())) errors.push('Invalid phone number format');
  return errors;
};

export const validatePasswordChange = (body) => {
  const errors = [];
  if (!body.current_password) errors.push('Current password is required');
  if (!body.new_password || String(body.new_password).length < 6) errors.push('New password must be at least 6 characters');
  return errors;
};
