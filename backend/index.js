// 1. Importar os pacotes que instalamos
const express = require('express');
const cors = require('cors');

// 2. Iniciar o aplicativo Express
const app = express();

// 3. Configurar os "middlewares" (ferramentas) que o app vai usar
app.use(cors()); // Habilita o CORS para todas as rotas
app.use(express.json()); // Permite que o servidor entenda requisições com corpo em JSON

// 4. Criar uma rota de teste
app.get('/', (req, res) => {
  res.send('A cozinha (backend) está funcionando!');
});

// 5. Definir a porta e iniciar o servidor
const PORT = 3001; // Usamos uma porta diferente da que o React usará (3000)
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
