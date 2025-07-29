const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

const objetivosController = require('../controllers/objetivos.controller');
const { verificarToken } = require('../middleware/auth.middleware');
const { checkValidation } = require('../middleware/validation.middleware');

const objetivoValidation = [
    body('nome', 'Nome do objetivo é obrigatório').isString().trim().notEmpty(),
    body('icon', 'Ícone é obrigatório').isString().trim().notEmpty(),
    body('valorAlvo', 'Valor alvo é obrigatório').isFloat({ gt: 0 }),
    body('aporteMensal', 'Aporte mensal deve ser um número').optional().isFloat(),
    body('investimentosLinkados', 'Investimentos lincados deve ser um array de números').optional().isArray(),
    body('investimentosLinkados.*', 'Cada item em investimentosLinkados deve ser um ID numérico').optional().isInt()
];

const idParamValidation = [
    param('id', 'O ID na URL é inválido').isInt()
];

// Todas as rotas aqui são protegidas, então aplicamos o middleware em todas
router.use(verificarToken);

router.get('/objetivos', objetivosController.getObjetivos);
router.post('/objetivos', objetivoValidation, checkValidation, objetivosController.createObjetivo);
router.put('/objetivos/:id', idParamValidation, objetivoValidation, checkValidation, objetivosController.updateObjetivo);
router.delete('/objetivos/:id', idParamValidation, checkValidation, objetivosController.deleteObjetivo);

module.exports = router;