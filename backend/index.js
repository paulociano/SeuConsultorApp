const { initialOrcamentoData } = require('../frontend/src/components/constants/initialOrcamentoData');
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
  if (token == null) return res.status(401).json({ message: 'Token não fornecido.' });
  jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
    if (err) return res.status(403).json({ message: 'Token inválido ou expirado.' });
    req.usuario = usuario;
    next();
  });
};

// --- FUNÇÃO AUXILIAR PARA CRIAR ORÇAMENTO PADRÃO ---
const criarOrcamentoPadraoParaUsuario = async (userId) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        for (const categoria of initialOrcamentoData) {
            const categoriaResult = await client.query(
                'INSERT INTO orcamento_categorias (nome, tipo, user_id) VALUES ($1, $2, $3) RETURNING id',
                [categoria.nome, categoria.tipo, userId]
            );
            const categoriaId = categoriaResult.rows[0].id;
            for (const item of categoria.subItens) {
                await client.query(
                    'INSERT INTO orcamento_itens (nome, valor_planejado, valor_atual, categoria_id, user_id) VALUES ($1, $2, $3, $4, $5)',
                    [item.nome, item.sugerido, 0, categoriaId, userId]
                );
            }
        }
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        throw error;
    } finally {
        client.release();
    }
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
    let novoUsuario;
    try {
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);
        const sql = 'INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING id, nome, email, imagem_url';
        const values = [nome, email, senhaHash];
        const result = await pool.query(sql, values);
        novoUsuario = result.rows[0];
        await criarOrcamentoPadraoParaUsuario(novoUsuario.id);
        res.status(201).json({ success: true, usuario: novoUsuario });
    } catch (error) {
        console.error('Erro no processo de cadastro:', error);
        if (novoUsuario && novoUsuario.id) {
            await pool.query('DELETE FROM usuarios WHERE id = $1', [novoUsuario.id]);
        }
        res.status(500).json({ success: false, message: 'Erro interno do servidor durante o cadastro.' });
    }
});

// --- ROTAS PROTEGIDAS ---

// ROTA DE PERFIL (AGORA COM DADOS REAIS DE PROTEÇÃO)
app.get('/api/perfil', verificarToken, async (req, res) => {
  try {
    const userId = req.usuario.id;

    // Busca os dados de proteção em paralelo
    const [invalidezRes, despesasRes, patrimonialRes] = await Promise.all([
      pool.query('SELECT * FROM protecao_invalidez WHERE user_id = $1 ORDER BY criado_em DESC', [userId]),
      pool.query('SELECT * FROM protecao_despesas_futuras WHERE user_id = $1 ORDER BY ano_inicio ASC', [userId]),
      pool.query('SELECT * FROM protecao_patrimonial WHERE user_id = $1 ORDER BY data_vencimento ASC', [userId])
    ]);

    // Busca os dados do usuário (se já não estiverem em req.usuario)
    const userQuery = await pool.query('SELECT id, nome, email, imagem_url FROM usuarios WHERE id = $1', [userId]);
    const usuario = userQuery.rows[0];

    res.json({
      usuario: usuario,
      // Os dados de proteção agora vêm do banco
      protecao: {
          invalidez: invalidezRes.rows,
          despesasFuturas: despesasRes.rows,
          patrimonial: patrimonialRes.rows
      }
    });

  } catch (error) {
    console.error("Erro ao buscar dados do perfil:", error);
    res.status(500).json({ message: 'Erro ao buscar dados do perfil.' });
  }
});

// Em index.js

// --- ROTAS PARA PROTEÇÃO (CRUD) ---

// INVALIDEZ
app.post('/api/protecao/invalidez', verificarToken, async (req, res) => {
    const { nome, cobertura, observacoes } = req.body;
    const sql = 'INSERT INTO protecao_invalidez (user_id, nome, cobertura, observacoes) VALUES ($1, $2, $3, $4) RETURNING *';
    try {
        const result = await pool.query(sql, [req.usuario.id, nome, cobertura, observacoes]);
        res.status(201).json(result.rows[0]);
    } catch (e) { res.status(500).json({ message: 'Erro ao salvar item.' }); }
});
app.put('/api/protecao/invalidez/:id', verificarToken, async (req, res) => {
    const { nome, cobertura, observacoes } = req.body;
    const sql = 'UPDATE protecao_invalidez SET nome = $1, cobertura = $2, observacoes = $3 WHERE id = $4 AND user_id = $5 RETURNING *';
    try {
        const result = await pool.query(sql, [nome, cobertura, observacoes, req.params.id, req.usuario.id]);
        res.json(result.rows[0]);
    } catch (e) { res.status(500).json({ message: 'Erro ao atualizar item.' }); }
});
app.delete('/api/protecao/invalidez/:id', verificarToken, async (req, res) => {
    const sql = 'DELETE FROM protecao_invalidez WHERE id = $1 AND user_id = $2';
    try {
        await pool.query(sql, [req.params.id, req.usuario.id]);
        res.status(204).send();
    } catch (e) { res.status(500).json({ message: 'Erro ao deletar item.' }); }
});

// DESPESAS FUTURAS
app.post('/api/protecao/despesas', verificarToken, async (req, res) => {
    const { nome, ano_inicio, valor_mensal, prazo_meses } = req.body;
    const sql = 'INSERT INTO protecao_despesas_futuras (user_id, nome, ano_inicio, valor_mensal, prazo_meses) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    try {
        const result = await pool.query(sql, [req.usuario.id, nome, ano_inicio, valor_mensal, prazo_meses]);
        res.status(201).json(result.rows[0]);
    } catch (e) { res.status(500).json({ message: 'Erro ao salvar despesa.' }); }
});
app.put('/api/protecao/despesas/:id', verificarToken, async (req, res) => {
    const { nome, ano_inicio, valor_mensal, prazo_meses } = req.body;
    const sql = 'UPDATE protecao_despesas_futuras SET nome = $1, ano_inicio = $2, valor_mensal = $3, prazo_meses = $4 WHERE id = $5 AND user_id = $6 RETURNING *';
    try {
        const result = await pool.query(sql, [nome, ano_inicio, valor_mensal, prazo_meses, req.params.id, req.usuario.id]);
        res.json(result.rows[0]);
    } catch (e) { res.status(500).json({ message: 'Erro ao atualizar despesa.' }); }
});
app.delete('/api/protecao/despesas/:id', verificarToken, async (req, res) => {
    const sql = 'DELETE FROM protecao_despesas_futuras WHERE id = $1 AND user_id = $2';
    try {
        await pool.query(sql, [req.params.id, req.usuario.id]);
        res.status(204).send();
    } catch (e) { res.status(500).json({ message: 'Erro ao deletar despesa.' }); }
});

// PATRIMONIAL
app.post('/api/protecao/patrimonial', verificarToken, async (req, res) => {
    const { nome, empresa, data_vencimento, valor } = req.body;
    const sql = 'INSERT INTO protecao_patrimonial (user_id, nome, empresa, data_vencimento, valor) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    try {
        const result = await pool.query(sql, [req.usuario.id, nome, empresa, data_vencimento, valor]);
        res.status(201).json(result.rows[0]);
    } catch (e) { res.status(500).json({ message: 'Erro ao salvar seguro.' }); }
});
app.put('/api/protecao/patrimonial/:id', verificarToken, async (req, res) => {
    const { nome, empresa, data_vencimento, valor } = req.body;
    const sql = 'UPDATE protecao_patrimonial SET nome = $1, empresa = $2, data_vencimento = $3, valor = $4 WHERE id = $5 AND user_id = $6 RETURNING *';
    try {
        const result = await pool.query(sql, [nome, empresa, data_vencimento, valor, req.params.id, req.usuario.id]);
        res.json(result.rows[0]);
    } catch (e) { res.status(500).json({ message: 'Erro ao atualizar seguro.' }); }
});
app.delete('/api/protecao/patrimonial/:id', verificarToken, async (req, res) => {
    const sql = 'DELETE FROM protecao_patrimonial WHERE id = $1 AND user_id = $2';
    try {
        await pool.query(sql, [req.params.id, req.usuario.id]);
        res.status(204).send();
    } catch (e) { res.status(500).json({ message: 'Erro ao deletar seguro.' }); }
});

// ROTAS DE TRANSAÇÕES (CRUD)
app.get('/api/transacoes', verificarToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM transacoes WHERE user_id = $1 ORDER BY data DESC', [req.usuario.id]);
    res.json(result.rows);
  } catch (error) { res.status(500).json({ message: 'Erro ao buscar transações.' }); }
});
app.post('/api/transacoes', verificarToken, async (req, res) => {
  try {
    const { descricao, valor, data, tipo, categoria, ignorada } = req.body;
    const sql = `INSERT INTO transacoes (descricao, valor, data, tipo, categoria, ignorada, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`;
    const values = [descricao, valor, data, tipo, categoria, ignorada || false, req.usuario.id];
    const result = await pool.query(sql, values);
    res.status(201).json(result.rows[0]);
  } catch (error) { res.status(500).json({ message: 'Erro ao adicionar transação.' }); }
});
app.put('/api/transacoes/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { descricao, valor, data, tipo, categoria, ignorada } = req.body;
    const sql = `UPDATE transacoes SET descricao = $1, valor = $2, data = $3, tipo = $4, categoria = $5, ignorada = $6 WHERE id = $7 AND user_id = $8 RETURNING *;`;
    const values = [descricao, valor, data, tipo, categoria, ignorada, id, req.usuario.id];
    const result = await pool.query(sql, values);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Transação não encontrada.' });
    res.json(result.rows[0]);
  } catch (error) { res.status(500).json({ message: 'Erro ao atualizar transação.' }); }
});
app.delete('/api/transacoes/:id', verificarToken, async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM transacoes WHERE id = $1 AND user_id = $2', [id, req.usuario.id]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Transação não encontrada.' });
    res.status(204).send(); 
  } catch (error) { res.status(500).json({ message: 'Erro ao apagar transação.' }); }
});

// ROTAS DE PATRIMÔNIO (CRUD)
app.get('/api/ativos', verificarToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ativos WHERE user_id = $1', [req.usuario.id]);
    res.json(result.rows);
  } catch (error) { res.status(500).json({ message: 'Erro ao buscar ativos.' }); }
});
app.post('/api/ativos', verificarToken, async (req, res) => {
  try {
    const { nome, valor, tipo } = req.body;
    const sql = 'INSERT INTO ativos (nome, valor, tipo, user_id) VALUES ($1, $2, $3, $4) RETURNING *';
    const result = await pool.query(sql, [nome, valor, tipo, req.usuario.id]);
    res.status(201).json(result.rows[0]);
  } catch (error) { res.status(500).json({ message: 'Erro ao adicionar ativo.' }); }
});
app.put('/api/ativos/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, valor, tipo } = req.body;
        const sql = 'UPDATE ativos SET nome = $1, valor = $2, tipo = $3 WHERE id = $4 AND user_id = $5 RETURNING *';
        const result = await pool.query(sql, [nome, valor, tipo, id, req.usuario.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Ativo não encontrado.' });
        res.json(result.rows[0]);
    } catch (error) { res.status(500).json({ message: 'Erro ao atualizar ativo.' }); }
});
app.delete('/api/ativos/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM ativos WHERE id = $1 AND user_id = $2', [id, req.usuario.id]);
        if (result.rowCount === 0) return res.status(404).json({ message: 'Ativo não encontrado.' });
        res.status(204).send();
    } catch (error) { res.status(500).json({ message: 'Erro ao apagar ativo.' }); }
});
app.get('/api/dividas', verificarToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM dividas WHERE user_id = $1', [req.usuario.id]);
    res.json(result.rows);
  } catch (error) { res.status(500).json({ message: 'Erro ao buscar dívidas.' }); }
});
app.post('/api/dividas', verificarToken, async (req, res) => {
  try {
    const { nome, valor, tipo } = req.body;
    const sql = 'INSERT INTO dividas (nome, valor, tipo, user_id) VALUES ($1, $2, $3, $4) RETURNING *';
    const result = await pool.query(sql, [nome, valor, tipo, req.usuario.id]);
    res.status(201).json(result.rows[0]);
  } catch (error) { res.status(500).json({ message: 'Erro ao adicionar dívida.' }); }
});
app.put('/api/dividas/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, valor, tipo } = req.body;
        const sql = 'UPDATE dividas SET nome = $1, valor = $2, tipo = $3 WHERE id = $4 AND user_id = $5 RETURNING *';
        const result = await pool.query(sql, [nome, valor, tipo, id, req.usuario.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Dívida não encontrada.' });
        res.json(result.rows[0]);
    } catch (error) { res.status(500).json({ message: 'Erro ao atualizar dívida.' }); }
});
app.delete('/api/dividas/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM dividas WHERE id = $1 AND user_id = $2', [id, req.usuario.id]);
        if (result.rowCount === 0) return res.status(404).json({ message: 'Dívida não encontrada.' });
        res.status(204).send();
    } catch (error) { res.status(500).json({ message: 'Erro ao apagar dívida.' }); }
});


// --- ROTAS PARA ORÇAMENTO (CRUD COMPLETO) ---
app.get('/api/orcamento', verificarToken, async (req, res) => {
    try {
        const userId = req.usuario.id;
        const categoriasResult = await pool.query('SELECT * FROM orcamento_categorias WHERE user_id = $1 ORDER BY id', [userId]);
        // CORREÇÃO: A query agora busca todos os campos, incluindo o novo `categoria_planejamento`
        const itensResult = await pool.query('SELECT * FROM orcamento_itens WHERE user_id = $1 ORDER BY id', [userId]);
        
        const orcamentoFormatado = categoriasResult.rows.map(cat => ({
            id: cat.id,
            nome: cat.nome,
            tipo: cat.tipo,
            subItens: itensResult.rows
                .filter(item => item.categoria_id === cat.id)
                .map(item => ({
                    id: item.id,
                    nome: item.nome,
                    sugerido: parseFloat(item.valor_planejado),
                    atual: parseFloat(item.valor_atual),
                    // CORREÇÃO: Incluindo o novo campo na resposta
                    categoria_planejamento: item.categoria_planejamento 
                }))
        }));
        res.json(orcamentoFormatado);
    } catch (error) {
        console.error("Erro ao buscar orçamento:", error);
        res.status(500).json({ message: 'Erro ao buscar dados do orçamento.' });
    }
});

// Rota para criar novo item (agora com categoria)
app.post('/api/orcamento/itens', verificarToken, async (req, res) => {
    try {
        // CORREÇÃO: Recebe também `categoria_planejamento`
        const { nome, valor_planejado, categoria_id, categoria_planejamento } = req.body;
        const userId = req.usuario.id;
        const sql = `INSERT INTO orcamento_itens (nome, valor_planejado, valor_atual, categoria_id, user_id, categoria_planejamento) VALUES ($1, $2, 0, $3, $4, $5) RETURNING *`;
        const result = await pool.query(sql, [nome, valor_planejado || 0, categoria_id, userId, categoria_planejamento]);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao adicionar item de orçamento:", error);
        res.status(500).json({ message: 'Erro ao adicionar item de orçamento.' });
    }
});

// Rota para ATUALIZAR um item existente (nome, valores e categoria)
app.put('/api/orcamento/itens/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        // CORREÇÃO: Recebe todos os campos que podem ser atualizados
        const { nome, valor_planejado, valor_atual, categoria_planejamento } = req.body;
        const userId = req.usuario.id;
        
        // CORREÇÃO: Query atualiza todos os campos necessários
        const sql = `
            UPDATE orcamento_itens 
            SET nome = $1, valor_planejado = $2, valor_atual = $3, categoria_planejamento = $4 
            WHERE id = $5 AND user_id = $6 
            RETURNING *
        `;
        const result = await pool.query(sql, [nome, valor_planejado, valor_atual, categoria_planejamento, id, userId]);
        
        if (result.rows.length === 0) return res.status(404).json({ message: 'Item do orçamento não encontrado.' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao atualizar item de orçamento:", error);
        res.status(500).json({ message: 'Erro ao atualizar item do orçamento.' });
    }
});

// Rota para apagar um item (não precisa de alteração)
app.delete('/api/orcamento/itens/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.usuario.id;
        const sql = 'DELETE FROM orcamento_itens WHERE id = $1 AND user_id = $2';
        const result = await pool.query(sql, [id, userId]);
        if (result.rowCount === 0) return res.status(404).json({ message: 'Item do orçamento não encontrado.' });
        res.status(204).send();
    } catch (error) {
        console.error("Erro ao apagar item de orçamento:", error);
        res.status(500).json({ message: 'Erro ao apagar item de orçamento.' });
    }
});


const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});