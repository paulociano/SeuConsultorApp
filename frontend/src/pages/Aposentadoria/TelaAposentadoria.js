import React, { useState, useMemo, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Card from '../../components/Card/Card';
import { PlusCircle, Save } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { v4 as uuidv4 } from 'uuid';

// O componente agora recebe os dados iniciais e uma função para salvar
const TelaAposentadoria = ({ dadosIniciais, onSave }) => {
    // Os estados agora são inicializados com os dados do backend ou com valores padrão
    const [idadeAtual, setIdadeAtual] = useState(30);
    const [idadeAposentadoria, setIdadeAposentadoria] = useState(65);
    const [patrimonioInicial, setPatrimonioInicial] = useState(50000);
    const [rendaDesejada, setRendaDesejada] = useState(5000);
    const [rentabilidadeAnual, setRentabilidadeAnual] = useState(8);
    const [tipoPrevidencia, setTipoPrevidencia] = useState('VGBL');
    const [aportes, setAportes] = useState([{ id: uuidv4(), ano: 1, valor: 1000 }]);
    const [aporteRestante, setAporteRestante] = useState(0);

    // Este useEffect sincroniza o estado do componente com os dados que vêm do backend
    useEffect(() => {
        if (dadosIniciais) {
            setIdadeAtual(dadosIniciais.idadeAtual || 30);
            setIdadeAposentadoria(dadosIniciais.idadeAposentadoria || 65);
            setPatrimonioInicial(dadosIniciais.patrimonioInicial || 50000);
            setRendaDesejada(dadosIniciais.rendaDesejada || 5000);
            setRentabilidadeAnual(dadosIniciais.rentabilidadeAnual || 8);
            setTipoPrevidencia(dadosIniciais.tipoPrevidencia || 'VGBL');
            // Garante que os aportes sejam um array válido com IDs únicos
            setAportes(dadosIniciais.aportes?.map(a => ({...a, id: a.id || uuidv4()})) || [{ id: uuidv4(), ano: 1, valor: 1000 }]);
            setAporteRestante(dadosIniciais.aporteRestante || 0);
        }
    }, [dadosIniciais]);

    // LÓGICA DE CÁLCULO CORRIGIDA
    const { projectionData, capitalNecessario, valorAcumulado } = useMemo(() => {
        const anosContribuicao = Math.max(0, idadeAposentadoria - idadeAtual);
        const taxaRendimentoAnual = rentabilidadeAnual / 100;
        
        const data = [];
        let acumulado = patrimonioInicial;

        // --- Fase de Acumulação ---
        data.push({ idade: idadeAtual, valor: acumulado });
        for (let i = 1; i <= anosContribuicao; i++) {
            const anoAtualContribuicao = i;
            const aporteEspecifico = aportes.find(a => a.ano === anoAtualContribuicao);
            const aporteDoAno = (aporteEspecifico ? aporteEspecifico.valor : aporteRestante) * 12;
            
            // O rendimento é aplicado sobre o saldo do início do ano + os aportes feitos durante o ano
            acumulado = (acumulado + aporteDoAno) * (1 + taxaRendimentoAnual);
            data.push({ idade: idadeAtual + i, valor: Math.max(0, acumulado) });
        }
        const valorFinalAcumulado = acumulado;

        // --- Fase de Retirada (Decumulação) ---
        let saldoRetirada = valorFinalAcumulado;
        const retiradaAnual = rendaDesejada * 12;
        const idadeMaxima = 100; // Define a idade máxima para a projeção

        for (let i = idadeAposentadoria + 1; i <= idadeMaxima; i++) {
            if (saldoRetirada <= 0) {
                // Se o dinheiro acabou, preenche o resto com 0 para completar o gráfico
                data.push({ idade: i, valor: 0 });
                continue;
            }
            
            // O saldo remanescente rende no início do ano
            const saldoComRendimento = saldoRetirada * (1 + taxaRendimentoAnual);
            // A retirada anual é feita do saldo que já rendeu
            saldoRetirada = saldoComRendimento - retiradaAnual;

            data.push({ idade: i, valor: Math.max(0, saldoRetirada) });
        }

        // --- Cálculo do Capital Necessário (para referência) ---
        const taxaIR = 0.10;
        let capitalNecessarioCalc = 0;
        if(rentabilidadeAnual > 0) {
            const rendimentoLiquidoAnual = taxaRendimentoAnual * (1 - taxaIR);
            if (rendimentoLiquidoAnual > 0) {
                 capitalNecessarioCalc = retiradaAnual / rendimentoLiquidoAnual;
            }
        }
        
        return { projectionData: data, capitalNecessario: capitalNecessarioCalc, valorAcumulado: valorFinalAcumulado };
    }, [idadeAtual, idadeAposentadoria, patrimonioInicial, aportes, aporteRestante, rendaDesejada, rentabilidadeAnual]);


    const handleAporteChange = (id, novoValor) => {
        setAportes(prev => prev.map(a => a.id === id ? {...a, valor: parseFloat(novoValor) || 0} : a));
    };

    const addAporteAno = () => {
        setAportes(prev => {
            const proximoAno = prev.length > 0 ? Math.max(...prev.map(a => a.ano)) + 1 : 1;
            const anosContribuicao = idadeAposentadoria - idadeAtual;
            if (proximoAno > anosContribuicao) return prev;
            return [...prev, {id: uuidv4(), ano: proximoAno, valor: prev[prev.length - 1]?.valor || 1000}]
        });
    };
    
    const handleSaveClick = () => {
        const dadosParaSalvar = {
            idadeAtual,
            idadeAposentadoria,
            patrimonioInicial,
            rendaDesejada,
            rentabilidadeAnual,
            tipoPrevidencia,
            aportes,
            aporteRestante
        };
        onSave(dadosParaSalvar);
    };

    const anosRestantes = (idadeAposentadoria - idadeAtual) - aportes.length;

    return (
        <div className="max-w-6xl mx-auto">
             <div className="flex justify-end mb-4">
                <button 
                    onClick={handleSaveClick} 
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-[#00d971] rounded-lg hover:brightness-90 transition-all"
                >
                    <Save size={16} />
                    Salvar Simulação
                </button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className='space-y-4'>
                    <Card>
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Parâmetros Iniciais</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <label className="block font-medium text-slate-800 dark:text-white">Idade Atual</label>
                                <input type="number" value={idadeAtual} onChange={e => setIdadeAtual(parseInt(e.target.value) || 0)} className="mt-1 w-full bg-white dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/>
                            </div>
                             <div>
                                <label className="block font-medium text-slate-800 dark:text-white">Idade Aposentadoria</label>
                                <input type="number" value={idadeAposentadoria} onChange={e => setIdadeAposentadoria(parseInt(e.target.value) || 0)} className="mt-1 w-full bg-white dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/>
                            </div>
                             <div>
                                <label className="block font-medium text-slate-800 dark:text-white">Patrimônio Inicial</label>
                                <input type="number" value={patrimonioInicial} onChange={e => setPatrimonioInicial(parseFloat(e.target.value) || 0)} className="mt-1 w-full bg-white dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/>
                            </div>
                            <div>
                                <label className="block font-medium text-slate-800 dark:text-white">Renda Mensal Desejada</label>
                                <input type="number" value={rendaDesejada} onChange={e => setRendaDesejada(parseFloat(e.target.value) || 0)} className="mt-1 w-full bg-white dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/>
                            </div>
                             <div>
                                <label className="block font-medium text-slate-800 dark:text-white">Rentabilidade Anual (%)</label>
                                <input type="number" value={rentabilidadeAnual} onChange={e => setRentabilidadeAnual(parseFloat(e.target.value) || 0)} className="mt-1 w-full bg-white dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/>
                            </div>
                             <div>
                                <label className="block font-medium text-slate-800 dark:text-white">Tipo de Previdência</label>
                                <select value={tipoPrevidencia} onChange={e => setTipoPrevidencia(e.target.value)} className="mt-1 w-full bg-white dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]">
                                    <option value="VGBL">VGBL</option>
                                    <option value="PGBL">PGBL</option>
                                </select>
                            </div>
                        </div>
                    </Card>
                     <Card>
                        <div className="flex justify-between items-center mb-2">
                             <h2 className="text-lg font-bold text-slate-800 dark:text-white">Plano de Aportes</h2>
                             <button onClick={addAporteAno} disabled={anosRestantes <= 0} className="text-xs flex items-center gap-1 text-[#00d971] hover:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed"><PlusCircle size={14} /> Adicionar Ano</button>
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {aportes.map((aporte) => (
                            <div key={aporte.id} className="flex items-center gap-4 text-sm">
                                <label className="text-slate-800 dark:text-white w-16">Ano {aporte.ano}:</label>
                                <input type="number" value={aporte.valor} onChange={e => handleAporteChange(aporte.id, e.target.value)} className="flex-1 bg-white dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/>
                            </div>
                        ))}
                         {anosRestantes > 0 && (
                            <div className="flex items-center gap-4 text-sm pt-2 border-t border-slate-200 dark:border-[#3e388b]">
                                <label className="text-slate-800 dark:text-white w-28">Restante ({anosRestantes} anos):</label>
                                <input type="number" value={aporteRestante} onChange={e => setAporteRestante(parseFloat(e.target.value) || 0)} className="flex-1 bg-white dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/>
                            </div>
                         )}
                        </div>
                    </Card>
                </div>
                <Card>
                     <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Projeção</h2>
                     <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={projectionData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00d971" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#00d971" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#3e388b" />
                                <XAxis type="number" dataKey="idade" stroke="#a39ee8" tick={{ fontSize: 12 }} domain={[idadeAtual, 100]} allowDataOverflow />
                                <YAxis stroke="#a39ee8" tick={{ fontSize: 12 }} tickFormatter={(value) => new Intl.NumberFormat('pt-BR', { notation: 'compact', compactDisplay: 'short' }).format(value)} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#2a246f', border: '1px solid #3e388b', borderRadius: '0.5rem' }}
                                    labelStyle={{ color: '#ffffff' }}
                                    formatter={(value) => [formatCurrency(value), 'Patrimônio']}
                                />
                                <Area type="monotone" dataKey="valor" stroke="#00d971" fillOpacity={1} fill="url(#colorValor)" />
                            </AreaChart>
                        </ResponsiveContainer>
                     </div>
                     <div className="grid grid-cols-2 gap-4 mt-4 text-center">
                        <div className="bg-slate-100 dark:bg-[#201b5d]/50 p-3 rounded-lg">
                            <p className="text-sm text-slate-600 dark:text-white">Capital Necessário</p>
                            <p className="text-xl font-bold text-slate-800 dark:text-white mt-1">{formatCurrency(capitalNecessario)}</p>
                        </div>
                        <div className="bg-slate-100 dark:bg-[#201b5d]/50 p-3 rounded-lg">
                            <p className="text-sm text-slate-600 dark:text-white">Você terá</p>
                            <p className="text-xl font-bold text-[#00d971] mt-1">{formatCurrency(valorAcumulado)}</p>
                        </div>
                     </div>
                </Card>
            </div>
        </div>
    );
};

export default TelaAposentadoria;
