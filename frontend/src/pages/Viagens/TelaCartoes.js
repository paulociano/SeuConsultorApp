
import CardDeComparacao from '../../components/Card/CardComparacao';
import { useState, useMemo, useCallback } from 'react';
import Card from '../../components/Card/Card';
import { Check, Star, StarOff, RefreshCw } from "lucide-react";
import { motion } from 'framer-motion';

const dadosBrutos = require('../../data/cartoes_credito.json');

const dadosDosCartoes = dadosBrutos.map(cartao => {
    const caracteristicas = [];
    const anuidade = (cartao.anuidade || '').toLowerCase();
    const beneficios = (cartao.outros_beneficios || '').toLowerCase();
    const acumulopontos = (cartao['acúmulo_de_pontos'] || '').toLowerCase();
    const salasvip = (cartao.salas_vip || '').toLowerCase();

    if (anuidade.includes('r$ 0') || anuidade.includes('grátis') || beneficios.includes('anuidade grátis')) {
        caracteristicas.push('Sem Anuidade');
    }
    if (beneficios.includes('cashback')) {
        caracteristicas.push('Cashback');
    }
    if (salasvip.includes('loungekey') || salasvip.includes('dragon pass') || salasvip.includes('internacional')) {
        caracteristicas.push('Internacional');
    }
    if (acumulopontos.includes('milha') || acumulopontos.includes('ponto') || beneficios.includes('milha') || beneficios.includes('ponto')) {
        caracteristicas.push('Milhas');
    }
    return {
        ...cartao,
        caracteristicas,
    };
});

const filtrosDisponiveis = ["Sem Anuidade", "Cashback", "Milhas", "Internacional"];

const TelaCartoes = () => {
    const [cartao1Id, setCartao1Id] = useState(dadosDosCartoes[0]?.id || '');
    const [cartao2Id, setCartao2Id] = useState(dadosDosCartoes[1]?.id || '');
    const [favoritos, setFavoritos] = useState([]);
    const [filtrosSelecionados, setFiltrosSelecionados] = useState([]);

    const toggleFavorito = (id) => {
        setFavoritos((prev) =>
            prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]
        );
    };

    const toggleFiltro = (filtro) => {
        setFiltrosSelecionados((prev) =>
            prev.includes(filtro) ? prev.filter(f => f !== filtro) : [...prev, filtro]
        );
    };

    const filtrarCartoes = useCallback((cartoes) => {
        if (filtrosSelecionados.length === 0) return cartoes;
        return cartoes.filter(cartao =>
            filtrosSelecionados.every(filtro => cartao.caracteristicas?.includes(filtro))
        );
    }, [filtrosSelecionados]);

    const cartao1 = useMemo(() => dadosDosCartoes.find(c => c.id === cartao1Id), [cartao1Id]);
    const cartao2 = useMemo(() => dadosDosCartoes.find(c => c.id === cartao2Id), [cartao2Id]);

    const opcoesDisponiveis1 = useMemo(() =>
        filtrarCartoes(dadosDosCartoes.filter(c => c.id !== cartao2Id))
            .sort((a, b) => (a?.nome || '').localeCompare(b?.nome || '')),
        [cartao2Id, filtrosSelecionados, filtrarCartoes]
    );

    const opcoesDisponiveis2 = useMemo(() =>
        filtrarCartoes(dadosDosCartoes.filter(c => c.id !== cartao1Id))
            .sort((a, b) => (a?.nome || '').localeCompare(b?.nome || '')),
        [cartao1Id, filtrosSelecionados, filtrarCartoes]
    );

    const resetComparacao = () => {
        setCartao1Id(dadosDosCartoes[0]?.id || '');
        setCartao2Id(dadosDosCartoes[1]?.id || '');
    };

    return (
        <div className="max-w-6xl mx-auto p-4 space-y-10">
            <div>
                <h3 className="text-lg font-semibold mb-2 text-slate-800 dark:text-white">Filtros:</h3>
                <div className="flex flex-wrap gap-2">
                    {filtrosDisponiveis.map(filtro => (
                        <button
                            key={filtro}
                            onClick={() => toggleFiltro(filtro)}
                            className={`px-3 py-1 rounded-full flex items-center gap-1 text-sm transition 
                                ${filtrosSelecionados.includes(filtro) 
                                    ? 'bg-indigo-600 text-white' 
                                    : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-white'}`}
                        >
                            {filtro}
                            {filtrosSelecionados.includes(filtro) && <Check size={14} />}
                        </button>
                    ))}
                </div>
            </div>

            <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                        { titulo: "Seu Cartão Atual", cartao: cartao1, setId: setCartao1Id, opcoes: opcoesDisponiveis1 },
                        { titulo: "Sugestão Recomendada", cartao: cartao2, setId: setCartao2Id, opcoes: opcoesDisponiveis2 }
                    ].map((coluna, index) => (
                        <motion.div 
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="space-y-4 bg-white dark:bg-slate-800 p-4 rounded-xl shadow-md"
                        >
                            <h2 className="text-xl font-bold text-center text-indigo-700 dark:text-indigo-300">{coluna.titulo}</h2>
                            <select 
                                value={coluna.cartao?.id || ''} 
                                onChange={(e) => coluna.setId(e.target.value)}
                                className="w-full p-2 rounded-md bg-slate-100 dark:bg-[#2a246f] text-slate-800 dark:text-white border border-slate-300 dark:border-[#3e388b]"
                            >
                                {coluna.opcoes.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                            </select>

                            <div className="w-full h-48 flex items-center justify-center p-4 rounded-lg relative bg-gradient-to-br from-slate-50 to-white dark:from-[#1e1b4b] dark:to-[#2a246f]">
                                {coluna.cartao && (
                                    <>
                                        <img src={coluna.cartao.imagem_url} alt={coluna.cartao.nome} className="max-w-full max-h-full object-contain rounded-md shadow-lg hover:scale-105 transition-transform" />
                                        <button onClick={() => toggleFavorito(coluna.cartao.id)} className="absolute top-2 right-2 text-yellow-400 text-xl">
                                            {favoritos.includes(coluna.cartao.id) ? <Star /> : <StarOff />}
                                        </button>
                                    </>
                                )}
                            </div>
                            <p className="text-center font-semibold text-slate-700 dark:text-white">{coluna.cartao?.nome}</p>
                            <CardDeComparacao cartao={coluna.cartao} />
                        </motion.div>
                    ))}
                </div>

                <div className="flex justify-center mt-6">
                    <button
                        onClick={resetComparacao}
                        className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    >
                        <RefreshCw size={18} /> Nova Comparação
                    </button>
                </div>
            </Card>
        </div>
    );
};

export default TelaCartoes;
