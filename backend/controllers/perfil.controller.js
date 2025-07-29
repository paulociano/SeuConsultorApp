const pool = require('../config/db');

const getPerfil = async (req, res) => {
  try {
    const userId = req.usuario.id;

    // Busca os dados em paralelo para maior eficiência
    const [userQuery, invalidezRes, despesasRes, patrimonialRes] = await Promise.all([
      pool.query('SELECT id, nome, email, imagem_url FROM usuarios WHERE id = $1', [userId]),
      pool.query('SELECT * FROM protecao_invalidez WHERE user_id = $1 ORDER BY criado_em DESC', [userId]),
      pool.query('SELECT * FROM protecao_despesas_futuras WHERE user_id = $1 ORDER BY ano_inicio ASC', [userId]),
      pool.query('SELECT * FROM protecao_patrimonial WHERE user_id = $1 ORDER BY data_vencimento ASC', [userId])
    ]);
    
    // Garante que o usuário foi encontrado
    if (userQuery.rows.length === 0) {
        return res.status(404).json({ message: 'Usuário não encontrado.' });
    }

    const usuario = userQuery.rows[0];

    // Monta o objeto de resposta final
    res.json({
      usuario: usuario,
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
};

module.exports = {
    getPerfil,
};