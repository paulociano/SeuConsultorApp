import React, { useState, useMemo, useEffect } from 'react';
import Card from '../../components/Card/Card';
import { formatCurrency } from '../../utils/formatters';
import { PIE_COLORS } from '../../components/constants/PieColors';
import CustomPieLegend from '../../components/Custom/CustomPieLegend';
import { toast } from 'sonner';
import { Edit, Trash2, PlusCircle } from 'lucide-react';

// --- Sub-componente do Modal para Adicionar/Editar Itens ---
const ModalItemOrcamento = ({ isOpen, onClose, onSave, context }) => {
    const { mode, category, item } = context;
    const [nome, setNome] = useState(item?.nome || '');
    const [valor, setValor] = useState(item?.atual?.toString() || '');

    useEffect(() => {
        if (item) {
            setNome(item.nome);
            setValor(item.atual.toString());
        } else {
            setNome('');
            setValor('');
        }
    }, [item]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const valorFloat = parseFloat(valor);
        if (!nome || isNaN(valorFloat)) {
            toast.error("Por favor, preencha o nome e um valor válido.");
            return;
        }
        onSave({ nome, valor: valorFloat, id: item?.id });
        onClose();
    };

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
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Valor Gasto (Atual)</label>
                        <input type="number" value={valor} onChange={(e) => setValor(e.target.value)} required step="0.01" className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300">Cancelar</button>
                        <button type="submit" className="px-6 py-2 text-sm font-medium text-black bg-[#00d971] rounded-lg hover:brightness-90">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


// --- Componente Principal da Tela de Orçamento ---
const TelaOrcamento = ({ categorias, onUpdateMeta, onSaveItem, onDeleteItem, orcamentoCalculos, pieChartData }) => {
    const [expandedCategories, setExpandedCategories] = useState({});
    const [isExpandedAll, setIsExpandedAll] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContext, setModalContext] = useState({ mode: 'add', category: null, item: null });

    const toggleCategory = (categoryId) => {
        setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
    };

    const toggleAllCategories = () => {
        const newExpandedState = {};
        if (!isExpandedAll) {
            categorias.forEach(cat => {
                newExpandedState[cat.id] = true;
            });
        }
        setExpandedCategories(newExpandedState);
        setIsExpandedAll(!isExpandedAll);
    };

    const handleOpenModal = (mode, category, item = null) => {
        setModalContext({ mode, category, item });
        setIsModalOpen(true);
    };

    const handleSave = (itemData) => {
        // A função onSaveItem virá do App.js e saberá como se comunicar com o backend
        onSaveItem(itemData, modalContext.category.id);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 space-y-4">
                <Card className="mb-2">
                    <div className="flex justify-between items-center px-4 py-2">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white">Orçamento</h2>
                        <button onClick={toggleAllCategories} className="text-sm text-[#00d971] hover:underline">
                            {isExpandedAll ? 'Recolher tudo' : 'Expandir tudo'}
                        </button>
                    </div>
                    <div className="grid grid-cols-3 items-center gap-4 px-4 pb-2 text-sm">
                        <span className="font-semibold text-slate-800 dark:text-white">Categoria</span>
                        <span className="font-semibold text-slate-800 dark:text-white text-right">Gasto Atual</span>
                        <span className="font-semibold text-slate-800 dark:text-white text-right">Meta Planejada</span>
                    </div>
                    {categorias.map(cat => {
                        const isExpanded = !!expandedCategories[cat.id];
                        const totalAtual = cat.subItens.reduce((acc, item) => acc + item.atual, 0);
                        const totalSugerido = cat.subItens.reduce((acc, item) => acc + item.sugerido, 0);
                        const corTexto = cat.tipo === 'receita' ? 'text-[#00d971]' : 'text-red-400';
                        
                        return (
                            <div key={cat.id} className="border-t border-[#3e388b]">
                                <div
                                    className="grid grid-cols-3 items-center gap-4 px-4 py-2 hover:bg-[#3e388b]/30 rounded-lg cursor-pointer text-slate-800 transition-all duration-300"
                                    onClick={() => toggleCategory(cat.id)}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-slate-600 dark:text-white text-base">{cat.nome}</span>
                                    </div>
                                    <div className={`text-right font-semibold ${corTexto}`}>{formatCurrency(totalAtual)}</div>
                                    <div className="text-right font-semibold text-[#a39ee8]">{formatCurrency(totalSugerido)}</div>
                                </div>
                                {isExpanded && (
                                    <div className="pl-10 pr-4 pb-2 space-y-2 text-sm transition-all duration-300 animate-fadeIn">
                                        {cat.subItens.map(item => (
                                            <div key={item.id} className="flex justify-between items-center">
                                                <span>{item.nome}</span>
                                                <div className="flex items-center gap-4">
                                                    <span>{formatCurrency(item.atual)}</span>
                                                    <div className="flex items-center gap-2">
                                                        <button onClick={(e) => { e.stopPropagation(); handleOpenModal('edit', cat, item); }} className="text-xs text-blue-400"><Edit size={14}/></button>
                                                        <button onClick={(e) => { e.stopPropagation(); onDeleteItem(item.id); }} className="text-xs text-red-500"><Trash2 size={14}/></button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <div className="pt-2">
                                            <button onClick={(e) => { e.stopPropagation(); handleOpenModal('add', cat); }} className="text-xs text-[#00d971] hover:underline font-semibold flex items-center gap-1">
                                                <PlusCircle size={14} /> Adicionar item
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </Card>
                <Card>
                    <div className="grid grid-cols-3 gap-4 text-center text-sm">
                        <div></div>
                        <div className="font-bold text-slate-800 dark:text-white">Atual</div>
                        <div className="font-bold text-slate-800 dark:text-white">Sugerido</div>
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
                    {/* Gráficos aqui */}
                    <CustomPieLegend payload={pieChartData.map((d, i) => ({ value: d.name, color: PIE_COLORS[i % PIE_COLORS.length] }))} chartData={pieChartData} />
                </Card>
            </div>
            <ModalItemOrcamento isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} context={modalContext} />
        </div>
    );
};

export default TelaOrcamento;
