// index.js

const { initialOrcamentoData } = require('../frontend/src/components/constants/initialOrcamentoData');
const { initialPatrimonioData } = require('../frontend/src/components/constants/initialPatrimonioData');
const jwt = require('jsonwebtoken');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config();

const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'seuconsultor_db',
  password: 'ph368g571',
  port: 5432,
});

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// --- NOVO: VERIFICADOR DE TOKEN (MIDDLEWARE) ---
// Esta função vai proteger nossas rotas futuras.
const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Formato "Bearer <token>"

  if (token == null) {
    return res.status(401).json({ message: 'Token não fornecido.' }); // 401 Unauthorized
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido ou expirado.' }); // 403 Forbidden
    }
    // Adiciona os dados do usuário (que estavam no payload do token) ao objeto da requisição
    req.usuario = usuario;
    next(); // Passa para a execução da rota
  });
};


// --- ROTAS PÚBLICAS (NÃO PRECISAM DE TOKEN) ---

app.post('/login', async (req, res) => {
    // ... seu código de login que já funciona ...
    const { email, senha } = req.body;
    try {
        const userQuery = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (userQuery.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Email ou senha inválidos' });
        }
        const usuario = userQuery.rows[0];
        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
        if (!senhaValida) {
            return res.status(401).json({ success: false, message: 'Email ou senha inválidos' });
        }
        const payload = { id: usuario.id, nome: usuario.nome, email: usuario.email };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
        res.json({
            success: true,
            token: token,
            usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, imagem_url: usuario.imagem_url }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
});

app.post('/cadastro', async (req, res) => {
    // ... seu código de cadastro que já funciona ...
    const { nome, email, senha } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);
        const sql = 'INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING id, nome, email, imagem_url';
        const values = [nome, email, senhaHash];
        const result = await pool.query(sql, values);
        const novoUsuario = result.rows[0];
        res.status(201).json({ success: true, usuario: novoUsuario });
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor. O email já pode estar em uso.' });
    }
});


// --- ROTAS PROTEGIDAS (PRECISAM DE TOKEN) ---

// NOVO: Esta rota substitui a antiga /dados-usuario
app.get('/api/perfil', verificarToken, (req, res) => {
  // Graças ao middleware `verificarToken`, `req.usuario` contém os dados do usuário do token.
  // No futuro, você usaria o `req.usuario.id` para buscar dados REAIS do banco.
  // Por agora, vamos retornar os dados do usuário do token e alguns dados mockados para o resto do app funcionar.
  console.log('Acessando perfil para o usuário:', req.usuario);

  res.json({
    // Dados reais vindos do token
    usuario: req.usuario,
    
    // Dados mockados para o resto do app (substituir no futuro por queries ao banco)
    transacoes: [], // Começa com transações vazias
    patrimonioData: initialPatrimonioData,
    protecao: [
        { id: '1', tipo: 'renda', nome: 'Seguro de Renda', valor: 80000 },
        { id: '2', tipo: 'morte', nome: 'Seguro de Vida', valor: 150000 },
        { id: '3', tipo: 'invalidez', nome: 'Seguro de Invalidez', valor: 60000 },
    ],
    // As categorias virão dos dados iniciais, mas poderiam ser específicas do usuário
    categorias: initialOrcamentoData 
  });
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});