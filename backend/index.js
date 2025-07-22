const { initialOrcamentoData } = require('../frontend/src/components/constants/initialOrcamentoData');
const { initialPatrimonioData } = require('../frontend/src/components/constants/initialPatrimonioData');

// 1. Importar os pacotes que instalamos
const express = require('express');
const cors = require('cors'); // Certifique-se de que está importado
const dotenv = require('dotenv');
dotenv.config();

// 3. Iniciar o aplicativo Express
const app = express();

// NOVO: Adicione o middleware CORS AQUI, ANTES DE DEFINIR SUAS ROTAS
// Isso permitirá que requisições de 'http://localhost:3000' (ou qualquer outra origem) acessem sua API
app.use(cors());

// NOVO: Adicionar middleware para JSON e URL-encoded data (se você ainda não tem)
app.use(express.json()); // Para parsear o corpo das requisições JSON
app.use(express.urlencoded({ extended: true })); // Para parsear dados de formulário URL-encoded

// ROTA DE LOGIN (NOVO)
app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  // --- SIMULAÇÃO ---
  // No futuro, você vai verificar isso em um banco de dados.
  if (email === 'paulo@email.com' && senha === 'senha123') {
    // Login com sucesso!
    res.json({
      success: true,
      usuario: {
        nome: 'Paulo Henrique',
        email: 'paulo@email.com',
        imagem: null // ou a URL da imagem se tiver
      }
    });
  } else {
    // Login falhou
    res.status(401).json({ success: false, message: 'Email ou senha inválidos' });
  }
});

// ROTA PARA BUSCAR OS DADOS DO USUÁRIO APÓS O LOGIN (NOVO)
app.get('/dados-usuario', (req, res) => {
    // --- SIMULAÇÃO ---
    // No futuro, você vai buscar isso do banco de dados para um usuário específico.
    // Por enquanto, vamos mover os dados que estavam no App.js para cá.

    res.json({
        transacoes: [], // Começa com transações vazias
        categorias: initialOrcamentoData, // Use os dados iniciais que você já tem
        patrimonioData: initialPatrimonioData,
        protecao: [
          { id: '1', tipo: 'renda', nome: 'Seguro de Renda', valor: 80000 },
          { id: '2', tipo: 'morte', nome: 'Seguro de Vida', valor: 150000 },
          { id: '3', tipo: 'invalidez', nome: 'Seguro de Invalidez', valor: 60000 },
          // ... outros dados de proteção
        ]
    });
});

// A porta em que o servidor irá escutar
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
