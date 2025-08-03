const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

const protecaoController = require('../controllers/protecao.controller');
const { verificarToken } = require('../middleware/auth.middleware');
const { checkValidation } = require('../middleware/validation.middleware');

const protecaoInvalidezValidation = [
  body('nome', 'O nome é obrigatório').isString().trim().notEmpty(),
  body('cobertura', 'O valor da cobertura é obrigatório e deve ser um número').isFloat({ gt: 0 }),
  body('observacoes', 'Observações devem ser um texto').optional().isString().trim(),
];
const protecaoDespesasValidation = [
  body('nome', 'O nome é obrigatório').isString().trim().notEmpty(),
  body('ano_inicio', 'Ano de início é obrigatório e deve ser um número válido').isInt({
    min: 1900,
    max: 2100,
  }),
  body('valor_mensal', 'Valor mensal é obrigatório e deve ser um número').isFloat({ gt: 0 }),
  body('prazo_meses', 'Prazo em meses é obrigatório e deve ser um número inteiro').isInt({ gt: 0 }),
];
const protecaoPatrimonialValidation = [
  body('nome', 'O nome do seguro é obrigatório').isString().trim().notEmpty(),
  body('empresa', 'O nome da empresa é obrigatório').isString().trim().notEmpty(),
  body('data_vencimento', 'A data de vencimento é obrigatória e deve estar no formato AAAA-MM-DD')
    .isISO8601()
    .toDate(),
  body('valor', 'O valor do seguro é obrigatório e deve ser um número').isFloat({ gt: 0 }),
];
const idParamValidation = [param('id', 'O ID na URL é inválido').isInt()];

// Protege todas as rotas de proteção
router.use(verificarToken);

// --- Rotas para Invalidez ---
router.post(
  '/protecao/invalidez',
  protecaoInvalidezValidation,
  checkValidation,
  protecaoController.createInvalidez
);
router.put(
  '/protecao/invalidez/:id',
  idParamValidation,
  protecaoInvalidezValidation,
  checkValidation,
  protecaoController.updateInvalidez
);
router.delete(
  '/protecao/invalidez/:id',
  idParamValidation,
  checkValidation,
  protecaoController.deleteInvalidez
);

// --- Rotas para Despesas Futuras ---
router.post(
  '/protecao/despesas',
  protecaoDespesasValidation,
  checkValidation,
  protecaoController.createDespesa
);
router.put(
  '/protecao/despesas/:id',
  idParamValidation,
  protecaoDespesasValidation,
  checkValidation,
  protecaoController.updateDespesa
);
router.delete(
  '/protecao/despesas/:id',
  idParamValidation,
  checkValidation,
  protecaoController.deleteDespesa
);

// --- Rotas para Patrimonial ---
router.post(
  '/protecao/patrimonial',
  protecaoPatrimonialValidation,
  checkValidation,
  protecaoController.createPatrimonial
);
router.put(
  '/protecao/patrimonial/:id',
  idParamValidation,
  protecaoPatrimonialValidation,
  checkValidation,
  protecaoController.updatePatrimonial
);
router.delete(
  '/protecao/patrimonial/:id',
  idParamValidation,
  checkValidation,
  protecaoController.deletePatrimonial
);

module.exports = router;
