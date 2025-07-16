import React, { useState, useContext } from 'react';
import { Home, Plane, Car, Shield, Briefcase, School, Gift, HeartHandshake } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { mockInvestimentos } from '../mocks/mockInvestimentos';

const ModalObjetivo = ({ isOpen, onClose, onSave }) => {
    const [nome, setNome] = useState('');
    const [valorAlvo, setValorAlvo] = useState('');
    
    const iconesDisponiveis = [
        { name: 'Casa', component: Home }, { name: 'Avião', component: Plane }, { name: 'Carro', component: Car },
        { name: 'Escudo', component: Shield }, { name: 'Maleta', component: Briefcase }, { name: 'Educação', component: School },
        { name: 'Presente', component: Gift }, { name: 'Coração', component: HeartHandshake },
    ];
    const [iconeSelecionado, setIconeSelecionado] = useState(iconesDisponiveis[0].component);
    const [investimentosSelecionados, setInvestimentosSelecionados] = useState(new Set());

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
            nome,
            icon: iconeSelecionado,
            valorAlvo: parseFloat(valorAlvo),
            investimentosLinkados: Array.from(investimentosSelecionados)
        };
        
        onSave(dadosObjetivo);
        // Limpa o formulário para a próxima vez
        setNome('');
        setValorAlvo('');
        setIconeSelecionado(iconesDisponiveis[0].component);
        setInvestimentosSelecionados(new Set());
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white dark:bg-[#201b5d] rounded-xl shadow-lg p-8 w-full max-w-lg">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Novo Objetivo</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Nome do Objetivo</label><input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/></div>
                        <div><label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Valor Alvo (R$)</label><input type="number" value={valorAlvo} onChange={(e) => setValorAlvo(e.target.value)} required className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/></div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Ícone</label>
                        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">{iconesDisponiveis.map((IconInfo, index) => { const Icone = IconInfo.component; const isSelected = iconeSelecionado === Icone; return ( <button key={index} type="button" onClick={() => setIconeSelecionado(Icone)} className={`p-3 rounded-lg flex items-center justify-center transition-all ${isSelected ? 'bg-[#00d971] text-white scale-110' : 'bg-slate-200 dark:bg-[#2a246f] text-gray-600 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-[#3e388b]'}`}><Icone size={24}/></button> )})}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Vincular Investimentos</label>
                        <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-slate-100 dark:bg-[#2a246f] rounded-lg">
                            {mockInvestimentos.map(inv => (
                                <label key={inv.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-200 dark:hover:bg-[#3e388b] cursor-pointer">
                                    <input type="checkbox" checked={investimentosSelecionados.has(inv.id)} onChange={() => handleToggleInvestimento(inv.id)} className="form-checkbox h-4 w-4 text-[#00d971] bg-slate-300 dark:bg-gray-700 border-gray-600 rounded focus:ring-0"/>
                                    <span className="text-sm text-slate-800 dark:text-gray-300">{inv.nome}</span>
                                    <span className="ml-auto text-sm font-semibold text-slate-800 dark:text-white">{formatCurrency(inv.valor)}</span>
                                </label>
                            ))}
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