const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { criarOrcamentoPadraoParaUsuario } = require('../utils/orcamento.utils');

const login = async (req, res) => {
    const { email, senha } = req.body;
    try {
        const userQuery = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
        if (userQuery.rows.length === 0) {
            return res.status(401).json({ success: false, message: 'Email ou senha inválidos' });
        }
        
        const usuario = userQuery.rows[0];
        const senhaValida = await bcrypt.compare(senha, usuario.senha_hash);
        
        if (!senhaValida) {
            return res.status(401).json({ success: false, message: 'Email ou senha inválidos' });
        }
        
        const payload = { id: usuario.id, nome: usuario.nome, email: usuario.email };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });
        
        res.json({
            success: true,
            token: token,
            usuario: { id: usuario.id, nome: usuario.nome, email: usuario.email, imagem_url: usuario.imagem_url }
        });
    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({ success: false, message: 'Erro interno do servidor.' });
    }
};

const cadastro = async (req, res) => {
    const { nome, email, senha } = req.body;
    let novoUsuario; // Declarado aqui para ter escopo em todo o bloco try/catch
    try {
        // Gera o salt e o hash da senha
        const salt = await bcrypt.genSalt(10);
        const senhaHash = await bcrypt.hash(senha, salt);
        
        // Insere o novo usuário no banco de dados
        const sql = 'INSERT INTO usuarios (nome, email, senha_hash) VALUES ($1, $2, $3) RETURNING id, nome, email, imagem_url';
        const values = [nome, email, senhaHash];
        const result = await pool.query(sql, values);
        novoUsuario = result.rows[0];
        
        // Cria a estrutura de orçamento padrão para este novo usuário
        await criarOrcamentoPadraoParaUsuario(novoUsuario.id);
        
        // Retorna o sucesso e os dados do novo usuário
        res.status(201).json({ success: true, usuario: novoUsuario });
        
    } catch (error) {
        console.error('Erro no processo de cadastro:', error);
        
        // Se a criação do usuário funcionou mas a do orçamento falhou, remove o usuário criado (rollback)
        if (novoUsuario && novoUsuario.id) {
            await pool.query('DELETE FROM usuarios WHERE id = $1', [novoUsuario.id]);
        }
        
        // Trata o erro específico de e-mail duplicado (código de violação de unicidade do PostgreSQL)
        if (error.code === '23505') {
            return res.status(409).json({ success: false, message: 'Este email já está em uso.' });
        }
        
        // Retorna um erro genérico do servidor para outras falhas
        res.status(500).json({ success: false, message: 'Erro interno do servidor durante o cadastro.' });
    }
};

module.exports = {
    login,
    cadastro,
};