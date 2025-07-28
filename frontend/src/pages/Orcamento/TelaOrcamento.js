import React, { useState, useMemo, useEffect } from 'react';
import Card from '../../components/Card/Card';
import { formatCurrency } from '../../utils/formatters';
import { toast } from 'sonner';
import { Edit, Trash2, PlusCircle, Tag, TrendingDown, TrendingUp, CheckCircle2, AlertTriangle, ChevronsUpDown } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, Legend } from 'recharts';
import { CATEGORIAS_FLUXO } from '../../components/constants/Categorias';
import { useOrcamentoStore } from '../../stores/useOrcamentoStore'; // 1. Importar a store

// --- Sub-componente do Modal (sem alterações) ---
const ModalItemOrcamento = ({ isOpen, onClose, onSave, context }) => {
    const { mode, category, item } = context;
    const [nome, setNome] = useState('');
    const [sugerido, setSugerido] = useState('');
    const [atual, setAtual] = useState('');
    const [categoriaPlanejamento, setCategoriaPlanejamento] = useState('');

    useEffect(() => {
        if (isOpen && item) {
            setNome(item.nome || '');
            setSugerido(item.sugerido?.toString() || '0');
            setAtual(item.atual?.toString() || '0');
            setCategoriaPlanejamento(item.categoria_planejamento || '');
        } else if (isOpen) {
            setNome('');
            setSugerido('0');
            setAtual('0');
            setCategoriaPlanejamento('');
        }
    }, [isOpen, item]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const valorSugeridoFloat = parseFloat(sugerido);
        const valorAtualFloat = parseFloat(atual);

        if (!nome || isNaN(valorSugeridoFloat) || isNaN(valorAtualFloat)) {
            toast.error("Por favor, preencha todos os campos com valores válidos.");
            return;
        }
        if (category.tipo === 'despesa' && !categoriaPlanejamento) {
            toast.error("Para despesas, a categoria de planejamento é obrigatória.");
            return;
        }

        onSave({
            nome,
            sugerido: valorSugeridoFloat,
            atual: valorAtualFloat,
            id: item?.id,
            categoria_planejamento: category.tipo === 'despesa' ? categoriaPlanejamento : null
        });
        onClose();
    };
    
    const opcoesCategoria = Object.entries(CATEGORIAS_FLUXO).map(([id, { label }]) => ({ id, label }));

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-[#201b5d] rounded-xl shadow-lg p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
                    {mode === 'edit' ? 'Editar Item' : 'Adicionar Item'} em "{category.nome}"
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Nome do Item</label>
                        <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Meta Planejada (Sugerido)</label>
                        <input type="number" value={sugerido} onChange={(e) => setSugerido(e.target.value)} required step="0.01" className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Gasto Atual (Realizado)</label>
                        <input type="number" value={atual} onChange={(e) => setAtual(e.target.value)} required step="0.01" className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/>
                    </div>
                    {category.tipo === 'despesa' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Categoria (para Planejamento)</label>
                            <select value={categoriaPlanejamento} onChange={(e) => setCategoriaPlanejamento(e.target.value)} required className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]">
                                <option value="" disabled>Selecione uma categoria</option>
                                {opcoesCategoria.map(opt => (
                                    <option key={opt.id} value={opt.id}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    )}
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300">Cancelar</button>
                        <button type="submit" className="px-6 py-2 text-sm font-medium text-black bg-[#00d971] rounded-lg hover:brightness-90">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Sub-componente para o Resumo do Orçamento (sem alterações funcionais) ---
const OrcamentoResumo = ({ calculos, chartData }) => {
    const { totalReceitas, totalDespesas, saldoAtual } = calculos;
    const COLORS = {
        'Fixos': '#ef4444',
        'Variáveis': '#f97316',
        'Investimentos': '#3b82f6',
        'Proteção': '#a855f7',
        'Outros': '#64748b'
    };

    const renderLegend = (props) => {
        const { payload } = props;
        return (
            <ul className="flex flex-col gap-2 text-xs text-slate-600 dark:text-slate-400">
                {payload.map((entry) => {
                    const percentual = totalDespesas.atual > 0 ? (entry.payload.value / totalDespesas.atual) * 100 : 0;
                    return (
                        <li key={`item-${entry.value}`} className="flex items-center justify-between">
                            <div className="flex items-center">
                                <span className="w-3 h-3 mr-2 rounded-sm" style={{ backgroundColor: entry.color }}></span>
                                <span>{entry.value}</span>
                            </div>
                            <span className="font-semibold">{percentual.toFixed(1)}%</span>
                        </li>
                    );
                })}
            </ul>
        );
    };

    return (
        <Card>
            <div className="p-6">
                <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Distribuição das Despesas</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 items-center">
                    <div className="w-full h-48">
                         <ResponsiveContainer width="100%" height="100%">
                             <PieChart>
                                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={70} fill="#8884d8" paddingAngle={5}>
                                    {chartData.map((entry) => (
                                        <Cell key={`cell-${entry.name}`} fill={COLORS[entry.name] || '#8884d8'} />
                                    ))}
                                </Pie>
                                <RechartsTooltip formatter={(value) => formatCurrency(value)} />
                                <Legend content={renderLegend} wrapperStyle={{ right: -20, top: 20, lineHeight: '24px' }} layout="vertical" align="right" verticalAlign="middle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 text-green-500"><TrendingUp size={18}/> <h3 className="font-semibold">Receitas</h3></div>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{formatCurrency(totalReceitas.atual)}</p>
                        </div>
                         <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-lg">
                            <div className="flex items-center gap-2 text-red-500"><TrendingDown size={18}/> <h3 className="font-semibold">Despesas</h3></div>
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{formatCurrency(totalDespesas.atual)}</p>
                        </div>
                        <div className="bg-slate-100 dark:bg-slate-800/50 p-4 rounded-lg col-span-2">
                             <div className="flex items-center gap-2 text-blue-500"><CheckCircle2 size={18}/> <h3 className="font-semibold">Sobra/Déficit do Mês</h3></div>
                             <p className={`text-2xl font-bold ${saldoAtual >= 0 ? 'text-green-500' : 'text-red-500'}`}>{formatCurrency(saldoAtual)}</p>
                        </div>
                    </div>
                </div>
            </div>
        </Card>
    );
};


// --- Sub-componente para a linha de um item do orçamento (sem alterações funcionais) ---
const ItemLinha = ({ item, catTipo, onEdit, onDelete }) => {
    const diferenca = item.sugerido - item.atual;
    const categoriaNome = CATEGORIAS_FLUXO[item.categoria_planejamento]?.label || 'Sem categoria';

    return (
        <div className="grid grid-cols-12 items-center py-2 px-4 gap-4 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700/50">
            <div className="col-span-4 flex flex-col">
                <span className="font-medium text-slate-800 dark:text-slate-200">{item.nome}</span>
                {catTipo === 'despesa' && item.categoria_planejamento && (
                    <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-gray-400">
                        <Tag size={12}/> <span>{categoriaNome}</span>
                    </div>
                )}
            </div>
            <div className="col-span-2 text-right font-mono">{formatCurrency(item.atual)}</div>
            <div className="col-span-2 text-right font-mono">{formatCurrency(item.sugerido)}</div>
            <div className={`col-span-2 text-right font-mono font-semibold flex items-center justify-end gap-1 ${diferenca >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {diferenca >= 0 ? <TrendingDown size={14} /> : <TrendingUp size={14} />}
                {formatCurrency(Math.abs(diferenca))}
            </div>
            <div className="col-span-2 flex items-center justify-end gap-3">
                <button onClick={onEdit} className="text-blue-400 hover:text-blue-600 transition-colors"><Edit size={16}/></button>
                <button onClick={onDelete} className="text-red-500 hover:text-red-700 transition-colors"><Trash2 size={16}/></button>
            </div>
        </div>
    );
}


// --- Sub-componente para a linha da Categoria (sem alterações funcionais) ---
const CategoriaLinha = ({ cat, onToggle, isExpanded }) => {
    const corTexto = cat.tipo === 'receita' ? 'text-green-500' : (cat.tipo === 'protecao' ? 'text-purple-400' : 'text-red-500');
    const progresso = cat.totalSugerido > 0 ? (cat.totalAtual / cat.totalSugerido) * 100 : 0;
    const corProgresso = progresso > 100 ? 'bg-red-500' : 'bg-blue-500';

    return (
        <div className="border-t border-slate-200 dark:border-slate-700">
            <div className="grid grid-cols-12 items-center gap-4 px-4 py-3 hover:bg-slate-100/50 dark:hover:bg-[#3e388b]/20 cursor-pointer" onClick={onToggle}>
                <div className="col-span-4 font-bold text-slate-700 dark:text-white flex items-center gap-2">
                   <ChevronsUpDown size={16} className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                   {cat.nome}
                </div>
                <div className={`col-span-2 text-right font-semibold ${corTexto}`}>{formatCurrency(cat.totalAtual)}</div>
                <div className="col-span-4 text-right font-semibold text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-2 justify-end">
                       <span>{formatCurrency(cat.totalSugerido)}</span>
                       {cat.tipo !== 'receita' && cat.totalSugerido > 0 && (
                            <div className="w-24 bg-gray-200 dark:bg-gray-600 rounded-full h-2.5">
                               <div className={`${corProgresso} h-2.5 rounded-full`} style={{ width: `${Math.min(progresso, 100)}%` }}></div>
                            </div>
                       )}
                    </div>
                </div>
                <div className={`col-span-2 text-right font-bold ${cat.diferenca >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                    {formatCurrency(cat.diferenca)}
                </div>
            </div>
        </div>
    );
};


// --- Componente Principal da Tela de Orçamento (REFATORADO) ---
const TelaOrcamento = () => {
    // 2. Conectar à store para obter estado e ações
    const { categorias, isLoading, fetchOrcamento, saveOrcamentoItem, deleteOrcamentoItem } = useOrcamentoStore();

    // 3. Buscar os dados do orçamento na montagem do componente
    useEffect(() => {
        fetchOrcamento();
    }, [fetchOrcamento]);

    const [expandedCategories, setExpandedCategories] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContext, setModalContext] = useState({ mode: 'add', category: null, item: null });

    const toggleCategory = (categoryId) => {
        setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
    };

    const handleOpenModal = (mode, category, item = null) => {
        setModalContext({ mode, category, item });
        setIsModalOpen(true);
    };

    // 4. A função de salvar agora chama a ação da store
    const handleSave = (itemData) => {
        saveOrcamentoItem(itemData, modalContext.category.id);
    };

    // 5. Cálculos que antes vinham de App.js agora são feitos aqui, usando os dados da store
    const { orcamentoCalculos, chartData } = useMemo(() => {
        const normalizeString = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const defaultReturn = { orcamentoCalculos: { totalReceitas: { atual: 0 }, totalDespesas: { atual: 0 }, saldoAtual: 0 }, chartData: [] };
        
        if (!categorias || categorias.length === 0) return defaultReturn;
        
        try {
            let totalReceitasAtual = 0;
            let totalDespesasAtual = 0;
            const totaisDespesasPorTipo = { 'Fixos': 0, 'Variáveis': 0, 'Investimentos': 0, 'Proteção': 0, 'Outros': 0 };

            categorias.forEach(cat => {
                const totalCatAtual = cat.subItens.reduce((acc, item) => acc + (item.atual || 0), 0);

                if (cat.tipo === 'receita') {
                    totalReceitasAtual += totalCatAtual;
                    return;
                }

                totalDespesasAtual += totalCatAtual;
                const nomeNormalizado = normalizeString(cat.nome.toLowerCase());

                if (cat.tipo === 'protecao' || nomeNormalizado.includes('protecao')) totaisDespesasPorTipo['Proteção'] += totalCatAtual;
                else if (nomeNormalizado.includes('fixa')) totaisDespesasPorTipo['Fixos'] += totalCatAtual;
                else if (nomeNormalizado.includes('variavel') || nomeNormalizado.includes('variável')) totaisDespesasPorTipo['Variáveis'] += totalCatAtual;
                else if (nomeNormalizado.includes('investimento')) totaisDespesasPorTipo['Investimentos'] += totalCatAtual;
                else if (totalCatAtual > 0) totaisDespesasPorTipo['Outros'] += totalCatAtual;
            });

            const saldoAtual = totalReceitasAtual - totalDespesasAtual;
            const newDonutChartData = Object.entries(totaisDespesasPorTipo)
                .map(([name, value]) => ({ name, value }))
                .filter(item => item.value > 0);
            
            return {
                orcamentoCalculos: {
                    totalReceitas: { atual: totalReceitasAtual },
                    totalDespesas: { atual: totalDespesasAtual },
                    saldoAtual,
                },
                chartData: newDonutChartData
            };
        } catch (e) {
            console.error("Erro ao calcular o resumo do orçamento:", e);
            return defaultReturn;
        }
    }, [categorias]);

    const categoriasFormatadas = useMemo(() => {
        return categorias.map(cat => {
            const totalAtual = cat.subItens.reduce((acc, item) => acc + (item.atual || 0), 0);
            const totalSugerido = cat.subItens.reduce((acc, item) => acc + (item.sugerido || 0), 0);
            return {
                ...cat,
                totalAtual,
                totalSugerido,
                diferenca: totalSugerido - totalAtual,
            };
        }).sort((a,b) => (a.tipo === 'receita' ? -1 : 1));
    }, [categorias]);

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00d971]"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                 <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-xl font-bold text-slate-800 dark:text-white">Detalhamento do Orçamento</h2>
                </div>
                <div className="grid grid-cols-12 items-center gap-4 px-4 py-2 text-sm font-semibold text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                    <span className="col-span-4">Categoria / Item</span>
                    <span className="col-span-2 text-right">Gasto Atual</span>
                    <span className="col-span-2 text-right">Meta Planejada</span>
                    <span className="col-span-2 text-right">Diferença</span>
                    <span className="col-span-2 text-right">Ações</span>
                </div>

                {categoriasFormatadas.map(cat => (
                    <div key={cat.id}>
                       <CategoriaLinha cat={cat} onToggle={() => toggleCategory(cat.id)} isExpanded={!!expandedCategories[cat.id]} />

                        {!!expandedCategories[cat.id] && (
                            <div className="bg-slate-100 dark:bg-slate-800/30">
                                {cat.subItens.map(item => (
                                    <ItemLinha
                                        key={item.id}
                                        item={item}
                                        catTipo={cat.tipo}
                                        onEdit={() => handleOpenModal('edit', cat, item)}
                                        // 6. A ação de apagar item chama diretamente a função da store
                                        onDelete={() => deleteOrcamentoItem(item.id)}
                                    />
                                ))}
                                <div className="pt-2 pl-4 pb-2">
                                    <button onClick={() => handleOpenModal('add', cat)} className="text-xs text-[#00d971] hover:underline font-semibold flex items-center gap-1">
                                        <PlusCircle size={14} /> 
                                        Adicionar item
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </Card>
            
            <OrcamentoResumo 
                calculos={orcamentoCalculos} 
                chartData={chartData}
            />

            <ModalItemOrcamento 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={handleSave} 
                context={modalContext}
            />
        </div>
    );
};

export default TelaOrcamento;