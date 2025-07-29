const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

// Carregadores de Módulos
const pool = require('./config/db'); // Embora não usado aqui, é bom para confirmar que a conexão está ok.
const authRoutes = require('./routes/auth.routes');
const objetivosRoutes = require('./routes/objetivos.routes');
const patrimonioRoutes = require('./routes/patrimonio.routes');
const transacoesRoutes = require('./routes/transacoes.routes');
const orcamentoRoutes = require('./routes/orcamento.routes');
const protecaoRoutes = require('./routes/protecao.routes');
const perfilRoutes = require('./routes/perfil.routes');
const planejamentoRoutes = require('./routes/planejamento.routes');
const milhasRoutes = require('./routes/milhas.routes');
const agendaRoutes = require('./routes/agenda.routes');

const app = express();

// Middlewares Globais
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Orquestração de Rotas
app.use('/', authRoutes); // Rotas públicas como /login, /cadastro
app.use('/api', 
    objetivosRoutes, 
    patrimonioRoutes, 
    transacoesRoutes, 
    orcamentoRoutes, 
    protecaoRoutes, 
    perfilRoutes, 
    planejamentoRoutes, 
    milhasRoutes, 
    agendaRoutes
);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});