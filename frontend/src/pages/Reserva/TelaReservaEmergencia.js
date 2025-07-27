import React, { useState, useMemo } from 'react';
import Card from '../../components/Card/Card';
import { formatCurrency } from '../../utils/formatters';
import { Target } from 'lucide-react';

// O componente agora recebe 'orcamento' com os dados detalhados
const TelaReservaEmergencia = ({ orcamento = [], investimentosDisponiveis = [] }) => {
    const [cenario, setCenario] = useState('cenario1');
    const [mesesReservaIdeal, setMesesReservaIdeal] = useState(6);
    const [investimentosSelecionados, setInvestimentosSelecionados] = useState({});

    // Lógica de cálculo da base da reserva foi totalmente refeita
    const baseCalculo = useMemo(() => {
        if (!orcamento || orcamento.length === 0) return 0;

        // Calcula os totais de cada tipo de gasto diretamente dos dados do orçamento
        const totais = orcamento.reduce((acc, categoria) => {
            // Soma o valor 'atual' de todos os sub-itens da categoria
            const totalCategoria = categoria.subItens.reduce((subAcc, item) => subAcc + (item.atual || 0), 0);
            
            const nomeCategoria = categoria.nome.toLowerCase();

            // Classifica o total da categoria com base no seu nome
            if (nomeCategoria.includes('fixa')) {
                acc.fixos += totalCategoria;
            } else if (nomeCategoria.includes('variável')) {
                acc.variaveis += totalCategoria;
            } else if (nomeCategoria.includes('investimento')) {
                acc.investimentos += totalCategoria;
            } else if (categoria.tipo === 'receita') {
                acc.renda += totalCategoria;
            }
            
            return acc;
        }, { fixos: 0, variaveis: 0, investimentos: 0, renda: 0 });

        // Aplica o cenário escolhido sobre os totais calculados
        switch (cenario) {
            case 'cenario1': return totais.fixos + (totais.variaveis * 0.7);
            case 'cenario2': return totais.fixos + totais.variaveis;
            case 'cenario3': return totais.fixos + totais.variaveis + totais.investimentos;
            case 'cenario4': return totais.renda;
            default: return 0;
        }
    }, [cenario, orcamento]); // O cálculo agora depende dos dados detalhados do orçamento

    const reservaMinima = baseCalculo * 3;
    const reservaIdeal = baseCalculo * mesesReservaIdeal;

    const handleSelectInvestimento = (invId) => {
        setInvestimentosSelecionados(prev => ({...prev, [invId]: !prev[invId]}));
    };

    const totalAcumulado = useMemo(() => {
        return investimentosDisponiveis.reduce((acc, inv) => {
            if(investimentosSelecionados[inv.id]) {
                return acc + parseFloat(inv.valor);
            }
            return acc;
        }, 0);
    }, [investimentosSelecionados, investimentosDisponiveis]);

    const progresso = reservaIdeal > 0 ? (totalAcumulado / reservaIdeal) * 100 : 0;

    return (
        <div className="max-w-4xl mx-auto">
            <Card className="mb-4">
                <div className="flex items-center gap-3 mb-4">
                    <Target className="text-[#00d971]" size={24} />
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">Cálculo da Reserva</h2>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-800 dark:text-white mb-2">Selecione o cenário para o cálculo base:</label>
                    <select value={cenario} onChange={(e) => setCenario(e.target.value)} className="w-full bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b] focus:outline-none focus:ring-1 focus:ring-[#00d971]">
                        <option value="cenario1">Despesas Fixas + 70% das Variáveis</option>
                        <option value="cenario2">Despesas Fixas + Variáveis</option>
                        <option value="cenario3">Custo de Vida Total (Fixas + Variáveis + Invest.)</option>
                        <option value="cenario4">Baseado na Renda Total</option>
                    </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                    <div className="bg-slate-100 dark:bg-[#201b5d]/50 p-3 rounded-lg">
                        <p className="text-sm text-slate-600 dark:text-white">Reserva Mínima (3 meses)</p>
                        <p className="text-xl font-bold text-slate-800 dark:text-white mt-1">{formatCurrency(reservaMinima)}</p>
                    </div>
                    <div className="bg-slate-100 dark:bg-[#201b5d]/50 p-3 rounded-lg">
                        <div className="flex justify-center items-center gap-2">
                             <p className="text-sm text-slate-600 dark:text-white">Reserva Ideal</p>
                             <select value={mesesReservaIdeal} onChange={e => setMesesReservaIdeal(parseInt(e.target.value))} className="bg-transparent text-slate-800 dark:text-white border-none focus:ring-0 p-0 text-sm font-medium">
                                {[...Array(22).keys()].map(i => <option key={i+3} value={i+3} className="bg-white dark:bg-slate-700">{i+3} meses</option>)}
                             </select>
                        </div>
                        <p className="text-2xl font-bold text-[#00d971] mt-1">{formatCurrency(reservaIdeal)}</p>
                    </div>
                </div>
            </Card>
            <Card>
                 <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Composição da Reserva</h2>
                 <p className="text-sm text-slate-600 dark:text-white mb-2">Selecione os investimentos que compõem sua reserva de emergência:</p>
                 <div className="space-y-2 text-sm">
                    {investimentosDisponiveis.length > 0 ? (
                        investimentosDisponiveis.map(inv => (
                            <label key={inv.id} className="flex items-center justify-between p-3 bg-slate-100 dark:bg-[#201b5d]/50 rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-[#201b5d]">
                                <div className="flex items-center gap-3">
                                    <input type="checkbox" checked={!!investimentosSelecionados[inv.id]} onChange={() => handleSelectInvestimento(inv.id)} className="form-checkbox h-4 w-4 text-[#00d971] bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-[#00d971]" />
                                    <span className="text-slate-800 dark:text-white">{inv.nome}</span>
                                </div>
                                <span className="font-semibold text-slate-800 dark:text-white">{formatCurrency(inv.valor)}</span>
                            </label>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 p-4 text-xs">Nenhum investimento adicionado. Adicione seus investimentos na tela de Patrimônio.</p>
                    )}
                 </div>
                 <div className="mt-6">
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-sm text-slate-600 dark:text-white">Progresso da Reserva Ideal</p>
                        <p className="text-sm font-bold text-[#00d971]">{formatCurrency(totalAcumulado)} / {formatCurrency(reservaIdeal)}</p>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-[#201b5d] rounded-full h-4">
                        <div className="bg-[#00d971] h-4 rounded-full text-xs text-black flex items-center justify-center font-bold" style={{ width: `${Math.min(progresso, 100)}%` }}>
                           {progresso > 5 ? `${progresso.toFixed(0)}%` : ''}
                        </div>
                    </div>
                 </div>
            </Card>
        </div>
    );
};

export default TelaReservaEmergencia;
