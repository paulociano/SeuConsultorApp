// backend/middleware/validation.middleware.js
const { validationResult } = require('express-validator');

const checkValidation = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Se houver erros, retorna um status 400 com a lista de erros.
    // Isso nos dirá exatamente qual campo está errado.
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = { checkValidation };
