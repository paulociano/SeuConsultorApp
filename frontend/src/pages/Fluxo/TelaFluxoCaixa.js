import React, { useState, useMemo } from 'react';
import Card from '../../components/Card/Card';
import { CATEGORIAS_FLUXO } from '../../components/constants/Categorias';
import { formatCurrency } from '../../utils/formatters';
import { PlusCircle, Eye, EyeOff } from 'lucide-react';

const TelaFluxoDeCaixa = ({ transacoes, handleCategoryChange, handleIgnoreToggle, handleEditTransacao, onAdicionarClick }) => {
    const [filtros, setFiltros] = useState({ mes: 'todos', ano: 'todos', categoria: 'todas', busca: '' });

    // ##### NOVO: Lógica para gerar as opções dos filtros dinamicamente #####
    const opcoesFiltro = useMemo(() => {
        const datas = transacoes.map(t => new Date(t.date));
        const anos = [...new Set(datas.map(d => d.getFullYear()))].sort((a,b) => b - a);
        const meses = [
            { v: 1, n: 'Janeiro' }, { v: 2, n: 'Fevereiro' }, { v: 3, n: 'Março' },
            { v: 4, n: 'Abril' }, { v: 5, n: 'Maio' }, { v: 6, n: 'Junho' },
            { v: 7, n: 'Julho' }, { v: 8, n: 'Agosto' }, { v: 9, n: 'Setembro' },
            { v: 10, n: 'Outubro' }, { v: 11, n: 'Novembro' }, { v: 12, n: 'Dezembro' }
        ];
        return { anos, meses };
    }, [transacoes]);

    // ##### NOVO: Lógica principal de filtragem das transações #####
    const transacoesFiltradas = useMemo(() => {
        return transacoes.filter(t => {
            const dataTransacao = new Date(t.date);
            const anoTransacao = dataTransacao.getFullYear();
            const mesTransacao = dataTransacao.getMonth() + 1; // getMonth() é 0-indexed

            const filtroAnoOk = filtros.ano === 'todos' || anoTransacao === parseInt(filtros.ano);
            const filtroMesOk = filtros.mes === 'todos' || mesTransacao === parseInt(filtros.mes);
            
            const filtroCategoriaOk = (() => {
                if (filtros.categoria === 'todas') return true;
                if (filtros.categoria === 'nao-categorizadas') return t.category === null;
                return t.category === filtros.categoria;
            })();

            const filtroBuscaOk = filtros.busca === '' || t.description.toLowerCase().includes(filtros.busca.toLowerCase());

            return filtroAnoOk && filtroMesOk && filtroCategoriaOk && filtroBuscaOk;
        });
    }, [transacoes, filtros]);
    
    // ##### ALTERAÇÃO: Sumário agora usa os dados filtrados #####
    const sumarioPorCategoria = useMemo(() => {
        const gastos = transacoesFiltradas.filter(t => t.type === 'debit' && !t.isIgnored && t.category !== 'receita');
        const totais = gastos.reduce((acc, t) => {
            if (t.category) {
                if (!acc[t.category]) acc[t.category] = 0;
                acc[t.category] += t.amount;
            }
            return acc;
        }, {});
        return Object.entries(totais).map(([key, value]) => ({ id: key, ...CATEGORIAS_FLUXO[key], total: value, })).sort((a, b) => b.total - a.total);
    }, [transacoesFiltradas]);

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({...prev, [name]: value}));
    };

    const handleDeleteTransacao = (id) => {
        const confirm = window.confirm("Tem certeza que deseja excluir esta transação?");
        if (confirm) {
            const novas = transacoes.filter(t => t.id !== id);
            handleEditTransacao(novas); // dispara atualização
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            
            {/* ##### NOVO: Barra de Filtros e Busca ##### */}
            <Card>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Resumo por Categoria (Gastos)</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {sumarioPorCategoria.map(cat => {
                        const Icon = cat.icon;
                        const crescimento = "+5%"; // <-- Substituir por lógica real se desejar
                        return (
                        <div key={cat.id} className="bg-white dark:bg-[#201b5d] rounded-xl p-4 shadow-md border border-slate-200 dark:border-[#3e388b] flex flex-col justify-between">
                            <div className="flex items-center justify-between">
                            <div className="rounded-full p-2" style={{ backgroundColor: `${cat.color}20` }}>
                                <Icon size={20} style={{ color: cat.color }} />
                            </div>
                            </div>
                            <div className="mt-6">
                            <p className="text-2xl font-bold text-slate-800 dark:text-white">{formatCurrency(cat.total)}</p>
                            <p className="text-sm text-slate-500 dark:text-slate-300">{cat.label}</p>
                            </div>
                            <div className="mt-2">
                            <p className="text-sm font-semibold text-green-500">{crescimento} desde o mês passado</p>
                            </div>
                        </div>
                        );
                    })}
                    </div>
            </Card>
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input 
                        type="text"
                        name="busca"
                        placeholder="Pesquisar na descrição..."
                        value={filtros.busca}
                        onChange={handleFiltroChange}
                        className="md:col-span-2 w-full bg-white dark:bg-[#200b5d] text-slate-800 dark:text-white rounded-md px-3 py-2 border border-[#3e388b] focus:ring-1 focus:ring-[#00d971]"
                    />
                    <select name="categoria" value={filtros.categoria} onChange={handleFiltroChange} className="w-full bg-white dark:bg-[#200b5d] text-slate-800 dark:text-white text-sm rounded-md p-2 border border-[#3e388b] focus:ring-1 focus:ring-[#00d971]">
                        <option value="todas">Todas as Categorias</option>
                        {Object.entries(CATEGORIAS_FLUXO).map(([key, { label }]) => (<option key={key} value={key}>{label}</option>))}
                        <option value="nao-categorizadas">Não Categorizadas</option>
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                        <select name="mes" value={filtros.mes} onChange={handleFiltroChange} className="w-full bg-white dark:bg-[#200b5d] text-slate-800 dark:text-white text-sm rounded-md p-2 border border-[#3e388b] focus:ring-1 focus:ring-[#00d971]">
                           <option value="todos">Mês</option>
                           {opcoesFiltro.meses.map(m => <option key={m.v} value={m.v}>{m.n}</option>)}
                        </select>
                        <select name="ano" value={filtros.ano} onChange={handleFiltroChange} className="w-full bg-white dark:bg-[#200b5d] text-slate-800 dark:text-white text-sm rounded-md p-2 border border-[#3e388b] focus:ring-1 focus:ring-[#00d971]">
                            <option value="todos">Ano</option>
                            {opcoesFiltro.anos.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-[#3e388b] pb-4 mb-4">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Transações</h2>
                    <button onClick={onAdicionarClick} className="text-xs flex items-center gap-1 text-[#00d971] hover:brightness-90 font-semibold">
                        <PlusCircle size={14} /> Adicionar Transação
                    </button>
                </div>
                <div className="space-y-2">
                    <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-bold text-slate-800 dark:text-white px-4 py-2">
                        <div className="col-span-1">Data</div><div className="col-span-4">Descrição</div><div className="col-span-3">Categoria</div><div className="col-span-2 text-right">Valor</div><div className="col-span-2 text-center">Ações</div>
                    </div>
                    {/* ##### ALTERAÇÃO: Renderiza a lista filtrada ##### */}
                    {transacoesFiltradas.map(t => {
                        const isCredit = t.type === 'credit';
                        const categoriaInfo = t.category ? CATEGORIAS_FLUXO[t.category] : null;
                        return (
                            <div key={t.id} className={`grid grid-cols-12 gap-4 items-center p-3 rounded-lg transition-colors ${t.isIgnored ? 'bg-gray-800/50 opacity-60' : 'bg-white dark:bg-[#201b5d] text-slate-800 dark:text-white hover:bg-[#2a246f]/70'}`}>
                                <div className="col-span-4 md:col-span-1 text-sm text-slate-800 dark:text-white">{new Date(t.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</div>
                                <div className="col-span-8 md:col-span-4 text-slate-800 dark:text-white font-medium">{t.description}</div>
                                <div className="col-span-12 md:col-span-3">
                                    {isCredit ? <span className="text-xs font-bold bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Receita</span> : (
                                        <select value={t.category || ''} onChange={(e) => handleCategoryChange(t.id, e.target.value)} className="w-full bg-white dark:bg-[#201b5d] text-slate-800 dark:text-white text-sm rounded-md p-1 border border-[#3e388b] focus:ring-1 focus:ring-[#00d971]">
                                            <option value="">Selecione...</option>
                                            {Object.entries(CATEGORIAS_FLUXO).map(([key, { label }]) => (<option key={key} value={key}>{label}</option>))}
                                        </select>
                                    )}
                                </div>
                                <div className={`col-span-6 md:col-span-2 text-right font-semibold ${isCredit ? 'text-green-400' : 'text-red-400'}`}>{isCredit ? '+' : '-'} {formatCurrency(t.amount)}</div>
                                <div className="col-span-6 md:col-span-2 flex justify-center gap-2">
                                    <button
                                        onClick={() => handleEditTransacao(t)}
                                        title="Editar Transação"
                                        className="text-blue-500 hover:text-white"
                                    >
                                        ✏️
                                    </button>
                                    <button
                                        onClick={() => handleDeleteTransacao(t.id)}
                                        title="Excluir Transação"
                                        className="text-red-500 hover:text-white"
                                    >
                                        🗑️
                                    </button>
                                    <button
                                        onClick={() => handleIgnoreToggle(t.id)}
                                        title={t.isIgnored ? "Restaurar Transação" : "Ignorar Transação"}
                                        className="text-slate-800 dark:text-white hover:text-white"
                                    >
                                        {t.isIgnored ? <Eye size={18} /> : <EyeOff size={18} />}
                                    </button>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </Card>
        </div>
    );
};

export default TelaFluxoDeCaixa;