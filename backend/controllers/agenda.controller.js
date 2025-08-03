const pool = require('../config/db');

// --- Lógica para Atas de Reunião ---
const getAtas = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM reunioes_atas WHERE user_id = $1 ORDER BY data_criacao DESC',
      [req.usuario.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar atas:', error);
    res.status(500).json({ message: 'Erro ao buscar atas.' });
  }
};

const createAta = async (req, res) => {
  try {
    const {
      titulo,
      resumo,
      participantesPresentes,
      deliberacoes,
      categoriaFinanceira,
      tipoDecisaoFinanceira,
      valorEnvolvido,
      impactoEsperado,
      actionItems,
    } = req.body;
    const sql = `
            INSERT INTO reunioes_atas (user_id, titulo, resumo, participantes_presentes, deliberacoes, categoria_financeira, tipo_decisao_financeira, valor_envolvido, impacto_esperado, action_items)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *;`;
    const values = [
      req.usuario.id,
      titulo,
      resumo,
      participantesPresentes,
      deliberacoes,
      categoriaFinanceira,
      tipoDecisaoFinanceira,
      valorEnvolvido || null,
      impactoEsperado,
      JSON.stringify(actionItems || []),
    ];
    const result = await pool.query(sql, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar ata:', error);
    res.status(500).json({ message: 'Erro ao criar ata.' });
  }
};

const updateAta = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      titulo,
      resumo,
      participantesPresentes,
      deliberacoes,
      categoriaFinanceira,
      tipoDecisaoFinanceira,
      valorEnvolvido,
      impactoEsperado,
      actionItems,
    } = req.body;
    const sql = `
            UPDATE reunioes_atas SET titulo = $1, resumo = $2, participantes_presentes = $3, deliberacoes = $4, categoria_financeira = $5, tipo_decisao_financeira = $6, valor_envolvido = $7, impacto_esperado = $8, action_items = $9
            WHERE id = $10 AND user_id = $11 RETURNING *;`;
    const values = [
      titulo,
      resumo,
      participantesPresentes,
      deliberacoes,
      categoriaFinanceira,
      tipoDecisaoFinanceira,
      valorEnvolvido || null,
      impactoEsperado,
      JSON.stringify(actionItems || []),
      id,
      req.usuario.id,
    ];
    const result = await pool.query(sql, values);
    if (result.rows.length === 0) return res.status(404).json({ message: 'Ata não encontrada.' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar ata:', error);
    res.status(500).json({ message: 'Erro ao atualizar ata.' });
  }
};

const deleteAta = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM reunioes_atas WHERE id = $1 AND user_id = $2', [
      id,
      req.usuario.id,
    ]);
    if (result.rowCount === 0) return res.status(404).json({ message: 'Ata não encontrada.' });
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar ata:', error);
    res.status(500).json({ message: 'Erro ao deletar ata.' });
  }
};

// --- Lógica para Compromissos da Agenda ---
const getCompromissos = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM agenda_compromissos WHERE user_id = $1 ORDER BY data ASC',
      [req.usuario.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Erro ao buscar compromissos:', error);
    res.status(500).json({ message: 'Erro ao buscar compromissos.' });
  }
};

const createCompromisso = async (req, res) => {
  try {
    const { titulo, data, local, participantes, linkReuniao, descricaoDetalhada, status } =
      req.body;
    const sql = `
            INSERT INTO agenda_compromissos (user_id, titulo, data, local, participantes, link_reuniao, descricao_detalhada, status)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *;`;
    const values = [
      req.usuario.id,
      titulo,
      data,
      local,
      participantes,
      linkReuniao,
      descricaoDetalhada,
      status,
    ];
    const result = await pool.query(sql, values);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao criar compromisso:', error);
    res.status(500).json({ message: 'Erro ao criar compromisso.' });
  }
};

const updateCompromisso = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, data, local, participantes, linkReuniao, descricaoDetalhada, status } =
      req.body;
    const sql = `
            UPDATE agenda_compromissos SET titulo = $1, data = $2, local = $3, participantes = $4, link_reuniao = $5, descricao_detalhada = $6, status = $7
            WHERE id = $8 AND user_id = $9 RETURNING *;`;
    const values = [
      titulo,
      data,
      local,
      participantes,
      linkReuniao,
      descricaoDetalhada,
      status,
      id,
      req.usuario.id,
    ];
    const result = await pool.query(sql, values);
    if (result.rows.length === 0)
      return res.status(404).json({ message: 'Compromisso não encontrado.' });
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Erro ao atualizar compromisso:', error);
    res.status(500).json({ message: 'Erro ao atualizar compromisso.' });
  }
};

const deleteCompromisso = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM agenda_compromissos WHERE id = $1 AND user_id = $2',
      [id, req.usuario.id]
    );
    if (result.rowCount === 0)
      return res.status(404).json({ message: 'Compromisso não encontrado.' });
    res.status(204).send();
  } catch (error) {
    console.error('Erro ao deletar compromisso:', error);
    res.status(500).json({ message: 'Erro ao deletar compromisso.' });
  }
};

module.exports = {
  getAtas,
  createAta,
  updateAta,
  deleteAta,
  getCompromissos,
  createCompromisso,
  updateCompromisso,
  deleteCompromisso,
};
