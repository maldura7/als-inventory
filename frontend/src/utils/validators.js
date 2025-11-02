// Email validation
export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// Password validation
export const validatePassword = (password) => {
  return password && password.length >= 6;
};

// Required field validation
export const validateRequired = (value) => {
  if (typeof value === 'string') {
    return value.trim().length > 0;
  }
  return !!value;
};

// Number validation
export const validateNumber = (value) => {
  return !isNaN(parseFloat(value)) && isFinite(value);
};

// Phone number validation
export const validatePhone = (phone) => {
  const re = /^\d{10}$/;
  return re.test(phone.replace(/\D/g, ''));
};

// URL validation
export const validateUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Validate form data
export const validateForm = (data, rules) => {
  const errors = {};

  Object.keys(rules).forEach(field => {
    const value = data[field];
    const rule = rules[field];

    if (rule.required && !validateRequired(value)) {
      errors[field] = `${field} is required`;
    } else if (rule.email && value && !validateEmail(value)) {
      errors[field] = `${field} must be a valid email`;
    } else if (rule.phone && value && !validatePhone(value)) {
      errors[field] = `${field} must be a valid phone number`;
    } else if (rule.min && value && parseFloat(value) < rule.min) {
      errors[field] = `${field} must be at least ${rule.min}`;
    } else if (rule.max && value && parseFloat(value) > rule.max) {
      errors[field] = `${field} must be at most ${rule.max}`;
    } else if (rule.minLength && value && value.length < rule.minLength) {
      errors[field] = `${field} must be at least ${rule.minLength} characters`;
    } else if (rule.maxLength && value && value.length > rule.maxLength) {
      errors[field] = `${field} must be at most ${rule.maxLength} characters`;
    } else if (rule.pattern && value && !rule.pattern.test(value)) {
      errors[field] = rule.message || `${field} is invalid`;
    } else if (rule.custom && !rule.custom(value)) {
      errors[field] = rule.message || `${field} is invalid`;
    }
  });

  return errors;
};

// SKU validation
export const validateSKU = (sku) => {
  return sku && sku.length > 0 && sku.length <= 50;
};

// Barcode validation
export const validateBarcode = (barcode) => {
  // Allow UPC-A (12 digits), EAN-13 (13 digits), or custom formats
  return /^\d{8,14}$/.test(barcode.replace(/\D/g, ''));
};

// Currency validation
export const validateCurrency = (value) => {
  return validateNumber(value) && parseFloat(value) >= 0;
};

// Quantity validation
export const validateQuantity = (quantity) => {
  const num = parseInt(quantity);
  return !isNaN(num) && num >= 0 && Number.isInteger(num);
};
