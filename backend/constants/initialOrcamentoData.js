const initialOrcamentoData = [
  {
    nome: 'Receitas',
    tipo: 'receita',
    subItens: [{ nome: 'Salário Principal', sugerido: 0, categoria_planejamento: 'Renda Fixa' }],
  },
  {
    nome: 'Gastos Fixos Essenciais',
    tipo: 'despesa',
    subItens: [
      {
        nome: 'Aluguel / Condomínio / IPTU',
        sugerido: 0,
        categoria_planejamento: 'Contas Residenciais',
      },
      { nome: 'Energia', sugerido: 0, categoria_planejamento: 'Contas Residenciais' },
      { nome: 'Água', sugerido: 0, categoria_planejamento: 'Contas Residenciais' },
      { nome: 'Gás', sugerido: 0, categoria_planejamento: 'Contas Residenciais' },
    ],
  },
  {
    nome: 'Gastos Fixos',
    tipo: 'despesa',
    subItens: [
      { nome: 'Assinaturas', sugerido: 0, categoria_planejamento: 'Assinaturas' },
      { nome: 'Internet', sugerido: 0, categoria_planejamento: 'Contas residenciais' },
      { nome: 'Consultoria', sugerido: 0, categoria_planejamento: 'Serviços' },
      { nome: 'Academia', sugerido: 0, categoria_planejamento: 'Bem-estar' },
    ],
  },
  {
    nome: 'Gastos Variáveis',
    tipo: 'despesa',
    subItens: [
      { nome: 'Alimentação', sugerido: 0, categoria_planejamento: 'Alimentação' },
      { nome: 'Supermercado', sugerido: 0, categoria_planejamento: 'Alimentação' },
      { nome: 'Lazer', sugerido: 0, categoria_planejamento: 'Lazer' },
      { nome: 'Transporte', sugerido: 0, categoria_planejamento: 'Transporte' },
      { nome: 'Combustível', sugerido: 0, categoria_planejamento: 'Transporte' },
      { nome: 'Compras', sugerido: 0, categoria_planejamento: 'Compras' },
      { nome: 'Estética e Beleza', sugerido: 0, categoria_planejamento: 'Estética' },
    ],
  },
  {
    nome: 'Investimentos',
    tipo: 'despesa',
    subItens: [
      { nome: 'Reserva de Emergência', sugerido: 0, categoria_planejamento: 'Investimentos' },
      { nome: 'Aposentadoria', sugerido: 0, categoria_planejamento: 'Investimentos' },
      { nome: 'Outros', sugerido: 0, categoria_planejamento: 'Investimentos' },
    ],
  },
  {
    nome: 'Proteção',
    tipo: 'despesa',
    subItens: [
      { nome: 'Seguro de Vida', sugerido: 0, categoria_planejamento: 'Segurança' },
      { nome: 'Plano de Saúde', sugerido: 0, categoria_planejamento: 'Segurança' },
    ],
  },
];

module.exports = { initialOrcamentoData };
