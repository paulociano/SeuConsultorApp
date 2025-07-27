import { useState, useEffect } from "react";

const ModalWallet = ({ isOpen, onClose, onSave, walletExistente }) => {
    const isEditing = !!walletExistente;
    const [nome, setNome] = useState('');
    const [saldo, setSaldo] = useState('');
    const [tipo, setTipo] = useState('milha'); // 'milha' ou 'ponto'
    const [cpm, setCpm] = useState('');
    const [expiracao, setExpiracao] = useState('');

    useEffect(() => {
        if (isOpen) {
            setNome(isEditing ? walletExistente.name : '');
            setSaldo(isEditing ? walletExistente.balance : '');
            setTipo(isEditing ? walletExistente.type : 'milha');
            setCpm(isEditing ? walletExistente.avgCpm : '');
            setExpiracao(isEditing ? walletExistente.expiration : '');
        }
    }, [isOpen, walletExistente, isEditing]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            ...walletExistente,
            name: nome,
            balance: parseFloat(saldo),
            type: tipo,
            avgCpm: parseFloat(cpm),
            expiration: expiracao,
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white dark:bg-[#201b5d] rounded-xl shadow-lg p-8 w-full max-w-lg">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">{isEditing ? 'Editar Programa' : 'Novo Programa de Fidelidade'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Nome do Programa</label>
                            <input type="text" value={nome} onChange={e => setNome(e.target.value)} required className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Saldo Atual</label>
                            <input type="number" value={saldo} onChange={e => setSaldo(e.target.value)} required className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/>
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Tipo de Programa</label>
                           <select value={tipo} onChange={e => setTipo(e.target.value)} className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]">
                               <option value="milha">Milhas Aéreas</option>
                               <option value="ponto">Pontos (Banco/Outros)</option>
                           </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Custo por Milheiro (CPM)</label>
                            <input type="number" step="0.01" value={cpm} onChange={e => setCpm(e.target.value)} placeholder="Ex: 17.50" required className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/>
                        </div>
                        <div className="md:col-span-2">
                           <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Data de Expiração Próxima</label>
                           <input type="date" value={expiracao} onChange={e => setExpiracao(e.target.value)} required className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/>
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300">Cancelar</button>
                        <button type="submit" className="px-6 py-2 text-sm font-medium text-slate-800 bg-[#00d971] rounded-lg hover:brightness-90">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ModalWallet;