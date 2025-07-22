import React, { useState, useContext, useMemo, useEffect } from "react";
import { ThemeContext } from "../../ThemeContext";
import CardComImagem from "../../components/Card/CardComImagem";
import { ArrowRight, ArrowLeft, BookOpen, Video, HelpCircle, CheckCircle } from "lucide-react"; // Adicionado CheckCircle
import { motion, AnimatePresence } from "framer-motion";

// Componente para exibir conteúdo de artigo (PDF ou texto)
const ArtigoContent = ({ content, link }) => {
    if (link && link.endsWith('.pdf')) {
        return (
            <div className="mt-4">
                <p className="text-gray-600 dark:text-gray-300 mb-2">Para visualizar o conteúdo completo, baixe o PDF:</p>
                <a href={link} target="_blank" rel="noopener noreferrer" className="text-[#00d971] hover:underline flex items-center">
                    Baixar PDF
                    <ArrowRight size={16} className="ml-1" />
                </a>
            </div>
        );
    }
    return (
        <div className="mt-4 text-gray-700 dark:text-gray-200" dangerouslySetInnerHTML={{ __html: content }} />
    );
};

// Componente para exibir conteúdo de vídeo
const VideoContent = ({ link }) => {
    const isYouTube = link.includes("youtube.com"); // Simplificado para fins de exemplo

    if (isYouTube) {
        const videoId = link.split('v=')[1] || link.split('/').pop();
        return (
            <div className="mt-4 aspect-video">
                <iframe
                    className="w-full h-full rounded-lg"
                    src={`https://www.youtube.com/embed/${videoId}`} // Usando embed do YouTube
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                ></iframe>
            </div>
        );
    }
    return (
        <div className="mt-4">
            <video controls className="w-full rounded-lg">
                <source src={link} type="video/mp4" />
                Seu navegador não suporta a tag de vídeo.
            </video>
        </div>
    );
};

// Componente para exibir conteúdo de quiz (exemplo simples)
const QuizContent = ({ titulo }) => {
    return (
        <div className="mt-4 p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
            <h4 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">{titulo}</h4>
            <p className="text-gray-600 dark:text-gray-300">
                Este é um exemplo de quiz. Em uma implementação real, o quiz seria interativo aqui.
            </p>
            <button className="mt-4 bg-[#00d971] text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors">
                Iniciar Quiz
            </button>
        </div>
    );
};


const TelaEducacaoFinanceira = () => {
    const { theme } = useContext(ThemeContext);

    const [cursos, setCursos] = useState([
        {
            id: 'curso-basico-investimentos',
            titulo: 'Curso Básico de Investimentos',
            descricao: 'Aprenda do zero sobre o mundo dos investimentos, da renda fixa à renda variável.',
            imagem: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFlg0umOueO559941oVf7CFBIVwN_kTCIArQ&s',
            matriculado: false,
            modulos: [
                {
                    id: 'modulo-1-fundamentos',
                    titulo: 'Módulo 1: Fundamentos da Renda Fixa',
                    licoes: [
                        { id: 'licao-1.1', tipo: 'artigo', titulo: 'O Básico dos Investimentos', conteudo: '<p>Aprenda sobre os diferentes tipos de investimentos como Renda Fixa (CDB, Tesouro Direto) e Renda Variável (Ações, Fundos Imobiliários). Entenda os conceitos de risco e retorno.</p><p>A renda fixa é caracterizada por ter regras de remuneração definidas no momento da aplicação, oferecendo mais previsibilidade. Já a renda variável não garante retornos fixos e está sujeita a flutuações de mercado.</p>', link: null, completo: false },
                        { id: 'licao-1.2', tipo: 'video', titulo: 'Morning Call Essencial', conteudo: null, link: 'https://www.youtube.com/watch?v=48kfX6V40q0', completo: false }, // Exemplo de link de vídeo YouTube real (Rick Astley)
                        { id: 'licao-1.3', tipo: 'quiz', titulo: 'Teste seus Conhecimentos em Finanças', conteudo: null, link: null, completo: false }, // Conteúdo de quiz será interno
                    ]
                },
                {
                    id: 'modulo-2-renda-variavel',
                    titulo: 'Módulo 2: Introdução à Renda Variável',
                    licoes: [
                        { id: 'licao-2.1', tipo: 'artigo', titulo: 'Ebook de Gestão de Finanças Pessoais', conteudo: '<p>Dicas práticas para criar um orçamento, identificar despesas desnecessárias e poupar dinheiro. A importância de registrar todas as suas movimentações financeiras.</p><p>Um bom planejamento financeiro pessoal envolve acompanhar receitas e despesas, definir metas financeiras e construir uma reserva de emergência.</p>', link: null, completo: false },
                        { id: 'licao-2.2', tipo: 'quiz', titulo: 'Você está preparado para Investir?', conteudo: null, link: null, completo: false },
                    ]
                },
            ]
        },
        {
            id: 'curso-avancado-financas',
            titulo: 'Curso Avançado de Finanças Pessoais',
            descricao: 'Estratégias para sair das dívidas e planejar sua aposentadoria com segurança.',
            imagem: 'https://cdn.borainvestir.b3.com.br/2024/04/17112249/fundos-de-investimentos-como-escolher.jpg.webp',
            matriculado: false,
            modulos: [
                {
                    id: 'modulo-3-dividas',
                    titulo: 'Módulo 3: Lidando com Dívidas',
                    licoes: [
                        { id: 'licao-3.1', tipo: 'artigo', titulo: 'Estratégias para Sair das Dívidas', conteudo: '<p>Conheça métodos eficazes para negociar dívidas, evitar juros abusivos e reorganizar sua vida financeira para eliminar o endividamento.</p><p>Priorize as dívidas com juros mais altos e crie um plano de pagamento.</p>', link: null, completo: false },
                    ]
                },
                {
                    id: 'modulo-4-planejamento',
                    titulo: 'Módulo 4: Aposentadoria e Futuro',
                    licoes: [
                        { id: 'licao-4.1', tipo: 'artigo', titulo: 'Planejamento para a Aposentadoria', conteudo: '<p>Entenda a importância de começar a planejar sua aposentadoria cedo. Opções de previdência privada, INSS e investimentos de longo prazo.</p><p>Diversificar seus investimentos e iniciar o quanto antes são chaves para uma aposentadoria tranquila.</p>', link: null, completo: false },
                        { id: 'licao-4.2', tipo: 'video', titulo: 'Como Planejar sua Aposentadoria', conteudo: null, link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', completo: false }, // Outro exemplo de link de vídeo YouTube real
                    ]
                },
            ]
        },
        {
            id: 'curso-planejamento-familiar',
            titulo: 'Planejamento Financeiro para Famílias',
            descricao: 'Gerencie as finanças de sua família, crie orçamentos conjuntos e planeje o futuro financeiro de todos.',
            imagem: 'https://investidorsardinha.r7.com/wp-content/uploads/2021/11/planejamento-financeiro-familiar-como-comecar-1.jpg',
            matriculado: false,
            modulos: [
                {
                    id: 'modulo-5-orcamento-familiar',
                    titulo: 'Módulo 5: Orçamento Conjunto',
                    licoes: [
                        { id: 'licao-5.1', tipo: 'artigo', titulo: 'Como Criar um Orçamento Familiar Eficaz', conteudo: '<p>Passo a passo para construir um orçamento que atenda às necessidades de todos na família, identificando receitas e despesas conjuntas.</p><p>A comunicação e a colaboração são essenciais no orçamento familiar.</p>', link: null, completo: false },
                        { id: 'licao-5.2', tipo: 'video', titulo: 'Desafios Financeiros em Família', conteudo: null, link: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', completo: false },
                    ]
                },
                {
                    id: 'modulo-6-futuro-filhos',
                    titulo: 'Módulo 6: Planejamento para Filhos',
                    licoes: [
                        { id: 'licao-6.1', tipo: 'artigo', titulo: 'Investindo no Futuro dos Seus Filhos', conteudo: '<p>Opções de investimento para educação, moradia e outras metas de longo prazo para as crianças.</p><p>Considere planos de previdência infantil ou fundos de investimento de longo prazo.</p>', link: null, completo: false },
                        { id: 'licao-6.2', tipo: 'quiz', titulo: 'Quiz: Família e Dinheiro', conteudo: null, link: null, completo: false },
                    ]
                },
            ]
        }
    ]);

    const [cursoSelecionadoId, setCursoSelecionadoId] = useState(null);
    const [moduloSelecionadoId, setModuloSelecionadoId] = useState(null);
    const [openLicaoId, setOpenLicaoId] = useState(null); // Estado para controlar qual lição está aberta no acordeão

    useEffect(() => {
        console.log("Estado de cursoSelecionadoId:", cursoSelecionadoId);
        console.log("Estado de moduloSelecionadoId:", moduloSelecionadoId);
        console.log("Estado de openLicaoId:", openLicaoId);
    }, [cursoSelecionadoId, moduloSelecionadoId, openLicaoId]);

    const cursoSelecionado = useMemo(() => {
        const foundCourse = cursos.find(c => c.id === cursoSelecionadoId);
        console.log("Curso selecionado (useMemo):", foundCourse);
        return foundCourse;
    }, [cursos, cursoSelecionadoId]);

    const moduloSelecionado = useMemo(() => {
        if (!cursoSelecionado) return null;
        const foundModulo = cursoSelecionado.modulos.find(m => m.id === moduloSelecionadoId);
        console.log("Módulo selecionado (useMemo):", foundModulo);
        return foundModulo;
    }, [cursoSelecionado, moduloSelecionadoId]);

    const calcularProgresso = (item) => {
        let totalLicoes = 0;
        let licoesCompletas = 0;

        if (item.licoes) {
            totalLicoes = item.licoes.length;
            licoesCompletas = item.licoes.filter(licao => licao.completo).length;
        } else if (item.modulos) {
            item.modulos.forEach(modulo => {
                totalLicoes += modulo.licoes.length;
                licoesCompletas += modulo.licoes.filter(licao => licao.completo).length;
            });
        }
        return totalLicoes > 0 ? (licoesCompletas / totalLicoes) * 100 : 0;
    };

    const toggleLicaoCompleta = (cursoId, moduloId, licaoId) => {
        setCursos(prevCursos => prevCursos.map(curso => {
            if (curso.id === cursoId) {
                return {
                    ...curso,
                    modulos: curso.modulos.map(modulo => {
                        if (modulo.id === moduloId) {
                            return {
                                ...modulo,
                                licoes: modulo.licoes.map(licao => {
                                    if (licao.id === licaoId) {
                                        // Se a lição está sendo marcada como completa, feche o acordeão dela
                                        if (!licao.completo) {
                                            setOpenLicaoId(null);
                                        }
                                        return { ...licao, completo: !licao.completo };
                                    }
                                    return licao;
                                })
                            };
                        }
                        return modulo;
                    })
                };
            }
            return curso;
        }));
    };

    const handleMatricular = (cursoId) => {
        setCursos(prevCursos => prevCursos.map(curso => {
            if (curso.id === cursoId) {
                return { ...curso, matriculado: true };
            }
            return curso;
        }));
    };

    const getLicaoIcon = (tipo) => {
        switch (tipo) {
            case 'artigo': return <BookOpen size={20} className="text-[#00d971]" />;
            case 'video': return <Video size={20} className="text-[#00d971]" />;
            case 'quiz': return <HelpCircle size={20} className="text-[#00d971]" />;
            default: return null;
        }
    };

    const renderListaCursos = () => (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        >
            {cursos.map(curso => (
                <CardComImagem
                    key={curso.id}
                    imageSrc={curso.imagem}
                    imageAlt={curso.titulo}
                    title={curso.titulo}
                    description={curso.descricao}
                >
                    <div className="relative w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-auto">
                        <div className="absolute top-0 left-0 h-2 rounded-full bg-[#00d971]" style={{ width: `${calcularProgresso(curso).toFixed(0)}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{calcularProgresso(curso).toFixed(0)}% Completo</p>
                    {curso.matriculado ? (
                        <button
                            onClick={() => setCursoSelecionadoId(curso.id)}
                            className="mt-4 w-full bg-[#00d971] text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors"
                        >
                            Ver Curso
                        </button>
                    ) : (
                        <button
                            onClick={() => handleMatricular(curso.id)}
                            className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Matricular
                        </button>
                    )}
                </CardComImagem>
            ))}
        </motion.div>
    );

    const renderDetalheLicaoContent = (licao) => {
        if (!licao) return null;

        return (
            <div className="mt-4 p-4 border-t border-gray-200 dark:border-gray-700">
                {licao.tipo === 'artigo' && (
                    <ArtigoContent content={licao.conteudo} link={licao.link} />
                )}
                {licao.tipo === 'video' && (
                    <VideoContent link={licao.link} />
                )}
                {licao.tipo === 'quiz' && (
                    <QuizContent titulo={licao.titulo} />
                )}

                <div className="flex items-center mt-6">
                    <input
                        type="checkbox"
                        checked={licao.completo}
                        onChange={() => toggleLicaoCompleta(cursoSelecionado.id, moduloSelecionado.id, licao.id)}
                        className="form-checkbox h-5 w-5 text-[#00d971] rounded border-gray-300 focus:ring-[#00d971] dark:bg-gray-700 dark:border-gray-600"
                        disabled={licao.completo} // Desabilita o checkbox se a lição estiver completa
                    />
                    <label className={`ml-2 ${licao.completo ? 'text-gray-500 dark:text-gray-400' : 'text-slate-800 dark:text-white'}`}>
                        {licao.completo ? 'Concluído' : 'Marcar como completo'}
                    </label>
                </div>
            </div>
        );
    };


    const renderDetalheCurso = () => {
        if (!cursoSelecionado) {
            console.error("Erro: Curso selecionado é nulo ou não encontrado. Redirecionando para lista de cursos.");
            setCursoSelecionadoId(null);
            return null;
        }

        if (!cursoSelecionado.matriculado) {
            return (
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ duration: 0.3 }}
                    className={`rounded-xl shadow-md p-6 ${theme === 'dark' ? 'bg-[#2a246f]' : 'bg-white'} text-center`}
                >
                    <p className="text-xl font-bold text-slate-800 dark:text-white mb-4">Você precisa se matricular neste curso para acessar o conteúdo.</p>
                    <button
                        onClick={() => handleMatricular(cursoSelecionado.id)}
                        className="mt-4 bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors"
                    >
                        Matricular-se Agora
                    </button>
                    <button onClick={() => { setCursoSelecionadoId(null); setModuloSelecionadoId(null); setOpenLicaoId(null); }} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white mt-4 mx-auto">
                        <ArrowLeft size={16} /> Voltar para Cursos
                    </button>
                </motion.div>
            );
        }

        return (
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
            >
                <button onClick={() => { setCursoSelecionadoId(null); setModuloSelecionadoId(null); setOpenLicaoId(null); }} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white mb-4">
                    <ArrowLeft size={16} /> Voltar para Cursos
                </button>
                <div className={`rounded-xl shadow-md p-6 ${theme === 'dark' ? 'bg-[#2a246f]' : 'bg-white'}`}>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">{cursoSelecionado.titulo}</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">{cursoSelecionado.descricao}</p>

                    {!moduloSelecionadoId && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Módulos</h3>
                            {cursoSelecionado.modulos.map(modulo => (
                                <div key={modulo.id} className="p-4 bg-slate-100 dark:bg-[#2a246f] rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-[#3b347e] transition-colors" onClick={() => setModuloSelecionadoId(modulo.id)}>
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-lg font-semibold text-slate-800 dark:text-white">{modulo.titulo}</h4>
                                        <span className="text-sm text-gray-500 dark:text-gray-400">{calcularProgresso(modulo).toFixed(0)}%</span>
                                    </div>
                                    <div className="relative w-full h-1.5 bg-slate-300 dark:bg-slate-600 rounded-full mt-2">
                                        <div className="absolute top-0 left-0 h-1.5 rounded-full bg-[#00d971]" style={{ width: `${calcularProgresso(modulo).toFixed(0)}%` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {moduloSelecionadoId && (
                        <div>
                            <button onClick={() => { setModuloSelecionadoId(null); setOpenLicaoId(null); }} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white mb-4">
                                <ArrowLeft size={16} /> Voltar para Módulos
                            </button>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">{moduloSelecionado.titulo}</h3>
                            <div className="space-y-4">
                                {moduloSelecionado.licoes.map(licao => (
                                    <div key={licao.id} className={`rounded-lg ${licao.completo ? 'bg-slate-200 dark:bg-slate-700 cursor-not-allowed' : 'bg-slate-100 dark:bg-[#2a246f] cursor-pointer hover:bg-slate-200 dark:hover:bg-[#3b347e]'} transition-colors`}>
                                        <div
                                            className="p-4 flex items-center justify-between"
                                            onClick={() => {
                                                if (!licao.completo) { // Só abre se não estiver completa
                                                    setOpenLicaoId(openLicaoId === licao.id ? null : licao.id);
                                                }
                                            }}
                                        >
                                            <div className="flex items-center gap-3">
                                                {licao.completo ? (
                                                    <CheckCircle size={20} className="text-[#00d971]" />
                                                ) : (
                                                    getLicaoIcon(licao.tipo)
                                                )}
                                                <h4 className={`text-lg font-semibold ${licao.completo ? 'text-gray-500 dark:text-gray-400' : 'text-slate-800 dark:text-white'}`}>
                                                    {licao.titulo}
                                                </h4>
                                            </div>
                                            {!licao.completo && (
                                                <ArrowRight size={16} className={`transition-transform ${openLicaoId === licao.id ? 'rotate-90' : ''}`} />
                                            )}
                                        </div>
                                        <AnimatePresence>
                                            {openLicaoId === licao.id && (
                                                <motion.div
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                                    className="overflow-hidden"
                                                >
                                                    {renderDetalheLicaoContent(licao)}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </motion.div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto text-center py-8">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">Sua jornada para a independência financeira começa aqui!</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-8">
                Explore nossos cursos, aprenda em módulos e acompanhe seu progresso em direção ao domínio financeiro.
            </p>

            <AnimatePresence mode="wait">
                {!cursoSelecionadoId && renderListaCursos()}
                {cursoSelecionadoId && renderDetalheCurso()}
            </AnimatePresence>
        </div>
    );
};

export default TelaEducacaoFinanceira;