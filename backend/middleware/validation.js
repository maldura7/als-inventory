// Input validation middleware
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePassword = (password) => {
  return password && password.length >= 6;
};

const validateRequiredFields = (fields) => {
  return (req, res, next) => {
    const missing = [];
    
    fields.forEach(field => {
      if (!req.body[field]) {
        missing.push(field);
      }
    });

    if (missing.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Missing required fields: ${missing.join(', ')}`
      });
    }

    next();
  };
};

const validateProductInput = (req, res, next) => {
  const { sku, name, price } = req.body;

  if (!sku || !name) {
    return res.status(400).json({
      success: false,
      message: 'SKU and name are required'
    });
  }

  if (price && isNaN(parseFloat(price))) {
    return res.status(400).json({
      success: false,
      message: 'Price must be a number'
    });
  }

  next();
};

const validatePaginationParams = (req, res, next) => {
  const { page = 1, limit = 20 } = req.query;
  
  req.pagination = {
    page: Math.max(1, parseInt(page)),
    limit: Math.min(100, Math.max(1, parseInt(limit)))
  };

  next();
};

module.exports = {
  validateEmail,
  validatePassword,
  validateRequiredFields,
  validateProductInput,
  validatePaginationParams
};
