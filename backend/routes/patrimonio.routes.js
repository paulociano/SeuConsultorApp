const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

const patrimonioController = require('../controllers/patrimonio.controller');
const { verificarToken } = require('../middleware/auth.middleware');
const { checkValidation } = require('../middleware/validation.middleware');

// Validação genérica para ativos e dívidas
const patrimonioValidation = [
  body('nome', 'Nome é obrigatório').isString().trim().notEmpty(),
  body('valor', 'Valor é obrigatório e deve ser um número').isFloat(),
  body('tipo', 'Tipo é obrigatório').isString().trim().notEmpty(),
];

const idParamValidation = [param('id', 'O ID na URL é inválido').isInt()];

// Protege todas as rotas deste arquivo com o token
router.use(verificarToken);

// --- ROTAS PARA ATIVOS ---
router.get('/ativos', patrimonioController.getAtivos);
router.post('/ativos', patrimonioValidation, checkValidation, patrimonioController.createAtivo);
router.put(
  '/ativos/:id',
  idParamValidation,
  patrimonioValidation,
  checkValidation,
  patrimonioController.updateAtivo
);
router.delete('/ativos/:id', idParamValidation, checkValidation, patrimonioController.deleteAtivo);

// --- ROTAS PARA DÍVIDAS ---
router.get('/dividas', patrimonioController.getDividas);
router.post('/dividas', patrimonioValidation, checkValidation, patrimonioController.createDivida);
router.put(
  '/dividas/:id',
  idParamValidation,
  patrimonioValidation,
  checkValidation,
  patrimonioController.updateDivida
);
router.delete(
  '/dividas/:id',
  idParamValidation,
  checkValidation,
  patrimonioController.deleteDivida
);

module.exports = router;
