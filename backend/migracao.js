// migracao.js
// Este é um script para ser executado APENAS UMA VEZ.

const { Pool } = require('pg');

// Copie exatamente a mesma configuração de conexão do seu arquivo index.js
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'seuconsultor_db',
  password: 'ph368g571',
  port: 5432,
});

// O comando SQL que queremos executar
const comandoSQL = `
  ALTER TABLE orcamento_itens
  ADD COLUMN IF NOT EXISTS categoria_planejamento VARCHAR(50);
`;
// Usar "ADD COLUMN IF NOT EXISTS" é uma boa prática para evitar erros se o script for executado acidentalmente mais de uma vez.

const executarMigracao = async () => {
  console.log('Iniciando migração do banco de dados...');
  const client = await pool.connect(); // Pega uma conexão do pool

  try {
    await client.query(comandoSQL);
    console.log('✅ Migração concluída com sucesso! A coluna "categoria_planejamento" foi adicionada.');
  } catch (error) {
    console.error('❌ Erro ao executar a migração:', error);
  } finally {
    // É muito importante liberar a conexão e fechar o pool para que o script termine
    client.release();
    await pool.end();
    console.log('Conexão com o banco de dados fechada.');
  }
};

// Executa a função
executarMigracao();