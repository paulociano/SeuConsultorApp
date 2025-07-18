import { useState, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid';
import { CATEGORIAS_FLUXO } from '../constants/Categorias';

const ModalNovaTransacao = ({ transacao, onClose, onSave }) => {
    const isEdicao = !!transacao;

    const [descricao, setDescricao] = useState('');
    const [valor, setValor] = useState('');
    const [data, setData] = useState(new Date().toISOString().slice(0, 10));
    const [tipo, setTipo] = useState('debit');
    const [categoriaId, setCategoriaId] = useState('outros');

    // Preencher campos se for edição
    useEffect(() => {
        if (transacao) {
            setDescricao(transacao.description || '');
            setValor(transacao.amount?.toString() || '');
            setData(transacao.date?.substring(0, 10) || new Date().toISOString().slice(0, 10));
            setTipo(transacao.type || 'debit');
            setCategoriaId(transacao.category || 'outros');
        }
    }, [transacao]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!descricao || !valor || !data) return;

        const novaTransacao = {
            id: transacao?.id || uuidv4(),
            date: data,
            description: descricao,
            amount: parseFloat(valor),
            type: tipo,
            sourceAccount: 'Conta Manual',
            category: tipo === 'debit' ? categoriaId : 'receita',
            isIgnored: transacao?.isIgnored || false,
        };

        onSave(novaTransacao);
        handleClose();
    };

    const handleClose = () => {
        onClose();
        setDescricao('');
        setValor('');
        setData(new Date().toISOString().slice(0, 10));
        setTipo('debit');
        setCategoriaId('outros');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white dark:bg-[#201b5d] rounded-xl shadow-lg p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
                    {isEdicao ? 'Editar Transação' : 'Adicionar Transação'}
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Descrição</label>
                        <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} required className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Valor (R$)</label>
                            <input type="number" value={valor} onChange={(e) => setValor(e.target.value)} required step="0.01" className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Data</label>
                            <input type="date" value={data} onChange={(e) => setData(e.target.value)} required className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                            <input type="radio" value="debit" checked={tipo === 'debit'} onChange={(e) => setTipo(e.target.value)} className="form-radio h-4 w-4 text-[#00d971] bg-slate-300 dark:bg-gray-700 border-gray-600 focus:ring-0"/>
                            <span className="text-slate-800 dark:text-white">Despesa</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="radio" value="credit" checked={tipo === 'credit'} onChange={(e) => setTipo(e.target.value)} className="form-radio h-4 w-4 text-[#00d971] bg-slate-300 dark:bg-gray-700 border-gray-600 focus:ring-0"/>
                            <span className="text-slate-800 dark:text-white">Receita</span>
                        </label>
                    </div>

                    {tipo === 'debit' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Categoria</label>
                            <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} className="w-full mt-1 px-3 py-2 text-slate-900 dark:text-white bg-slate-100 dark:bg-[#2a246f] border border-slate-300 dark:border-[#3e388b] rounded-md">
                                {Object.entries(CATEGORIAS_FLUXO).map(([key, { label }]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300">Cancelar</button>
                        <button type="submit" className="px-6 py-2 text-sm font-medium text-black bg-[#00d971] rounded-lg hover:brightness-90">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalNovaTransacao;
