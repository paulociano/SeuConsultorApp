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

// --- ROTAS PARA APOSENTADORIA ---
app.get('/api/aposentadoria', verificarToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT dados FROM aposentadoria_dados WHERE user_id = $1', [req.usuario.id]);
        if (result.rows.length === 0) {
            // Se não houver dados, retorna nulo para o frontend saber que precisa criar
            return res.json(null);
        }
        res.json(result.rows[0].dados);
    } catch (error) {
        console.error("Erro ao buscar dados de aposentadoria:", error);
        res.status(500).json({ message: 'Erro ao buscar dados de aposentadoria.' });
    }
});

app.post('/api/aposentadoria', verificarToken, async (req, res) => {
    const dados = req.body;
    const userId = req.usuario.id;

    const sql = `
        INSERT INTO aposentadoria_dados (user_id, dados, atualizado_em)
        VALUES ($1, $2, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            dados = EXCLUDED.dados,
            atualizado_em = CURRENT_TIMESTAMP
        RETURNING dados;
    `;

    try {
        const result = await pool.query(sql, [userId, dados]);
        res.status(200).json(result.rows[0].dados);
    } catch (error) {
        console.error("Erro ao salvar dados de aposentadoria:", error);
        res.status(500).json({ message: 'Erro ao salvar dados de aposentadoria.' });
    }
});

// --- ROTAS PARA SIMULADOR PGBL ---
app.get('/api/simulador-pgbl', verificarToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT dados FROM simulador_pgbl_dados WHERE user_id = $1', [req.usuario.id]);
        if (result.rows.length === 0) {
            // Se não houver dados, retorna nulo para o frontend saber que precisa criar
            return res.json(null);
        }
        res.json(result.rows[0].dados);
    } catch (error) {
        console.error("Erro ao buscar dados do simulador PGBL:", error);
        res.status(500).json({ message: 'Erro ao buscar dados do simulador PGBL.' });
    }
});

app.post('/api/simulador-pgbl', verificarToken, async (req, res) => {
    const dados = req.body;
    const userId = req.usuario.id;

    // Query "Upsert": Insere se não existir, ou atualiza se já existir para o user_id
    const sql = `
        INSERT INTO simulador_pgbl_dados (user_id, dados, atualizado_em)
        VALUES ($1, $2, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id) 
        DO UPDATE SET 
            dados = EXCLUDED.dados,
            atualizado_em = CURRENT_TIMESTAMP
        RETURNING dados;
    `;

    try {
        const result = await pool.query(sql, [userId, dados]);
        res.status(200).json(result.rows[0].dados);
    } catch (error) {
        console.error("Erro ao salvar dados do simulador PGBL:", error);
        res.status(500).json({ message: 'Erro ao salvar dados do simulador PGBL.' });
    }
});

// --- ROTAS PARA AQUISIÇÃO DE BENS ---
app.get('/api/aquisicoes/:tipo', verificarToken, async (req, res) => {
    const { tipo } = req.params;
    if (tipo !== 'imoveis' && tipo !== 'automoveis') {
        return res.status(400).json({ message: 'Tipo de bem inválido.' });
    }
    try {
        const result = await pool.query('SELECT simulacoes FROM aquisicao_simulacoes WHERE user_id = $1 AND tipo_bem = $2', [req.usuario.id, tipo]);
        if (result.rows.length === 0) {
            // Se não houver dados, retorna um array vazio
            return res.json([]);
        }
        // Retorna o array de simulações que está no campo JSONB
        res.json(result.rows[0].simulacoes);
    } catch (error) {
        console.error(`Erro ao buscar dados de aquisição (${tipo}):`, error);
        res.status(500).json({ message: `Erro ao buscar dados de aquisição (${tipo}).` });
    }
});

app.post('/api/aquisicoes/:tipo', verificarToken, async (req, res) => {
    const { tipo } = req.params;
    const simulacoes = req.body; // Espera-se um array de simulações
    const userId = req.usuario.id;

    if (tipo !== 'imoveis' && tipo !== 'automoveis') {
        return res.status(400).json({ message: 'Tipo de bem inválido.' });
    }

    const sql = `
        INSERT INTO aquisicao_simulacoes (user_id, tipo_bem, simulacoes, atualizado_em)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id, tipo_bem) 
        DO UPDATE SET 
            simulacoes = EXCLUDED.simulacoes,
            atualizado_em = CURRENT_TIMESTAMP
        RETURNING simulacoes;
    `;

    try {
        const result = await pool.query(sql, [userId, tipo, JSON.stringify(simulacoes)]);
        res.status(200).json(result.rows[0].simulacoes);
    } catch (error) {
        console.error(`Erro ao salvar dados de aquisição (${tipo}):`, error);
        res.status(500).json({ message: `Erro ao salvar dados de aquisição (${tipo}).` });
    }
});

// --- ROTAS PARA MILHAS ---

// Função auxiliar para mapear nomes de colunas para nomes de propriedades do frontend
const mapCarteiraToFrontend = (dbRow) => ({
    id: dbRow.id,
    name: dbRow.nome,
    balance: parseInt(dbRow.saldo, 10),
    avgCpm: parseFloat(dbRow.cpm_medio),
    expiration: dbRow.data_expiracao,
    type: dbRow.tipo,
});

const mapMetaToFrontend = (dbRow) => ({
    id: dbRow.id,
    nomeDestino: dbRow.nome_destino,
    origem: dbRow.origem_sigla,
    destino: dbRow.destino_sigla,
    programSuggestions: [dbRow.programa_alvo],
    flightCostBRL: parseFloat(dbRow.custo_reais),
    estimatedMiles: parseInt(dbRow.custo_milhas, 10),
});

// CARTEIRAS (WALLETS)
app.get('/api/milhas/carteiras', verificarToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM milhas_carteiras WHERE user_id = $1 ORDER BY tipo, nome', [req.usuario.id]);
        res.json(result.rows.map(mapCarteiraToFrontend));
    } catch (e) { res.status(500).json({ message: 'Erro ao buscar carteiras.' }); }
});

app.post('/api/milhas/carteiras', verificarToken, async (req, res) => {
    const { name, balance, avgCpm, expiration, type } = req.body;
    const sql = 'INSERT INTO milhas_carteiras (user_id, nome, saldo, cpm_medio, data_expiracao, tipo) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
    try {
        const result = await pool.query(sql, [req.usuario.id, name, balance, avgCpm, expiration, type]);
        res.status(201).json(mapCarteiraToFrontend(result.rows[0]));
    } catch (e) { res.status(500).json({ message: 'Erro ao salvar carteira.' }); }
});

app.put('/api/milhas/carteiras/:id', verificarToken, async (req, res) => {
    const { name, balance, avgCpm, expiration, type } = req.body;
    const sql = 'UPDATE milhas_carteiras SET nome=$1, saldo=$2, cpm_medio=$3, data_expiracao=$4, tipo=$5, atualizado_em=NOW() WHERE id=$6 AND user_id=$7 RETURNING *';
    try {
        const result = await pool.query(sql, [name, balance, avgCpm, expiration, type, req.params.id, req.usuario.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Carteira não encontrada.' });
        res.json(mapCarteiraToFrontend(result.rows[0]));
    } catch (e) { res.status(500).json({ message: 'Erro ao atualizar carteira.' }); }
});

app.delete('/api/milhas/carteiras/:id', verificarToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM milhas_carteiras WHERE id=$1 AND user_id=$2', [req.params.id, req.usuario.id]);
        res.status(204).send();
    } catch (e) { res.status(500).json({ message: 'Erro ao deletar carteira.' }); }
});


// METAS (TRIP GOALS)
app.get('/api/milhas/metas', verificarToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM milhas_metas WHERE user_id = $1 ORDER BY criado_em DESC', [req.usuario.id]);
        res.json(result.rows.map(mapMetaToFrontend));
    } catch (e) { res.status(500).json({ message: 'Erro ao buscar metas.' }); }
});

app.post('/api/milhas/metas', verificarToken, async (req, res) => {
    const { nomeDestino, origem, destino, programSuggestions, flightCostBRL, estimatedMiles } = req.body;
    const sql = 'INSERT INTO milhas_metas (user_id, nome_destino, origem_sigla, destino_sigla, programa_alvo, custo_reais, custo_milhas) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *';
    try {
        const result = await pool.query(sql, [req.usuario.id, nomeDestino, origem, destino, programSuggestions[0], flightCostBRL, estimatedMiles]);
        res.status(201).json(mapMetaToFrontend(result.rows[0]));
    } catch (e) { console.error(e); res.status(500).json({ message: 'Erro ao salvar meta.' }); }
});

app.put('/api/milhas/metas/:id', verificarToken, async (req, res) => {
    const { nomeDestino, origem, destino, programSuggestions, flightCostBRL, estimatedMiles } = req.body;
    const sql = 'UPDATE milhas_metas SET nome_destino=$1, origem_sigla=$2, destino_sigla=$3, programa_alvo=$4, custo_reais=$5, custo_milhas=$6, atualizado_em=NOW() WHERE id=$7 AND user_id=$8 RETURNING *';
    try {
        const result = await pool.query(sql, [nomeDestino, origem, destino, programSuggestions[0], flightCostBRL, estimatedMiles, req.params.id, req.usuario.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Meta não encontrada.' });
        res.json(mapMetaToFrontend(result.rows[0]));
    } catch (e) { res.status(500).json({ message: 'Erro ao atualizar meta.' }); }
});

app.delete('/api/milhas/metas/:id', verificarToken, async (req, res) => {
    try {
        await pool.query('DELETE FROM milhas_metas WHERE id=$1 AND user_id=$2', [req.params.id, req.usuario.id]);
        res.status(204).send();
    } catch (e) { res.status(500).json({ message: 'Erro ao deletar meta.' }); }
});

// --- ROTAS PARA REUNIÕES E AGENDA ---

// --- ATAS DE REUNIÃO (CRUD) ---
app.get('/api/atas', verificarToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM reunioes_atas WHERE user_id = $1 ORDER BY data_criacao DESC', [req.usuario.id]);
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar atas:", error);
        res.status(500).json({ message: 'Erro ao buscar atas.' });
    }
});

app.post('/api/atas', verificarToken, async (req, res) => {
    try {
        const { titulo, resumo, participantesPresentes, deliberacoes, categoriaFinanceira, tipoDecisaoFinanceira, valorEnvolvido, impactoEsperado, actionItems } = req.body;
        const sql = `
            INSERT INTO reunioes_atas (user_id, titulo, resumo, participantes_presentes, deliberacoes, categoria_financeira, tipo_decisao_financeira, valor_envolvido, impacto_esperado, action_items)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *;
        `;
        const values = [req.usuario.id, titulo, resumo, participantesPresentes, deliberacoes, categoriaFinanceira, tipoDecisaoFinanceira, valorEnvolvido || null, impactoEsperado, JSON.stringify(actionItems || [])];
        const result = await pool.query(sql, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao criar ata:", error);
        res.status(500).json({ message: 'Erro ao criar ata.' });
    }
});

app.put('/api/atas/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, resumo, participantesPresentes, deliberacoes, categoriaFinanceira, tipoDecisaoFinanceira, valorEnvolvido, impactoEsperado, actionItems } = req.body;
        const sql = `
            UPDATE reunioes_atas SET titulo = $1, resumo = $2, participantes_presentes = $3, deliberacoes = $4, categoria_financeira = $5, tipo_decisao_financeira = $6, valor_envolvido = $7, impacto_esperado = $8, action_items = $9
            WHERE id = $10 AND user_id = $11 RETURNING *;
        `;
        const values = [titulo, resumo, participantesPresentes, deliberacoes, categoriaFinanceira, tipoDecisaoFinanceira, valorEnvolvido || null, impactoEsperado, JSON.stringify(actionItems || []), id, req.usuario.id];
        const result = await pool.query(sql, values);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Ata não encontrada.' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao atualizar ata:", error);
        res.status(500).json({ message: 'Erro ao atualizar ata.' });
    }
});

app.delete('/api/atas/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM reunioes_atas WHERE id = $1 AND user_id = $2', [id, req.usuario.id]);
        if (result.rowCount === 0) return res.status(404).json({ message: 'Ata não encontrada.' });
        res.status(204).send();
    } catch (error) {
        console.error("Erro ao deletar ata:", error);
        res.status(500).json({ message: 'Erro ao deletar ata.' });
    }
});


// --- COMPROMISSOS DA AGENDA (CRUD) ---
app.get('/api/agenda', verificarToken, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM agenda_compromissos WHERE user_id = $1 ORDER BY data ASC', [req.usuario.id]);
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar compromissos:", error);
        res.status(500).json({ message: 'Erro ao buscar compromissos.' });
    }
});

app.post('/api/agenda', verificarToken, async (req, res) => {
    try {
        const { titulo, data, local, participantes, linkReuniao, descricaoDetalhada, status } = req.body;
        const sql = `
            INSERT INTO agenda_compromissos (user_id, titulo, data, local, participantes, link_reuniao, descricao_detalhada, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;
        `;
        const values = [req.usuario.id, titulo, data, local, participantes, linkReuniao, descricaoDetalhada, status];
        const result = await pool.query(sql, values);
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao criar compromisso:", error);
        res.status(500).json({ message: 'Erro ao criar compromisso.' });
    }
});

app.put('/api/agenda/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { titulo, data, local, participantes, linkReuniao, descricaoDetalhada, status } = req.body;
        const sql = `
            UPDATE agenda_compromissos SET titulo = $1, data = $2, local = $3, participantes = $4, link_reuniao = $5, descricao_detalhada = $6, status = $7
            WHERE id = $8 AND user_id = $9 RETURNING *;
        `;
        const values = [titulo, data, local, participantes, linkReuniao, descricaoDetalhada, status, id, req.usuario.id];
        const result = await pool.query(sql, values);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Compromisso não encontrado.' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error("Erro ao atualizar compromisso:", error);
        res.status(500).json({ message: 'Erro ao atualizar compromisso.' });
    }
});

app.delete('/api/agenda/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM agenda_compromissos WHERE id = $1 AND user_id = $2', [id, req.usuario.id]);
        if (result.rowCount === 0) return res.status(404).json({ message: 'Compromisso não encontrado.' });
        res.status(204).send();
    } catch (error) {
        console.error("Erro ao deletar compromisso:", error);
        res.status(500).json({ message: 'Erro ao deletar compromisso.' });
    }
});

// --- ROTAS PARA OBJETIVOS (CRUD) ---

// GET /api/objetivos - Buscar todos os objetivos do usuário
app.get('/api/objetivos', verificarToken, async (req, res) => {
    try {
        const userId = req.usuario.id;
        const query = `
            SELECT 
                o.id,
                o.user_id,
                o.nome,
                o.icon,
                o.valor_alvo,
                o.aporte_mensal,
                o.investimentos_linkados,
                o.criado_em,
                COALESCE(SUM(a.valor), 0) as "valorAtual"
            FROM 
                objetivos o
            LEFT JOIN 
                ativos a ON a.id = ANY(o.investimentos_linkados) AND a.user_id = o.user_id
            WHERE 
                o.user_id = $1
            GROUP BY
                o.id
            ORDER BY
                o.criado_em ASC;
        `;
        const result = await pool.query(query, [userId]);
        res.json(result.rows);
    } catch (error) {
        console.error("Erro ao buscar objetivos:", error);
        res.status(500).json({ message: 'Erro ao buscar objetivos.' });
    }
});

// POST /api/objetivos - Criar um novo objetivo
app.post('/api/objetivos', verificarToken, async (req, res) => {
    try {
        const { nome, icon, valorAlvo, aporteMensal, investimentosLinkados } = req.body;
        const userId = req.usuario.id;

        // VALIDAÇÃO: Garante que os IDs dos investimentos são números inteiros.
        const sanitizedLinks = (investimentosLinkados || []).map(id => parseInt(id, 10)).filter(id => !isNaN(id));

        const sql = `
            INSERT INTO objetivos (user_id, nome, icon, valor_alvo, aporte_mensal, investimentos_linkados)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;
        const result = await pool.query(sql, [userId, nome, icon, valorAlvo, aporteMensal || 0, sanitizedLinks]);
        
        const novoObjetivo = result.rows[0];
        const valorAtualResult = await pool.query('SELECT COALESCE(SUM(valor), 0) as "valorAtual" FROM ativos WHERE id = ANY($1) AND user_id = $2', [novoObjetivo.investimentos_linkados, userId]);
        novoObjetivo.valorAtual = valorAtualResult.rows[0].valorAtual;
        
        res.status(201).json(novoObjetivo);
    } catch (error) {
        console.error("Erro ao criar objetivo:", error);
        res.status(500).json({ message: 'Erro ao criar objetivo.' });
    }
});

// PUT /api/objetivos/:id - Atualizar um objetivo existente
app.put('/api/objetivos/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const { nome, icon, valorAlvo, aporteMensal, investimentosLinkados } = req.body;
        const userId = req.usuario.id;

        // VALIDAÇÃO: Garante que os IDs dos investimentos são números inteiros.
        const sanitizedLinks = (investimentosLinkados || []).map(id => parseInt(id, 10)).filter(id => !isNaN(id));

        const sql = `
            UPDATE objetivos 
            SET nome = $1, icon = $2, valor_alvo = $3, aporte_mensal = $4, investimentos_linkados = $5, atualizado_em = CURRENT_TIMESTAMP
            WHERE id = $6 AND user_id = $7
            RETURNING *;
        `;
        const result = await pool.query(sql, [nome, icon, valorAlvo, aporteMensal || 0, sanitizedLinks, id, userId]);
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Objetivo não encontrado.' });
        }
        const objetivoAtualizado = result.rows[0];
        const valorAtualResult = await pool.query('SELECT COALESCE(SUM(valor), 0) as "valorAtual" FROM ativos WHERE id = ANY($1) AND user_id = $2', [objetivoAtualizado.investimentos_linkados, userId]);
        objetivoAtualizado.valorAtual = valorAtualResult.rows[0].valorAtual;
        
        res.json(objetivoAtualizado);
    } catch (error) {
        console.error("Erro ao atualizar objetivo:", error);
        res.status(500).json({ message: 'Erro ao atualizar objetivo.' });
    }
});

// DELETE /api/objetivos/:id - Deletar um objetivo
app.delete('/api/objetivos/:id', verificarToken, async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.usuario.id;
        const result = await pool.query('DELETE FROM objetivos WHERE id = $1 AND user_id = $2', [id, userId]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Objetivo não encontrado.' });
        }
        res.status(204).send();
    } catch (error) {
        console.error("Erro ao deletar objetivo:", error);
        res.status(500).json({ message: 'Erro ao deletar objetivo.' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});