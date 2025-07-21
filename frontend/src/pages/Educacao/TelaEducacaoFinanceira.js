import React, { useState, useContext, useMemo, useEffect } from "react";
import { ThemeContext } from "../../ThemeContext";
import CardComImagem from "../../components/Card/CardComImagem";
import { ArrowRight, ArrowLeft, BookOpen, Video, HelpCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const TelaEducacaoFinanceira = () => {
    const { theme } = useContext(ThemeContext);

    const [cursos, setCursos] = useState([
        {
            id: 'curso-basico-investimentos',
            titulo: 'Curso Básico de Investimentos',
            descricao: 'Aprenda do zero sobre o mundo dos investimentos, da renda fixa à renda variável.',
            imagem: 'https://via.placeholder.com/400x200?text=Curso+Basico', // Imagem de placeholder
            modulos: [
                {
                    id: 'modulo-1-fundamentos',
                    titulo: 'Módulo 1: Fundamentos da Renda Fixa',
                    licoes: [
                        { id: 'licao-1.1', tipo: 'artigo', titulo: 'O Básico dos Investimentos', conteudo: 'Aprenda sobre os diferentes tipos de investimentos como Renda Fixa (CDB, Tesouro Direto) e Renda Variável (Ações, Fundos Imobiliários). Entenda os conceitos de risco e retorno.', link: 'https://www.gov.br/investidor/pt-br/investir/antes-de-investir/entenda-as-caracteristicas-dos-investimentos', completo: false },
                        { id: 'licao-1.2', tipo: 'video', titulo: 'Morning Call Essencial', link: 'https://www.youtube.com/embed/dQw4w9WgXcQ', completo: false },
                        { id: 'licao-1.3', tipo: 'quiz', titulo: 'Teste seus Conhecimentos em Finanças', link: '/quiz/financeiro', completo: false },
                    ]
                },
                {
                    id: 'modulo-2-renda-variavel',
                    titulo: 'Módulo 2: Introdução à Renda Variável',
                    licoes: [
                        { id: 'licao-2.1', tipo: 'artigo', titulo: 'Ebook de Gestão de Finanças Pessoais', conteudo: 'Dicas práticas para criar um orçamento, identificar despesas desnecessárias e poupar dinheiro. A importância de registrar todas as suas movimentações financeiras.', link: 'https://www.bcb.gov.br/content/cidadaniafinanceira/documentos_cidadania_financeira.pdf', completo: false },
                        { id: 'licao-2.2', tipo: 'quiz', titulo: 'Você está preparado para Investir?', link: '/quiz/investimentos', completo: false },
                    ]
                },
            ]
        },
        {
            id: 'curso-avancado-financas',
            titulo: 'Curso Avançado de Finanças Pessoais',
            descricao: 'Estratégias para sair das dívidas e planejar sua aposentadoria com segurança.',
            imagem: 'https://via.placeholder.com/400x200?text=Curso+Avancado', // Imagem de placeholder
            modulos: [
                {
                    id: 'modulo-3-dividas',
                    titulo: 'Módulo 3: Lidando com Dívidas',
                    licoes: [
                        { id: 'licao-3.1', tipo: 'artigo', titulo: 'Estratégias para Sair das Dívidas', conteudo: 'Conheça métodos eficazes para negociar dívidas, evitar juros abusivos e reorganizar sua vida financeira para eliminar o endividamento.', link: 'https://www.serasa.com.br/limpa-nome/blog/5-passos-para-sair-das-dividas/', completo: false },
                    ]
                },
                {
                    id: 'modulo-4-planejamento',
                    titulo: 'Módulo 4: Aposentadoria e Futuro',
                    licoes: [
                        { id: 'licao-4.1', tipo: 'artigo', titulo: 'Planejamento para a Aposentadoria', conteudo: 'Entenda a importância de começar a planejar sua aposentadoria cedo. Opções de previdência privada, INSS e investimentos de longo prazo.', link: 'https://www.btgpactualdigital.com/blog/investimentos/planejamento-de-aposentadoria', completo: false },
                    ]
                },
            ]
        },
        { // Novo curso adicionado
            id: 'curso-planejamento-familiar',
            titulo: 'Planejamento Financeiro para Famílias',
            descricao: 'Gerencie as finanças de sua família, crie orçamentos conjuntos e planeje o futuro financeiro de todos.',
            imagem: 'https://via.placeholder.com/400x200?text=Financas+Familiares', // Imagem de placeholder
            modulos: [
                {
                    id: 'modulo-5-orcamento-familiar',
                    titulo: 'Módulo 5: Orçamento Conjunto',
                    licoes: [
                        { id: 'licao-5.1', tipo: 'artigo', titulo: 'Como Criar um Orçamento Familiar Eficaz', conteudo: 'Passo a passo para construir um orçamento que atenda às necessidades de todos na família, identificando receitas e despesas conjuntas.', link: 'https://www.iq.com.br/blog/como-fazer-orcamento-familiar/', completo: false },
                        { id: 'licao-5.2', tipo: 'video', titulo: 'Desafios Financeiros em Família', link: 'http://googleusercontent.com/youtube.com/2', completo: false },
                    ]
                },
                {
                    id: 'modulo-6-futuro-filhos',
                    titulo: 'Módulo 6: Planejamento para Filhos',
                    licoes: [
                        { id: 'licao-6.1', tipo: 'artigo', titulo: 'Investindo no Futuro dos Seus Filhos', conteudo: 'Opções de investimento para educação, moradia e outras metas de longo prazo para as crianças.', link: 'https://www.cnnbrasil.com.br/economiamais/guia-de-investimento-para-filhos/', completo: false },
                        { id: 'licao-6.2', tipo: 'quiz', titulo: 'Quiz: Família e Dinheiro', link: '/quiz/familia-dinheiro', completo: false },
                    ]
                },
            ]
        }
    ]);

    const [cursoSelecionadoId, setCursoSelecionadoId] = useState(null);
    const [moduloSelecionadoId, setModuloSelecionadoId] = useState(null);

    useEffect(() => {
        console.log("Estado de cursoSelecionadoId:", cursoSelecionadoId);
        console.log("Estado de moduloSelecionadoId:", moduloSelecionadoId);
    }, [cursoSelecionadoId, moduloSelecionadoId]);

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
                                licoes: modulo.licoes.map(licao =>
                                    licao.id === licaoId ? { ...licao, completo: !licao.completo } : licao
                                )
                            };
                        }
                        return modulo;
                    })
                };
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
                    onClick={() => setCursoSelecionadoId(curso.id)}
                    imageSrc={curso.imagem}
                    imageAlt={curso.titulo}
                    title={curso.titulo}
                    description={curso.descricao}
                >
                    {/* Conteúdo adicional do Card, como a barra de progresso */}
                    <div className="relative w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full mt-auto">
                        <div className="absolute top-0 left-0 h-2 rounded-full bg-[#00d971]" style={{ width: `${calcularProgresso(curso).toFixed(0)}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{calcularProgresso(curso).toFixed(0)}% Completo</p>
                </CardComImagem>
            ))}
        </motion.div>
    );

    const renderDetalheCurso = () => {
        if (!cursoSelecionado) {
            console.error("Erro: Curso selecionado é nulo ou não encontrado. Redirecionando para lista de cursos.");
            setCursoSelecionadoId(null);
            return null;
        }

        return (
            <motion.div
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3 }}
            >
                <button onClick={() => { setCursoSelecionadoId(null); setModuloSelecionadoId(null); }} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white mb-4">
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
                            <button onClick={() => setModuloSelecionadoId(null)} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white mb-4">
                                <ArrowLeft size={16} /> Voltar para Módulos
                            </button>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">{moduloSelecionado.titulo}</h3>
                            <div className="space-y-4">
                                {moduloSelecionado.licoes.map(licao => (
                                    <div key={licao.id} className="p-4 bg-slate-100 dark:bg-[#2a246f] rounded-lg flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                checked={licao.completo}
                                                onChange={() => toggleLicaoCompleta(cursoSelecionado.id, moduloSelecionado.id, licao.id)}
                                                className="form-checkbox h-5 w-5 text-[#00d971] rounded border-gray-300 focus:ring-[#00d971] dark:bg-gray-700 dark:border-gray-600"
                                            />
                                            {getLicaoIcon(licao.tipo)}
                                            <h4 className="text-lg font-semibold text-slate-800 dark:text-white">{licao.titulo}</h4>
                                        </div>
                                        <a href={licao.link} target="_blank" rel="noopener noreferrer" className="text-[#00d971] hover:underline flex items-center">
                                            Abrir <ArrowRight size={16} className="ml-1" />
                                        </a>
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