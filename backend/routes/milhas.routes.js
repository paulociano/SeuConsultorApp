const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

const milhasController = require('../controllers/milhas.controller');
const { verificarToken } = require('../middleware/auth.middleware');
const { checkValidation } = require('../middleware/validation.middleware');

const carteiraValidation = [
  body('name', 'O nome da carteira é obrigatório').isString().trim().notEmpty(),
  body('balance', 'Saldo deve ser um número inteiro').isInt(),
  body('avgCpm', 'CPM médio deve ser um número').isFloat(),
  body('expiration', 'Data de expiração deve ser uma data válida')
    .optional({ nullable: true })
    .isISO8601(),
  body('type', 'Tipo é obrigatório').isString().trim().notEmpty(),
];
const metaMilhasValidation = [
  body('nomeDestino', 'Nome do destino é obrigatório').isString().trim().notEmpty(),
  body('origem', 'Sigla da origem é obrigatória').isString().trim().isLength({ min: 3, max: 3 }),
  body('destino', 'Sigla do destino é obrigatória').isString().trim().isLength({ min: 3, max: 3 }),
  body('programSuggestions', 'Sugestões de programa deve ser um array').isArray({ min: 1 }),
  body('flightCostBRL', 'Custo em Reais deve ser um número').isFloat(),
  body('estimatedMiles', 'Milhas estimadas deve ser um número inteiro').isInt(),
];
const idParamValidation = [param('id', 'O ID na URL é inválido').isInt()];

// Protege todas as rotas de milhas
router.use(verificarToken);

// --- Rotas para Carteiras de Milhas ---
router.get('/milhas/carteiras', milhasController.getCarteiras);
router.post(
  '/milhas/carteiras',
  carteiraValidation,
  checkValidation,
  milhasController.createCarteira
);
router.put(
  '/milhas/carteiras/:id',
  idParamValidation,
  carteiraValidation,
  checkValidation,
  milhasController.updateCarteira
);
router.delete(
  '/milhas/carteiras/:id',
  idParamValidation,
  checkValidation,
  milhasController.deleteCarteira
);

// --- Rotas para Metas de Milhas ---
router.get('/milhas/metas', milhasController.getMetas);
router.post('/milhas/metas', metaMilhasValidation, checkValidation, milhasController.createMeta);
router.put(
  '/milhas/metas/:id',
  idParamValidation,
  metaMilhasValidation,
  checkValidation,
  milhasController.updateMeta
);
router.delete('/milhas/metas/:id', idParamValidation, checkValidation, milhasController.deleteMeta);

module.exports = router;
