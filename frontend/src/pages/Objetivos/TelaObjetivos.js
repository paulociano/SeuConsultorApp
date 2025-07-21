import React, { useState, useContext, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, Trash2, PlusCircle, Trophy, Grid2X2, Rotate3D } from 'lucide-react';
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
  const [modoGamificado, setModoGamificado] = useState(false);
  const [objetivoSelecionadoId, setObjetivoSelecionadoId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [girarObjetivos, setGirarObjetivos] = useState(false);
  const [hoveredObjectiveId, setHoveredObjectiveId] = useState(null);

  const mockObjetivosInicial = [
    { id: 1, nome: 'Casa na Praia', icon: Home, valorAlvo: 800000, investimentosLinkados: ['inv1', 'inv3'], aporteMensal: 3000 },
    { id: 2, nome: 'Viagem ao Japão', icon: Plane, valorAlvo: 40000, investimentosLinkados: ['inv2'], aporteMensal: 1000 },
    { id: 3, nome: 'Carro Novo', icon: Car, valorAlvo: 120000, investimentosLinkados: ['inv1'], aporteMensal: 2500 },
    { id: 4, nome: 'Fundo de Emergência', icon: Shield, valorAlvo: 50000, investimentosLinkados: ['inv1', 'inv2'], aporteMensal: 500 },
  ];

  const [objetivos, setObjetivos] = useState(mockObjetivosInicial);

  const objetivosCalculados = useMemo(() => objetivos.map(obj => {
    const valorAtual = obj.investimentosLinkados.reduce((acc, invId) => {
      const investimento = mockInvestimentos.find(i => i.id === invId);
      return acc + (investimento ? investimento.valor : 0);
    }, 0);
    return { ...obj, valorAtual };
  }), [objetivos]);

  const metaSelecionada = useMemo(() => objetivosCalculados.find(o => o.id === objetivoSelecionadoId), [objetivosCalculados, objetivoSelecionadoId]);

  const progressoMetaDetalhe = useMemo(() => {
    if (!metaSelecionada) return null;
    const percentual = metaSelecionada.valorAlvo > 0 ? (metaSelecionada.valorAtual / metaSelecionada.valorAlvo) * 100 : 0;
    return {
      percentual: Math.min(percentual, 100),
      data: [
        { name: 'Alcançado', value: metaSelecionada.valorAtual },
        { name: 'Faltante', value: Math.max(0, metaSelecionada.valorAlvo - metaSelecionada.valorAtual) }
      ]
    };
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

  const renderClássico = () => {
    const raioBase = 120;
    const objetivosPorAnel = [];
    for (let i = 0; i < objetivosCalculados.length; i += 5) {
      objetivosPorAnel.push(objetivosCalculados.slice(i, i + 5));
    }

    return (
      <div className="flex flex-col items-center justify-center pt-4 relative min-h-[500px] mb-4">
        <div className="relative flex items-center justify-center" style={{ width: `${(raioBase + objetivosPorAnel.length * 80) * 2}px`, height: `${(raioBase + objetivosPorAnel.length * 80) * 2}px` }}>
          <div className="absolute z-30">
            <img src={userImage} alt="Usuário" className="w-24 h-24 rounded-full border-4 border-white dark:border-[#201b5d] shadow-lg" />
          </div>
          {objetivosPorAnel.map((anel, anelIndex) => {
            const raioAtual = raioBase + (anelIndex * 80);
            const totalObjetivosNoAnel = anel.length;
            return (
              <React.Fragment key={anelIndex}>
                <div className="absolute top-1/2 left-1/2 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-full animate-spin-slow pointer-events-none" style={{ width: `${raioAtual * 2}px`, height: `${raioAtual * 2}px`, transform: 'translate(-50%, -50%)' }}></div>
                {anel.map((objetivo, objIndex) => {
                  let angulo = (objIndex / totalObjetivosNoAnel) * 2 * Math.PI - (Math.PI / 2);
                  if (anelIndex % 2 !== 0) angulo += Math.PI / totalObjetivosNoAnel;
                  const x = raioAtual * Math.cos(angulo);
                  const y = raioAtual * Math.sin(angulo);
                  const Icone = objetivo.icon;
                  const porcentagemAtingida = objetivo.valorAlvo > 0 ? (objetivo.valorAtual / objetivo.valorAlvo) * 100 : 0;
                  return (
                    <div key={objetivo.id} className="absolute flex flex-col items-center z-10" style={{ top: '50%', left: '50%', transform: `translate(-50%, -50%) translate(${x}px, ${y}px)` }}>
                      <div className="relative w-20 h-20">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie data={[{ value: objetivo.valorAtual }, { value: Math.max(0, objetivo.valorAlvo - objetivo.valorAtual) }]} dataKey="value" startAngle={90} endAngle={-270} innerRadius="85%" outerRadius="100%" paddingAngle={2}>
                              <Cell fill="#00d971" /><Cell fill={theme === 'dark' ? '#2a246f' : '#e2e8f0'} />
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <motion.button
                            onClick={() => setObjetivoSelecionadoId(objetivo.id)}
                            onMouseEnter={() => setHoveredObjectiveId(objetivo.id)}
                            onMouseLeave={() => setHoveredObjectiveId(null)}
                            className="absolute inset-2 bg-white dark:bg-[#2a246f] rounded-full flex items-center justify-center shadow-md hover:scale-110 transition-transform"
                        >
                            <AnimatePresence mode="wait">
                                {hoveredObjectiveId === objetivo.id ? (
                                    <motion.span
                                        key="percentage"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ duration: 0.2 }}
                                        className="text-sm font-bold text-[#00d971]"
                                    >
                                        {porcentagemAtingida.toFixed(0)}%
                                    </motion.span>
                                ) : (
                                    <motion.div
                                        key="icon"
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.8 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Icone size={24} className="text-[#00d971]" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>
                      </div>
                      <p className="mt-2 text-xs font-semibold text-center text-slate-600 dark:text-gray-400 w-24 truncate">{objetivo.nome}</p>
                    </div>
                  );
                })}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  };

  const renderGamificado = () => (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
      {objetivosCalculados.map(obj => {
        const porcentagem = obj.valorAlvo > 0 ? (obj.valorAtual / obj.valorAlvo) * 100 : 0;
        const completo = porcentagem >= 100;
        const Icone = obj.icon; // Obter o componente de ícone

        return (
          <motion.div
            key={obj.id}
            onClick={() => setObjetivoSelecionadoId(obj.id)}
            onMouseEnter={() => setHoveredObjectiveId(obj.id)}
            onMouseLeave={() => setHoveredObjectiveId(null)}
            whileHover={{ scale: 1.03 }}
            className="cursor-pointer rounded-xl shadow-md p-4 bg-white dark:bg-[#2a246f] transition-all border border-transparent hover:border-[#00d971] flex flex-col justify-between" // Adicionado flex-col e justify-between
          >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    {/* Renderização condicional para ícone ou porcentagem */}
                    <AnimatePresence mode="wait">
                        {hoveredObjectiveId === obj.id ? (
                            <motion.span
                                key="percentage-gamified"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                                className="text-sm font-bold text-[#00d971] w-6 h-6 flex items-center justify-center" // Ajustar tamanho se necessário
                            >
                                {porcentagem.toFixed(0)}%
                            </motion.span>
                        ) : (
                            <motion.div
                                key="icon-gamified"
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{ duration: 0.2 }}
                            >
                                <Icone size={24} className="text-[#00d971]" />
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <h2 className="font-semibold text-slate-800 dark:text-white truncate">{obj.nome}</h2>
                </div>
                {completo && <Trophy className="text-yellow-400" title="Objetivo Concluído" />}
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">{formatCurrency(obj.valorAtual)} de {formatCurrency(obj.valorAlvo)}</p>
            <div className="relative w-full h-3 bg-slate-200 dark:bg-slate-700 rounded mt-2">
              <div className="absolute top-0 left-0 h-3 rounded bg-[#00d971]" style={{ width: `${Math.min(porcentagem, 100)}%` }}></div>
            </div>
            {obj.aporteMensal > 0 && <p className="text-xs mt-1 text-gray-400">Aporte: {formatCurrency(obj.aporteMensal)} / mês</p>}
          </motion.div>
        );
      })}
    </div>
  );

  const renderDetalheObjetivo = () => {
    if (!metaSelecionada || !progressoMetaDetalhe) return null;
    return (
      <motion.div
        key="detalhe"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="max-w-xl mx-auto">
          <button onClick={() => setObjetivoSelecionadoId(null)} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white mb-4">
            <ArrowLeft size={16} /> Voltar para todos os objetivos
          </button>
          <Card>
            <div className="flex flex-col items-center text-center">
              <div className="flex justify-end w-full gap-4 -mt-2 -mr-2">
                <button onClick={() => handleDeleteObjetivo(metaSelecionada.id)} className="text-gray-500 dark:text-gray-400 hover:text-red-500">
                  <Trash2 size={18} />
                </button>
              </div>
              <div className="p-4 bg-slate-200 dark:bg-[#2a246f] rounded-full mb-4 -mt-4">
                <metaSelecionada.icon size={32} className="text-[#00d971]" />
              </div>
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{metaSelecionada.nome}</h1>
              <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">Alcançado: <span className="font-bold text-[#00d971]">{formatCurrency(metaSelecionada.valorAtual)}</span> de {formatCurrency(metaSelecionada.valorAlvo)}</p>
              <div className="relative w-48 h-48 my-4">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={progressoMetaDetalhe.data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="70%" outerRadius="90%" startAngle={90} endAngle={-270} paddingAngle={2}>
                      <Cell fill="#00d971" stroke="none" />
                      <Cell fill={theme === 'dark' ? '#2a246f' : '#e2e8f0'} stroke="none" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-3xl font-bold text-slate-800 dark:text-white">{progressoMetaDetalhe.percentual.toFixed(0)}%</span>
                </div>
              </div>
              <div className="w-full text-left mt-4">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Investimentos Vinculados</h3>
                <div className="space-y-2">
                  {metaSelecionada.investimentosLinkados.map(invId => {
                    const investimento = mockInvestimentos.find(i => i.id === invId);
                    return (
                      <div key={invId} className="flex justify-between items-center p-3 bg-slate-100 dark:bg-[#2a246f] rounded-lg">
                        <span className="font-medium text-slate-700 dark:text-gray-300">{investimento?.nome || 'Investimento não encontrado'}</span>
                        <span className="font-bold text-slate-800 dark:text-white">{investimento ? formatCurrency(investimento.valor) : ''}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Card>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex justify-between items-center mb-4">
        <button onClick={() => setModoGamificado(prev => !prev)} className="flex items-center gap-2 text-sm bg-[#00d971] text-white px-4 py-1.5 rounded hover:brightness-110">
          {modoGamificado ? <Rotate3D size={16} /> : <Grid2X2 size={16} />} Mudar para modo {modoGamificado ? 'Clássico' : 'Gamificado'}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {objetivoSelecionadoId ? renderDetalheObjetivo() : (modoGamificado ? renderGamificado() : renderClássico())}
      </AnimatePresence>

      <button onClick={() => setIsModalOpen(true)} className="fixed bottom-10 right-10 bg-[#00d971] text-black w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-30">
        <PlusCircle size={32} />
      </button>
      <ModalObjetivo isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveObjetivo} />
    </div>
  );
};

export default TelaObjetivos;