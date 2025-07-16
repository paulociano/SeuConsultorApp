import React, { useState, useEffect } from 'react';
import Card from '../../components/Card/Card';
import { formatCurrency } from '../../utils/formatters';
import { ChevronDown, ChevronRight, Edit, PlusCircle, Trash2 } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import ModalItemOrcamento from '../../components/Modals/ModalItemOrcamento';
import { PIE_COLORS } from '../../components/constants/PieColors';
import CustomPieLegend from '../../components/Custom/CustomPieLegend';

const TelaOrcamento = ({ categorias, setCategorias, orcamentoCalculos, pieChartData }) => {
    const [expandedCategories, setExpandedCategories] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContext, setModalContext] = useState({ mode: 'add', category: null, item: null });
    const [editingSugeridoId, setEditingSugeridoId] = useState(null);
    const [sugeridoInputValue, setSugeridoInputValue] = useState("");

    useEffect(() => {
      const orcamentoAtual = categorias.map(cat => ({
        id: cat.id,
        subItens: cat.subItens.map(item => ({ id: item.id, atual: item.atual })),
      }));

      const orcamentoSugerido = categorias.map(cat => ({
        id: cat.id,
        subItens: cat.subItens.map(item => ({ id: item.id, sugerido: item.sugerido })),
      }));
    }, [categorias]);


    const toggleCategory = (categoryId) => setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
    
    const handleOpenModal = (mode, category, item = null) => {
        setModalContext({ mode, category, item });
        setIsModalOpen(true);
    };

    const handleSaveItem = ({ nome, valor, id, categoriaId }) => {
        const categoryIdToUpdate = modalContext.category.id;
        setCategorias(prev => prev.map(cat => {
            if (cat.id === categoryIdToUpdate) {
                let subItensAtualizados;
                if (id) { // Modo de Edição
                    subItensAtualizados = cat.subItens.map(item => 
                        item.id === id ? { ...item, nome, atual: valor, categoriaId: categoriaId !== undefined ? categoriaId : item.categoriaId } : item
                    );
                } else { // Modo de Criação
                    const novoItem = { id: crypto.randomUUID(), nome, atual: valor, sugerido: valor, categoriaId };
                    subItensAtualizados = [...cat.subItens, novoItem];
                }
                return { ...cat, subItens: subItensAtualizados };
            }
            return cat;
        }));
    };

    const handleDeleteItem = (categoryId, itemId) => {
        setCategorias(prev => prev.map(cat => {
            if (cat.id === categoryId) return { ...cat, subItens: cat.subItens.filter(item => item.id !== itemId) };
            return cat;
        }));
    };

    const handleEditSugeridoClick = (item) => {
        setEditingSugeridoId(item.id);
        setSugeridoInputValue(item.sugerido.toString());
    };

    const handleSugeridoSave = (categoryId, itemId) => {
        const newValue = parseFloat(sugeridoInputValue);
        if (!isNaN(newValue)) {
            setCategorias(prev => prev.map(cat => {
                if (cat.id === categoryId) {
                    return { ...cat, subItens: cat.subItens.map(item => item.id === itemId ? { ...item, sugerido: newValue } : item) };
                }
                return cat;
            }));
        }
        setEditingSugeridoId(null);
    };

    const handleSugeridoInputKeyDown = (e, categoryId, itemId) => {
        if (e.key === 'Enter') handleSugeridoSave(categoryId, itemId);
        if (e.key === 'Escape') setEditingSugeridoId(null);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 gap-4">
                <Card className="mb-4">
                    <div>
                        <div className="grid grid-cols-3 items-center gap-4 p-2 text-sm"><span className="font-semibold text-slate-800 dark:text-white"></span><span className="font-semibold text-slate-800 dark:text-white text-right">Atual</span><span className="font-semibold text-slate-800 dark:text-white text-right">Sugerido</span></div>
                        {categorias.map(cat => {
                            const Icon = cat.icon;
                            const isExpanded = !!expandedCategories[cat.id];
                            const totalAtual = cat.subItens.reduce((acc, item) => acc + item.atual, 0);
                            const percAtual = orcamentoCalculos.atual.despesas > 0 ? (totalAtual / orcamentoCalculos.atual.despesas) * 100 : 0;
                            const corTexto = cat.tipo === 'receita' ? 'text-[#00d971]' : 'text-red-400';
                            return (
                                <div key={cat.id} className="border-t border-[#3e388b]">
                                    <div className="grid grid-cols-3 items-center gap-4 p-2 hover:bg-[#3e388b]/30 rounded-lg cursor-pointer text-slate-800" onClick={() => toggleCategory(cat.id)}>
                                        <div className="flex items-center gap-2"><button className="text-slate-800 dark:text-white hover:text-white">{isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</button><Icon size={18} className="text-slate-800 dark:text-white" /><span className="font-bold text-slate-600 dark:text-white">{cat.nome}</span></div>
                                        <div className={`text-right font-semibold ${corTexto}`}>{cat.tipo === 'despesa' && <span className="text-xs text-slate-800 dark:text-white mr-2">({percAtual.toFixed(1)}%)</span>}{formatCurrency(totalAtual)}</div>
                                        <div className="text-right font-semibold text-[#a39ee8]">{formatCurrency(cat.subItens.reduce((acc, item) => acc + item.sugerido, 0))}</div>
                                    </div>
                                    {isExpanded && (<div className="pl-10 pr-4 pb-2 space-y-2 text-xs">
                                        {cat.subItens.map(item => (<div key={item.id} className="grid grid-cols-3 items-center gap-4">
                                            <span className="text-slate-800 dark:text-white col-span-1">{item.nome}</span>
                                            <div className="flex justify-end items-center gap-2"><span className="text-slate-800 dark:text-white text-right">{formatCurrency(item.atual)}</span><button onClick={(e) => {e.stopPropagation(); handleOpenModal('edit', cat, item)}} className="text-slate-800 dark:text-white hover:text-[#00d971]"><Edit size={12}/></button><button onClick={(e) => {e.stopPropagation(); handleDeleteItem(cat.id, item.id)}} className="text-slate-800 dark:text-white hover:text-red-400"><Trash2 size={12}/></button></div>
                                            <div className="text-right flex justify-end items-center gap-2">
                                                {editingSugeridoId === item.id ? (
                                                    <input type="number" value={sugeridoInputValue} onChange={(e) => setSugeridoInputValue(e.target.value)} onBlur={() => handleSugeridoSave(cat.id, item.id)} onKeyDown={(e) => handleSugeridoInputKeyDown(e, cat.id, item.id)} className="w-20 bg-white dark:bg-[#201b5d] text-slate-800 dark:text-white text-right rounded-md px-1 py-0.5 border border-[#00d971] focus:outline-none focus:ring-1 focus:ring-[#00d971]" autoFocus onClick={(e) => e.stopPropagation()} />
                                                ) : (
                                                    <>
                                                        <span className="text-[#a39ee8]">{formatCurrency(item.sugerido)}</span>
                                                        <button onClick={(e) => {e.stopPropagation(); handleEditSugeridoClick(item)}} className="text-slate-800 dark:text-white hover:text-[#00d971]"><Edit size={12} /></button>
                                                    </>
                                                )}
                                            </div>
                                        </div>))}
                                        <div className="pt-2"><button onClick={(e) => {e.stopPropagation(); handleOpenModal('add', cat)}} className="flex items-center gap-2 text-xs text-[#00d971] hover:brightness-90 font-semibold"><PlusCircle size={14} />Adicionar</button></div>
                                    </div>)}
                                </div>
                            );
                        })}
                    </div>
                </Card>
                <Card>
                    <div className="grid grid-cols-3 gap-4 text-center text-sm space-y-1">
                        <div></div><div className="font-bold text-slate-800 dark:text-white">Atual</div><div className="font-bold text-slate-800 dark:text-white">Sugerido</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center mt-2 border-t border-[#3e388b] pt-3">
                        <div className="text-left font-semibold text-slate-800 dark:text-white text-sm">Saldo esperado</div>
                        <div className="font-semibold text-base text-[#00d971]">{formatCurrency(orcamentoCalculos.atual.receitas - orcamentoCalculos.atual.despesas)}</div>
                        <div className="font-semibold text-base text-[#a39ee8]">{formatCurrency(orcamentoCalculos.sugerido.receitas - orcamentoCalculos.sugerido.despesas)}</div>
                    </div>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <Card>
                    <h2 className="text-lg font-bold text-white mb-4 text-center">Divisão de Gastos</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-center font-semibold text-slate-800 dark:text-white mb-2 text-sm">Atual</h3>
                            <ResponsiveContainer width="100%" height={150}>
                                <PieChart>
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                    <Pie data={pieChartData} dataKey="valueAtual" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                                        {pieChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div>
                            <h3 className="text-center font-semibold text-[#a39ee8] mb-2 text-sm">Sugerido</h3>
                            <ResponsiveContainer width="100%" height={150}>
                                <PieChart>
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                    <Pie data={pieChartData} dataKey="valueSugerido" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                                        {pieChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <CustomPieLegend payload={pieChartData.map((d, i) => ({ value: d.name, color: PIE_COLORS[i % PIE_COLORS.length] }))} chartData={pieChartData} />
                </Card>
            </div>
            <ModalItemOrcamento isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveItem} context={modalContext} />
        </div>
    );
};

export default TelaOrcamento;