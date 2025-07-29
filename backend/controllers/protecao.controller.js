const pool = require('../config/db');

// --- Invalidez ---
const createInvalidez = async (req, res) => {
    const { nome, cobertura, observacoes } = req.body;
    const sql = 'INSERT INTO protecao_invalidez (user_id, nome, cobertura, observacoes) VALUES ($1, $2, $3, $4) RETURNING *';
    try {
        const result = await pool.query(sql, [req.usuario.id, nome, cobertura, observacoes]);
        res.status(201).json(result.rows[0]);
    } catch (e) { res.status(500).json({ message: 'Erro ao salvar item.' }); }
};
const updateInvalidez = async (req, res) => {
    const { nome, cobertura, observacoes } = req.body;
    const sql = 'UPDATE protecao_invalidez SET nome = $1, cobertura = $2, observacoes = $3 WHERE id = $4 AND user_id = $5 RETURNING *';
    try {
        const result = await pool.query(sql, [nome, cobertura, observacoes, req.params.id, req.usuario.id]);
        res.json(result.rows[0]);
    } catch (e) { res.status(500).json({ message: 'Erro ao atualizar item.' }); }
};
const deleteInvalidez = async (req, res) => {
    const sql = 'DELETE FROM protecao_invalidez WHERE id = $1 AND user_id = $2';
    try {
        await pool.query(sql, [req.params.id, req.usuario.id]);
        res.status(204).send();
    } catch (e) { res.status(500).json({ message: 'Erro ao deletar item.' }); }
};

// --- Despesas Futuras ---
const createDespesa = async (req, res) => {
    const { nome, ano_inicio, valor_mensal, prazo_meses } = req.body;
    const sql = 'INSERT INTO protecao_despesas_futuras (user_id, nome, ano_inicio, valor_mensal, prazo_meses) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    try {
        const result = await pool.query(sql, [req.usuario.id, nome, ano_inicio, valor_mensal, prazo_meses]);
        res.status(201).json(result.rows[0]);
    } catch (e) { res.status(500).json({ message: 'Erro ao salvar despesa.' }); }
};
const updateDespesa = async (req, res) => {
    const { nome, ano_inicio, valor_mensal, prazo_meses } = req.body;
    const sql = 'UPDATE protecao_despesas_futuras SET nome = $1, ano_inicio = $2, valor_mensal = $3, prazo_meses = $4 WHERE id = $5 AND user_id = $6 RETURNING *';
    try {
        const result = await pool.query(sql, [nome, ano_inicio, valor_mensal, prazo_meses, req.params.id, req.usuario.id]);
        res.json(result.rows[0]);
    } catch (e) { res.status(500).json({ message: 'Erro ao atualizar despesa.' }); }
};
const deleteDespesa = async (req, res) => {
    const sql = 'DELETE FROM protecao_despesas_futuras WHERE id = $1 AND user_id = $2';
    try {
        await pool.query(sql, [req.params.id, req.usuario.id]);
        res.status(204).send();
    } catch (e) { res.status(500).json({ message: 'Erro ao deletar despesa.' }); }
};

// --- Patrimonial ---
const createPatrimonial = async (req, res) => {
    const { nome, empresa, data_vencimento, valor } = req.body;
    const sql = 'INSERT INTO protecao_patrimonial (user_id, nome, empresa, data_vencimento, valor) VALUES ($1, $2, $3, $4, $5) RETURNING *';
    try {
        const result = await pool.query(sql, [req.usuario.id, nome, empresa, data_vencimento, valor]);
        res.status(201).json(result.rows[0]);
    } catch (e) { res.status(500).json({ message: 'Erro ao salvar seguro.' }); }
};
const updatePatrimonial = async (req, res) => {
    const { nome, empresa, data_vencimento, valor } = req.body;
    const sql = 'UPDATE protecao_patrimonial SET nome = $1, empresa = $2, data_vencimento = $3, valor = $4 WHERE id = $5 AND user_id = $6 RETURNING *';
    try {
        const result = await pool.query(sql, [nome, empresa, data_vencimento, valor, req.params.id, req.usuario.id]);
        res.json(result.rows[0]);
    } catch (e) { res.status(500).json({ message: 'Erro ao atualizar seguro.' }); }
};
const deletePatrimonial = async (req, res) => {
    const sql = 'DELETE FROM protecao_patrimonial WHERE id = $1 AND user_id = $2';
    try {
        await pool.query(sql, [req.params.id, req.usuario.id]);
        res.status(204).send();
    } catch (e) { res.status(500).json({ message: 'Erro ao deletar seguro.' }); }
};

module.exports = {
    createInvalidez, updateInvalidez, deleteInvalidez,
    createDespesa, updateDespesa, deleteDespesa,
    createPatrimonial, updatePatrimonial, deletePatrimonial
};