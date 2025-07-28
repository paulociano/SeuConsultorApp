import { useState, useMemo, useEffect } from 'react';
import { useTransacoesStore } from '../../stores/useTransacoesStore'; // 1. Importa a store
import Card from '../../components/Card/Card';
import { CATEGORIAS_FLUXO } from '../../components/constants/Categorias';
import { formatCurrency } from '../../utils/formatters';
import { PlusCircle, Eye, EyeOff } from 'lucide-react';
import FlipCardCategoria from '../../components/Card/FlipCardCategoria';
import { toast } from 'sonner';

// O componente agora não precisa mais receber props para gerenciar transações
const TelaFluxoDeCaixa = () => {
    // 2. Conecta-se à store para obter o estado e as ações
    const { transacoes, isLoading, fetchTransacoes, saveTransacao, deleteTransacao } = useTransacoesStore();

    // 3. O useEffect agora busca as transações na montagem do componente
    useEffect(() => {
        fetchTransacoes();
    }, [fetchTransacoes]);

    // O estado local para filtros e itens selecionados é mantido no componente
    const [filtros, setFiltros] = useState(() => {
        const saved = localStorage.getItem('filtros_fluxo');
        return saved ? JSON.parse(saved) : { mes: 'todos', ano: 'todos', categoria: 'todas', busca: '' };
    });
    const [selecionadas, setSelecionadas] = useState([]);

    useEffect(() => {
        localStorage.setItem('filtros_fluxo', JSON.stringify(filtros));
    }, [filtros]);

    // Os cálculos de `useMemo` continuam os mesmos, pois dependem de `transacoes`
    const opcoesFiltro = useMemo(() => {
        const datas = transacoes.map(t => new Date(t.data));
        const anos = [...new Set(datas.map(d => d.getFullYear()))].filter(ano => !isNaN(ano)).sort((a, b) => b - a);
        const meses = [
            { v: 1, n: 'Janeiro' }, { v: 2, n: 'Fevereiro' }, { v: 3, n: 'Março' },
            { v: 4, n: 'Abril' }, { v: 5, n: 'Maio' }, { v: 6, n: 'Junho' },
            { v: 7, n: 'Julho' }, { v: 8, n: 'Agosto' }, { v: 9, n: 'Setembro' },
            { v: 10, n: 'Outubro' }, { v: 11, n: 'Novembro' }, { v: 12, n: 'Dezembro' }
        ];
        return { anos, meses };
    }, [transacoes]);

    const transacoesFiltradas = useMemo(() => {
        return transacoes.filter(t => {
            const dataTransacao = new Date(t.data);
            if (isNaN(dataTransacao.getTime())) return false;

            const anoTransacao = dataTransacao.getFullYear();
            const mesTransacao = dataTransacao.getMonth() + 1;
            const filtroAnoOk = filtros.ano === 'todos' || anoTransacao === parseInt(filtros.ano);
            const filtroMesOk = filtros.mes === 'todos' || mesTransacao === parseInt(filtros.mes);
            const filtroCategoriaOk = filtros.categoria === 'todas' || (filtros.categoria === 'nao-categorizadas' ? t.categoria === null : t.categoria === filtros.categoria);
            const filtroBuscaOk = filtros.busca === '' || t.descricao.toLowerCase().includes(filtros.busca.toLowerCase());
            return filtroAnoOk && filtroMesOk && filtroCategoriaOk && filtroBuscaOk;
        });
    }, [transacoes, filtros]);

    const sumarioPorCategoria = useMemo(() => {
        const gastosAtuais = transacoesFiltradas.filter(t => t.tipo === 'debit' && !t.ignorada && t.categoria !== 'receita');
        const totaisAtuais = gastosAtuais.reduce((acc, t) => {
            if (t.categoria) {
                if (!acc[t.categoria]) acc[t.categoria] = 0;
                acc[t.categoria] += parseFloat(t.valor);
            }
            return acc;
        }, {});

        let totaisAnteriores = {};
        if (filtros.ano !== 'todos' && filtros.mes !== 'todos') {
            const anoAtualNum = parseInt(filtros.ano);
            const mesAtualNum = parseInt(filtros.mes);
            
            let anoAnterior = anoAtualNum;
            let mesAnterior = mesAtualNum - 1;
            if (mesAnterior === 0) {
                mesAnterior = 12;
                anoAnterior = anoAtualNum - 1;
            }

            const gastosMesAnterior = transacoes.filter(t => {
                const dataTransacao = new Date(t.data);
                if (isNaN(dataTransacao.getTime())) return false;
                
                return dataTransacao.getFullYear() === anoAnterior &&
                       dataTransacao.getMonth() + 1 === mesAnterior &&
                       t.tipo === 'debit' && !t.ignorada && t.categoria !== 'receita';
            });
            
            totaisAnteriores = gastosMesAnterior.reduce((acc, t) => {
                if (t.categoria) {
                    if (!acc[t.categoria]) acc[t.categoria] = 0;
                    acc[t.categoria] += parseFloat(t.valor);
                }
                return acc;
            }, {});
        }

        return Object.entries(totaisAtuais).map(([key, totalAtual]) => {
            const totalAnterior = totaisAnteriores[key] || 0;
            let textoVerso = "Selecione um mês e ano para ver a comparação.";

            if (filtros.mes !== 'todos' && filtros.ano !== 'todos') {
                if (totalAnterior > 0) {
                    const diferenca = ((totalAtual - totalAnterior) / totalAnterior) * 100;
                    textoVerso = `Variação de ${diferenca >= 0 ? '+' : ''}${diferenca.toFixed(1)}% em relação ao mês anterior.`;
                } else if (totalAtual > 0) {
                    textoVerso = "Gasto novo este mês. Sem registro no mês anterior.";
                }
            }
            
            return {
                id: key,
                ...CATEGORIAS_FLUXO[key],
                total: totalAtual,
                verso: textoVerso,
            };
        }).sort((a, b) => b.total - a.total);
    }, [transacoes, filtros, transacoesFiltradas]);

    // 4. Funções que antes eram props, agora são definidas localmente e usam a store
    const handleIgnoreToggle = async (transacaoId) => {
        const transacao = transacoes.find(t => t.id === transacaoId);
        if (transacao) {
            // Usa a ação `saveTransacao` da store para atualizar a transação
            const success = await saveTransacao({ ...transacao, ignorada: !transacao.ignorada });
            if (success) {
                toast.info(`Transação ${!transacao.ignorada ? 'ignorada' : 'restaurada'} com sucesso.`);
            }
        }
    };

    const handleDeleteClick = (transacaoId) => {
        // A confirmação já está dentro da ação `deleteTransacao` na store
        deleteTransacao(transacaoId);
    };

    const deletarSelecionadas = async () => {
        if (selecionadas.length === 0) return;
        
        // A ação `deleteTransacao` da store já possui uma confirmação.
        // Ao apagar em lote, a confirmação será exibida para cada item individualmente.
        if (window.confirm(`Você está prestes a apagar ${selecionadas.length} transações. A confirmação será pedida para cada uma. Deseja continuar?`)) {
            // Espera todas as promessas de deleção serem resolvidas
            await Promise.all(selecionadas.map(id => deleteTransacao(id)));
            setSelecionadas([]); // Limpa a seleção após todas serem apagadas
        }
    };
    
    // Funções placeholder para adicionar/editar, que normalmente abririam um modal/formulário
    const handleAdicionarClick = () => {
        // Esta função normalmente abriria um modal de criação.
        // O modal, ao salvar, chamaria a ação `saveTransacao` da store.
        toast.info("Funcionalidade para adicionar nova transação a ser implementada.");
    };

    const handleEditClick = (transacao) => {
        // Esta função normalmente abriria um modal de edição com os dados da transação.
        // O modal, ao salvar, chamaria `saveTransacao(dadosAtualizados)`.
        toast.info(`Editando transação: ${transacao.descricao}`);
    };

    // Funções de manipulação de filtros permanecem as mesmas
    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({ ...prev, [name]: value }));
    };

    const toggleSelecionada = (id) => {
        setSelecionadas(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
    };

    const limparFiltros = () => {
        setFiltros({ mes: 'todos', ano: 'todos', categoria: 'todas', busca: '' });
        toast('Filtros limpos');
    };


    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <Card>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Resumo por Categoria (Gastos)</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {sumarioPorCategoria.map(cat => (
                        <FlipCardCategoria key={cat.id} icon={cat.icon} label={cat.label} total={cat.total} color={cat.color} verso={cat.verso} />
                    ))}
                </div>
            </Card>

            <Card>
                <div className="flex flex-wrap gap-4 items-center justify-between">
                    <div className="flex flex-wrap gap-2">
                        <input name="busca" value={filtros.busca} onChange={handleFiltroChange} placeholder="Buscar descrição..." className="bg-white dark:bg-[#200b5d] text-slate-800 dark:text-white rounded-md px-3 py-2 border border-[#3e388b] focus:ring-1 focus:ring-[#00d971]" />
                        <select name="categoria" value={filtros.categoria} onChange={handleFiltroChange} className="text-sm rounded-md p-2 border bg-white dark:bg-[#200b5d] border-[#3e388b] text-slate-800 dark:text-white">
                            <option value="todas">Todas as Categorias</option>
                            {Object.entries(CATEGORIAS_FLUXO).map(([key, { label }]) => (<option key={key} value={key}>{label}</option>))}
                            <option value="nao-categorizadas">Não Categorizadas</option>
                        </select>
                        <select name="mes" value={filtros.mes} onChange={handleFiltroChange} className="text-sm rounded-md p-2 border bg-white dark:bg-[#200b5d] border-[#3e388b] text-slate-800 dark:text-white">
                            <option value="todos">Mês</option>
                            {opcoesFiltro.meses.map(m => <option key={m.v} value={m.v}>{m.n}</option>)}
                        </select>
                        <select name="ano" value={filtros.ano} onChange={handleFiltroChange} className="text-sm rounded-md p-2 border bg-white dark:bg-[#200b5d] border-[#3e388b] text-slate-800 dark:text-white">
                            <option value="todos">Ano</option>
                            {opcoesFiltro.anos.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={limparFiltros} className="text-xs text-yellow-400 hover:underline">Limpar Filtros</button>
                        <button onClick={deletarSelecionadas} className="text-xs text-red-400 hover:underline">Apagar Selecionadas</button>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="flex justify-between items-center border-b pb-4 mb-4">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">Transações ({transacoesFiltradas.length})</h2>
                    <button onClick={handleAdicionarClick} className="text-xs flex items-center gap-1 text-[#00d971] hover:brightness-90 font-semibold">
                        <PlusCircle size={14} /> Adicionar Transação
                    </button>
                </div>
                {isLoading ? (
                    <p className="text-center text-slate-500 dark:text-gray-400">Carregando transações...</p>
                ) : (
                    <div className="space-y-2">
                        <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-bold text-slate-800 dark:text-white px-4 py-2">
                            <div className="col-span-1">#</div><div className="col-span-1">Data</div><div className="col-span-4">Descrição</div><div className="col-span-2">Categoria</div><div className="col-span-2 text-right">Valor</div><div className="col-span-2 text-center">Ações</div>
                        </div>
                        {transacoesFiltradas.map((t) => {
                            const isCredit = t.tipo === 'credit';
                            const selecionada = selecionadas.includes(t.id);
                            return (
                                <div key={t.id} className={`grid grid-cols-12 gap-4 items-center p-3 rounded-lg transition-colors ${selecionada ? 'bg-yellow-100 dark:bg-yellow-900' : t.ignorada ? 'bg-gray-800/50 opacity-60' : 'bg-white dark:bg-[#201b5d]'}`}>
                                    <div className="col-span-1 text-center">
                                        <input type="checkbox" checked={selecionada} onChange={() => toggleSelecionada(t.id)} />
                                    </div>
                                    <div className="col-span-1 text-sm">{new Date(t.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</div>
                                    <div className="col-span-4 font-medium">{t.descricao}</div>
                                    <div className="col-span-2">
                                        {isCredit ? (
                                            <span className="text-xs font-bold bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Receita</span>
                                        ) : (
                                            <span>{t.categoria ? CATEGORIAS_FLUXO[t.categoria]?.label || '—' : 'Não categorizada'}</span>
                                        )}
                                    </div>
                                    <div className={`col-span-2 text-right font-semibold ${isCredit ? 'text-green-400' : 'text-red-400'}`}>
                                        {isCredit ? '+' : '-'} {formatCurrency(t.valor)}
                                    </div>
                                    <div className="col-span-2 flex justify-center gap-2">
                                        {/* 5. Os botões agora chamam as funções locais que interagem com a store */}
                                        <button onClick={() => handleEditClick(t)} title="Editar" className="text-blue-500 hover:text-white">✏️</button>
                                        <button onClick={() => handleDeleteClick(t.id)} title="Apagar" className="text-red-500 hover:text-white">🗑️</button>
                                        <button onClick={() => handleIgnoreToggle(t.id)} title={t.ignorada ? 'Restaurar' : 'Ignorar'} className="text-slate-800 dark:text-white hover:text-white">
                                            {t.ignorada ? <Eye size={18} /> : <EyeOff size={18} />}
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </Card>
        </div>
    );
};

export default TelaFluxoDeCaixa;