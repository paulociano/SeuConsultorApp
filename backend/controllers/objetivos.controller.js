const pool = require('../config/db');

const getObjetivos = async (req, res, next) => {
  try {
    const userId = req.usuario.id;
    const query = `
            SELECT o.id, o.user_id, o.nome, o.icon, o.valor_alvo, o.aporte_mensal, o.investimentos_linkados, o.criado_em,
                   COALESCE(SUM(a.valor), 0) as "valorAtual"
            FROM objetivos o
            LEFT JOIN ativos a ON a.id = ANY(o.investimentos_linkados) AND a.user_id = o.user_id
            WHERE o.user_id = $1
            GROUP BY o.id
            ORDER BY o.criado_em ASC;`;
    const result = await pool.query(query, [userId]);
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};

const createObjetivo = async (req, res, next) => {
  try {
    const { nome, icon, valorAlvo, aporteMensal, investimentosLinkados } = req.body;
    const userId = req.usuario.id;
    const sanitizedLinks = (investimentosLinkados || [])
      .map((id) => parseInt(id, 10))
      .filter((id) => !isNaN(id));
    const sql = `
            INSERT INTO objetivos (user_id, nome, icon, valor_alvo, aporte_mensal, investimentos_linkados)
            VALUES ($1, $2, $3, $4, $5, $6) RETURNING *;`;
    const result = await pool.query(sql, [
      userId,
      nome,
      icon,
      valorAlvo,
      aporteMensal || 0,
      sanitizedLinks,
    ]);

    const novoObjetivo = result.rows[0];
    const valorAtualResult = await pool.query(
      'SELECT COALESCE(SUM(valor), 0) as "valorAtual" FROM ativos WHERE id = ANY($1) AND user_id = $2',
      [novoObjetivo.investimentos_linkados, userId]
    );
    novoObjetivo.valorAtual = parseFloat(valorAtualResult.rows[0].valorAtual);

    res.status(201).json(novoObjetivo);
  } catch (error) {
    next(error);
  }
};

const updateObjetivo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nome, icon, valorAlvo, aporteMensal, investimentosLinkados } = req.body;
    const userId = req.usuario.id;
    const sanitizedLinks = (investimentosLinkados || [])
      .map((id) => parseInt(id, 10))
      .filter((id) => !isNaN(id));
    const sql = `
            UPDATE objetivos 
            SET nome = $1, icon = $2, valor_alvo = $3, aporte_mensal = $4, investimentos_linkados = $5, atualizado_em = CURRENT_TIMESTAMP
            WHERE id = $6 AND user_id = $7 RETURNING *;`;
    const result = await pool.query(sql, [
      nome,
      icon,
      valorAlvo,
      aporteMensal || 0,
      sanitizedLinks,
      id,
      userId,
    ]);
    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Objetivo não encontrado.' });
    }
    const objetivoAtualizado = result.rows[0];
    const valorAtualResult = await pool.query(
      'SELECT COALESCE(SUM(valor), 0) as "valorAtual" FROM ativos WHERE id = ANY($1) AND user_id = $2',
      [objetivoAtualizado.investimentos_linkados, userId]
    );
    objetivoAtualizado.valorAtual = parseFloat(valorAtualResult.rows[0].valorAtual);

    res.json(objetivoAtualizado);
  } catch (error) {
    next(error);
  }
};

const deleteObjetivo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.usuario.id;
    const result = await pool.query('DELETE FROM objetivos WHERE id = $1 AND user_id = $2', [
      id,
      userId,
    ]);
    if (result.rowCount === 0) {
      return res.status(404).json({ message: 'Objetivo não encontrado.' });
    }
    res.status(204).send();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getObjetivos,
  createObjetivo,
  updateObjetivo,
  deleteObjetivo,
};
