const express = require('express');
const router = express.Router();
// ...
const chatbotController = require('../controllers/chatbot.controller');
router.post('/query', chatbotController.handleQuery);
router.post('/analyze', chatbotController.handleAnalysis); // Nova rota
module.exports = router;

router.post('/query', chatbotController.handleQuery);
// Adicionaremos a rota de análise mais tarde
// router.post('/analyze', chatbotController.handleAnalysis);

module.exports = router;
