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

// --- MIDDLEWARE DE VERIFICAÇÃO DE TOKEN ---
const verificarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token == null) {
    return res.status(401).json({ message: 'Token não fornecido.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) {
      return res.status(403).json({ message: 'Token inválido ou expirado.' });
    }
    req.usuario = usuario;
    next();
  });
};

// --- ROTAS PÚBLICAS (AUTENTICAÇÃO) ---

app.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    try {
        const userQuery = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (userQuery.rows.length === 0) return res.status(401).json({ success: false, message: 'Email ou senha inválidos' });
        const usuario = userQuery.rows[0];
        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
        if (!senhaValida) return res.status(401).json({ success: false, message: 'Email ou senha inválidos' });
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
    const { nome, email, senha } = req.body;
    try {
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);
        const sql = 'INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING id, nome, email, imagem_url';
        const values = [nome, email, senhaHash];
        const result = await pool.query(sql, values);
        res.status(201).json({ success: true, usuario: result.rows[0] });
    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor. O email já pode estar em uso.' });
    }
});

// --- ROTAS PROTEGIDAS (DADOS DO USUÁRIO) ---

app.get('/api/perfil', verificarToken, (req, res) => {
  // Esta rota agora só retorna os dados mockados, as transações virão da rota específica.
  res.json({
    usuario: req.usuario,
    patrimonioData: initialPatrimonioData,
    protecao: [
        { id: '1', tipo: 'renda', nome: 'Seguro de Renda', valor: 80000 },
        { id: '2', tipo: 'morte', nome: 'Seguro de Vida', valor: 150000 },
        { id: '3', tipo: 'invalidez', nome: 'Seguro de Invalidez', valor: 60000 },
    ],
    categorias: initialOrcamentoData 
  });
});

// --- NOVO: ROTAS PARA TRANSAÇÕES (CRUD) ---

// ROTA PARA BUSCAR TODAS AS TRANSAÇÕES DO USUÁRIO LOGADO
app.get('/api/transacoes', verificarToken, async (req, res) => {
  try {
    const userId = req.usuario.id; // ID do usuário vem do token verificado
    const result = await pool.query('SELECT * FROM transacoes WHERE user_id = $1 ORDER BY data DESC', [userId]);
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar transações:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});

// ROTA PARA ADICIONAR UMA NOVA TRANSAÇÃO
app.post('/api/transacoes', verificarToken, async (req, res) => {
  try {
    const userId = req.usuario.id;
    const { descricao, valor, data, tipo, categoria, ignorada } = req.body;

    const sql = `
      INSERT INTO transacoes (descricao, valor, data, tipo, categoria, ignorada, user_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *;
    `;
    const values = [descricao, valor, data, tipo, categoria, ignorada || false, userId];
    
    const result = await pool.query(sql, values);
    res.status(201).json(result.rows[0]); // Retorna a transação criada
  } catch (error) {
    console.error('Erro ao adicionar transação:', error);
    res.status(500).json({ message: 'Erro interno do servidor.' });
  }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
