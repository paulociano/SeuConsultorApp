import React, { useState, useMemo, useEffect } from 'react';
import Card from '../../components/Card/Card';
import { formatCurrency } from '../../utils/formatters';
import { Target } from 'lucide-react';
// 1. Importar todas as stores necessárias
import { usePatrimonioStore } from '../../stores/usePatrimonioStore';
import { useReservaStore } from '../../stores/useReservaStore';
import { useOrcamentoStore } from '../../stores/useOrcamentoStore';


/**
 * Tela para cálculo e composição da Reserva de Emergência.
 * Este componente agora é totalmente autônomo, buscando todos os dados de suas stores.
 */
// 2. O componente não recebe mais props
const TelaReservaEmergencia = () => {
    // 3. Aceder ao estado e às ações das stores necessárias
    const { ativos, isLoading: isLoadingPatrimonio, fetchPatrimonio } = usePatrimonioStore();
    const { investimentosSelecionados, toggleInvestimento } = useReservaStore();
    const { categorias: orcamento, isLoading: isLoadingOrcamento, fetchOrcamento } = useOrcamentoStore();

    // Estados locais que controlam apenas a UI desta tela (sem alteração)
    const [cenario, setCenario] = useState('cenario1');
    const [mesesReservaIdeal, setMesesReservaIdeal] = useState(6);

    // 4. Chamar as funções para carregar os dados de todas as stores necessárias
    useEffect(() => {
        fetchPatrimonio();
        fetchOrcamento();
    }, [fetchPatrimonio, fetchOrcamento]);

    const investimentosDisponiveis = useMemo(() => 
        ativos.filter(ativo => ativo.tipo === 'Investimentos'),
        [ativos]
    );

    // O useMemo agora usa o 'orcamento' vindo da useOrcamentoStore
    const baseCalculo = useMemo(() => {
        if (!orcamento || orcamento.length === 0) return 0;
        
        const custoDeVida = orcamento
            .filter(c => c.nome.toLowerCase().includes('fixa') || c.nome.toLowerCase().includes('variável'))
            .reduce((acc, cat) => acc + cat.subItens.reduce((subAcc, item) => subAcc + (item.atual || 0), 0), 0);
        
        const totalReceitas = orcamento
            .filter(c => c.tipo === 'receita')
            .reduce((acc, cat) => acc + cat.subItens.reduce((subAcc, item) => subAcc + (item.atual || 0), 0), 0);

        switch (cenario) {
            case 'cenario1': return custoDeVida;
            case 'cenario2': return custoDeVida * 0.7;
            case 'cenario3': return totalReceitas;
            default: return custoDeVida;
        }
    }, [orcamento, cenario]);

    const reservaIdeal = useMemo(() => {
        return baseCalculo * mesesReservaIdeal;
    }, [baseCalculo, mesesReservaIdeal]);

    // O useMemo agora usa 'investimentosSelecionados' vindo da useReservaStore
    const totalAcumulado = useMemo(() => {
        return investimentosDisponiveis
            .filter(inv => investimentosSelecionados[inv.id])
            .reduce((acc, inv) => acc + parseFloat(inv.valor), 0);
    }, [investimentosDisponiveis, investimentosSelecionados]);

    const progresso = useMemo(() => {
        return reservaIdeal > 0 ? (totalAcumulado / reservaIdeal) * 100 : 0;
    }, [totalAcumulado, reservaIdeal]);

    // 5. O handler agora chama a ação 'toggleInvestimento' da store
    const handleCheckboxChange = (investimentoId) => {
        toggleInvestimento(investimentoId);
    };

    // 6. A lógica de carregamento agora considera os estados de loading do patrimônio e do orçamento
    if (isLoadingOrcamento || isLoadingPatrimonio) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00d971]"></div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Card>
                <div className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                        <Target className="text-[#00d971]" size={24} />
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white">Cálculo da Reserva de Emergência</h2>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Coluna de Configuração */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Cenário para Cálculo</label>
                                <select value={cenario} onChange={(e) => setCenario(e.target.value)} className="w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]">
                                    <option value="cenario1">Custo de Vida Essencial</option>
                                    <option value="cenario2">Custo de Vida Reduzido (70%)</option>
                                    <option value="cenario3">Renda Total</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Meses de Cobertura ({mesesReservaIdeal})</label>
                                <input 
                                    type="range" 
                                    min="3" 
                                    max="12" 
                                    step="1" 
                                    value={mesesReservaIdeal} 
                                    onChange={(e) => setMesesReservaIdeal(Number(e.target.value))}
                                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-[#00d971]"
                                />
                            </div>
                        </div>

                        {/* Coluna de Resultados */}
                        <div className="bg-slate-100 dark:bg-[#201b5d]/80 p-4 rounded-lg space-y-3 text-center">
                            <div>
                                <p className="text-sm text-slate-600 dark:text-gray-300">Base de Cálculo Mensal</p>
                                <p className="text-2xl font-bold text-slate-800 dark:text-white">{formatCurrency(baseCalculo)}</p>
                            </div>
                            <div className="border-t border-slate-300 dark:border-[#3e388b] my-2"></div>
                            <div>
                                <p className="text-sm text-slate-600 dark:text-gray-300">Reserva de Emergência Ideal</p>
                                <p className="text-3xl font-bold text-[#00d971]">{formatCurrency(reservaIdeal)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </Card>

            <Card>
                 <div className="p-6">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Composição da Reserva Atual</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">Selecione os investimentos de alta liquidez que compõem sua reserva de emergência.</p>
                    
                    {investimentosDisponiveis.length > 0 ? (
                        investimentosDisponiveis.map(inv => (
                            <label key={inv.id} className="flex items-center justify-between p-3 hover:bg-slate-100 dark:hover:bg-[#2a246f]/50 rounded-lg cursor-pointer">
                                <div className="flex items-center gap-3">
                                    <input 
                                        type="checkbox"
                                        checked={!!investimentosSelecionados[inv.id]}
                                        onChange={() => handleCheckboxChange(inv.id)}
                                        className="form-checkbox h-5 w-5 text-[#00d971] bg-gray-700 border-gray-600 rounded focus:ring-offset-0 focus:ring-2 focus:ring-[#00d971]"
                                    />
                                    <span className="text-slate-800 dark:text-white">{inv.nome}</span>
                                </div>
                                <span className="font-semibold text-slate-800 dark:text-white">{formatCurrency(inv.valor)}</span>
                            </label>
                        ))
                    ) : (
                        <p className="text-center text-gray-500 dark:text-gray-400 p-4 text-xs">Nenhum investimento adicionado. Adicione seus investimentos na tela de Patrimônio.</p>
                    )}
                 </div>
                 <div className="p-6 border-t border-slate-200 dark:border-slate-700">
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-sm text-slate-600 dark:text-white">Progresso da Reserva Ideal</p>
                        <p className="text-sm font-bold text-[#00d971]">{formatCurrency(totalAcumulado)} / {formatCurrency(reservaIdeal)}</p>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-[#201b5d] rounded-full h-4">
                        <div className="bg-[#00d971] h-4 rounded-full text-xs text-black flex items-center justify-center font-bold" style={{ width: `${Math.min(progresso, 100)}%` }}>
                           {progresso > 10 ? `${progresso.toFixed(0)}%` : ''}
                        </div>
                    </div>
                 </div>
            </Card>
        </div>
    );
};

export default TelaReservaEmergencia;