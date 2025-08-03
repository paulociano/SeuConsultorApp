const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { criarOrcamentoPadraoParaUsuario } = require('../utils/orcamento.utils');

const login = async (req, res, next) => {
  // Adicionado 'next'
  const { email, senha } = req.body;
  try {
    const userQuery = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (userQuery.rows.length === 0) {
      // Usamos um return para parar a execução aqui
      return res.status(401).json({ success: false, message: 'Email ou senha inválidos.' });
    }

    const usuario = userQuery.rows[0];
    const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);

    if (!senhaValida) {
      return res.status(401).json({ success: false, message: 'Email ou senha inválidos.' });
    }

    const payload = { id: usuario.id, nome: usuario.nome, email: usuario.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

    res.json({
      success: true,
      token: token,
      usuario: {
        id: usuario.id,
        nome: usuario.nome,
        email: usuario.email,
        imagem_url: usuario.imagem_url,
      },
    });
  } catch (error) {
    // CORREÇÃO: Passa o erro para o middleware central
    next(error);
  }
};

const cadastro = async (req, res, next) => {
  // Adicionado 'next'
  const { nome, email, senha } = req.body;
  let novoUsuario;
  try {
    const salt = await bcrypt.genSalt(10);
    const senhaHash = await bcrypt.hash(senha, salt);

    const sql =
      'INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING id, nome, email, imagem_url';
    const values = [nome, email, senhaHash];
    const result = await pool.query(sql, values);
    novoUsuario = result.rows[0];

    await criarOrcamentoPadraoParaUsuario(novoUsuario.id);

    res.status(201).json({ success: true, usuario: novoUsuario });
  } catch (error) {
    // A lógica de rollback e erro de duplicidade é mantida
    if (novoUsuario && novoUsuario.id) {
      await pool.query('DELETE FROM usuarios WHERE id = $1', [novoUsuario.id]);
    }

    if (error.code === '23505') {
      return res.status(409).json({ success: false, message: 'Este email já está em uso.' });
    }

    // CORREÇÃO: Passa o erro genérico para o middleware central
    next(error);
  }
};

module.exports = {
  login,
  cadastro,
};
