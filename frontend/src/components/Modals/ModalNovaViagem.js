import { useState } from "react";

const ModalNovaViagem = ({ isOpen, onClose, onSave, viagemExistente }) => {
    const isEditing = !!viagemExistente;
    const [origem, setOrigem] = useState(isEditing ? viagemExistente.origem : 'GRU');
    const [destino, setDestino] = useState(isEditing ? viagemExistente.destino : 'NRT');
    const [nomeDestino, setNomeDestino] = useState(isEditing ? viagemExistente.nomeDestino : 'Tóquio, Japão');
    const [companhia, setCompanhia] = useState(isEditing ? viagemExistente.companhia : 'LATAM Pass');
    const [milhasNecessarias, setMilhasNecessarias] = useState(isEditing ? viagemExistente.milhasNecessarias : '');
    const [milhasAtuais, setMilhasAtuais] = useState(isEditing ? viagemExistente.milhasAtuais : 0);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ 
            ...viagemExistente, // Mantém o ID e outras propriedades se estiver editando
            origem, destino, nomeDestino, companhia, 
            milhasNecessarias: parseFloat(milhasNecessarias), 
            milhasAtuais: parseFloat(milhasAtuais)
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
         <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white dark:bg-[#201b5d] rounded-xl shadow-lg p-8 w-full max-w-lg">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">{isEditing ? 'Editar Viagem' : 'Nova Meta de Viagem'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Nome do Destino</label><input type="text" value={nomeDestino} onChange={e => setNomeDestino(e.target.value)} required className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/></div>
                        <div><label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Companhia/Programa</label><input type="text" value={companhia} onChange={e => setCompanhia(e.target.value)} required className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/></div>
                        <div><label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Origem (Sigla)</label><input type="text" value={origem} onChange={e => setOrigem(e.target.value.toUpperCase())} maxLength="3" required className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/></div>
                        <div><label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Destino (Sigla)</label><input type="text" value={destino} onChange={e => setDestino(e.target.value.toUpperCase())} maxLength="3" required className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/></div>
                        <div><label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Milhas Necessárias</label><input type="number" value={milhasNecessarias} onChange={e => setMilhasNecessarias(e.target.value)} required className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/></div>
                        <div><label className="block font-medium text-gray-600 dark:text-gray-400">Milhas Atuais</label><input type="number" value={milhasAtuais} onChange={e => setMilhasAtuais(e.target.value)} required className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/></div>
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

export default ModalNovaViagem;