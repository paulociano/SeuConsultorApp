import { useContext } from "react";
import { ThemeContext } from "../../ThemeContext";
import Card from "../../components/Card/Card";
import BlogCard from "../../components/Card/BlogCard"; // Novo componente para blog
import { ArrowRight } from "lucide-react";

const TelaEducacaoFinanceira = () => {
    const { theme } = useContext(ThemeContext);

    const topicosEducacao = [
        {
            id: 'basico-investimentos',
            titulo: 'O Básico dos Investimentos',
            conteudo: 'Aprenda sobre os diferentes tipos de investimentos como Renda Fixa (CDB, Tesouro Direto) e Renda Variável (Ações, Fundos Imobiliários). Entenda os conceitos de risco e retorno.',
            link: 'https://www.gov.br/investidor/pt-br/investir/antes-de-investir/entenda-as-caracteristicas-dos-investimentos'
        },
        {
            id: 'controle-gastos',
            titulo: 'Ebook de Gestão de Finanças Pessoais',
            conteudo: 'Dicas práticas para criar um orçamento, identificar despesas desnecessárias e poupar dinheiro. A importância de registrar todas as suas movimentações financeiras.',
            link: 'https://www.bcb.gov.br/content/cidadaniafinanceira/documentos_cidadania_financeira.pdf'
        },
        {
            id: 'gerenciamento-dividas',
            titulo: 'Estratégias para Sair das Dívidas',
            conteudo: 'Conheça métodos eficazes para negociar dívidas, evitar juros abusivos e reorganizar sua vida financeira para eliminar o endividamento.',
            link: 'https://www.serasa.com.br/limpa-nome/blog/5-passos-para-sair-das-dividas/'
        },
        {
            id: 'planejamento-aposentadoria',
            titulo: 'Planejamento para a Aposentadoria',
            conteudo: 'Entenda a importância de começar a planejar sua aposentadoria cedo. Opções de previdência privada, INSS e investimentos de longo prazo.',
            link: 'https://www.btgpactualdigital.com/blog/investimentos/planejamento-de-aposentadoria'
        },
    ];

    const quizzes = [
        { id: 'quiz-financeiro', titulo: 'Teste seus Conhecimentos em Finanças', link: '/quiz/financeiro' },
        { id: 'quiz-investimentos', titulo: 'Você está preparado para Investir?', link: '/quiz/investimentos' },
    ];

    return (
        <div className="max-w-6xl mx-auto text-center">
            <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-3">Sua jornada para a independência financeira começa aqui!</h3>
            <p className="text-gray-600 dark:text-gray-300">
                Explore os tópicos, assista vídeos, resolva quizzes e aplique o conhecimento no seu dia a dia.
            </p>
            {/* Seção de Blog com BlogCards */}
                <div className="col-span-1 p-6">
                    <Card>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Artigos e Leitura</h3>
                        <div className="grid grid-cols-2 gap-6 space-y-4">
                            {topicosEducacao.map(topico => (
                                <BlogCard
                                    key={topico.id}
                                    titulo={topico.titulo}
                                    conteudo={topico.conteudo}
                                    link={topico.link}
                                />
                            ))}
                        </div>
                    </Card>
                </div>

            <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6 p-5">
                {/* Seção de Vídeo */}
                <div className="col-span-1">
                    <Card>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">Morning Call</h3>
                        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
                            <iframe
                                className="absolute top-0 left-0 w-full h-full rounded-lg"
                                src='https://www.youtube.com/embed/TsrQDU8EvBg?autoplay=0&controls=1&showinfo=0&rel=0'
                                title='Vídeo Educativo'
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </Card>
                </div>

                {/* Seção de Quizzes */}
                <div className="col-span-1">
                    <Card>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Quizzes Interativos</h3>
                        {quizzes.map(quiz => (
                            <div key={quiz.id} className="mb-4">
                                <h4 className="text-md font-semibold text-slate-800 dark:text-white">{quiz.titulo}</h4>
                                <a href={quiz.link} className="text-[#00d971] hover:underline text-sm flex items-center">
                                    Participe do Quiz <ArrowRight size={16} className="ml-1" />
                                </a>
                            </div>
                        ))}
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default TelaEducacaoFinanceira;
