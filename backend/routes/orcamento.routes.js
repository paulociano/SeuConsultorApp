const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

const orcamentoController = require('../controllers/orcamento.controller');
const { verificarToken } = require('../middleware/auth.middleware');
const { checkValidation } = require('../middleware/validation.middleware');

const createItemValidation = [
  body('nome', 'O nome do item é obrigatório').isString().trim().notEmpty(),
  body('valor_planejado', 'Valor planejado deve ser um número').optional().isFloat(),
  body('categoria_id', 'O ID da categoria é obrigatório').isInt(),
  body('categoria_planejamento', 'Categoria de planejamento é obrigatória')
    .isString()
    .trim()
    .notEmpty(),
];

const updateItemValidation = [
  param('id', 'O ID na URL é inválido').isInt(),
  body('nome', 'O nome do item é obrigatório').isString().trim().notEmpty(),
  body('valor_planejado', 'Valor planejado deve ser um número').isFloat(),
  body('valor_atual', 'Valor atual deve ser um número').isFloat(),
  body('categoria_planejamento', 'Categoria de planejamento é obrigatória')
    .isString()
    .trim()
    .notEmpty(),
];

const idParamValidation = [param('id', 'O ID na URL é inválido').isInt()];

// Protege todas as rotas de orçamento com o token
router.use(verificarToken);

// Rota principal para buscar o orçamento completo
router.get('/orcamento', orcamentoController.getOrcamento);

// Rotas para o CRUD dos itens do orçamento
router.post(
  '/orcamento/itens',
  createItemValidation,
  checkValidation,
  orcamentoController.createOrcamentoItem
);
router.put(
  '/orcamento/itens/:id',
  updateItemValidation,
  checkValidation,
  orcamentoController.updateOrcamentoItem
);
router.delete(
  '/orcamento/itens/:id',
  idParamValidation,
  checkValidation,
  orcamentoController.deleteOrcamentoItem
);

module.exports = router;
