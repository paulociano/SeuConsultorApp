import { useState, useEffect } from "react";

// O modal agora aceita a prop `programasDisponiveis`
const ModalNovaViagem = ({ isOpen, onClose, onSave, viagemExistente, programasDisponiveis = [] }) => {
    const isEditing = !!viagemExistente;
    
    // O estado inicial de 'companhia' agora é '' para funcionar com o placeholder do select
    const [companhia, setCompanhia] = useState('');
    const [nomeDestino, setNomeDestino] = useState('');
    const [origem, setOrigem] = useState('');
    const [destino, setDestino] = useState('');
    const [flightCostBRL, setFlightCostBRL] = useState('');
    const [estimatedMiles, setEstimatedMiles] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Define o estado inicial quando o modal abre ou a viagem para editar muda
            setNomeDestino(isEditing ? viagemExistente.nomeDestino : '');
            setCompanhia(isEditing ? viagemExistente.programSuggestions?.[0] || '' : '');
            setOrigem(isEditing ? viagemExistente.origem : '');
            setDestino(isEditing ? viagemExistente.destino : '');
            setFlightCostBRL(isEditing ? viagemExistente.flightCostBRL : '');
            setEstimatedMiles(isEditing ? viagemExistente.estimatedMiles : '');
        }
    }, [isOpen, viagemExistente, isEditing]);


    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ 
            ...viagemExistente,
            nomeDestino,
            programSuggestions: [companhia], // Salva a companhia selecionada
            origem, 
            destino, 
            flightCostBRL: parseFloat(flightCostBRL),
            estimatedMiles: parseFloat(estimatedMiles),
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
         <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white dark:bg-[#201b5d] rounded-xl shadow-lg p-8 w-full max-w-lg">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">{isEditing ? 'Editar Meta de Viagem' : 'Nova Meta de Viagem'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Nome do Destino</label>
                            <input type="text" value={nomeDestino} onChange={e => setNomeDestino(e.target.value)} required className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Programa Alvo</label>
                            {/* ALTERAÇÃO PRINCIPAL: Input substituído por Select */}
                            <select 
                                value={companhia} 
                                onChange={e => setCompanhia(e.target.value)} 
                                required 
                                className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"
                            >
                                <option value="" disabled>Selecione um programa</option>
                                {programasDisponiveis.map(prog => (
                                    <option key={prog.id} value={prog.name}>
                                        {prog.name}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Origem (Sigla)</label>
                            <input type="text" value={origem} onChange={e => setOrigem(e.target.value.toUpperCase())} maxLength="3" required className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Destino (Sigla)</label>
                            <input type="text" value={destino} onChange={e => setDestino(e.target.value.toUpperCase())} maxLength="3" required className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Custo em Dinheiro (R$)</label>
                            <input type="number" step="0.01" value={flightCostBRL} onChange={e => setFlightCostBRL(e.target.value)} required className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/>
                        </div>
                        <div>
                            <label className="block font-medium text-gray-600 dark:text-gray-400">Custo Estimado em Milhas</label>
                            <input type="number" value={estimatedMiles} onChange={e => setEstimatedMiles(e.target.value)} required className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/>
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

export default ModalNovaViagem;