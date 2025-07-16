// 1. Importar os pacotes que instalamos
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const OpenAI = require('openai');
dotenv.config();

// 2. Verificar se a chave da API está presente
if (!process.env.OPENAI_API_KEY) {
  console.error('❌ A variável OPENAI_API_KEY não está definida no .env');
  process.exit(1);
}

// 3. Iniciar o aplicativo Express
const app = express();

// 4. Configurar middlewares
app.use(cors()); // Permite chamadas do frontend
app.use(express.json()); // Permite leitura de JSON no body

// 5. Rota simples de teste
app.get('/', (req, res) => {
  res.send('A cozinha (backend) está funcionando!');
});

// 6. Instanciar o cliente OpenAI com a chave
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 7. Rota principal: gerar relatório
app.post('/api/gerar-relatorio', async (req, res) => {
  const { dados } = req.body;

  if (!dados) {
    return res.status(400).json({ error: 'Dados financeiros ausentes.' });
  }

  const prompt = `
Você é um analista financeiro experiente.
Com base nos seguintes dados financeiros, gere um relatório detalhado com:
- Diagnóstico da situação atual
- Pontos fortes
- Pontos de atenção
- Sugestões para melhorar o planejamento financeiro

Dados:
${JSON.stringify(dados, null, 2)}
  `;

  try {
    console.log('🧠 Gerando relatório com os dados recebidos...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });

    const relatorio = completion.choices[0].message.content;
    console.log('✅ Relatório gerado com sucesso!');
    res.json({ relatorio });
  } catch (error) {
    console.error('❌ Erro ao gerar relatório:', error.response?.data || error.message || error);
    res.status(500).json({ error: 'Erro ao gerar relatório. Verifique o backend.' });
  }
});

// 8. Iniciar o servidor na porta 3001
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
});
