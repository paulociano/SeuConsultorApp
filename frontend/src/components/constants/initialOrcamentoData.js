import { DollarSign, Home, ShoppingCart, Briefcase, Shield } from "lucide-react";

export const initialOrcamentoData = [
    { id: 'renda', nome: 'Renda', tipo: 'receita', icon: DollarSign, subItens: [ { id: 1, nome: 'Salário', atual: 7000, sugerido: 7000, categoriaId: null } ] },
    { 
        id: 'fixo', // O ID pode continuar como 'fixo' ou mudar para 'despesas-fixas'
        nome: 'Despesas Fixas', // <-- NOME ALTERADO AQUI
        tipo: 'despesa', 
        icon: Home, 
        // Adicionadas as categorias de Moradia e Serviços aqui
        subItens: [ 
            { id: 2, nome: 'Aluguel', atual: 1500, sugerido: 1500, categoriaId: 'moradia' }, 
            { id: 3, nome: 'Energia', atual: 250, sugerido: 220, categoriaId: 'moradia' },
            // Adicione mais itens fixos aqui se necessário
        ] 
    },
    { 
        id: 'variavel', 
        nome: 'Despesas Variáveis', 
        tipo: 'despesa', 
        icon: ShoppingCart, 
        // A lógica aqui agora permite adicionar qualquer despesa variável com uma categoria
        subItens: [
             { id: 4, nome: 'Supermercado', atual: 800, sugerido: 750, categoriaId: 'alimentacao' },
             { id: 5, nome: 'Gasolina', atual: 300, sugerido: 350, categoriaId: 'transporte' }
        ]
    },
    { id: 'investimento', nome: 'Investimento', tipo: 'despesa', icon: Briefcase, subItens: [ { id: 6, nome: 'Ações', atual: 500, sugerido: 700, categoriaId: 'outros' } ] },
    { id: 'protecao', nome: 'Proteção', tipo: 'despesa', icon: Shield, subItens: [ { id: 7, nome: 'Seguro de Vida', atual: 100, sugerido: 100, categoriaId: 'outros' } ] },
];