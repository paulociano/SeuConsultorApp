// setupDatabase.js

// Importa o pacote 'dotenv' para carregar variáveis de ambiente do arquivo .env
require('dotenv').config();

// Importa a classe Pool do pacote 'pg' (node-postgres)
const { Pool } = require('pg');

// Cria uma nova instância do Pool de conexões.
// O Pool gerencia múltiplas conexões de clientes ao banco de dados para você.
// As credenciais são as mesmas usadas no seu arquivo index.js.
// É uma boa prática usar variáveis de ambiente para dados sensíveis.
const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_DATABASE || 'seuconsultor_db',
  password: process.env.DB_PASSWORD || 'ph368g571',
  port: process.env.DB_PORT || 5432,
});

// Define as consultas SQL para criar as tabelas.
// Usamos "CREATE TABLE IF NOT EXISTS" para evitar erros se o script for executado mais de uma vez.
const createTablesQueries = [
  `
    CREATE TABLE IF NOT EXISTS protecao_invalidez (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        nome VARCHAR(255) NOT NULL,
        cobertura NUMERIC(15, 2) NOT NULL DEFAULT 0,
        observacoes TEXT,
        criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS protecao_despesas_futuras (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        nome VARCHAR(255) NOT NULL,
        ano_inicio INTEGER NOT NULL,
        valor_mensal NUMERIC(15, 2) NOT NULL DEFAULT 0,
        prazo_meses INTEGER NOT NULL,
        criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `,
  `
    CREATE TABLE IF NOT EXISTS protecao_patrimonial (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES usuarios(id) ON DELETE CASCADE,
        nome VARCHAR(255) NOT NULL,
        empresa VARCHAR(255),
        data_vencimento DATE,
        valor NUMERIC(15, 2) NOT NULL DEFAULT 0,
        criado_em TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `
];

// Função assíncrona para executar as consultas de criação de tabelas.
const setupDatabase = async () => {
  console.log('Iniciando a configuração do banco de dados...');
  
  // Pega um cliente do pool de conexões.
  const client = await pool.connect();
  
  try {
    // Itera sobre cada consulta SQL no array
    for (const query of createTablesQueries) {
      // Extrai o nome da tabela da consulta para usar na mensagem de log.
      const tableName = query.match(/CREATE TABLE IF NOT EXISTS (\w+)/)[1];
      
      // Executa a consulta
      await client.query(query);
      
      // Imprime uma mensagem de sucesso
      console.log(`✅ Tabela '${tableName}' verificada/criada com sucesso.`);
    }
    
    console.log('\nConfiguração do banco de dados concluída com sucesso!');
    
  } catch (error) {
    // Se ocorrer um erro, imprime a mensagem de erro.
    console.error('❌ Erro durante a configuração do banco de dados:', error);
    
  } finally {
    // Garante que a conexão com o cliente seja liberada de volta para o pool,
    // independentemente de ter ocorrido um erro ou não.
    client.release();
    
    // Fecha o pool de conexões, encerrando o script.
    pool.end();
  }
};

// Chama a função para iniciar o processo.
setupDatabase();