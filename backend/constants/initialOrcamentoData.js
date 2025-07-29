const initialOrcamentoData = [
    {
        nome: 'Receitas',
        tipo: 'receita',
        subItens: [
            { nome: 'Salário Principal', sugerido: 0, categoria_planejamento: 'Renda Fixa' },
            { nome: 'Salário (Cônjuge)', sugerido: 0, categoria_planejamento: 'Renda Fixa' },
            { nome: 'Renda Extra / Freelance', sugerido: 0, categoria_planejamento: 'Renda Variável' },
            { nome: '13º Salário / Férias', sugerido: 0, categoria_planejamento: 'Renda Extra' },
            { nome: 'Aluguéis Recebidos', sugerido: 0, categoria_planejamento: 'Renda Passiva' },
            { nome: 'Outras Receitas', sugerido: 0, categoria_planejamento: 'Outras' }
        ]
    },
    {
        nome: 'Investimentos',
        tipo: 'despesa',
        subItens: [
            { nome: 'Aporte - Renda Fixa', sugerido: 0, categoria_planejamento: 'Investimento' },
            { nome: 'Aporte - Renda Variável', sugerido: 0, categoria_planejamento: 'Investimento' },
            { nome: 'Previdência Privada', sugerido: 0, categoria_planejamento: 'Investimento' },
            { nome: 'Outros Investimentos', sugerido: 0, categoria_planejamento: 'Investimento' }
        ]
    },
    {
        nome: 'Moradia',
        tipo: 'despesa',
        subItens: [
            { nome: 'Aluguel / Prestação Imóvel', sugerido: 0, categoria_planejamento: 'Habitação' },
            { nome: 'Condomínio', sugerido: 0, categoria_planejamento: 'Habitação' },
            { nome: 'IPTU', sugerido: 0, categoria_planejamento: 'Impostos' },
            { nome: 'Conta de Energia', sugerido: 0, categoria_planejamento: 'Utilities' },
            { nome: 'Conta de Água e Esgoto', sugerido: 0, categoria_planejamento: 'Utilities' },
            { nome: 'Gás', sugerido: 0, categoria_planejamento: 'Utilities' },
            { nome: 'Internet / TV / Telefone', sugerido: 0, categoria_planejamento: 'Comunicação' },
            { nome: 'Manutenção e Reparos', sugerido: 0, categoria_planejamento: 'Manutenção' }
        ]
    },
    {
        nome: 'Transporte',
        tipo: 'despesa',
        subItens: [
            { nome: 'Combustível', sugerido: 0, categoria_planejamento: 'Transporte' },
            { nome: 'Transporte Público / App', sugerido: 0, categoria_planejamento: 'Transporte' },
            { nome: 'Seguro do Veículo', sugerido: 0, categoria_planejamento: 'Seguros' },
            { nome: 'IPVA / Licenciamento', sugerido: 0, categoria_planejamento: 'Impostos' },
            { nome: 'Manutenção do Veículo', sugerido: 0, categoria_planejamento: 'Manutenção' },
            { nome: 'Estacionamento / Pedágio', sugerido: 0, categoria_planejamento: 'Transporte' }
        ]
    },
    {
        nome: 'Alimentação',
        tipo: 'despesa',
        subItens: [
            { nome: 'Supermercado', sugerido: 0, categoria_planejamento: 'Alimentação' },
            { nome: 'Restaurantes e Lanches', sugerido: 0, categoria_planejamento: 'Lazer' },
            { nome: 'Delivery / iFood', sugerido: 0, categoria_planejamento: 'Lazer' },
            { nome: 'Padaria', sugerido: 0, categoria_planejamento: 'Alimentação' }
        ]
    },
    {
        nome: 'Saúde',
        tipo: 'despesa',
        subItens: [
            { nome: 'Plano de Saúde', sugerido: 0, categoria_planejamento: 'Saúde' },
            { nome: 'Farmácia', sugerido: 0, categoria_planejamento: 'Saúde' },
            { nome: 'Consultas e Terapias', sugerido: 0, categoria_planejamento: 'Saúde' },
            { nome: 'Academia / Atividade Física', sugerido: 0, categoria_planejamento: 'Saúde' }
        ]
    },
    {
        nome: 'Despesas Pessoais',
        tipo: 'despesa',
        subItens: [
            { nome: 'Cuidados Pessoais (Salão, etc)', sugerido: 0, categoria_planejamento: 'Cuidados Pessoais' },
            { nome: 'Vestuário e Acessórios', sugerido: 0, categoria_planejamento: 'Compras' },
            { nome: 'Hobbies', sugerido: 0, categoria_planejamento: 'Lazer' },
            { nome: 'Educação (Cursos, Livros)', sugerido: 0, categoria_planejamento: 'Educação' }
        ]
    },
    {
        nome: 'Lazer e Entretenimento',
        tipo: 'despesa',
        subItens: [
            { nome: 'Assinaturas (Streaming, etc)', sugerido: 0, categoria_planejamento: 'Assinaturas' },
            { nome: 'Viagens', sugerido: 0, categoria_planejamento: 'Viagens' },
            { nome: 'Passeios e Eventos', sugerido: 0, categoria_planejamento: 'Lazer' },
            { nome: 'Presentes', sugerido: 0, categoria_planejamento: 'Presentes' }
        ]
    },
    {
        nome: 'Filhos e Dependentes',
        tipo: 'despesa',
        subItens: [
            { nome: 'Escola / Mensalidade', sugerido: 0, categoria_planejamento: 'Educação' },
            { nome: 'Material Escolar', sugerido: 0, categoria_planejamento: 'Educação' },
            { nome: 'Mesada', sugerido: 0, categoria_planejamento: 'Outras' },
            { nome: 'Brinquedos e Roupas', sugerido: 0, categoria_planejamento: 'Compras' }
        ]
    },
    {
        nome: 'Outras Despesas',
        tipo: 'despesa',
        subItens: [
            { nome: 'Serviços (Lavanderia, etc)', sugerido: 0, categoria_planejamento: 'Serviços' },
            { nome: 'Empréstimos / Financiamentos', sugerido: 0, categoria_planejamento: 'Dívidas' },
            { nome: 'Doações', sugerido: 0, categoria_planejamento: 'Doações' },
            { nome: 'Despesas não previstas', sugerido: 0, categoria_planejamento: 'Outras' }
        ]
    }
];

module.exports = { initialOrcamentoData };