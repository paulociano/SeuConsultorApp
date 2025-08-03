const aiService = require('../services/ai.service');

/**
 * Manipula perguntas simples do usuário com base em palavras-chave.
 * @param {object} req - Objeto de requisição do Express.
 * @param {object} res - Objeto de resposta do Express.
 * @param {function} next - Próximo middleware.
 */
const handleQuery = (req, res, next) => {
  try {
    const { message } = req.body;
    let reply =
      "Desculpe, não entendi sua pergunta. Tente perguntar sobre 'orçamento', 'objetivos' ou peça uma 'análise' dos seus dados.";

    // Lógica simples para responder a perguntas frequentes
    if (message.includes('objetivo')) {
      reply =
        "Para criar um novo objetivo, vá para a tela 'Objetivos' e clique no botão '+' no canto inferior direito.";
    } else if (message.includes('orçamento')) {
      reply =
        "Na tela 'Orçamento', você pode expandir uma categoria e clicar em 'Adicionar item' para detalhar seus gastos e receitas.";
    } else if (message.includes('transação')) {
      reply =
        "Você pode adicionar uma nova transação (receita ou despesa) na tela 'Fluxo de Caixa', clicando em 'Adicionar Transação'.";
    }

    res.json({ reply });
  } catch (error) {
    next(error);
  }
};

/**
 * Aciona o serviço de IA para analisar os dados financeiros do usuário e gerar um insight.
 * @param {object} req - Objeto de requisição do Express.
 * @param {object} res - Objeto de resposta do Express.
 * @param {function} next - Próximo middleware.
 */
const handleAnalysis = async (req, res, next) => {
  try {
    const userId = req.usuario.id;
    const insight = await aiService.analyzeUserData(userId);
    res.json({ reply: insight });
  } catch (error) {
    // Passa o erro para o middleware central de tratamento de erros
    next(error);
  }
};

module.exports = {
  handleQuery,
  handleAnalysis,
};
