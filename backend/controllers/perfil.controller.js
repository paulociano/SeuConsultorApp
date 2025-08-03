const pool = require('../config/db');
const bcrypt = require('bcrypt');

const getPerfil = async (req, res, next) => {
  try {
    const userId = req.usuario.id;

    // Busca os dados em paralelo para maior eficiência
    const [userQuery, invalidezRes, despesasRes, patrimonialRes] = await Promise.all([
      pool.query('SELECT id, nome, email, imagem_url FROM usuarios WHERE id = $1', [userId]),
      pool.query('SELECT * FROM protecao_invalidez WHERE user_id = $1 ORDER BY criado_em DESC', [
        userId,
      ]),
      pool.query(
        'SELECT * FROM protecao_despesas_futuras WHERE user_id = $1 ORDER BY ano_inicio ASC',
        [userId]
      ),
      pool.query(
        'SELECT * FROM protecao_patrimonial WHERE user_id = $1 ORDER BY data_vencimento ASC',
        [userId]
      ),
    ]);

    if (userQuery.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const usuario = userQuery.rows[0];

    res.json({
      usuario: usuario,
      protecao: {
        invalidez: invalidezRes.rows,
        despesasFuturas: despesasRes.rows,
        patrimonial: patrimonialRes.rows,
      },
    });
  } catch (error) {
    next(error);
  }
};

// --- NOVA FUNÇÃO PARA ATUALIZAR O PERFIL ---
const updatePerfil = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nome, email, senha } = req.body;
    const userIdAutenticado = req.usuario.id;

    // Garante que um usuário só pode editar o próprio perfil
    if (parseInt(id, 10) !== userIdAutenticado) {
      return res.status(403).json({ message: 'Acesso negado.' });
    }

    const fieldsToUpdate = [];
    const values = [];
    let queryIndex = 1;

    // Adiciona os campos ao update dinamicamente
    if (nome) {
      fieldsToUpdate.push(`nome = $${queryIndex++}`);
      values.push(nome);
    }
    if (email) {
      fieldsToUpdate.push(`email = $${queryIndex++}`);
      values.push(email);
    }
    // Se uma nova senha foi enviada, faz o hash dela
    if (senha) {
      const salt = await bcrypt.genSalt(10);
      const senhaHash = await bcrypt.hash(senha, salt);
      fieldsToUpdate.push(`senha_hash = $${queryIndex++}`);
      values.push(senhaHash);
    }
    // Se um novo arquivo de imagem foi enviado pelo multer, atualiza a URL
    if (req.file) {
      // O multer nos dá o caminho do arquivo salvo.
      // Assumimos que as imagens estão acessíveis a partir de uma pasta 'uploads'.
      const imageUrl = `/uploads/${req.file.filename}`;
      fieldsToUpdate.push(`imagem_url = $${queryIndex++}`);
      values.push(imageUrl);
    }

    if (fieldsToUpdate.length === 0) {
      return res.status(400).json({ message: 'Nenhum dado para atualizar.' });
    }

    // Monta e executa a query SQL de atualização
    const sql = `UPDATE usuarios SET ${fieldsToUpdate.join(', ')} WHERE id = $${queryIndex++} RETURNING id, nome, email, imagem_url`;
    values.push(id);

    const result = await pool.query(sql, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    res.json({ success: true, usuario: result.rows[0] });
  } catch (error) {
    // Trata erro de email duplicado
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Este email já está em uso por outra conta.' });
    }
    next(error);
  }
};

module.exports = {
  getPerfil,
  updatePerfil, // Exporta a nova função
};
