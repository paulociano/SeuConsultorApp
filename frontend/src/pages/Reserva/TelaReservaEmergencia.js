import React, { useState, useMemo } from 'react';
import Card from '../../components/Card/Card';
import { mockInvestimentos } from '../../components/mocks/mockInvestimentos';
import { formatCurrency } from '../../utils/formatters';
import { Target } from 'lucide-react';

const TelaReservaEmergencia = ({ orcamentoCalculos }) => {
    const [cenario, setCenario] = useState('cenario1');
    const [mesesReservaIdeal, setMesesReservaIdeal] = useState(6);
    const [investimentosSelecionados, setInvestimentosSelecionados] = useState({});

    const baseCalculo = useMemo(() => {
        const { fixos, variaveis, investimentos, renda } = orcamentoCalculos.categorias;
        switch (cenario) {
            case 'cenario1': return fixos + (variaveis * 0.7);
            case 'cenario2': return fixos + variaveis;
            case 'cenario3': return fixos + variaveis + investimentos;
            case 'cenario4': return renda;
            default: return 0;
        }
    }, [cenario, orcamentoCalculos]);

    const reservaMinima = baseCalculo * 3;
    const reservaIdeal = baseCalculo * mesesReservaIdeal;

    const handleSelectInvestimento = (invId) => {
        setInvestimentosSelecionados(prev => ({...prev, [invId]: !prev[invId]}));
    };

    const totalAcumulado = useMemo(() => {
        return mockInvestimentos.reduce((acc, inv) => {
            if(investimentosSelecionados[inv.id]) {
                return acc + inv.valor;
            }
            return acc;
        }, 0);
    }, [investimentosSelecionados]);

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
                    <select value={cenario} onChange={(e) => setCenario(e.target.value)} className="w-full bg-[white] text-slate-800 dark:text-slate-800 rounded-md px-2 py-2 border border-[#3e388b] focus:outline-none focus:ring-1 focus:ring-[#00d971]">
                        <option value="cenario1">Fixos + 70% dos Variáveis</option>
                        <option value="cenario2">Fixos + Variáveis</option>
                        <option value="cenario3">Fixos + Variáveis + Investimentos</option>
                        <option value="cenario4">Renda</option>
                    </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                    <div className="bg-[#201b5d]/50 p-3 rounded-lg">
                        <p className="text-sm text-slate-800 dark:text-white">Reserva Mínima (3 meses)</p>
                        <p className="text-xl font-bold text-white mt-1">{formatCurrency(reservaMinima)}</p>
                    </div>
                    <div className="bg-[#201b5d]/50 p-3 rounded-lg">
                        <div className="flex justify-center items-center gap-2">
                             <p className="text-sm text-slate-800 dark:text-white">Reserva Ideal</p>
                             <select value={mesesReservaIdeal} onChange={e => setMesesReservaIdeal(parseInt(e.target.value))} className="bg-transparent text-white border-none focus:ring-0 p-0 text-sm">
                                {[...Array(22).keys()].map(i => <option key={i+3} value={i+3}>{i+3} meses</option>)}
                             </select>
                        </div>
                        <p className="text-2xl font-bold text-[#00d971] mt-1">{formatCurrency(reservaIdeal)}</p>
                    </div>
                </div>
            </Card>
            <Card>
                 <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Composição da Reserva</h2>
                 <p className="text-sm text-slate-800 dark:text-white mb-2">Selecione os investimentos que compõem sua reserva de emergência:</p>
                 <div className="space-y-2 text-sm">
                    {mockInvestimentos.map(inv => (
                        <label key={inv.id} className="flex items-center justify-between p-2 bg-[#201b5d]/50 rounded-lg cursor-pointer">
                            <div className="flex items-center gap-3">
                                <input type="checkbox" checked={!!investimentosSelecionados[inv.id]} onChange={() => handleSelectInvestimento(inv.id)} className="form-checkbox h-4 w-4 text-[#00d971] bg-gray-700 border-gray-600 rounded focus:ring-[#00d971]" />
                                <span className="text-white">{inv.nome}</span>
                            </div>
                            <span className="font-semibold text-slate-800 dark:text-white">{formatCurrency(inv.valor)}</span>
                        </label>
                    ))}
                 </div>
                 <div className="mt-6">
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-sm text-slate-800 dark:text-white">Progresso da Reserva Ideal</p>
                        <p className="text-sm font-bold text-[#00d971]">{formatCurrency(totalAcumulado)} / {formatCurrency(reservaIdeal)}</p>
                    </div>
                    <div className="w-full bg-[#201b5d] rounded-full h-4">
                        <div className="bg-[#00d971] h-4 rounded-full text-xs text-black flex items-center justify-center font-bold" style={{ width: `${Math.min(progresso, 100)}%` }}>
                           {progresso.toFixed(1)}%
                        </div>
                    </div>
                 </div>
            </Card>
        </div>
    );
};

export default TelaReservaEmergencia;