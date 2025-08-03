const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/auth.controller');
const { checkValidation } = require('../middleware/validation.middleware');

const loginValidation = [
  body('email', 'Por favor, insira um email válido.').isEmail().normalizeEmail(),
  body('senha', 'A senha não pode estar em branco.').notEmpty(),
];

const cadastroValidation = [
  body('nome', 'O nome é obrigatório...').isString().trim().isLength({ min: 3 }),
  body('email', 'Por favor, insira um email válido.').isEmail().normalizeEmail(),
  body('senha', 'A senha deve ter no mínimo 6 caracteres.').isLength({ min: 6 }),
];

router.post('/login', loginValidation, checkValidation, authController.login);
router.post('/cadastro', cadastroValidation, checkValidation, authController.cadastro);

module.exports = router;
