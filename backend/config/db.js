// Local do arquivo: backend/config/db.js

const { Pool } = require('pg');
require('dotenv').config();

// Verifica se a variável de ambiente DATABASE_URL foi fornecida.
if (!process.env.DATABASE_URL) {
  throw new Error('FATAL ERROR: A variável de ambiente DATABASE_URL não foi definida.');
}

// Cria a pool de conexões EXPLICITAMENTE com a connectionString.
// Isso força o pg a usar a URL do Docker ('postgresql://...:@postgres_db:5432/...')
// em vez de qualquer configuração padrão (como localhost).
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Opcional: Um pequeno log para confirmar que a conexão está funcionando.
pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('ERRO DE CONEXÃO COM O BANCO DE DADOS:', err);
  } else {
    console.log('✅ Conexão com o banco de dados estabelecida com sucesso em:', res.rows[0].now);
  }
});

module.exports = pool;
