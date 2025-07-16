import CardDeComparacao from '../../components/Card/CardComparacao';
import { useState, useMemo } from 'react';
import Card from '../../components/Card/Card';
import dadosDosCartoes from '../../data/cartoes_credito.json'

const TelaCartoes = () => {
    // A lógica de estado e `useMemo` permanece a mesma
    const [cartao1Id, setCartao1Id] = useState(dadosDosCartoes[0]?.id || '');
    const [cartao2Id, setCartao2Id] = useState(dadosDosCartoes[1]?.id || '');

    const cartao1 = useMemo(() => dadosDosCartoes.find(c => c.id === cartao1Id), [cartao1Id]);
    const cartao2 = useMemo(() => dadosDosCartoes.find(c => c.id === cartao2Id), [cartao2Id]);

    const opcoesDisponiveis1 = useMemo(() => dadosDosCartoes.filter(c => c.id !== cartao2Id), [cartao2Id]);
    const opcoesDisponiveis2 = useMemo(() => dadosDosCartoes.filter(c => c.id !== cartao1Id), [cartao1Id]);

    return (
        <div className="max-w-6xl mx-auto">
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    
                    {/* Coluna da Esquerda */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white text-center">ATUAL</h2>
                        <select 
                            value={cartao1Id} 
                            onChange={(e) => setCartao1Id(e.target.value)}
                            className="w-full p-2 rounded-md bg-slate-100 dark:bg-[#2a246f] text-slate-800 dark:text-white border border-slate-300 dark:border-[#3e388b]"
                        >
                            {opcoesDisponiveis1.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                        </select>
                        
                        {/* Imagem grande do cartão */}
                        <div className="w-full h-48 flex items-center justify-center p-4 rounded-lg">
                            {cartao1 ? (
                                <img src={cartao1.imagem_url} alt={cartao1.nome} className="max-w-full max-h-full object-contain" />
                            ) : null}
                        </div>
                        
                        <CardDeComparacao cartao={cartao1} />
                    </div>

                    {/* Coluna da Direita */}
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white text-center">SUGESTÃO</h2>
                        <select 
                            value={cartao2Id} 
                            onChange={(e) => setCartao2Id(e.target.value)}
                            className="w-full p-2 rounded-md bg-slate-100 dark:bg-[#2a246f] text-slate-800 dark:text-white border border-slate-300 dark:border-[#3e388b]"
                        >
                            {opcoesDisponiveis2.map(c => <option key={c.id} value={c.id}>{c.nome}</option>)}
                        </select>
                        
                        {/* Imagem grande do cartão */}
                         <div className="w-full h-48 flex items-center justify-center p-4 rounded-lg">
                            {cartao2 ? (
                                <img src={cartao2.imagem_url} alt={cartao2.nome} className="max-w-full max-h-full object-contain" />
                            ) : null}
                        </div>
                        
                        <CardDeComparacao cartao={cartao2} />
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default TelaCartoes;