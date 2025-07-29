const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

const transacoesController = require('../controllers/transacoes.controller');
const { verificarToken } = require('../middleware/auth.middleware');
const { checkValidation } = require('../middleware/validation.middleware');

const transacaoValidation = [
    body('descricao', 'Descrição é obrigatória').isString().trim().notEmpty(),
    body('valor', 'Valor é obrigatório e deve ser um número').isFloat(),
    body('data', 'Data é obrigatória e deve estar no formato AAAA-MM-DD').isISO8601(),
    body('tipo', 'Tipo é obrigatório (receita ou despesa)').isIn(['receita', 'despesa']),
    body('categoria', 'Categoria é obrigatória').isString().trim().notEmpty(),
    body('ignorada', 'O campo "ignorada" deve ser booleano').optional().isBoolean()
];

const idParamValidation = [
    param('id', 'O ID na URL é inválido').isInt()
];

// Protege todas as rotas de transações com o token de autenticação
router.use(verificarToken);

// Define as rotas para /transacoes
router.get('/transacoes', transacoesController.getTransacoes);
router.post('/transacoes', transacaoValidation, checkValidation, transacoesController.createTransacao);
router.put('/transacoes/:id', idParamValidation, transacaoValidation, checkValidation, transacoesController.updateTransacao);
router.delete('/transacoes/:id', idParamValidation, checkValidation, transacoesController.deleteTransacao);

module.exports = router;