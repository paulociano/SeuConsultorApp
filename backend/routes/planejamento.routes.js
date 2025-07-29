const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

const planejamentoController = require('../controllers/planejamento.controller');
const { verificarToken } = require('../middleware/auth.middleware');
const { checkValidation } = require('../middleware/validation.middleware');

const jsonDataValidation = [
    body().isObject().withMessage('O corpo da requisição deve ser um objeto JSON válido.')
];
const jsonArrayValidation = [
    body().isArray().withMessage('O corpo da requisição deve ser um array JSON válido.')
];
const tipoAquisicaoValidation = [
    param('tipo').isIn(['imoveis', 'automoveis']).withMessage('Tipo de aquisição inválido.')
];

// Protege todas as rotas de planejamento
router.use(verificarToken);

// --- Rotas de Aposentadoria ---
router.get('/aposentadoria', planejamentoController.getAposentadoria);
router.post('/aposentadoria', jsonDataValidation, checkValidation, planejamentoController.saveAposentadoria);

// --- Rotas do Simulador PGBL ---
router.get('/simulador-pgbl', planejamentoController.getSimuladorPgbl);
router.post('/simulador-pgbl', jsonDataValidation, checkValidation, planejamentoController.saveSimuladorPgbl);

// --- Rotas de Aquisições ---
router.get('/aquisicoes/:tipo', tipoAquisicaoValidation, checkValidation, planejamentoController.getAquisicoes);
router.post('/aquisicoes/:tipo', tipoAquisicaoValidation, jsonArrayValidation, checkValidation, planejamentoController.saveAquisicoes);

module.exports = router;