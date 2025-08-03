const pool = require('../config/db');

// --- LÓGICA PARA ATIVOS ---

const getAtivos = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM ativos WHERE user_id = $1 ORDER BY tipo, nome', [
      req.usuario.id,
    ]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar ativos.' });
  }
};

const createAtivo = async (req, res) => {
  const { nome, valor, tipo } = req.body;
  const sql = 'INSERT INTO ativos (nome, valor, tipo, user_id) VALUES ($1, $2, $3, $4) RETURNING *';
  try {
    const result = await pool.query(sql, [nome, valor, tipo, req.usuario.id]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao adicionar ativo.' });
  }
};

const updateAtivo = async (req, res) => {
  const { id } = req.params;
  const { nome, valor, tipo } = req.body;
  const sql =
    'UPDATE ativos SET nome = $1, valor = $2, tipo = $3 WHERE id = $4 AND user_id = $5 RETURNING *';
  try {
    const result = await pool.query(sql, [nome, valor, tipo, id, req.usuario.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Ativo não encontrado.' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar ativo.' });
  }
};

const deleteAtivo = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM ativos WHERE id = $1 AND user_id = $2', [
      id,
      req.usuario.id,
    ]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Ativo não encontrado.' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Erro ao apagar ativo.' });
  }
};

// --- LÓGICA PARA DÍVIDAS ---

const getDividas = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM dividas WHERE user_id = $1 ORDER BY tipo, nome',
      [req.usuario.id]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar dívidas.' });
  }
};

const createDivida = async (req, res) => {
  const { nome, valor, tipo } = req.body;
  const sql =
    'INSERT INTO dividas (nome, valor, tipo, user_id) VALUES ($1, $2, $3, $4) RETURNING *';
  try {
    const result = await pool.query(sql, [nome, valor, tipo, req.usuario.id]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao adicionar dívida.' });
  }
};

const updateDivida = async (req, res) => {
  const { id } = req.params;
  const { nome, valor, tipo } = req.body;
  const sql =
    'UPDATE dividas SET nome = $1, valor = $2, tipo = $3 WHERE id = $4 AND user_id = $5 RETURNING *';
  try {
    const result = await pool.query(sql, [nome, valor, tipo, id, req.usuario.id]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Dívida não encontrada.' });
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao atualizar dívida.' });
  }
};

const deleteDivida = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM dividas WHERE id = $1 AND user_id = $2', [
      id,
      req.usuario.id,
    ]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Dívida não encontrada.' });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ message: 'Erro ao apagar dívida.' });
  }
};

module.exports = {
  getAtivos,
  createAtivo,
  updateAtivo,
  deleteAtivo,
  getDividas,
  createDivida,
  updateDivida,
  deleteDivida,
};
