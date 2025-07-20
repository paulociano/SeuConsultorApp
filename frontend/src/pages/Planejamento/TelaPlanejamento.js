import React, { useState, useMemo } from 'react';
import Card from '../../components/Card/Card';
import { CATEGORIAS_FLUXO } from '../../components/constants/Categorias';
import { formatCurrency } from '../../utils/formatters';
import { categorizeByAI } from '../../components/constants/categorizeByAI';
import { Package, AlertTriangle, FileDown, Edit3 } from 'lucide-react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const TelaPlanejamento = ({ orcamento, gastosReais, onEditarMeta }) => {
    const [filtroData, setFiltroData] = useState({ mes: new Date().getMonth() + 1, ano: new Date().getFullYear() });
    const [mostrarSomenteComMetas, setMostrarSomenteComMetas] = useState(false);
    const [editando, setEditando] = useState({});
    const [valoresEditados, setValoresEditados] = useState({});

    const opcoesFiltro = useMemo(() => {
        const datas = gastosReais.map(t => new Date(t.date));
        const anos = [...new Set(datas.map(d => d.getFullYear()))].sort((a, b) => b - a);
        const meses = [
            { v: 1, n: 'Janeiro' }, { v: 2, n: 'Fevereiro' }, { v: 3, n: 'Março' },
            { v: 4, n: 'Abril' }, { v: 5, n: 'Maio' }, { v: 6, n: 'Junho' },
            { v: 7, n: 'Julho' }, { v: 8, n: 'Agosto' }, { v: 9, n: 'Setembro' },
            { v: 10, n: 'Outubro' }, { v: 11, n: 'Novembro' }, { v: 12, n: 'Dezembro' }
        ];
        return { anos, meses };
    }, [gastosReais]);

    const gastosFiltrados = useMemo(() => {
        if (!Array.isArray(gastosReais)) return [];
        const totais = gastosReais
            .filter(t => {
                const data = new Date(t.date);
                return t.type === 'debit' && !t.isIgnored && data.getFullYear() === filtroData.ano && (data.getMonth() + 1) === filtroData.mes;
            })
            .reduce((acc, t) => {
                const categoria = categorizeByAI(t.description);
                if (categoria) acc[categoria] = (acc[categoria] || 0) + Number(t.amount || 0);
                return acc;
            }, {});
        return Object.entries(totais).map(([id, total]) => ({ id, total }));
    }, [filtroData, gastosReais]);

    const dadosPlanejamento = useMemo(() => {
        const metas = orcamento.filter(cat => cat.tipo === 'despesa').flatMap(cat => cat.subItens);
        const agrupadas = metas.reduce((acc, item) => {
            if (!item.categoriaId) return acc;
            if (!acc[item.categoriaId]) acc[item.categoriaId] = { id: item.categoriaId, meta: 0 };
            acc[item.categoriaId].meta += Number(item.sugerido || 0);
            return acc;
        }, {});
        return Object.keys(agrupadas).map(id => {
            const meta = agrupadas[id].meta;
            const realizado = gastosFiltrados.find(g => g.id === id)?.total || 0;
            const percentual = meta > 0 ? (realizado / meta) * 100 : 0;
            const categoria = CATEGORIAS_FLUXO[id] || {};
            return {
                id,
                nome: categoria.label || id,
                icon: categoria.icon || Package,
                meta,
                realizado,
                percentual
            };
        }).sort((a, b) => b.percentual - a.percentual);
    }, [orcamento, gastosFiltrados]);

    const categoriasParaExibir = mostrarSomenteComMetas ? dadosPlanejamento.filter(d => d.meta > 0) : dadosPlanejamento;
    const totalMeta = categoriasParaExibir.reduce((acc, item) => acc + item.meta, 0);
    const totalRealizado = categoriasParaExibir.reduce((acc, item) => acc + item.realizado, 0);
    const percentualTotal = totalMeta > 0 ? (totalRealizado / totalMeta) * 100 : 0;

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltroData(prev => ({ ...prev, [name]: parseInt(value) }));
    };

    const exportarCSV = () => {
        const ws = XLSX.utils.json_to_sheet(categoriasParaExibir.map(c => ({
            Categoria: c.nome,
            Meta: c.meta,
            Realizado: c.realizado,
            Percentual: `${c.percentual.toFixed(1)}%`
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Planejamento');
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
        saveAs(blob, 'planejamento_mensal.xlsx');
    };

    const exportarPDF = () => {
    const doc = new jsPDF();
    doc.text('Relatório de Planejamento', 14, 16);
    autoTable(doc, {
        head: [['Categoria', 'Meta', 'Realizado', '%']],
        body: categoriasParaExibir.map(c => [c.nome, formatCurrency(c.meta), formatCurrency(c.realizado), `${c.percentual.toFixed(1)}%`]),
    });
    doc.save('planejamento.pdf');
    };

    const handleEditarMeta = (id) => {
        setEditando({ ...editando, [id]: true });
        setValoresEditados({ ...valoresEditados, [id]: categoriasParaExibir.find(c => c.id === id)?.meta });
    };

    const salvarMetaEditada = (id) => {
        const novaMeta = parseFloat(valoresEditados[id]);
        if (!isNaN(novaMeta) && onEditarMeta) {
            onEditarMeta(id, novaMeta);
        }
        setEditando({ ...editando, [id]: false });
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">Planejamento de Metas</h2>
                    <div className="flex gap-2">
                        <button onClick={exportarCSV} title="Exportar CSV">
                            <FileDown className="text-[#00d971]" />
                        </button>
                        <button onClick={exportarPDF} title="Exportar PDF">
                            <FileDown className="text-[#3e388b]" />
                        </button>
                        <select name="mes" value={filtroData.mes} onChange={handleFiltroChange}>
                            {opcoesFiltro.meses.map(m => <option key={m.v} value={m.v}>{m.n}</option>)}
                        </select>
                        <select name="ano" value={filtroData.ano} onChange={handleFiltroChange}>
                            {opcoesFiltro.anos.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>
                </div>

                <div className="flex justify-between items-center mb-4 text-sm text-slate-800 dark:text-white">
                    <span>Você já realizou <strong>{formatCurrency(totalRealizado)}</strong> de <strong>{formatCurrency(totalMeta)}</strong> planejado. ({percentualTotal.toFixed(1)}%)</span>
                    <button onClick={() => setMostrarSomenteComMetas(prev => !prev)} className="text-[#00d971] hover:underline">
                        {mostrarSomenteComMetas ? 'Mostrar tudo' : 'Mostrar só categorias com metas'}
                    </button>
                </div>

                <div className="space-y-5">
                    {categoriasParaExibir.map(item => {
                        const Icone = item.icon;
                        const cor = item.realizado > item.meta ? 'bg-red-500' : 'bg-green-500';
                        const largura = Math.min(item.percentual, 100);
                        return (
                            <div key={item.id}>
                                <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center gap-2">
                                        <Icone size={16} />
                                        <span className="font-bold">{item.nome}</span>
                                        {item.percentual >= 100 && <AlertTriangle size={14} className="text-red-400" />}
                                    </div>
                                    <div className="text-sm font-semibold flex gap-2 items-center">
                                        <span className={item.realizado > item.meta ? 'text-red-500' : 'text-green-500'}>
                                            {formatCurrency(item.realizado)}
                                        </span> / 
                                        {editando[item.id] ? (
                                            <input
                                                type="number"
                                                value={valoresEditados[item.id]}
                                                onChange={e => setValoresEditados({ ...valoresEditados, [item.id]: e.target.value })}
                                                onBlur={() => salvarMetaEditada(item.id)}
                                                className="bg-white border rounded px-2 w-20"
                                            />
                                        ) : (
                                            <span onClick={() => handleEditarMeta(item.id)} className="cursor-pointer text-blue-600">{formatCurrency(item.meta)}</span>
                                        )}
                                        <Edit3 size={14} onClick={() => handleEditarMeta(item.id)} className="cursor-pointer" />
                                    </div>
                                </div>
                                <div className="relative w-full bg-slate-200 dark:bg-slate-700 rounded-full h-5">
                                    <div className={`h-full rounded-full transition-all duration-500 ${cor}`} style={{ width: `${largura}%` }}></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-xs font-bold text-white drop-shadow-md">{item.percentual.toFixed(0)}%</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </Card>

            {/* Gráfico comparativo entre meses */}
            <Card>
                <h3 className="text-md font-bold mb-4">Comparativo de Gastos por Mês</h3>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={resumoPorMes(gastosReais)} margin={{ top: 20, right: 20, left: 0, bottom: 0 }}>
                        <XAxis dataKey="mes" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="total" fill="#00d971" />
                    </BarChart>
                </ResponsiveContainer>
            </Card>
        </div>
    );
};

const resumoPorMes = (gastosReais) => {
    const resumo = {};
    gastosReais.forEach(t => {
        if (t.type === 'debit' && !t.isIgnored) {
            const d = new Date(t.date);
            const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            resumo[key] = (resumo[key] || 0) + Number(t.amount || 0);
        }
    });
    return Object.entries(resumo).map(([key, total]) => ({
        mes: key,
        total
    }));
};

export default TelaPlanejamento;
