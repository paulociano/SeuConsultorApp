const { GoogleGenerativeAI } = require('@google/generative-ai');
const pool = require('../config/db');

// Inicializa o cliente da IA
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

const analyzeUserData = async (userId) => {
  // 1. Buscar dados financeiros relevantes do usuário
  const orcamentoRes = await pool.query('SELECT * FROM orcamento_categorias WHERE user_id = $1', [
    userId,
  ]);
  const transacoesRes = await pool.query(
    "SELECT * FROM transacoes WHERE user_id = $1 AND data > NOW() - INTERVAL '30 days'",
    [userId]
  );

  // 2. Formatar os dados para enviar à IA (simplificado)
  const dadosFormatados = `
        Categorias do Orçamento: ${JSON.stringify(orcamentoRes.rows)}
        Transações dos Últimos 30 Dias: ${JSON.stringify(transacoesRes.rows)}
    `;

  // 3. Criar o prompt para a IA
  const prompt = `
        Você é um assistente financeiro amigável para o app "SeuConsultor". 
        Sua tarefa é analisar os dados financeiros do usuário e fornecer um pequeno conselho ou insight útil e encorajador.
        NUNCA se apresente como um profissional. Use frases como "Notei que..." ou "Uma oportunidade interessante seria...".
        Seja breve (1-2 frases).

        Aqui estão os dados do usuário:
        ${dadosFormatados}

        Por favor, gere um insight com base nesses dados.
    `;

  // 4. Chamar a IA e retornar a resposta
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
};

module.exports = { analyzeUserData };
