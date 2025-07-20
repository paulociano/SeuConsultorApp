// TelaFluxoCaixa.js - Versão Melhorada com UX/UI, filtros avançados, toasts, ações em lote e insights

import { useState, useMemo, useEffect } from 'react';
import Card from '../../components/Card/Card';
import { CATEGORIAS_FLUXO } from '../../components/constants/Categorias';
import { formatCurrency } from '../../utils/formatters';
import { PlusCircle, Eye, EyeOff } from 'lucide-react';
import FlipCardCategoria from '../../components/Card/FlipCardCategoria';
import { toast } from 'sonner';

const TelaFluxoDeCaixa = ({
    transacoes,
    handleCategoryChange,
    handleIgnoreToggle,
    handleEditTransacao,
    onAdicionarClick,
    onEditClick
}) => {
    const [filtros, setFiltros] = useState(() => {
        const saved = localStorage.getItem('filtros_fluxo');
        return saved ? JSON.parse(saved) : { mes: 'todos', ano: 'todos', categoria: 'todas', busca: '' };
    });
    const [selecionadas, setSelecionadas] = useState([]);

    useEffect(() => {
        localStorage.setItem('filtros_fluxo', JSON.stringify(filtros));
    }, [filtros]);

    const opcoesFiltro = useMemo(() => {
        const datas = transacoes.map(t => new Date(t.date));
        const anos = [...new Set(datas.map(d => d.getFullYear()))].sort((a, b) => b - a);
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
            const dataTransacao = new Date(t.date);
            const anoTransacao = dataTransacao.getFullYear();
            const mesTransacao = dataTransacao.getMonth() + 1;
            const filtroAnoOk = filtros.ano === 'todos' || anoTransacao === parseInt(filtros.ano);
            const filtroMesOk = filtros.mes === 'todos' || mesTransacao === parseInt(filtros.mes);
            const filtroCategoriaOk = filtros.categoria === 'todas' || (filtros.categoria === 'nao-categorizadas' ? t.category === null : t.category === filtros.categoria);
            const filtroBuscaOk = filtros.busca === '' || t.description.toLowerCase().includes(filtros.busca.toLowerCase());
            return filtroAnoOk && filtroMesOk && filtroCategoriaOk && filtroBuscaOk;
        });
    }, [transacoes, filtros]);

    const sumarioPorCategoria = useMemo(() => {
        const gastos = transacoesFiltradas.filter(t => t.type === 'debit' && !t.isIgnored && t.category !== 'receita');
        const totais = gastos.reduce((acc, t) => {
            if (t.category) {
                if (!acc[t.category]) acc[t.category] = 0;
                acc[t.category] += t.amount;
            }
            return acc;
        }, {});
        return Object.entries(totais).map(([key, value]) => ({
            id: key,
            ...CATEGORIAS_FLUXO[key],
            total: value
        })).sort((a, b) => b.total - a.total);
    }, [transacoesFiltradas]);

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({ ...prev, [name]: value }));
    };

    const handleDeleteTransacao = (id) => {
        if (window.confirm("Tem certeza que deseja excluir esta transação?")) {
            const novas = transacoes.filter(t => t.id !== id);
            handleEditTransacao(null, novas);
            toast.success('Transação excluída');
        }
    };

    const toggleSelecionada = (id) => {
        setSelecionadas(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
    };

    const limparFiltros = () => {
        setFiltros({ mes: 'todos', ano: 'todos', categoria: 'todas', busca: '' });
        toast('Filtros limpos');
    };

    const deletarSelecionadas = () => {
        if (selecionadas.length === 0) return;
        if (window.confirm(`Deseja excluir ${selecionadas.length} transações selecionadas?`)) {
            const novas = transacoes.filter(t => !selecionadas.includes(t.id));
            handleEditTransacao(null, novas);
            setSelecionadas([]);
            toast.success('Transações excluídas');
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            {/* Resumo por Categoria */}
            <Card>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Resumo por Categoria (Gastos)</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {sumarioPorCategoria.map(cat => (
                        <FlipCardCategoria key={cat.id} icon={cat.icon} label={cat.label} total={cat.total} color={cat.color} />
                    ))}
                </div>
            </Card>

            {/* Filtros */}
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
                        <button onClick={deletarSelecionadas} className="text-xs text-red-400 hover:underline">Excluir Selecionadas</button>
                    </div>
                </div>
            </Card>

            {/* Lista de Transações */}
            <Card>
                <div className="flex justify-between items-center border-b pb-4 mb-4">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">Transações ({transacoesFiltradas.length})</h2>
                    <button onClick={onAdicionarClick} className="text-xs flex items-center gap-1 text-[#00d971] hover:brightness-90 font-semibold">
                        <PlusCircle size={14} /> Adicionar Transação
                    </button>
                </div>
                <div className="space-y-2">
                    <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-bold text-slate-800 dark:text-white px-4 py-2">
                        <div className="col-span-1">#</div><div className="col-span-1">Data</div><div className="col-span-4">Descrição</div><div className="col-span-2">Categoria</div><div className="col-span-2 text-right">Valor</div><div className="col-span-2 text-center">Ações</div>
                    </div>
                    {transacoesFiltradas.map((t, idx) => {
                        const isCredit = t.type === 'credit';
                        const selecionada = selecionadas.includes(t.id);
                        return (
                            <div key={t.id} className={`grid grid-cols-12 gap-4 items-center p-3 rounded-lg transition-colors ${selecionada ? 'bg-yellow-100 dark:bg-yellow-900' : t.isIgnored ? 'bg-gray-800/50 opacity-60' : 'bg-white dark:bg-[#201b5d]'}`}>
                                <div className="col-span-1 text-center">
                                    <input type="checkbox" checked={selecionada} onChange={() => toggleSelecionada(t.id)} />
                                </div>
                                <div className="col-span-1 text-sm">{new Date(t.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</div>
                                <div className="col-span-4 font-medium">{t.description}</div>
                                <div className="col-span-2">
                                    {isCredit ? (
                                        <span className="text-xs font-bold bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Receita</span>
                                    ) : (
                                        <span>{t.category ? CATEGORIAS_FLUXO[t.category]?.label || '—' : 'Não categorizada'}</span>
                                    )}
                                </div>
                                <div className={`col-span-2 text-right font-semibold ${isCredit ? 'text-green-400' : 'text-red-400'}`}>
                                    {isCredit ? '+' : '-'} {formatCurrency(t.amount)}
                                </div>
                                <div className="col-span-2 flex justify-center gap-2">
                                    <button onClick={() => onEditClick(t)} title="Editar" className="text-blue-500 hover:text-white">✏️</button>
                                    <button onClick={() => handleDeleteTransacao(t.id)} title="Excluir" className="text-red-500 hover:text-white">🗑️</button>
                                    <button onClick={() => handleIgnoreToggle(t.id)} title={t.isIgnored ? 'Restaurar' : 'Ignorar'} className="text-slate-800 dark:text-white hover:text-white">
                                        {t.isIgnored ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>
        </div>
    );
};

export default TelaFluxoDeCaixa;
