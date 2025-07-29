const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');

const agendaController = require('../controllers/agenda.controller');
const { verificarToken } = require('../middleware/auth.middleware');
const { checkValidation } = require('../middleware/validation.middleware');

const ataValidation = [
    body('titulo', 'Título é obrigatório').isString().trim().notEmpty(),
    body('resumo', 'Resumo é obrigatório').isString().trim().notEmpty(),
    body('participantesPresentes').isArray(),
    body('deliberacoes').isString().trim(),
    body('categoriaFinanceira').isString().trim(),
    body('tipoDecisaoFinanceira').isString().trim(),
    body('valorEnvolvido').optional({ nullable: true }).isFloat(),
    body('impactoEsperado').isString().trim(),
    body('actionItems').optional().isArray()
];
const compromissoValidation = [
    body('titulo', 'Título é obrigatório').isString().trim().notEmpty(),
    body('data', 'Data é obrigatória e deve ser válida').isISO8601(),
    body('local').optional().isString().trim(),
    body('participantes').isArray(),
    body('linkReuniao').optional({ nullable: true }).isURL(),
    body('descricaoDetalhada').optional().isString().trim(),
    body('status').isString().isIn(['Pendente', 'Confirmado', 'Cancelado', 'Realizado'])
];
const idParamValidation = [param('id', 'O ID na URL é inválido').isInt()];

// Protege todas as rotas
router.use(verificarToken);

// --- Rotas para Atas ---
router.get('/atas', agendaController.getAtas);
router.post('/atas', ataValidation, checkValidation, agendaController.createAta);
router.put('/atas/:id', idParamValidation, ataValidation, checkValidation, agendaController.updateAta);
router.delete('/atas/:id', idParamValidation, checkValidation, agendaController.deleteAta);

// --- Rotas para Agenda ---
router.get('/agenda', agendaController.getCompromissos);
router.post('/agenda', compromissoValidation, checkValidation, agendaController.createCompromisso);
router.put('/agenda/:id', idParamValidation, compromissoValidation, checkValidation, agendaController.updateCompromisso);
router.delete('/agenda/:id', idParamValidation, checkValidation, agendaController.deleteCompromisso);

module.exports = router;