import React from 'react';
import { useState, useContext, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Trash2, PlusCircle } from 'lucide-react';
import Card from '../../components/Card/Card';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ThemeContext } from '../../ThemeContext';
import ModalObjetivo from '../../components/Modals/ModalObjetivo';
import { mockInvestimentos } from '../../components/mocks/mockInvestimentos';
import userImage from '../../assets/persona.jpg';
import { Home, Plane, Car, Shield } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';
import { v4 as uuidv4 } from 'uuid';

const TelaObjetivos = () => {
    const { theme } = useContext(ThemeContext);
    
    const mockObjetivosInicial = [
        { id: 1, nome: 'Casa na Praia', icon: Home, valorAlvo: 800000, investimentosLinkados: ['inv1', 'inv3'] },
        { id: 2, nome: 'Viagem ao Japão', icon: Plane, valorAlvo: 40000, investimentosLinkados: ['inv2'] },
        { id: 3, nome: 'Carro Novo', icon: Car, valorAlvo: 120000, investimentosLinkados: ['inv1'] },
        { id: 4, nome: 'Fundo de Emergência', icon: Shield, valorAlvo: 50000, investimentosLinkados: ['inv1', 'inv2'] },
    ];

    const [objetivos, setObjetivos] = useState(mockObjetivosInicial);
    const [objetivoSelecionadoId, setObjetivoSelecionadoId] = useState(null);
    const [objetivoHoveredId, setObjetivoHoveredId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

     const objetivosCalculados = useMemo(() => {
    return objetivos.map(obj => {
      const valorAtual = obj.investimentosLinkados.reduce((acc, invId) => {
        const investimento = mockInvestimentos.find(i => i.id === invId);
        return acc + (investimento ? investimento.valor : 0);
      }, 0);
      return { ...obj, valorAtual };
    });
  }, [objetivos]);

    const metaSelecionada = useMemo(() => {
        return objetivosCalculados.find(o => o.id === objetivoSelecionadoId);
    }, [objetivosCalculados, objetivoSelecionadoId]);

    const progressoMetaDetalhe = useMemo(() => {
        if (!metaSelecionada) return null;
        const percentual = metaSelecionada.valorAlvo > 0 ? (metaSelecionada.valorAtual / metaSelecionada.valorAlvo) * 100 : 0;
        return {
            percentual: Math.min(percentual, 100),
            donutData: [
                { name: 'Alcançado', value: metaSelecionada.valorAtual },
                { name: 'Faltante', value: Math.max(0, metaSelecionada.valorAlvo - metaSelecionada.valorAtual) }
            ]
        }
    }, [metaSelecionada]);

    const handleSaveObjetivo = (dadosDoForm) => {
        const novoObjetivo = { ...dadosDoForm, id: uuidv4() };
        setObjetivos(prev => [...prev, novoObjetivo]);
        setIsModalOpen(false);
    };

    const handleDeleteObjetivo = (id) => {
        if (window.confirm("Tem certeza que deseja excluir este objetivo?")) {
            setObjetivos(prev => prev.filter(o => o.id !== id));
            setObjetivoSelecionadoId(null);
        }
    };
    
    const raioBase = 120;
    const objetivosPorAnel = [];
    for (let i = 0; i < objetivosCalculados.length; i += 5) {
        objetivosPorAnel.push(objetivosCalculados.slice(i, i + 5));
    }

    return (
        <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
                {metaSelecionada ? (
                    <motion.div
                        key="detalhe"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <div className="max-w-xl mx-auto">
                            <button onClick={() => setObjetivoSelecionadoId(null)} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white mb-4"><ArrowLeft size={16} /> Voltar para todos os objetivos</button>
                            <Card>
                                <div className="flex flex-col items-center text-center">
                                    <div className="flex justify-end w-full gap-4 -mt-2 -mr-2">
                                         <button onClick={() => handleDeleteObjetivo(metaSelecionada.id)} className="text-gray-500 dark:text-gray-400 hover:text-red-500"><Trash2 size={18}/></button>
                                    </div>
                                    <div className="p-4 bg-slate-200 dark:bg-[#2a246f] rounded-full mb-4 -mt-4">
                                        <metaSelecionada.icon size={32} className="text-[#00d971]" />
                                    </div>
                                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{metaSelecionada.nome}</h1>
                                    <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">Alcançado: <span className="font-bold text-[#00d971]">{formatCurrency(metaSelecionada.valorAtual)}</span> de {formatCurrency(metaSelecionada.valorAlvo)}</p>
                                    <div className="relative w-48 h-48 my-4">
                                        <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={progressoMetaDetalhe.donutData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="70%" outerRadius="90%" startAngle={90} endAngle={-270} paddingAngle={2}><Cell fill="#00d971" stroke="none" /><Cell fill={theme === 'dark' ? '#2a246f' : '#e2e8f0'} stroke="none" /></Pie></PieChart></ResponsiveContainer>
                                        <div className="absolute inset-0 flex items-center justify-center"><span className="text-3xl font-bold text-slate-800 dark:text-white">{progressoMetaDetalhe.percentual.toFixed(0)}%</span></div>
                                    </div>
                                    <div className="w-full text-left mt-4">
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Investimentos Vinculados</h3>
                                        <div className="space-y-2">
                                            {metaSelecionada.investimentosLinkados.length > 0 ? metaSelecionada.investimentosLinkados.map(invId => {
                                                const investimento = mockInvestimentos.find(i => i.id === invId);
                                                return ( <div key={invId} className="flex justify-between items-center p-3 bg-slate-100 dark:bg-[#2a246f] rounded-lg"><span className="font-medium text-slate-700 dark:text-gray-300">{investimento ? investimento.nome : 'Investimento não encontrado'}</span><span className="font-bold text-slate-800 dark:text-white">{investimento ? formatCurrency(investimento.valor) : ''}</span></div> );
                                            }) : <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">Nenhum investimento vinculado a este objetivo.</p>}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="geral"
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <div className="flex flex-col items-center justify-center pt-4 relative min-h-[500px] mb-4">
                            <div className="relative flex items-center justify-center" style={{ width: `${(raioBase + objetivosPorAnel.length * 80) * 2}px`, height: `${(raioBase + objetivosPorAnel.length * 80) * 2}px` }}>
                                <div className="absolute z-30"><img src={userImage} alt="Usuário" className="w-24 h-24 rounded-full border-4 border-white dark:border-[#201b5d] shadow-lg"/></div>
                                {objetivosPorAnel.map((anel, anelIndex) => {
                                    const raioAtual = raioBase + (anelIndex * 80);
                                    const totalObjetivosNoAnel = anel.length;
                                    return (
                                        <React.Fragment key={anelIndex}>
                                            <div className="absolute top-1/2 left-1/2 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-full animate-spin-slow pointer-events-none" style={{ width: `${raioAtual * 2}px`, height: `${raioAtual * 2}px`, transform: 'translate(-50%, -50%)' }}></div>
                                            {anel.map((objetivo, objIndex) => {
                                                let angulo = (objIndex / totalObjetivosNoAnel) * 2 * Math.PI - (Math.PI / 2);
                                                if (anelIndex % 2 !== 0) { const anguloOffset = Math.PI / totalObjetivosNoAnel; angulo += anguloOffset; }
                                                const x = raioAtual * Math.cos(angulo);
                                                const y = raioAtual * Math.sin(angulo);
                                                const Icone = objetivo.icon;
                                                const progressoData = [ { value: objetivo.valorAtual }, { value: Math.max(0, objetivo.valorAlvo - objetivo.valorAtual) } ];
                                                const porcentagemAtingida = objetivo.valorAlvo > 0 ? (objetivo.valorAtual / objetivo.valorAlvo) * 100 : 0;
                                                return (
                                                    <div key={objetivo.id} className="absolute flex flex-col items-center z-10" style={{ top: '50%', left: '50%', transform: `translate(-50%, -50%) translate(${x}px, ${y}px)` }} onMouseEnter={() => setObjetivoHoveredId(objetivo.id)} onMouseLeave={() => setObjetivoHoveredId(null)}>
                                                        <div className="relative w-20 h-20">
                                                            <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={progressoData} dataKey="value" startAngle={90} endAngle={-270} innerRadius="85%" outerRadius="100%" cy="50%" cx="50%" paddingAngle={2}><Cell fill="#00d971" stroke="none" /><Cell fill={theme === 'dark' ? '#2a246f' : '#e2e8f0'} stroke="none"/></Pie></PieChart></ResponsiveContainer>
                                                            <button onClick={() => setObjetivoSelecionadoId(objetivo.id)} className="absolute inset-2 bg-white dark:bg-[#2a246f] rounded-full flex items-center justify-center shadow-md transform transition-transform hover:scale-110" title={objetivo.nome}>
                                                                {objetivoHoveredId === objetivo.id ? ( <span className="text-xs font-bold text-slate-800 dark:text-white">{porcentagemAtingida.toFixed(0)}%</span> ) : ( <Icone size={24} className="text-[#00d971]" /> )}
                                                            </button>
                                                        </div>
                                                        <p className="mt-2 text-xs font-semibold text-center text-slate-600 dark:text-gray-400 w-24 truncate">{objetivo.nome}</p>
                                                    </div>
                                                )
                                            })}
                                        </React.Fragment>
                                    )
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button onClick={() => setIsModalOpen(true)} className="fixed bottom-10 right-10 bg-[#00d971] text-black w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-30">
                <PlusCircle size={32} />
            </button>
            <ModalObjetivo isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveObjetivo} />
        </div>
    );
};

export default TelaObjetivos;