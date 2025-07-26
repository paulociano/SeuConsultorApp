import React, { useState, useMemo } from 'react';
import Card from '../../components/Card/Card';
import { CATEGORIAS_FLUXO } from '../../components/constants/Categorias';
import { formatCurrency } from '../../utils/formatters';
import { Package, AlertTriangle, FileDown } from 'lucide-react';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const TelaPlanejamento = ({ orcamento, gastosReais }) => {
    const [filtroData, setFiltroData] = useState({ mes: new Date().getMonth() + 1, ano: new Date().getFullYear() });
    const [mostrarSomenteComMetas, setMostrarSomenteComMetas] = useState(false);

    const opcoesFiltro = useMemo(() => {
        if (!gastosReais) return { anos: [new Date().getFullYear()], meses: [] };
        const datas = gastosReais.map(t => new Date(t.data));
        const anos = [...new Set(datas.map(d => d.getFullYear()))].sort((a, b) => b - a);
        const meses = [ { v: 1, n: 'Janeiro' }, { v: 2, n: 'Fevereiro' }, { v: 3, n: 'Março' }, { v: 4, n: 'Abril' }, { v: 5, n: 'Maio' }, { v: 6, n: 'Junho' }, { v: 7, n: 'Julho' }, { v: 8, n: 'Agosto' }, { v: 9, n: 'Setembro' }, { v: 10, n: 'Outubro' }, { v: 11, n: 'Novembro' }, { v: 12, n: 'Dezembro' } ];
        return { anos: anos.length > 0 ? anos : [new Date().getFullYear()], meses };
    }, [gastosReais]);

    const dadosPlanejamento = useMemo(() => {
        const metasAgrupadas = orcamento
            .filter(cat => cat.tipo === 'despesa')
            .flatMap(cat => cat.subItens)
            .reduce((acc, item) => {
                const categoria = item.categoria_planejamento;
                if (categoria) {
                    acc[categoria] = (acc[categoria] || 0) + Number(item.sugerido || 0);
                }
                return acc;
            }, {});

        const gastosAgrupados = gastosReais
            .filter(t => {
                const data = new Date(t.data);
                //  ***** A CORREÇÃO ESTÁ AQUI *****
                // Trocamos 'despesa' por 'debit' para corresponder aos seus dados
                return t.tipo === 'debit' && !t.ignorada && data.getFullYear() === filtroData.ano && (data.getMonth() + 1) === filtroData.mes;
            })
            .reduce((acc, t) => {
                const categoria = t.categoria;
                if (categoria) {
                    acc[categoria] = (acc[categoria] || 0) + Number(t.valor || 0);
                }
                return acc;
            }, {});

        const todasCategoriasIds = [...new Set([...Object.keys(metasAgrupadas), ...Object.keys(gastosAgrupados)])];
        
        return todasCategoriasIds.map(id => {
            const meta = metasAgrupadas[id] || 0;
            const realizado = gastosAgrupados[id] || 0;
            const percentual = meta > 0 ? (realizado / meta) * 100 : (realizado > 0 ? 100 : 0);
            const categoriaInfo = CATEGORIAS_FLUXO[id] || {};

            return { id, nome: categoriaInfo.label || id, icon: categoriaInfo.icon || Package, meta, realizado, percentual };
        }).sort((a, b) => b.meta - a.meta);
    }, [orcamento, gastosReais, filtroData]);

    // O resto do componente JSX continua o mesmo...
    const categoriasParaExibir = mostrarSomenteComMetas ? dadosPlanejamento.filter(d => d.meta > 0) : dadosPlanejamento;
    const totalMeta = categoriasParaExibir.reduce((acc, item) => acc + item.meta, 0);
    const totalRealizado = categoriasParaExibir.reduce((acc, item) => acc + item.realizado, 0);
    const percentualTotal = totalMeta > 0 ? (totalRealizado / totalMeta) * 100 : 0;
    const handleFiltroChange = (e) => { const { name, value } = e.target; setFiltroData(prev => ({ ...prev, [name]: parseInt(value) })); };
    const exportarCSV = () => { const ws = XLSX.utils.json_to_sheet(categoriasParaExibir.map(c => ({ Categoria: c.nome, Meta_Planejada: c.meta, Gasto_Real: c.realizado, Percentual_Atingido: `${c.percentual.toFixed(1)}%` }))); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, 'Planejamento'); const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' }); const blob = new Blob([excelBuffer], { type: 'application/octet-stream' }); saveAs(blob, 'planejamento_mensal.xlsx'); };
    const exportarPDF = () => { const doc = new jsPDF(); const dataFormatada = `${opcoesFiltro.meses.find(m => m.v === filtroData.mes)?.n}/${filtroData.ano}`; doc.text(`Relatório de Planejamento - ${dataFormatada}`, 14, 16); autoTable(doc, { head: [['Categoria', 'Meta', 'Realizado', '% Atingido']], body: categoriasParaExibir.map(c => [c.nome, formatCurrency(c.meta), formatCurrency(c.realizado), `${c.percentual.toFixed(1)}%`]), startY: 22, }); doc.save(`planejamento_${filtroData.mes}_${filtroData.ano}.pdf`); };
    return ( <div className="max-w-4xl mx-auto space-y-6"> <Card> <div className="flex justify-between items-center mb-4 flex-wrap gap-4"> <h2 className="text-lg font-bold text-slate-800 dark:text-white">Planejamento vs Realizado</h2> <div className="flex gap-2 items-center"> <button onClick={exportarCSV} title="Exportar para Excel" className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"> <FileDown size={20} className="text-green-600" /> </button> <button onClick={exportarPDF} title="Exportar para PDF" className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700"> <FileDown size={20} className="text-red-600" /> </button> <select name="mes" value={filtroData.mes} onChange={handleFiltroChange} className="bg-white dark:bg-[#2a246f] border border-slate-300 dark:border-[#3e388b] rounded-md px-2 py-1 text-sm"> {opcoesFiltro.meses.map(m => <option key={m.v} value={m.v}>{m.n}</option>)} </select> <select name="ano" value={filtroData.ano} onChange={handleFiltroChange} className="bg-white dark:bg-[#2a246f] border border-slate-300 dark:border-[#3e388b] rounded-md px-2 py-1 text-sm"> {opcoesFiltro.anos.map(a => <option key={a} value={a}>{a}</option>)} </select> </div> </div> <div className="flex justify-between items-center mb-4 text-sm text-slate-800 dark:text-white bg-slate-100 dark:bg-slate-800/50 p-3 rounded-lg"> <span>Resumo do mês: <strong>{formatCurrency(totalRealizado)}</strong> de <strong>{formatCurrency(totalMeta)}</strong> ({percentualTotal.toFixed(1)}%)</span> <label className="flex items-center gap-2 cursor-pointer"> <input type="checkbox" checked={mostrarSomenteComMetas} onChange={() => setMostrarSomenteComMetas(prev => !prev)} /> Mostrar apenas categorias com metas </label> </div> <div className="space-y-5"> {categoriasParaExibir.map(item => { const Icone = item.icon; const cor = item.realizado > item.meta ? 'bg-red-500' : 'bg-[#00d971]'; const largura = Math.min(item.percentual, 100); return ( <div key={item.id}> <div className="flex justify-between items-center mb-1"> <div className="flex items-center gap-2"> <Icone size={16} /> <span className="font-bold">{item.nome}</span> {item.percentual >= 100 && item.meta > 0 && <AlertTriangle size={14} className="text-red-400" title="Meta ultrapassada!" />} </div> <div className="text-sm font-semibold flex gap-2 items-center"> <span className={item.realizado > item.meta && item.meta > 0 ? 'text-red-500' : 'text-green-500'}> {formatCurrency(item.realizado)} </span> / <span>{formatCurrency(item.meta)}</span> </div> </div> <div className="relative w-full bg-slate-200 dark:bg-slate-700 rounded-full h-5"> <div className={`h-full rounded-full transition-all duration-500 ${cor}`} style={{ width: `${largura}%` }}></div> <div className="absolute inset-0 flex items-center justify-center"> <span className="text-xs font-bold text-white drop-shadow-md">{item.percentual.toFixed(0)}%</span> </div> </div> </div> ); })} </div> </Card> </div> );
};

export default TelaPlanejamento;