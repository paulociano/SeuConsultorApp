import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Sparkles, ArrowRight, Shuffle, Star, Award, TrendingUp } from 'lucide-react';

/*
  NOTA DE ESTILO:
  Este componente foi reescrito para utilizar a identidade visual fornecida pelo 'Card.js'.
  - Fundo do Card (Dark Mode): #201b5d
  - Sombra: shadow-lg
  - Borda (Dark Mode): Transparente
  - v2: Corrigido bug de posicionamento do selo "Melhor Escolha" e completada a renderização da tabela.
*/

// Importe o seu arquivo JSON de dados reestruturado.
const dadosDosCartoes = require('../../data/cartoes_credito.json');

// --- COMPONENTE DE CARD REUTILIZÁVEL ---
// Adicionada a classe `relative` para garantir que elementos filhos com `absolute` se posicionem corretamente.
const Card = ({ children, className = '' }) => (
  <div className={`relative bg-white dark:bg-[#201b5d] p-4 rounded-xl shadow-lg border border-slate-200 dark:border-transparent ${className}`}>
    {children}
  </div>
);


// --- COMPONENTES AUXILIARES ---

// Wizard interativo com a nova identidade visual
const Wizard = ({ onSubmit, onReset }) => {
    const [gastoMensal, setGastoMensal] = useState(5000);
    const [prioridade, setPrioridade] = useState('milhas');

    const handleSubmit = () => {
        onSubmit({ gastoMensal, prioridade });
    };

    const prioridadesOpcoes = [
        { id: 'milhas', label: 'Milhas', icon: '✈️' },
        { id: 'cashback', label: 'Cashback', icon: '💰' },
        { id: 'salas_vip', label: 'Salas VIP', icon: '🛋️' },
        { id: 'sem_anuidade', label: 'Sem Anuidade', icon: '💸' }
    ];

    return (
        <Card className="p-6 md:p-8">
            <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                            <Sparkles className="text-[#00d971]" /> Descubra seu Cartão Ideal
                        </h1>
                        <p className="text-slate-500 dark:text-slate-300 mt-2">Responda as perguntas e encontre o parceiro perfeito para suas compras.</p>
                    </div>
                    <button onClick={onReset} className="text-slate-500 dark:text-slate-300 hover:text-[#00d971] transition hidden md:flex items-center gap-2 text-sm font-semibold">
                        <Shuffle size={14} /> Começar de Novo
                    </button>
                </div>
                
                <div className="space-y-8 mt-8">
                    <div>
                        <label className="font-semibold block mb-3 text-slate-700 dark:text-slate-200">Qual seu gasto mensal estimado no cartão?</label>
                        <div className="flex items-center gap-4">
                            <span className="text-sm text-slate-500 dark:text-slate-400">R$ 1.000</span>
                            <input 
                                type="range" 
                                min="1000" 
                                max="50000" 
                                step="500" 
                                value={gastoMensal} 
                                onChange={e => setGastoMensal(Number(e.target.value))} 
                                className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00d971]"
                            />
                            <span className="font-bold text-lg w-28 text-right text-slate-800 dark:text-white">R$ {gastoMensal.toLocaleString('pt-BR')}</span>
                        </div>
                    </div>
                    <div>
                        <label className="font-semibold block mb-3 text-slate-700 dark:text-slate-200">O que você mais valoriza em um cartão?</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {prioridadesOpcoes.map(p => (
                                <button 
                                    key={p.id} 
                                    onClick={() => setPrioridade(p.id)} 
                                    className={`p-3 rounded-lg border-2 transition-all duration-200 text-center ${prioridade === p.id ? 'border-[#00d971] bg-[#00d971]/10 scale-105' : 'border-slate-300 dark:border-white/20 bg-transparent hover:border-slate-400 dark:hover:border-white/50'}`}
                                >
                                    <span className="text-3xl mb-2 block">{p.icon}</span>
                                    <span className={`font-semibold text-sm capitalize ${prioridade === p.id ? 'text-[#00d971]' : 'text-slate-700 dark:text-slate-200'}`}>{p.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-center mt-10">
                    <button onClick={handleSubmit} className="bg-[#00d971] hover:bg-[#00b860] text-black font-bold py-3 px-10 rounded-lg transition-all hover:scale-105 flex items-center gap-2">
                        Encontrar Recomendações <ArrowRight size={20} />
                    </button>
                </div>
            </motion.div>
        </Card>
    );
};

// Tabela de comparação rica e visual com a nova identidade visual
const TabelaComparativa = ({ cartoes, fecharComparacao }) => {
    const beneficios = [
        { key: 'anuidade', label: 'Anuidade' },
        { key: 'pontos', label: 'Pontos / Cashback' },
        { key: 'salas_vip', label: 'Salas VIP' },
        { key: 'spread_cambial', label: 'Spread Cambial' }
    ];

    const renderValorBeneficio = (cartao, beneficioKey) => {
        switch(beneficioKey) {
            case 'anuidade':
                return (
                    <div>
                        <span className="font-bold">{cartao.anuidade.valor > 0 ? `R$ ${cartao.anuidade.valor.toLocaleString('pt-BR')}` : 'Grátis'}</span>
                        {cartao.anuidade.isencao && cartao.anuidade.isencao.gasto_mensal && <div className="text-xs text-slate-500 dark:text-slate-400">Isenção com R$ {cartao.anuidade.isencao.gasto_mensal.toLocaleString('pt-BR')}/mês</div>}
                    </div>
                );
            case 'pontos':
                const temPontos = cartao.pontos?.pontos_por_dolar?.base;
                const temCashback = cartao.pontos?.cashback_opcao && cartao.pontos.cashback_percentual;
                if (!temPontos && !temCashback) return <span className="text-slate-500 dark:text-slate-400">N/A</span>;
                return (
                    <div className="space-y-1 text-left">
                        {temPontos && (
                            <div>
                                <span className="font-bold">{cartao.pontos.pontos_por_dolar.base} pts / U$</span>
                                {cartao.pontos.pontos_por_dolar.maximo && <span className="text-xs text-slate-500 dark:text-slate-400"> (até {cartao.pontos.pontos_por_dolar.maximo})</span>}
                            </div>
                        )}
                        {temCashback && (
                            <div className="text-sm"><span className="font-bold">{cartao.pontos.cashback_percentual}% de Cashback</span></div>
                        )}
                    </div>
                );
            case 'salas_vip':
                const acessos = Object.entries(cartao.salas_vip).filter(([_, v]) => v && (v.acessos > 0 || v.acessos === 'ilimitado'));
                if (acessos.length === 0) return <span className="text-slate-500 dark:text-slate-400">Nenhum</span>;
                return (
                    <div className="space-y-1 text-left">
                        {acessos.map(([key, val]) => (
                            <div key={key} className="text-xs capitalize">{key.replace(/_/g, ' ')}: <span className="font-bold">{val.acessos}</span></div>
                        ))}
                    </div>
                );
            case 'spread_cambial':
                if (cartao.spread === null || cartao.spread === undefined) return <span className="text-slate-500 dark:text-slate-400">Não informado</span>
                return <span className={`font-bold ${cartao.spread === 0 ? 'text-[#00d971]' : 'dark:text-white'}`}>{cartao.spread}%</span>;
            default: return 'N/A';
        }
    };

    return (
        <Card className="p-0 overflow-hidden">
            <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: 'auto', opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
                className="w-full"
            >
                <div className="p-4 border-b border-slate-200 dark:border-white/10 flex justify-between items-center flex-shrink-0">
                    <h2 className="font-bold text-xl text-slate-800 dark:text-white">Comparativo Detalhado</h2>
                    <button onClick={fecharComparacao} className="text-slate-500 dark:text-slate-300 hover:text-red-500"><X /></button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 dark:bg-white/5">
                            <tr>
                                <th className="p-4 text-slate-600 dark:text-slate-300 font-semibold w-1/4">Benefício</th>
                                {cartoes.map(c => (
                                    <th key={c.id} className="p-4 min-w-[200px] text-center">
                                        <img src={c.imagem_url} alt={c.nome} className="w-24 mx-auto rounded-lg mb-2 shadow-md"/>
                                        <span className="font-semibold text-slate-800 dark:text-white">{c.nome}</span>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-white/10">
                            {beneficios.map(beneficio => (
                                <tr key={beneficio.key} className="hover:bg-slate-50 dark:hover:bg-white/10">
                                    <td className="p-4 font-semibold text-slate-600 dark:text-slate-400 capitalize">{beneficio.label}</td>
                                    {cartoes.map(cartao => (
                                        <td key={cartao.id} className="p-4 text-center text-slate-700 dark:text-slate-200 align-top">
                                            {renderValorBeneficio(cartao, beneficio.key)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </Card>
    );
};


// --- COMPONENTE PRINCIPAL ---
const TelaCartoes = () => {
    const [recomendacoes, setRecomendacoes] = useState([]);
    const [cartoesParaComparar, setCartoesParaComparar] = useState([]);
    const [wizardKey, setWizardKey] = useState(1);
    
    // As lógicas de cálculo e estado permanecem as mesmas.
    const calcularCompatibilidade = (cartao, preferencias) => {
        let score = 0;
        const { gastoMensal, prioridade } = preferencias;
        if (cartao.anuidade.valor === 0) {
            score += 30;
            if (prioridade === 'sem_anuidade') score += 50;
        } else if (cartao.anuidade.isencao && cartao.anuidade.isencao.gasto_mensal && gastoMensal >= cartao.anuidade.isencao.gasto_mensal) {
            score += 25;
        } else {
            score -= cartao.anuidade.valor / 100;
        }
        if (prioridade === 'milhas' && cartao.pontos?.pontos_por_dolar?.base) score += cartao.pontos.pontos_por_dolar.base * 20;
        if (prioridade === 'cashback' && cartao.pontos?.cashback_percentual) score += cartao.pontos.cashback_percentual * 40;
        const totalAcessos = Object.values(cartao.salas_vip).reduce((acc, val) => {
            if (!val || !val.acessos) return acc;
            if (val.acessos === 'ilimitado') return acc + 10;
            return acc + val.acessos;
        }, 0);
        if (totalAcessos > 0 && prioridade === 'salas_vip') score += totalAcessos * 5;
        return Math.max(0, Math.round(score));
    };
    const handleWizardSubmit = (preferencias) => {
        const recomendacoesComPontos = dadosDosCartoes.map(cartao => ({...cartao, compatibilidade: calcularCompatibilidade(cartao, preferencias)})).sort((a, b) => b.compatibilidade - a.compatibilidade);
        setRecomendacoes(recomendacoesComPontos);
    };
    const handleReset = () => {
        setRecomendacoes([]);
        setCartoesParaComparar([]);
        setWizardKey(prev => prev + 1);
    };
    const toggleComparacao = (cartaoId) => {
        setCartoesParaComparar(prev => {
            if (prev.includes(cartaoId)) return prev.filter(id => id !== cartaoId);
            if (prev.length < 4) return [...prev, cartaoId];
            return prev;
        });
    };
    const cartoesComparados = useMemo(() => dadosDosCartoes.filter(c => cartoesParaComparar.includes(c.id)), [cartoesParaComparar]);

    return (
        <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-10 bg-slate-50 dark:bg-gray-900 min-h-screen">
            <Wizard key={wizardKey} onSubmit={handleWizardSubmit} onReset={handleReset} />

            <AnimatePresence>
            {recomendacoes.length > 0 && (
                 <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
                    <div className="flex items-center gap-3">
                        <Award className="text-[#00d971]" size={28} />
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Suas Recomendações</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recomendacoes.slice(0, 9).map((cartao, index) => (
                            <motion.div 
                                key={cartao.id} 
                                layout
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0, transition: { delay: index * 0.05 } }}
                                className="h-full"
                            >
                                <Card className={`transition-all duration-200 h-full flex flex-col ${cartoesParaComparar.includes(cartao.id) ? '!border-2 !border-[#00d971]' : 'hover:-translate-y-1'}`}>
                                    {index === 0 && <div className="absolute -top-3 -right-3 bg-[#00d971] text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1"><Star size={12}/> MELHOR ESCOLHA</div>}
                                    <div className="absolute top-3 left-3 bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold px-2 py-1 rounded-full flex items-center gap-1.5">
                                        <TrendingUp size={14} className="text-[#00d971]"/>
                                        {cartao.compatibilidade} pts
                                    </div>
                                    
                                    <div className="flex-grow flex flex-col items-center justify-center pt-10">
                                      <img src={cartao.imagem_url} alt={cartao.nome} className="w-40 mx-auto rounded-lg shadow-md mb-4"/>
                                      <p className="font-bold text-center text-slate-800 dark:text-white h-12 flex items-center justify-center">{cartao.nome}</p>
                                      <div className="text-xs text-center text-slate-500 dark:text-slate-400">{cartao.bandeira} {cartao.nivel}</div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => toggleComparacao(cartao.id)}
                                        className={`w-full mt-4 py-2.5 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${cartoesParaComparar.includes(cartao.id) ? 'bg-[#00d971] text-black' : 'bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-white/20'}`}
                                    >
                                        <Check size={16} /> {cartoesParaComparar.includes(cartao.id) ? 'Selecionado' : 'Comparar'}
                                    </button>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                 </motion.div>
            )}
            </AnimatePresence>

            <AnimatePresence>
            {cartoesComparados.length > 1 && (
                <TabelaComparativa 
                    cartoes={cartoesComparados} 
                    fecharComparacao={() => setCartoesParaComparar([])}
                />
            )}
            </AnimatePresence>
        </div>
    );
};

export default TelaCartoes;