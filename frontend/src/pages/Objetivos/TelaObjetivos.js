import React, { useState, useContext, useMemo, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
    ArrowLeft, Trash2, PlusCircle, Trophy, Grid2X2, Rotate3D, Pencil,
    Home, Plane, Car, Shield, Briefcase, School, Gift, HeartHandshake,
    Loader, Award
} from 'lucide-react';
import Card from '../../components/Card/Card';
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ThemeContext } from '../../ThemeContext';
import ModalObjetivo from '../../components/Modals/ModalObjetivo';
import userImage from '../../assets/persona.jpg';
import { formatCurrency } from '../../utils/formatters';
import LoaderLogo from '../../components/Loader/loaderlogo';
import { useObjetivosStore } from '../../stores/useObjetivosStore';
import { usePatrimonioStore } from '../../stores/usePatrimonioStore';
import { useAchievementsStore } from '../../stores/useAchievementsStore';
// --- INÍCIO DAS ADIÇÕES PARA O ONBOARDING ---
import Joyride from 'react-joyride';
import { useOnboarding } from '../../hooks/useOnboarding';
// --- FIM DAS ADIÇÕES PARA O ONBOARDING ---

// Estilos para o efeito de brilho (sem alterações)
const shineEffectStyles = `
  .shine-card::before {
    content: "";
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background: radial-gradient(
      circle at var(--mouse-x) var(--mouse-y),
      rgba(255, 215, 0, 0.4) 0%,
      rgba(255, 215, 0, 0) 35%,
      rgba(255, 215, 0, 0) 100%
    );
    border-radius: inherit;
    opacity: 0;
    transition: opacity 0.2s;
    z-index: 20; /* Garante que o brilho fique por cima do conteúdo do card */
  }

  .shine-card:hover::before {
    opacity: 1;
  }
`;

const iconMap = {
    Home, Plane, Car, Shield, Briefcase, School, Gift, HeartHandshake
};

// ==================================================================================
//  INÍCIO DA CORREÇÃO
// ==================================================================================
const BadgeCard = ({ achievement }) => {
    const Icon = achievement.icon;
    const unlocked = achievement.unlocked;
    
    const containerRef = useRef(null); // Renomeado para maior clareza

    useEffect(() => {
        const element = containerRef.current;
        if (!element || !unlocked) return;

        const handleMouseMove = (e) => {
            const rect = element.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            element.style.setProperty('--mouse-x', `${x}px`);
            element.style.setProperty('--mouse-y', `${y}px`);
        };

        element.addEventListener('mousemove', handleMouseMove);

        return () => {
            element.removeEventListener('mousemove', handleMouseMove);
        };
    }, [unlocked]);

    return (
        // 1. Envolvemos tudo em uma 'div'. A 'ref' e as classes de efeito vêm para esta 'div'.
        <div
            ref={containerRef}
            // A 'div' agora controla a aparência do brilho e o arredondamento
            className={`relative rounded-xl transition-all duration-300 ${unlocked ? 'shine-card' : ''}`}
        >
            <Card 
                // 2. O Card interno agora só controla a cor de fundo e a opacidade.
                className={`w-full h-full transition-all duration-300 ${unlocked ? 'opacity-100 border-yellow-400/50' : 'opacity-60 bg-slate-50 dark:bg-slate-800/50'}`}
            >
                <div className="flex flex-col items-center text-center p-3">
                    <div className={`w-14 h-14 mb-3 rounded-full flex items-center justify-center border-2 ${unlocked ? 'border-yellow-400 bg-yellow-400/20' : 'border-gray-300 dark:border-gray-600'}`}>
                        <Icon size={28} className={unlocked ? 'text-yellow-500' : 'text-gray-400 dark:text-gray-500'} />
                    </div>
                    <h4 className={`font-semibold text-sm ${unlocked ? 'text-slate-800 dark:text-white' : 'text-gray-500'}`}>{achievement.name}</h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400 h-8 mt-1">{achievement.description}</p>
                </div>
            </Card>
        </div>
    );
};
// ==================================================================================
//  FIM DA CORREÇÃO
// ==================================================================================


const TelaObjetivos = () => {
    const { theme } = useContext(ThemeContext);

    const { objetivos, isLoading: isLoadingObjetivos, fetchObjetivos, saveObjetivo, deleteObjetivo } = useObjetivosStore();
    const { ativos, isLoading: isLoadingPatrimonio, fetchPatrimonio } = usePatrimonioStore();
    const { achievements, updateAchievements } = useAchievementsStore();

    const [modoGamificado, setModoGamificado] = useState(false);
    const [objetivoSelecionadoId, setObjetivoSelecionadoId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hoveredObjectiveId, setHoveredObjectiveId] = useState(null);
    const [objetivoParaEditar, setObjetivoParaEditar] = useState(null);

    // --- INÍCIO DA LÓGICA DO ONBOARDING ---
    const TOUR_KEY = 'objetivos_tour';
    const { runTour, handleTourEnd } = useOnboarding(TOUR_KEY);

    const tourSteps = [
        {
          target: 'body',
          content: 'Bem-vindo à tela de Objetivos! Vamos fazer um tour rápido pelas funcionalidades.',
          placement: 'center',
          disableBeacon: true,
        },
        {
          target: '#toggle-view-button',
          content: 'Você pode alternar entre a visualização "Gamificada", com cards, e a "Clássica", com uma visão orbital de suas metas.',
        },
        {
          target: '#main-view-container',
          content: 'Nesta área principal, você verá seus objetivos. Interaja com eles para ver mais detalhes.',
        },
        {
          target: '#conquistas-gallery',
          content: 'Ao completar objetivos, você desbloqueia conquistas que aparecerão aqui. Colecione todas!',
        },
        {
          target: '#add-objective-button',
          content: 'Para começar, clique aqui para adicionar seu primeiro objetivo financeiro!',
        }
    ];
    // --- FIM DA LÓGICA DO ONBOARDING ---

    useEffect(() => {
        fetchObjetivos();
        fetchPatrimonio();
    }, [fetchObjetivos, fetchPatrimonio]);

    const investimentosDisponiveis = useMemo(() =>
        ativos.filter(ativo => ativo.tipo === 'Investimentos'),
        [ativos]
    );

    const objetivosCalculados = useMemo(() => objetivos.map(obj => ({
        ...obj,
        valorAtual: parseFloat(obj.valorAtual) || 0,
        valorAlvo: parseFloat(obj.valor_alvo) || 0,
        aporteMensal: parseFloat(obj.aporte_mensal) || 0,
        investimentosLinkados: obj.investimentos_linkados || []
    })), [objetivos]);

    useEffect(() => {
        if (objetivosCalculados.length > 0) {
            updateAchievements(objetivosCalculados);
        }
    }, [objetivosCalculados, updateAchievements]);

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

    const handleOpenModal = (objetivo = null) => {
        setObjetivoParaEditar(objetivo);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setObjetivoParaEditar(null);
    };

    const handleSaveObjetivo = (dadosDoForm) => {
        saveObjetivo(dadosDoForm);
        handleCloseModal();
    };

    const handleDeleteObjetivo = (id) => {
        deleteObjetivo(id);
        setObjetivoSelecionadoId(null);
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
                                    const Icone = iconMap[objetivo.icon] || Shield;
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
                                                            <motion.span key="percentage" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.2 }} className="text-sm font-bold text-[#00d971]">
                                                                {porcentagemAtingida.toFixed(0)}%
                                                            </motion.span>
                                                        ) : (
                                                            <motion.div key="icon" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.2 }}>
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

    const renderGamificado = () => {
        return (
            <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
                {objetivosCalculados.map(obj => {
                    const porcentagem = obj.valorAlvo > 0 ? (obj.valorAtual / obj.valorAlvo) * 100 : 0;
                    const completo = porcentagem >= 100;
                    const Icone = iconMap[obj.icon] || Shield;

                    return (
                        <motion.div
                            key={obj.id}
                            onClick={() => setObjetivoSelecionadoId(obj.id)}
                            onMouseEnter={() => setHoveredObjectiveId(obj.id)}
                            onMouseLeave={() => setHoveredObjectiveId(null)}
                            whileHover={{ scale: 1.03 }}
                            className="cursor-pointer rounded-xl shadow-md p-4 bg-white dark:bg-[#2a246f] transition-all border border-transparent hover:border-[#00d971] flex flex-col justify-between"
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <AnimatePresence mode="wait">
                                        {hoveredObjectiveId === obj.id ? (
                                            <motion.span key="percentage-gamified" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.2 }} className="text-sm font-bold text-[#00d971] w-6 h-6 flex items-center justify-center">
                                                {porcentagem.toFixed(0)}%
                                            </motion.span>
                                        ) : (
                                            <motion.div key="icon-gamified" initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }} transition={{ duration: 0.2 }}>
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
    };

    const renderDetalheObjetivo = () => {
        if (!metaSelecionada || !progressoMetaDetalhe) return null;
        const IconeDetalhe = iconMap[metaSelecionada.icon] || Shield;

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
                                <button onClick={() => handleOpenModal(metaSelecionada)} className="text-gray-500 dark:text-gray-400 hover:text-blue-500 transition-colors">
                                    <Pencil size={18} />
                                </button>
                                <button onClick={() => handleDeleteObjetivo(metaSelecionada.id)} className="text-gray-500 dark:text-gray-400 hover:text-red-500 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                            <div className="p-4 bg-slate-200 dark:bg-[#2a246f] rounded-full mb-4 -mt-4">
                                <IconeDetalhe size={32} className="text-[#00d971]" />
                            </div>
                            <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{metaSelecionada.nome}</h1>
                            <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">Alcançado: <span className="font-bold text-[#00d971]">{formatCurrency(metaSelecionada.valorAtual)}</span> de {formatCurrency(metaSelecionada.valorAlvo)}</p>
                            <div className="relative w-48 h-48 my-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie data={progressoMetaDetalhe.data} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="70%" outerRadius="90%" startAngle={90} endAngle={-270} paddingAngle={2}>
                                            <Cell fill="#00d971" stroke="none" /><Cell fill={theme === 'dark' ? '#2a246f' : '#e2e8f0'} stroke="none" />
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
                                    {metaSelecionada.investimentosLinkados.length > 0 ? metaSelecionada.investimentosLinkados.map(invId => {
                                        const investimento = ativos.find(i => i.id === invId);
                                        return (
                                            <div key={invId} className="flex justify-between items-center p-3 bg-slate-100 dark:bg-[#2a246f] rounded-lg">
                                                <span className="font-medium text-slate-700 dark:text-gray-300">{investimento?.nome || 'Investimento não encontrado'}</span>
                                                <span className="font-bold text-slate-800 dark:text-white">{investimento ? formatCurrency(investimento.valor) : ''}</span>
                                            </div>
                                        );
                                    }) : <p className="text-sm text-center text-gray-500 dark:text-gray-400">Nenhum investimento vinculado.</p>}
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>
            </motion.div>
        );
    };

    const renderConquistas = () => (
        <>
            <div className="flex items-center gap-3 mb-4">
                <Award className="text-yellow-500" size={24} />
                <h2 className="text-xl font-bold text-slate-800 dark:text-white">Galeria de Conquistas</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
                {achievements.map(ach => <BadgeCard key={ach.id} achievement={ach} />)}
            </div>
        </>
    );

    if (isLoadingObjetivos || isLoadingPatrimonio) {
        return (
            <LoaderLogo />
        );
    }
    
    return (
        <div className="max-w-6xl mx-auto px-4 pb-24">
            <Joyride
                steps={tourSteps}
                run={runTour}
                callback={handleTourEnd}
                continuous={true}
                showProgress={true}
                showSkipButton={true}
                locale={{
                    back: 'Voltar',
                    close: 'Fechar',
                    last: 'Fim',
                    next: 'Próximo',
                    skip: 'Pular',
                }}
                styles={{
                    options: {
                      arrowColor: '#fff',
                      backgroundColor: '#fff',
                      primaryColor: '#00d971',
                      textColor: '#333',
                      zIndex: 1000,
                    }
                }}
            />
            <style>{shineEffectStyles}</style>

            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Seus Objetivos</h1>
                <button 
                    id="toggle-view-button" // ID para o tour
                    onClick={() => setModoGamificado(prev => !prev)} 
                    className="flex items-center gap-2 text-sm bg-slate-200 dark:bg-[#2a246f] text-slate-700 dark:text-white px-4 py-1.5 rounded-lg hover:bg-slate-300 dark:hover:bg-[#3e388b] transition-colors"
                >
                    {modoGamificado ? <Rotate3D size={16} /> : <Grid2X2 size={16} />}
                    <span>{modoGamificado ? 'Modo Clássico' : 'Modo Gamificado'}</span>
                </button>
            </div>

            <AnimatePresence mode="wait">
                {objetivoSelecionadoId ? renderDetalheObjetivo() : (
                    objetivosCalculados.length > 0 ? (
                        <motion.div 
                            key="main-view"
                            id="main-view-container" // ID para o tour
                        >
                            {modoGamificado ? renderGamificado() : renderClássico()}
                        </motion.div>
                    ) : (
                        <div key="empty-state" className="text-center py-20">
                            <p className="text-gray-500 dark:text-gray-400">Você ainda não tem nenhum objetivo.</p>
                            <p className="text-gray-500 dark:text-gray-400">Clique no botão <span className="text-[#00d971] font-bold">+</span> para começar a planejar seu futuro!</p>
                        </div>
                    )
                )}
            </AnimatePresence>

            {!objetivoSelecionadoId && (
                <div 
                    id="conquistas-gallery" // ID para o tour
                    className="mt-12"
                >
                    <AnimatePresence>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                        >
                            {renderConquistas()}
                        </motion.div>
                    </AnimatePresence>
                </div>
            )}

            <button 
                id="add-objective-button" // ID para o tour
                onClick={() => handleOpenModal()} 
                className="fixed bottom-10 right-10 bg-[#00d971] text-black w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-30"
            >
                <PlusCircle size={32} />
            </button>

            {isModalOpen && (
                <ModalObjetivo
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveObjetivo}
                    investimentosDisponiveis={investimentosDisponiveis}
                    objetivoExistente={objetivoParaEditar}
                />
            )}
        </div>
    );
};

export default TelaObjetivos;