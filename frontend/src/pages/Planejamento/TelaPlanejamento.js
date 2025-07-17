import React, { useState, useMemo } from 'react';
import Card from '../../components/Card/Card';
import { CATEGORIAS_FLUXO } from '../../components/constants/Categorias';
import { formatCurrency } from '../../utils/formatters';
import { categorizeByAI } from '../../components/constants/categorizeByAI';
import { Package } from 'lucide-react';

const TelaPlanejamento = ({ orcamento, gastosReais }) => {
    const [filtroData, setFiltroData] = useState({
        mes: new Date().getMonth() + 1,
        ano: new Date().getFullYear(),
    });

    // ⚠️ Log dos dados brutos recebidos
    console.log('📥 gastosReais:', gastosReais);

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
            const isValido = (
                t.type === 'debit' &&
                !t.isIgnored &&
                typeof t.description === 'string' &&
                !!t.date
            );

            if (!isValido) return false;

            const dataTransacao = new Date(t.date);
            const dataOk =
                dataTransacao.getFullYear() === filtroData.ano &&
                (dataTransacao.getMonth() + 1) === filtroData.mes;

            return dataOk;
        })
        .reduce((acc, t) => {
            const categoria = categorizeByAI(t.description);
            if (categoria) {
                acc[categoria] = (acc[categoria] || 0) + (Number(t.amount) || 0);
            }
            return acc;
        }, {});

    const resultado = Object.entries(totais).map(([key, total]) => ({ id: key, total }));
    console.log('📊 Gastos filtrados:', resultado);
    return resultado;
    }, [filtroData, gastosReais]);

    const dadosPlanejamento = useMemo(() => {
        const metasAgrupadas = orcamento
            .filter(cat => cat.tipo === 'despesa')
            .flatMap(cat => cat.subItens)
            .reduce((acc, item) => {
                const categoriaId = item.categoriaId;
                if (!categoriaId) return acc;

                if (!acc[categoriaId]) {
                    acc[categoriaId] = {
                        id: categoriaId,
                        nome: CATEGORIAS_FLUXO[categoriaId]?.label || categoriaId,
                        icon: CATEGORIAS_FLUXO[categoriaId]?.icon || Package,
                        meta: 0
                    };
                }

                acc[categoriaId].meta += Number(item.sugerido) || 0;
                return acc;
            }, {});

        const resultado = Object.values(metasAgrupadas).map(meta => {
            const gasto = gastosFiltrados.find(g => g.id === meta.id);
            const realizado = gasto ? gasto.total : 0;
            const percentual = meta.meta > 0 ? (realizado / meta.meta) * 100 : 0;

            return { ...meta, realizado, percentual };
        });

        console.log('📈 Dados do planejamento:', resultado);
        return resultado;
    }, [orcamento, gastosFiltrados]);

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltroData(prev => ({ ...prev, [name]: parseInt(value) }));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Card>
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">Planejamento de Metas</h2>
                    <div className="flex gap-2">
                        <select name="mes" value={filtroData.mes} onChange={handleFiltroChange} className="w-full bg-white dark:bg-[#2a246f] text-slate-900 dark:text-white text-sm rounded-md p-2 border border-slate-300 dark:border-[#3e388b] focus:ring-1 focus:ring-[#00d971]">
                            {opcoesFiltro.meses.map(m => <option key={m.v} value={m.v}>{m.n}</option>)}
                        </select>
                        <select name="ano" value={filtroData.ano} onChange={handleFiltroChange} className="w-full bg-white dark:bg-[#2a246f] text-slate-900 dark:text-white text-sm rounded-md p-2 border border-slate-300 dark:border-[#3e388b] focus:ring-1 focus:ring-[#00d971]">
                            {opcoesFiltro.anos.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>
                </div>

                <div className="space-y-5">
                    {dadosPlanejamento.map(item => {
                        if (item.meta <= 0 && item.realizado <= 0) return null;
                        const Icone = item.icon;
                        const progressoCor = item.realizado > item.meta ? 'bg-red-500' : 'bg-green-500';
                        const larguraBarra = Math.min(item.percentual, 100);

                        return (
                            <div key={item.id}>
                                <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center gap-2">
                                        <Icone size={16} className="text-slate-600 dark:text-gray-300" />
                                        <span className="font-bold text-slate-800 dark:text-white">{item.nome}</span>
                                    </div>
                                    <div className="text-sm font-semibold text-slate-600 dark:text-gray-300">
                                        <span className={item.realizado > item.meta ? 'text-red-500' : 'text-green-500'}>
                                            {formatCurrency(item.realizado)}
                                        </span> / {formatCurrency(item.meta)}
                                    </div>
                                </div>
                                <div className="relative w-full bg-slate-200 dark:bg-slate-700 rounded-full h-5">
                                    <div className={`h-full rounded-full transition-all duration-500 ${progressoCor}`} style={{ width: `${larguraBarra}%` }}></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-xs font-bold text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                                            {item.percentual.toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </Card>
        </div>
    );
};

export default TelaPlanejamento;
