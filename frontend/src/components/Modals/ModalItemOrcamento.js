import React, { useEffect, useState } from 'react';
import { CATEGORIAS_FLUXO } from '../constants/Categorias';

const ModalItemOrcamento = ({ isOpen, onClose, onSave, context }) => {
    const isEditing = !!context.item;
    const [nome, setNome] = useState(isEditing ? context.item.nome : '');
    const [valor, setValor] = useState(isEditing ? context.item.atual.toString() : '');
    // Novo estado para a categoria selecionada
    const [categoriaId, setCategoriaId] = useState(isEditing ? context.item.categoriaId : 'outros');

    // Limpa o formulário quando o modal é fechado ou o contexto muda
    useEffect(() => {
        if (isOpen) {
            if (isEditing) {
                setNome(context.item.nome);
                setValor(context.item.atual.toString());
                setCategoriaId(context.item.categoriaId || 'outros');
            } else {
                setNome('');
                setValor('');
                setCategoriaId('outros');
            }
        }
    }, [isOpen, context, isEditing]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const dadosSalvos = {
            nome,
            valor: parseFloat(valor),
            id: isEditing ? context.item.id : null,
            categoriaId: context.category.tipo === 'despesa' ? categoriaId : null // Salva a categoria apenas para despesas
        };
        onSave(dadosSalvos);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-[#201b5d] rounded-lg p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">{isEditing ? 'Editar Item' : `Adicionar em ${context.category.nome}`}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Nome</label>
                        <input value={nome} onChange={(e) => setNome(e.target.value)} type="text" required className="w-full mt-1 px-3 py-2 text-slate-900 dark:text-white bg-slate-100 dark:bg-[#2a246f] border border-slate-300 dark:border-[#3e388b] rounded-md"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Valor (R$)</label>
                        <input value={valor} onChange={(e) => setValor(e.target.value)} type="number" step="0.01" required className="w-full mt-1 px-3 py-2 text-slate-900 dark:text-white bg-slate-100 dark:bg-[#2a246f] border border-slate-300 dark:border-[#3e388b] rounded-md"/>
                    </div>
                    
                    {/* NOVO CAMPO: Seletor de Categoria (só aparece para despesas) */}
                    {context.category.tipo === 'despesa' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Categoria</label>
                            <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} className="w-full mt-1 px-3 py-2 text-slate-900 dark:text-white bg-slate-100 dark:bg-[#2a246f] border border-slate-300 dark:border-[#3e388b] rounded-md">
                                {Object.entries(CATEGORIAS_FLUXO).map(([key, { label }]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="text-gray-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition">Cancelar</button>
                        <button type="submit" className="bg-[#00d971] hover:brightness-90 text-black font-bold py-2 px-4 rounded-lg">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalItemOrcamento;