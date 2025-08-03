const pool = require('../config/db');

const getOrcamento = async (req, res) => {
  try {
    const userId = req.usuario.id;
    const categoriasResult = await pool.query(
      'SELECT * FROM orcamento_categorias WHERE user_id = $1 ORDER BY id',
      [userId]
    );
    const itensResult = await pool.query(
      'SELECT * FROM orcamento_itens WHERE user_id = $1 ORDER BY id',
      [userId]
    );

    const orcamentoFormatado = categoriasResult.rows.map((cat) => ({
      id: cat.id,
      nome: cat.nome,
      tipo: cat.tipo,
      subItens: itensResult.rows
        .filter((item) => item.categoria_id === cat.id)
        .map((item) => ({
          id: item.id,
          nome: item.nome,
          sugerido: parseFloat(item.valor_planejado),
          atual: parseFloat(item.valor_atual),
          categoria_planejamento: item.categoria_planejamento,
        })),
    }));
    res.json(orcamentoFormatado);
  } catch (error) {
    console.error('Erro ao buscar orçamento:', error);
    res.status(500).json({ message: 'Erro ao buscar dados do orçamento.' });
  }
};

const createOrcamentoItem = async (req, res) => {
  const { nome, valor_planejado, categoria_id, categoria_planejamento } = req.body;
  const sql = `INSERT INTO orcamento_itens (nome, valor_planejado, valor_atual, categoria_id, user_id, categoria_planejamento) VALUES ($1, $2, 0, $3, $4, $5) RETURNING *`;
  try {
    const result = await pool.query(sql, [
      nome,
      valor_planejado || 0,
      categoria_id,
      req.usuario.id,
      categoria_planejamento,
    ]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao adicionar item de orçamento:', error);
    res.status(500).json({ message: 'Erro ao adicionar item de orçamento.' });
  }
};

const updateOrcamentoItem = async (req, res) => {
  const { id } = req.params;
  const { nome, valor_planejado, valor_atual, categoria_planejamento } = req.body;
  const sql = `UPDATE orcamento_itens SET nome = $1, valor_planejado = $2, valor_atual = $3, categoria_planejamento = $4 WHERE id = $5 AND user_id = $6 RETURNING *`;
  try {
    const result = await pool.query(sql, [
      nome,
      valor_planejado,
      valor_atual,
      categoria_planejamento,
      id,
      req.usuario.id,
    ]);
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Item do orçamento não encontrado.' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar item de orçamento:', error);
    res.status(500).json({ message: 'Erro ao atualizar item do orçamento.' });
  }
};

const deleteOrcamentoItem = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.usuario.id;
    const sql = 'DELETE FROM orcamento_itens WHERE id = $1 AND user_id = $2';
    const result = await pool.query(sql, [id, userId]);
    if (result.rowCount === 0)
      return res.status(404).json({ message: 'Item do orçamento não encontrado.' });
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao apagar item de orçamento:', error);
    res.status(500).json({ message: 'Erro ao apagar item de orçamento.' });
  }
};

module.exports = {
  getOrcamento,
  createOrcamentoItem,
  updateOrcamentoItem,
  deleteOrcamentoItem,
};
