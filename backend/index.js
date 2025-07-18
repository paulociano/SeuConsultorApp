// 1. Importar os pacotes que instalamos
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

// 3. Iniciar o aplicativo Express
const app = express();

// 4. Configurar middlewares
app.use(cors()); // Permite chamadas do frontend
app.use(express.json()); // Permite leitura de JSON no body

// 5. Rota simples de teste
app.get('/', (req, res) => {
  res.send('A cozinha (backend) está funcionando!');
});

// 8. Iniciar o servidor na porta 3001
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Backend rodando em http://localhost:${PORT}`);
});
