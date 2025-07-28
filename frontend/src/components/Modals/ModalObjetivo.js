import React, { useState, useEffect } from 'react';
import { Home, Plane, Car, Shield, Briefcase, School, Gift, HeartHandshake } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

const iconesDisponiveis = [
    { name: 'Home', component: Home }, { name: 'Plane', component: Plane }, { name: 'Car', component: Car },
    { name: 'Shield', component: Shield }, { name: 'Briefcase', component: Briefcase }, { name: 'School', component: School },
    { name: 'Gift', component: Gift }, { name: 'HeartHandshake', component: HeartHandshake },
];

const ModalObjetivo = ({ isOpen, onClose, onSave, investimentosDisponiveis = [], objetivoExistente = null }) => {
    const [nome, setNome] = useState('');
    const [valorAlvo, setValorAlvo] = useState('');
    const [aporteMensal, setAporteMensal] = useState('');
    const [iconeSelecionado, setIconeSelecionado] = useState(iconesDisponiveis[0].name);
    const [investimentosSelecionados, setInvestimentosSelecionados] = useState(new Set());

    const isEditing = objetivoExistente !== null;

    useEffect(() => {
        if (isOpen && isEditing) {
            setNome(objetivoExistente.nome);
            setValorAlvo(objetivoExistente.valor_alvo);
            setAporteMensal(objetivoExistente.aporte_mensal || '');
            setIconeSelecionado(objetivoExistente.icon);
            setInvestimentosSelecionados(new Set(objetivoExistente.investimentos_linkados || []));
        } else if (!isOpen) {
            // Limpa o formulário quando o modal é fechado
            setNome('');
            setValorAlvo('');
            setAporteMensal('');
            setIconeSelecionado(iconesDisponiveis[0].name);
            setInvestimentosSelecionados(new Set());
        }
    }, [isOpen, isEditing, objetivoExistente]);

    const handleToggleInvestimento = (invId) => {
        setInvestimentosSelecionados(prev => {
            const newSet = new Set(prev);
            if (newSet.has(invId)) {
                newSet.delete(invId);
            } else {
                newSet.add(invId);
            }
            return newSet;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!nome || !valorAlvo) return;
        
        const dadosObjetivo = {
            id: isEditing ? objetivoExistente.id : undefined,
            nome,
            icon: iconeSelecionado,
            valorAlvo: parseFloat(valorAlvo),
            aporteMensal: parseFloat(aporteMensal || 0),
            investimentosLinkados: Array.from(investimentosSelecionados)
        };
        
        onSave(dadosObjetivo);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white dark:bg-[#201b5d] rounded-xl shadow-lg p-8 w-full max-w-lg">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">{isEditing ? 'Editar Objetivo' : 'Novo Objetivo'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Nome do Objetivo</label><input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/></div>
                        <div><label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Valor Alvo (R$)</label><input type="number" value={valorAlvo} onChange={(e) => setValorAlvo(e.target.value)} required className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/></div>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Aporte Mensal (Opcional)</label>
                        <input type="number" value={aporteMensal} onChange={(e) => setAporteMensal(e.target.value)} className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Ícone</label>
                        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">{iconesDisponiveis.map((IconInfo) => { 
                            const Icone = IconInfo.component; 
                            const isSelected = iconeSelecionado === IconInfo.name;
                            return ( <button key={IconInfo.name} type="button" onClick={() => setIconeSelecionado(IconInfo.name)} className={`p-3 rounded-lg flex items-center justify-center transition-all ${isSelected ? 'bg-[#00d971] text-white scale-110' : 'bg-slate-200 dark:bg-[#2a246f] text-gray-600 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-[#3e388b]'}`}><Icone size={24}/></button> )
                        })}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Vincular Investimentos</label>
                        <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-slate-100 dark:bg-[#2a246f] rounded-lg">
                            {investimentosDisponiveis.map(inv => (
                                <label key={inv.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-200 dark:hover:bg-[#3e388b] cursor-pointer">
                                    <input type="checkbox" checked={investimentosSelecionados.has(inv.id)} onChange={() => handleToggleInvestimento(inv.id)} className="form-checkbox h-4 w-4 text-[#00d971] bg-slate-300 dark:bg-gray-700 border-gray-600 rounded focus:ring-0"/>
                                    <span className="text-sm text-slate-800 dark:text-gray-300">{inv.nome}</span>
                                    <span className="ml-auto text-sm font-semibold text-slate-800 dark:text-white">{formatCurrency(inv.valor)}</span>
                                </label>
                            ))}
                             {investimentosDisponiveis.length === 0 && <p className="text-center text-xs p-2 text-gray-500">Nenhum investimento disponível.</p>}
                        </div>
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

export default ModalObjetivo;