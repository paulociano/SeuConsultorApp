const pool = require('../config/db');
// A constante 'initialOrcamentoData' era importada do frontend.
// Para um backend mais robusto, é melhor tê-la aqui.
const { initialOrcamentoData } = require('../constants/initialOrcamentoData');

const criarOrcamentoPadraoParaUsuario = async (userId) => {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        for (const categoria of initialOrcamentoData) {
            const categoriaResult = await client.query(
                'INSERT INTO orcamento_categorias (nome, tipo, user_id) VALUES ($1, $2, $3) RETURNING id',
                [categoria.nome, categoria.tipo, userId]
            );
            const categoriaId = categoriaResult.rows[0].id;
            for (const item of categoria.subItens) {
                await client.query(
                    'INSERT INTO orcamento_itens (nome, valor_planejado, valor_atual, categoria_id, user_id) VALUES ($1, $2, $3, $4, $5)',
                    [item.nome, item.sugerido, 0, categoriaId, userId]
                );
            }
        }
        await client.query('COMMIT');
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Erro ao criar orçamento padrão:", error); // Adicionado log de erro
        throw error;
    } finally {
        client.release();
    }
};

module.exports = { criarOrcamentoPadraoParaUsuario };