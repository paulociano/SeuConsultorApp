const pool = require('../config/db');

// --- Funções Auxiliares de Mapeamento ---
const mapCarteiraToFrontend = (dbRow) => ({ id: dbRow.id, name: dbRow.nome, balance: parseInt(dbRow.saldo, 10), avgCpm: parseFloat(dbRow.cpm_medio), expiration: dbRow.data_expiracao, type: dbRow.tipo });
const mapMetaToFrontend = (dbRow) => ({ id: dbRow.id, nomeDestino: dbRow.nome_destino, origem: dbRow.origem_sigla, destino: dbRow.destino_sigla, programSuggestions: [dbRow.programa_alvo], flightCostBRL: parseFloat(dbRow.custo_reais), estimatedMiles: parseInt(dbRow.custo_milhas, 10) });


// --- Lógica para Carteiras ---
const getCarteiras = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM milhas_carteiras WHERE user_id = $1 ORDER BY tipo, nome', [req.usuario.id]);
        res.json(result.rows.map(mapCarteiraToFrontend));
    } catch (e) { res.status(500).json({ message: 'Erro ao buscar carteiras.' }); }
};

const createCarteira = async (req, res) => {
    const { name, balance, avgCpm, expiration, type } = req.body;
    const sql = 'INSERT INTO milhas_carteiras (user_id, nome, saldo, cpm_medio, data_expiracao, tipo) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *';
    try {
        const result = await pool.query(sql, [req.usuario.id, name, balance, avgCpm, expiration, type]);
        res.status(201).json(mapCarteiraToFrontend(result.rows[0]));
    } catch (e) { res.status(500).json({ message: 'Erro ao salvar carteira.' }); }
};

const updateCarteira = async (req, res) => {
    const { name, balance, avgCpm, expiration, type } = req.body;
    const sql = 'UPDATE milhas_carteiras SET nome=$1, saldo=$2, cpm_medio=$3, data_expiracao=$4, tipo=$5, atualizado_em=NOW() WHERE id=$6 AND user_id=$7 RETURNING *';
    try {
        const result = await pool.query(sql, [name, balance, avgCpm, expiration, type, req.params.id, req.usuario.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Carteira não encontrada.' });
        res.json(mapCarteiraToFrontend(result.rows[0]));
    } catch (e) { res.status(500).json({ message: 'Erro ao atualizar carteira.' }); }
};

const deleteCarteira = async (req, res) => {
    try {
        await pool.query('DELETE FROM milhas_carteiras WHERE id=$1 AND user_id=$2', [req.params.id, req.usuario.id]);
        res.status(204).send();
    } catch (e) { res.status(500).json({ message: 'Erro ao deletar carteira.' }); }
};


// --- Lógica para Metas ---
const getMetas = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM milhas_metas WHERE user_id = $1 ORDER BY criado_em DESC', [req.usuario.id]);
        res.json(result.rows.map(mapMetaToFrontend));
    } catch (e) { res.status(500).json({ message: 'Erro ao buscar metas.' }); }
};

const createMeta = async (req, res) => {
    const { nomeDestino, origem, destino, programSuggestions, flightCostBRL, estimatedMiles } = req.body;
    const sql = 'INSERT INTO milhas_metas (user_id, nome_destino, origem_sigla, destino_sigla, programa_alvo, custo_reais, custo_milhas) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *';
    try {
        const result = await pool.query(sql, [req.usuario.id, nomeDestino, origem, destino, programSuggestions[0], flightCostBRL, estimatedMiles]);
        res.status(201).json(mapMetaToFrontend(result.rows[0]));
    } catch (e) { console.error(e); res.status(500).json({ message: 'Erro ao salvar meta.' }); }
};

const updateMeta = async (req, res) => {
    const { nomeDestino, origem, destino, programSuggestions, flightCostBRL, estimatedMiles } = req.body;
    const sql = 'UPDATE milhas_metas SET nome_destino=$1, origem_sigla=$2, destino_sigla=$3, programa_alvo=$4, custo_reais=$5, custo_milhas=$6, atualizado_em=NOW() WHERE id=$7 AND user_id=$8 RETURNING *';
    try {
        const result = await pool.query(sql, [nomeDestino, origem, destino, programSuggestions[0], flightCostBRL, estimatedMiles, req.params.id, req.usuario.id]);
        if (result.rows.length === 0) return res.status(404).json({ message: 'Meta não encontrada.' });
        res.json(mapMetaToFrontend(result.rows[0]));
    } catch (e) { res.status(500).json({ message: 'Erro ao atualizar meta.' }); }
};

const deleteMeta = async (req, res) => {
    try {
        await pool.query('DELETE FROM milhas_metas WHERE id=$1 AND user_id=$2', [req.params.id, req.usuario.id]);
        res.status(204).send();
    } catch (e) { res.status(500).json({ message: 'Erro ao deletar meta.' }); }
};


module.exports = {
    getCarteiras, createCarteira, updateCarteira, deleteCarteira,
    getMetas, createMeta, updateMeta, deleteMeta
};