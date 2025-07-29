const express = require('express');
const router = express.Router();

const perfilController = require('../controllers/perfil.controller');
const { verificarToken } = require('../middleware/auth.middleware');

// A rota de perfil é protegida, então aplicamos o middleware
router.get('/perfil', verificarToken, perfilController.getPerfil);

module.exports = router;