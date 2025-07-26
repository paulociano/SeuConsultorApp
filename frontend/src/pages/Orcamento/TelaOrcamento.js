import React, { useState, useEffect } from 'react';
import Card from '../../components/Card/Card';
import { formatCurrency } from '../../utils/formatters';
import { toast } from 'sonner';
import { Edit, Trash2, PlusCircle, Tag } from 'lucide-react';
// CORREÇÃO: Importando o nome correto da variável, conforme o arquivo Categorias.js
import { CATEGORIAS_FLUXO } from '../../components/constants/Categorias';

// --- Sub-componente do Modal para Adicionar/Editar Itens ---
const ModalItemOrcamento = ({ isOpen, onClose, onSave, context }) => {
    const { mode, category, item } = context;
    const [nome, setNome] = useState('');
    const [valorPlanejado, setValorPlanejado] = useState('');
    const [categoriaPlanejamento, setCategoriaPlanejamento] = useState('');

    useEffect(() => {
        if (isOpen && item) {
            setNome(item.nome || '');
            setValorPlanejado(item.sugerido?.toString() || '0');
            setCategoriaPlanejamento(item.categoria_planejamento || '');
        } else if (isOpen) {
            setNome('');
            setValorPlanejado('0');
            setCategoriaPlanejamento('');
        }
    }, [isOpen, item]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const valorFloat = parseFloat(valorPlanejado);
        if (!nome || isNaN(valorFloat) || !categoriaPlanejamento) {
            toast.error("Por favor, preencha nome, meta e a categoria para o planejamento.");
            return;
        }
        onSave({ 
            nome, 
            valor_planejado: valorFloat, 
            id: item?.id, 
            categoria_planejamento: categoriaPlanejamento 
        });
        onClose();
    };
    
    // CORREÇÃO: Usando a variável correta 'CATEGORIAS_FLUXO'
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
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Meta Planejada</label>
                        <input type="number" value={valorPlanejado} onChange={(e) => setValorPlanejado(e.target.value)} required step="0.01" className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Categoria (para Planejamento)</label>
                        <select
                            value={categoriaPlanejamento}
                            onChange={(e) => setCategoriaPlanejamento(e.target.value)}
                            required
                            className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"
                        >
                            <option value="" disabled>Selecione uma categoria</option>
                            {opcoesCategoria.map(opt => (
                                <option key={opt.id} value={opt.id}>{opt.label}</option>
                            ))}
                        </select>
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
const TelaOrcamento = ({ categorias, onSaveItem, onDeleteItem, orcamentoCalculos }) => {
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

    const handleSave = (itemData) => {
        onSaveItem(itemData, modalContext.category.id);
    };

    return (
        <div className="space-y-4">
            <Card>
                <div className="px-4 py-2">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">Orçamento</h2>
                </div>
                <div className="grid grid-cols-3 items-center gap-4 px-4 pb-2 text-sm">
                    <span className="font-semibold text-slate-800 dark:text-white">Categoria / Item</span>
                    <span className="font-semibold text-slate-800 dark:text-white text-right">Gasto Atual</span>
                    <span className="font-semibold text-slate-800 dark:text-white text-right">Meta Planejada</span>
                </div>
                {categorias.map(cat => {
                    if (cat.tipo === 'protecao') return null;
                    const isExpanded = !!expandedCategories[cat.id];
                    const totalAtual = cat.subItens.reduce((acc, item) => acc + item.atual, 0);
                    const totalSugerido = cat.subItens.reduce((acc, item) => acc + item.sugerido, 0);
                    const corTexto = cat.tipo === 'receita' ? 'text-[#00d971]' : 'text-red-400';
                    
                    return (
                        <div key={cat.id} className="border-t border-[#3e388b]">
                            <div
                                className="grid grid-cols-3 items-center gap-4 px-4 py-3 hover:bg-[#3e388b]/30 cursor-pointer"
                                onClick={() => toggleCategory(cat.id)}
                            >
                                <span className="font-bold text-slate-600 dark:text-white text-base">{cat.nome}</span>
                                <div className={`text-right font-semibold ${corTexto}`}>{formatCurrency(totalAtual)}</div>
                                <div className="text-right font-semibold text-[#a39ee8]">{formatCurrency(totalSugerido)}</div>
                            </div>
                            {isExpanded && (
                                <div className="pl-10 pr-4 pb-2 space-y-3 text-sm bg-slate-100 dark:bg-slate-800/50">
                                    {cat.subItens.map(item => {
                                        // CORREÇÃO: Usando a variável correta 'CATEGORIAS_FLUXO'
                                        const categoriaNome = CATEGORIAS_FLUXO[item.categoria_planejamento]?.label || 'Sem categoria';
                                        return (
                                            <div key={item.id} className="grid grid-cols-3 items-center py-1">
                                                <div className="col-span-2 flex flex-col">
                                                    <span>{item.nome}</span>
                                                    {cat.tipo === 'despesa' && (
                                                        <div className="flex items-center gap-1 text-xs text-slate-500">
                                                            <Tag size={12}/>
                                                            <span>{categoriaNome}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex items-center justify-end gap-4">
                                                    <span>{formatCurrency(item.atual)}</span>
                                                    <span>{formatCurrency(item.sugerido)}</span>
                                                    <button onClick={(e) => { e.stopPropagation(); handleOpenModal('edit', cat, item); }} className="text-blue-400"><Edit size={14}/></button>
                                                    <button onClick={(e) => { e.stopPropagation(); onDeleteItem(item.id); }} className="text-red-500"><Trash2 size={14}/></button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {cat.tipo === 'despesa' && (
                                        <div className="pt-2">
                                            <button onClick={(e) => { e.stopPropagation(); handleOpenModal('add', cat); }} className="text-xs text-[#00d971] hover:underline font-semibold flex items-center gap-1">
                                                <PlusCircle size={14} /> Adicionar item de despesa
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </Card>
            <ModalItemOrcamento isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} context={modalContext} />
        </div>
    );
};

export default TelaOrcamento;