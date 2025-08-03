import React, { useState, useContext, useMemo, useEffect } from "react";
import { ThemeContext } from "../../ThemeContext";
import CardComImagem from "../../components/Card/CardComImagem";
import { ArrowRight, ArrowLeft, BookOpen, Video, HelpCircle, CheckCircle, Rss, Instagram, Home, GraduationCap, Newspaper } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from 'clsx';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

// --- DADOS SIMULADOS CORRIGIDOS ---
const mockPostsBlog = [
    { id: 1, imagem: 'https://images.pexels.com/photos/730547/pexels-photo-730547.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', categoria: 'Planejamento', titulo: '5 Passos para Construir sua Reserva de Emergência Ainda Este Ano', autor: 'Maria Silva', link: '#' },
    { id: 2, imagem: 'https://images.pexels.com/photos/210574/pexels-photo-210574.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1', categoria: 'Investimentos', titulo: 'Análise Completa: CDB ou LCI, qual o melhor para seu perfil?', autor: 'João Pereira', link: '#' },
];
const mockPostsInstagram = [
    { id: 1, imagem: 'https://images.pexels.com/photos/590022/pexels-photo-590022.jpeg?auto=compress&cs=tinysrgb&w=600', link: '#' },
    { id: 2, imagem: 'https://images.pexels.com/photos/7788009/pexels-photo-7788009.jpeg?auto=compress&cs=tinysrgb&w=600', link: '#' },
    { id: 3, imagem: 'https://images.pexels.com/photos/6802049/pexels-photo-6802049.jpeg?auto=compress&cs=tinysrgb&w=600', link: '#' },
    { id: 4, imagem: 'https://images.pexels.com/photos/5439427/pexels-photo-5439427.jpeg?auto=compress&cs=tinysrgb&w=600', link: '#' },
];

// --- COMPONENTES DE CONTEÚDO DA LIÇÃO (COMPLETOS) ---
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

const VideoContent = ({ link }) => {
    let videoId = null;
    try {
        const url = new URL(link);
        if (url.hostname.includes('youtube.com') || url.hostname.includes('youtu.be')) {
            videoId = url.searchParams.get('v') || url.pathname.split('/').pop();
        }
    } catch (e) {
        console.error("Link de vídeo inválido:", link);
    }

    if (videoId) {
        return (
            <div className="mt-4 aspect-video">
                <iframe className="w-full h-full rounded-lg" src={`https://www.youtube.com/embed/${videoId}`} title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
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

const QuizContent = ({ titulo }) => {
    return (
        <div className="mt-4 p-4 border border-gray-300 dark:border-gray-600 rounded-lg">
            <h4 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">{titulo}</h4>
            <p className="text-gray-600 dark:text-gray-300">
                Este é um exemplo de quiz. Em uma implementação real, o quiz seria interativo aqui.
            </p>
            <button className="mt-4 bg-[#00d971] text-black font-bold py-2 px-4 rounded-md hover:brightness-90 transition-colors">
                Iniciar Quiz
            </button>
        </div>
    );
};


const TelaEducacaoFinanceira = () => {
    const { theme } = useContext(ThemeContext);

    const [activeTab, setActiveTab] = useState('inicio');
    const [cursos, setCursos] = useState([
        {
            id: 'curso-basico-investimentos',
            titulo: 'Curso Básico de Investimentos',
            descricao: 'Aprenda do zero sobre o mundo dos investimentos, da renda fixa à renda variável.',
            imagem: 'https://images.pexels.com/photos/210600/pexels-photo-210600.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            matriculado: true,
            modulos: [
                {
                    id: 'modulo-1-fundamentos',
                    titulo: 'Módulo 1: Fundamentos da Renda Fixa',
                    licoes: [
                        { id: 'licao-1.1', tipo: 'artigo', titulo: 'O Básico dos Investimentos', conteudo: '<p>Aprenda sobre os diferentes tipos de investimentos como Renda Fixa (CDB, Tesouro Direto) e Renda Variável (Ações, Fundos Imobiliários). Entenda os conceitos de risco e retorno.</p><p>A renda fixa é caracterizada por ter regras de remuneração definidas no momento da aplicação, oferecendo mais previsibilidade. Já a renda variável não garante retornos fixos e está sujeita a flutuações de mercado.</p>', link: null, completo: true },
                        { id: 'licao-1.2', tipo: 'video', titulo: 'Morning Call Essencial', conteudo: null, link: 'http://googleusercontent.com/youtube.com/6', completo: false },
                        { id: 'licao-1.3', tipo: 'quiz', titulo: 'Teste seus Conhecimentos em Finanças', conteudo: null, link: null, completo: false },
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
            imagem: 'https://images.pexels.com/photos/534216/pexels-photo-534216.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            matriculado: false,
            modulos: [
                {
                    id: 'modulo-3-dividas',
                    titulo: 'Módulo 3: Lidando com Dívidas',
                    licoes: [
                        { id: 'licao-3.1', tipo: 'artigo', titulo: 'Estratégias para Sair das Dívidas', conteudo: '<p>Conheça métodos eficazes para negociar dívidas, evitar juros abusivos e reorganizar sua vida financeira para eliminar o endividamento.</p><p>Priorize as dívidas com juros mais altos e crie um plano de pagamento.</p>', link: null, completo: false },
                    ]
                },
            ]
        },
    ]);
    const [noticias, setNoticias] = useState([]);
    const [loadingNoticias, setLoadingNoticias] = useState(true);
    const [erroNoticias, setErroNoticias] = useState(null);
    const [blogPosts] = useState(mockPostsBlog);
    const [instagramPosts] = useState(mockPostsInstagram);
    const [cursoSelecionadoId, setCursoSelecionadoId] = useState(null);
    const [moduloSelecionadoId, setModuloSelecionadoId] = useState(null);
    const [openLicaoId, setOpenLicaoId] = useState(null);

    useEffect(() => {
        const fetchNoticias = async () => {
            setLoadingNoticias(true);
            setErroNoticias(null);
            
            const apiKey = process.env.REACT_APP_NEWS_API_KEY;
            console.log("1. Verificando a chave da API:", apiKey ? "Chave encontrada" : "CHAVE NÃO ENCONTRADA!");

            if (!apiKey) {
                const errorMsg = "Chave da API de Notícias (REACT_APP_NEWS_API_KEY) não encontrada. Verifique seu arquivo .env e reinicie o servidor.";
                console.error(errorMsg);
                setErroNoticias(errorMsg);
                setLoadingNoticias(false);
                return;
            }

            const url = `https://newsapi.org/v2/top-headlines?country=br&category=business&apiKey=${apiKey}`;
            console.log("2. URL da requisição:", url);

            try {
                const response = await fetch(url);
                const data = await response.json();

                console.log("3. Resposta completa da API:", data);

                if (response.ok) {
                    if (data.articles && data.articles.length > 0) {
                        const noticiasFormatadas = data.articles.slice(0, 5).map(article => ({
                            id: article.url,
                            fonte: article.source.name,
                            titulo: article.title,
                            tempo: formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true, locale: ptBR }),
                            link: article.url,
                        }));
                        setNoticias(noticiasFormatadas);
                        console.log("4. Notícias formatadas e salvas no estado:", noticiasFormatadas);
                    } else {
                        console.warn("A API não retornou artigos. Isso é esperado em localhost com o plano gratuito da NewsAPI.");
                        setNoticias([]);
                    }
                } else {
                    throw new Error(data.message || `Erro na API: ${response.status}`);
                }

            } catch (error) {
                console.error("Falha detalhada ao buscar notícias da News API:", error);
                setErroNoticias(error.message);
            } finally {
                setLoadingNoticias(false);
            }
        };

        fetchNoticias();
    }, []);

    const cursoSelecionado = useMemo(() => cursos.find(c => c.id === cursoSelecionadoId), [cursos, cursoSelecionadoId]);
    const moduloSelecionado = useMemo(() => cursoSelecionado?.modulos.find(m => m.id === moduloSelecionadoId), [cursoSelecionado, moduloSelecionadoId]);
    
    const calcularProgresso = (item) => {
        if (!item) return 0;
        let totalLicoes = 0;
        let licoesCompletas = 0;
        if (item.licoes && Array.isArray(item.licoes)) {
            totalLicoes = item.licoes.length;
            licoesCompletas = item.licoes.filter(l => l.completo).length;
        } else if (item.modulos && Array.isArray(item.modulos)) {
            item.modulos.forEach(modulo => {
                if (modulo.licoes && Array.isArray(modulo.licoes)) {
                    totalLicoes += modulo.licoes.length;
                    licoesCompletas += modulo.licoes.filter(l => l.completo).length;
                }
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
                                        if (!licao.completo) setOpenLicaoId(null);
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
    
    const getProximaLicao = (curso) => {
        if (!curso || !curso.modulos) return null;
        for (const modulo of curso.modulos) {
            if (modulo.licoes) {
                for (const licao of modulo.licoes) {
                    if (!licao.completo) {
                        return { cursoId: curso.id, moduloId: modulo.id, licaoId: licao.id, tituloLicao: licao.titulo };
                    }
                }
            }
        }
        return null;
    };
    
    const handleContinuarCurso = (proximaLicao) => {
        if (proximaLicao) {
            setCursoSelecionadoId(proximaLicao.cursoId);
            setModuloSelecionadoId(proximaLicao.moduloId);
            setOpenLicaoId(proximaLicao.licaoId);
        }
    };
    
    const renderInicioTab = () => {
        const cursoEmProgresso = cursos.find(c => c.matriculado && calcularProgresso(c) < 100);
        const proximaLicao = cursoEmProgresso ? getProximaLicao(cursoEmProgresso) : null;
        const ultimoPostBlog = blogPosts[0];

        return (
            <div className="space-y-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-left">
                    {proximaLicao && (
                        <div className="relative p-6 rounded-xl shadow-lg flex flex-col justify-center overflow-hidden bg-cover bg-center text-white" style={{ backgroundImage: `url(${cursoEmProgresso.imagem})` }}>
                            <div className="absolute inset-0 bg-black/60"></div>
                            <div className="relative z-10">
                                <h3 className="text-sm font-semibold uppercase tracking-wider text-[#00d971] mb-2">Continue de onde parou</h3>
                                <h4 className="text-2xl font-bold mb-1">{cursoEmProgresso.titulo}</h4>
                                <p className="text-slate-200 mb-4">Próxima lição: {proximaLicao.tituloLicao}</p>
                                <button onClick={() => handleContinuarCurso(proximaLicao)} className="bg-[#00d971] text-black font-bold py-2 px-5 rounded-lg hover:brightness-90 transition-all flex items-center gap-2 w-fit">
                                    Continuar Aprendendo <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    )}
                    {ultimoPostBlog && (
                        <div>
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-3"><Newspaper /> Último Post do Blog</h3>
                            <a href={ultimoPostBlog.link} className="block group rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow bg-white dark:bg-slate-800 h-full">
                                <img src={ultimoPostBlog.imagem} alt={ultimoPostBlog.titulo} className="w-full h-40 object-cover" />
                                <div className="p-4">
                                    <p className="text-sm font-semibold text-blue-500">{ultimoPostBlog.categoria}</p>
                                    <h4 className="text-lg font-bold text-slate-800 dark:text-white mt-1 group-hover:text-[#00d971] transition-colors">{ultimoPostBlog.titulo}</h4>
                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">por {ultimoPostBlog.autor}</p>
                                </div>
                            </a>
                        </div>
                    )}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left pt-8 border-t border-slate-200 dark:border-slate-700">
                    <div className="lg:col-span-2">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-white">Mais do Nosso Blog</h3>
                            <button onClick={() => setActiveTab('blog')} className="text-sm font-semibold text-[#00d971] hover:underline">Ver Todos</button>
                        </div>
                        <div className="space-y-8">
                            {blogPosts.slice(1).map(post => (
                                <a href={post.link} key={post.id} className="block group md:flex gap-6 items-center">
                                    <img src={post.imagem} alt={post.titulo} className="w-full md:w-48 h-32 object-cover rounded-lg mb-4 md:mb-0" />
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-blue-500">{post.categoria}</p>
                                        <h4 className="text-xl font-bold text-slate-800 dark:text-white mt-1 group-hover:text-[#00d971] transition-colors">{post.titulo}</h4>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">por {post.autor}</p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                    <aside className="space-y-12">
                        <div className={`p-6 rounded-xl shadow-md ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-3"><Rss /> Últimas do Mercado</h3>
                            
                            {loadingNoticias && <p className="text-sm text-gray-500 dark:text-gray-400">Carregando notícias...</p>}
                            
                            {erroNoticias && <p className="text-sm text-red-500">Falha ao carregar notícias: {erroNoticias}</p>}
                            
                            {!loadingNoticias && !erroNoticias && noticias.length === 0 && (
                                <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma notícia encontrada no momento.</p>
                            )}
                            
                            {!loadingNoticias && !erroNoticias && noticias.length > 0 && (
                                <div className="space-y-4">
                                    {noticias.map(noticia => (
                                        <a href={noticia.link} target="_blank" rel="noopener noreferrer" key={noticia.id} className="block pb-4 border-b border-slate-200 dark:border-slate-700 last:border-b-0">
                                            <p className="font-semibold text-slate-700 dark:text-slate-200 hover:text-[#00d971] transition-colors">{noticia.titulo}</p>
                                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{noticia.fonte} • {noticia.tempo}</p>
                                        </a>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className={`p-6 rounded-xl shadow-md ${theme === 'dark' ? 'bg-slate-800' : 'bg-slate-100'}`}>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-3"><Instagram /> Dicas no Instagram</h3>
                            <div className="grid grid-cols-2 gap-2">
                                {instagramPosts.map(post => (
                                    <a href={post.link} key={post.id} target="_blank" rel="noopener noreferrer">
                                        <img src={post.imagem} alt="Instagram Post" className="rounded-md w-full aspect-square object-cover hover:opacity-80 transition-opacity" />
                                    </a>
                                ))}
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        );
    };
    
    const renderCursosTab = () => (
        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {cursos.map(curso => (
                <CardComImagem key={curso.id} imageSrc={curso.imagem} title={curso.titulo} description={curso.descricao}>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-auto">
                        <div className="bg-[#00d971] h-2 rounded-full" style={{ width: `${calcularProgresso(curso).toFixed(0)}%` }}></div>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{calcularProgresso(curso).toFixed(0)}% Completo</p>
                    {curso.matriculado ? (
                        <button onClick={() => setCursoSelecionadoId(curso.id)} className="mt-4 w-full bg-[#00d971] text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors">Ver Curso</button>
                    ) : (
                        <button onClick={() => handleMatricular(curso.id)} className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors">Matricular</button>
                    )}
                </CardComImagem>
            ))}
        </div>
    );

    const renderBlogTab = () => (
         <div className="space-y-12 text-left">
            {blogPosts.map(post => (
                <a href={post.link} key={post.id} className="block group md:flex gap-6 items-center">
                    <img src={post.imagem} alt={post.titulo} className="w-full md:w-1/3 h-48 object-cover rounded-lg mb-4 md:mb-0" />
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-blue-500">{post.categoria}</p>
                        <h4 className="text-2xl font-bold text-slate-800 dark:text-white mt-1 group-hover:text-[#00d971] transition-colors">{post.titulo}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">por {post.autor}</p>
                    </div>
                </a>
            ))}
        </div>
    );
    
    const renderDetalheLicaoContent = (licao) => {
        if (!licao) return null;
        return (
            <div className="mt-4 p-4 border-t border-gray-200 dark:border-gray-700">
                {licao.tipo === 'artigo' && <ArtigoContent content={licao.conteudo} link={licao.link} />}
                {licao.tipo === 'video' && <VideoContent link={licao.link} />}
                {licao.tipo === 'quiz' && <QuizContent titulo={licao.titulo} />}
                <div className="flex items-center mt-6">
                    <input type="checkbox" checked={licao.completo} onChange={() => toggleLicaoCompleta(cursoSelecionado.id, moduloSelecionado.id, licao.id)} className="form-checkbox h-5 w-5 text-[#00d971] rounded border-gray-300 focus:ring-[#00d971] dark:bg-gray-700 dark:border-gray-600" />
                    <label className={`ml-2 ${licao.completo ? 'text-gray-500 dark:text-gray-400' : 'text-slate-800 dark:text-white'}`}>
                        Marcar como completo
                    </label>
                </div>
            </div>
        );
    };

    const renderDetalheCurso = () => {
        if (!cursoSelecionado) return null;

        if (!cursoSelecionado.matriculado) {
            return (
                <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} className={`rounded-xl shadow-md p-6 ${theme === 'dark' ? 'bg-[#2a246f]' : 'bg-white'} text-center`}>
                    <p className="text-xl font-bold text-slate-800 dark:text-white mb-4">Você precisa se matricular neste curso para acessar o conteúdo.</p>
                    <button onClick={() => handleMatricular(cursoSelecionado.id)} className="mt-4 bg-blue-600 text-white py-2 px-6 rounded-md hover:bg-blue-700 transition-colors">Matricular-se Agora</button>
                    <button onClick={() => setCursoSelecionadoId(null)} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white mt-4 mx-auto">
                        <ArrowLeft size={16} /> Voltar para o Hub
                    </button>
                </motion.div>
            );
        }

        return (
            <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }}>
                <button onClick={() => { setCursoSelecionadoId(null); setModuloSelecionadoId(null); setOpenLicaoId(null); }} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white mb-4">
                    <ArrowLeft size={16} /> Voltar para o Hub
                </button>
                <div className={`rounded-xl shadow-md p-6 ${theme === 'dark' ? 'bg-[#2a246f]' : 'bg-white'}`}>
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">{cursoSelecionado.titulo}</h2>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">{cursoSelecionado.descricao}</p>
                    
                    {!moduloSelecionadoId && (
                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Módulos</h3>
                            {cursoSelecionado.modulos.map(modulo => (
                                <div key={modulo.id} className="p-4 bg-slate-100 dark:bg-slate-800 rounded-lg cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors" onClick={() => setModuloSelecionadoId(modulo.id)}>
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

                    {moduloSelecionado && (
                        <div>
                            <button onClick={() => { setModuloSelecionadoId(null); setOpenLicaoId(null); }} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white mb-4">
                                <ArrowLeft size={16} /> Voltar para Módulos
                            </button>
                            <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">{moduloSelecionado.titulo}</h3>
                            <div className="space-y-4">
                                {moduloSelecionado.licoes.map(licao => (
                                    <div key={licao.id} className={`rounded-lg ${licao.completo ? 'bg-slate-200 dark:bg-slate-700' : 'bg-slate-100 dark:bg-slate-800'} transition-colors`}>
                                        <div className="p-4 flex items-center justify-between cursor-pointer" onClick={() => setOpenLicaoId(openLicaoId === licao.id ? null : licao.id)}>
                                            <div className="flex items-center gap-3">
                                                {licao.completo ? <CheckCircle size={20} className="text-[#00d971]" /> : getLicaoIcon(licao.tipo)}
                                                <h4 className={`text-lg font-semibold ${licao.completo ? 'text-gray-500 dark:text-gray-400' : 'text-slate-800 dark:text-white'}`}>{licao.titulo}</h4>
                                            </div>
                                            <ArrowRight size={16} className={`transition-transform ${openLicaoId === licao.id ? 'rotate-90' : ''}`} />
                                        </div>
                                        <AnimatePresence>
                                            {openLicaoId === licao.id && (
                                                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
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
        <div className="max-w-7xl mx-auto px-4 py-8">
            <AnimatePresence mode="wait">
                {cursoSelecionadoId ? (
                    <motion.div key="detalhe-curso">
                        {renderDetalheCurso()}
                    </motion.div>
                ) : (
                    <motion.div key="dashboard-hub">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-800 dark:text-white mb-3">Hub de Educação Financeira</h2>
                            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                                Sua jornada para a independência financeira, com cursos, notícias e insights, tudo em um só lugar.
                            </p>
                        </div>
                        <div className="flex justify-center border-b border-slate-200 dark:border-slate-700 mb-8">
                            <button onClick={() => setActiveTab('inicio')} className={clsx("flex items-center gap-2 px-4 py-3 font-semibold border-b-2 transition-colors", activeTab === 'inicio' ? 'border-[#00d971] text-[#00d971]' : 'border-transparent text-gray-500 hover:border-gray-300 dark:hover:border-gray-600')}>
                                <Home size={18} /> Início
                            </button>
                            <button onClick={() => setActiveTab('cursos')} className={clsx("flex items-center gap-2 px-4 py-3 font-semibold border-b-2 transition-colors", activeTab === 'cursos' ? 'border-[#00d971] text-[#00d971]' : 'border-transparent text-gray-500 hover:border-gray-300 dark:hover:border-gray-600')}>
                                <GraduationCap size={18} /> Cursos
                            </button>
                            <button onClick={() => setActiveTab('blog')} className={clsx("flex items-center gap-2 px-4 py-3 font-semibold border-b-2 transition-colors", activeTab === 'blog' ? 'border-[#00d971] text-[#00d971]' : 'border-transparent text-gray-500 hover:border-gray-300 dark:hover:border-gray-600')}>
                                <Newspaper size={18} /> Blog
                            </button>
                        </div>
                        <AnimatePresence mode="wait">
                            <motion.div key={activeTab} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
                                {activeTab === 'inicio' && renderInicioTab()}
                                {activeTab === 'cursos' && renderCursosTab()}
                                {activeTab === 'blog' && renderBlogTab()}
                            </motion.div>
                        </AnimatePresence>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TelaEducacaoFinanceira;