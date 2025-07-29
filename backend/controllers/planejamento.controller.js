const pool = require('../config/db');

// --- Aposentadoria ---
const getAposentadoria = async (req, res) => {
    try {
        const result = await pool.query('SELECT dados FROM aposentadoria_dados WHERE user_id = $1', [req.usuario.id]);
        if (result.rows.length === 0) {
            return res.json(null); // Retorna nulo se não houver dados, como no original
        }
        res.json(result.rows[0].dados);
    } catch (error) {
        console.error("Erro ao buscar dados de aposentadoria:", error);
        res.status(500).json({ message: 'Erro ao buscar dados de aposentadoria.' });
    }
};

const saveAposentadoria = async (req, res) => {
    const dados = req.body;
    const userId = req.usuario.id;
    const sql = `
        INSERT INTO aposentadoria_dados (user_id, dados, atualizado_em)
        VALUES ($1, $2, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id) 
        DO UPDATE SET dados = EXCLUDED.dados, atualizado_em = CURRENT_TIMESTAMP
        RETURNING dados;`;
    try {
        const result = await pool.query(sql, [userId, dados]);
        res.status(200).json(result.rows[0].dados);
    } catch (error) {
        console.error("Erro ao salvar dados de aposentadoria:", error);
        res.status(500).json({ message: 'Erro ao salvar dados de aposentadoria.' });
    }
};

// --- Simulador PGBL ---
const getSimuladorPgbl = async (req, res) => {
    try {
        const result = await pool.query('SELECT dados FROM simulador_pgbl_dados WHERE user_id = $1', [req.usuario.id]);
        if (result.rows.length === 0) {
            return res.json(null);
        }
        res.json(result.rows[0].dados);
    } catch (error) {
        console.error("Erro ao buscar dados do simulador PGBL:", error);
        res.status(500).json({ message: 'Erro ao buscar dados do simulador PGBL.' });
    }
};

const saveSimuladorPgbl = async (req, res) => {
    const dados = req.body;
    const userId = req.usuario.id;
    const sql = `
        INSERT INTO simulador_pgbl_dados (user_id, dados, atualizado_em)
        VALUES ($1, $2, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id) 
        DO UPDATE SET dados = EXCLUDED.dados, atualizado_em = CURRENT_TIMESTAMP
        RETURNING dados;`;
    try {
        const result = await pool.query(sql, [userId, dados]);
        res.status(200).json(result.rows[0].dados);
    } catch (error) {
        console.error("Erro ao salvar dados do simulador PGBL:", error);
        res.status(500).json({ message: 'Erro ao salvar dados do simulador PGBL.' });
    }
};

// --- Aquisições ---
const getAquisicoes = async (req, res) => {
    const { tipo } = req.params;
    try {
        const result = await pool.query('SELECT simulacoes FROM aquisicao_simulacoes WHERE user_id = $1 AND tipo_bem = $2', [req.usuario.id, tipo]);
        if (result.rows.length === 0) {
            return res.json([]); // Retorna array vazio como no original
        }
        res.json(result.rows[0].simulacoes);
    } catch (error) {
        console.error(`Erro ao buscar dados de aquisição (${tipo}):`, error);
        res.status(500).json({ message: `Erro ao buscar dados de aquisição (${tipo}).` });
    }
};

const saveAquisicoes = async (req, res) => {
    const { tipo } = req.params;
    const simulacoes = req.body;
    const userId = req.usuario.id;
    const sql = `
        INSERT INTO aquisicao_simulacoes (user_id, tipo_bem, simulacoes, atualizado_em)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        ON CONFLICT (user_id, tipo_bem) 
        DO UPDATE SET simulacoes = EXCLUDED.simulacoes, atualizado_em = CURRENT_TIMESTAMP
        RETURNING simulacoes;`;
    try {
        const result = await pool.query(sql, [userId, tipo, simulacoes]);
        res.status(200).json(result.rows[0].simulacoes);
    } catch (error) {
        console.error(`Erro ao salvar dados de aquisição (${tipo}):`, error);
        res.status(500).json({ message: `Erro ao salvar dados de aquisição (${tipo}).` });
    }
};

module.exports = {
    getAposentadoria, saveAposentadoria,
    getSimuladorPgbl, saveSimuladorPgbl,
    getAquisicoes, saveAquisicoes
};