const pool = require('../config/db');

const getTransacoes = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM transacoes WHERE user_id = $1 ORDER BY data DESC',
      [req.usuario.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar transações.' });
  }
};

const createTransacao = async (req, res) => {
  const { descricao, valor, data, tipo, categoria, ignorada } = req.body;
  const sql = `INSERT INTO transacoes (descricao, valor, data, tipo, categoria, ignorada, user_id) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *;`;
  try {
    const values = [descricao, valor, data, tipo, categoria, ignorada || false, req.usuario.id];
    const result = await pool.query(sql, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao adicionar transação.' });
  }
};

const updateTransacao = async (req, res) => {
  const { id } = req.params;
  const { descricao, valor, data, tipo, categoria, ignorada } = req.body;
  const sql = `UPDATE transacoes SET descricao = $1, valor = $2, data = $3, tipo = $4, categoria = $5, ignorada = $6 WHERE id = $7 AND user_id = $8 RETURNING *;`;
  try {
    const values = [descricao, valor, data, tipo, categoria, ignorada, id, req.usuario.id];
    const result = await pool.query(sql, values);
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Transação não encontrada.' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar transação.' });
  }
};

const deleteTransacao = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM transacoes WHERE id = $1 AND user_id = $2', [
      id,
      req.usuario.id,
    ]);
    if (result.rowCount === 0)
      return res.status(404).json({ message: 'Transação não encontrada.' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Erro ao apagar transação.' });
  }
};

module.exports = {
  getTransacoes,
  createTransacao,
  updateTransacao,
  deleteTransacao,
};
