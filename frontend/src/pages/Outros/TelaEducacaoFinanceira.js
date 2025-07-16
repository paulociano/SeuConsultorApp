import Card from "../../components/Card/Card";
import { ArrowRight } from "lucide-react";
import { useContext } from "react";
import { ThemeContext } from "../../ThemeContext";

const TelaEducacaoFinanceira = () => {
    const { theme } = useContext(ThemeContext); // Para usar o tema se necessário

    // Dados de exemplo para tópicos de educação financeira
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
            link: 'https://www.bcb.gov.br/content/cidadaniafinanceira/documentos_cidadania/Cuidando_do_seu_dinheiro_Gestao_de_Financas_Pessoais/caderno_cidadania_financeira.pdf'
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

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8">
            <div className="grid grid-cols-1 md:grid-cols-1 gap-6">
                <div className="mt-10 p-6 bg-slate-100 dark:bg-[#2a246f] rounded-xl text-center">
                <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-3">Sua jornada para a independência financeira começa aqui!</h3>
                <p className="text-gray-600 dark:text-gray-300">
                    Explore os tópicos, aplique o conhecimento e veja suas finanças prosperarem.
                </p>
            </div>
                <Card>
                        <div className="relative w-full" style={{ paddingBottom: '56.25%'}}>
                            <iframe
                                className="absolute top-0 left-0 w-full h-full rounded-lg"
                                src= 'https://www.youtube.com/embed/TsrQDU8EvBg?autoplay=0&controls=1&showinfo=0&rel=0'
                                title='Morning Call W1 Capital'
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            ></iframe>
                        </div>
                    </Card>
                {topicosEducacao.map(topico => (
                    <Card key={topico.id}>
                        <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-3">{topico.titulo}</h2>
                        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">{topico.conteudo}</p>
                        {topico.link && (
                            <a
                                href={topico.link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-[#00d971] hover:underline text-sm font-medium"
                            >
                                Ler Mais <ArrowRight size={16} className="ml-1" />
                            </a>
                        )}
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default TelaEducacaoFinanceira;