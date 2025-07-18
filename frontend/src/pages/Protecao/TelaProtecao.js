import React, { useState, useEffect, useMemo } from 'react';
import Card from '../../components/Card/Card';
import { formatCurrency } from '../../utils/formatters';
import { PlusCircle, Edit, Trash2, Users, Stethoscope, HeartHandshake, Car } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const TelaProtecao = ({ rendaMensal, custoDeVidaMensal, patrimonioTotal }) => {
    const [rentabilidadeAnual, setRentabilidadeAnual] = useState(10);
    const [protecoesTemporarias, setProtecoesTemporarias] = useState([]);
    const [editingItemId, setEditingItemId] = useState(null);
    const [editingItemData, setEditingItemData] = useState({ cobertura: '', observacoes: '' });
    const [tipoProtecaoPermanente, setTipoProtecaoPermanente] = useState('renda');
    const [percentualInventario, setPercentualInventario] = useState(15);
    const [possuiHolding, setPossuiHolding] = useState(false);
    const [despesasFuturas, setDespesasFuturas] = useState([]);
    const [editingFuturaId, setEditingFuturaId] = useState(null);
    const [editingFuturaData, setEditingFuturaData] = useState({ nome: '', anoInicio: '', valorMensal: '', prazoMeses: '' });
    const [doencasGravesTempo, setDoencasGravesTempo] = useState(12);
    const [doencasGravesBase, setDoencasGravesBase] = useState('renda');
    const [protecaoPatrimonial, setProtecaoPatrimonial] = useState([]);
    const [editingPatrimonialId, setEditingPatrimonialId] = useState(null);
    const [editingPatrimonialData, setEditingPatrimonialData] = useState({ nome: '', dataVencimento: '', empresa: '', valor: '' });

    const { capitalRenda, capitalCustoVida } = useMemo(() => {
        const taxaIR = 15; // Alíquota de IR fixa em 15%
        if (rentabilidadeAnual <= 0) return { capitalRenda: 0, capitalCustoVida: 0 };

        const rendimentoBrutoDecimal = rentabilidadeAnual / 100;
        const taxaIrDecimal = taxaIR / 100;
        const rendimentoLiquidoDecimal = rendimentoBrutoDecimal * (1 - taxaIrDecimal);

        if (rendimentoLiquidoDecimal <= 0) return { capitalRenda: 0, capitalCustoVida: 0 };

        const capitalRenda = (rendaMensal * 12) / rendimentoLiquidoDecimal;
        const capitalCustoVida = (custoDeVidaMensal * 12) / rendimentoLiquidoDecimal;

        return { capitalRenda, capitalCustoVida };
    }, [rendaMensal, custoDeVidaMensal, rentabilidadeAnual]);

    const protecaoPermanenteSelecionada = useMemo(() => {
        return tipoProtecaoPermanente === 'renda'
            ? { id: 'auto-renda', nome: 'Proteção da Renda', cobertura: capitalRenda, observacoes: 'Cálculo automático' }
            : { id: 'auto-cv', nome: 'Proteção do Custo de Vida', cobertura: capitalCustoVida, observacoes: 'Cálculo automático' };
    }, [tipoProtecaoPermanente, capitalRenda, capitalCustoVida]);

    const totalCoberturaInvalidez = useMemo(() => {
        const totalTemporaria = protecoesTemporarias.reduce((acc, item) => acc + item.cobertura, 0);
        return protecaoPermanenteSelecionada.cobertura + totalTemporaria;
    }, [protecaoPermanenteSelecionada, protecoesTemporarias]);

    const custoInventario = useMemo(() => {
        return patrimonioTotal * (percentualInventario / 100);
    }, [patrimonioTotal, percentualInventario]);

    const totalCoberturaMorte = useMemo(() => {
        const totalDespesasFuturas = despesasFuturas.reduce((acc, item) => acc + (item.valorMensal * item.prazoMeses), 0);
        return custoInventario + totalDespesasFuturas;
    }, [custoInventario, despesasFuturas]);

    const coberturaDoencasGraves = useMemo(() => {
        const base = doencasGravesBase === 'renda' ? rendaMensal : custoDeVidaMensal;
        return base * doencasGravesTempo;
    }, [doencasGravesBase, doencasGravesTempo, rendaMensal, custoDeVidaMensal]);

    useEffect(() => {
        if (possuiHolding) {
            setPercentualInventario(4);
        }
    }, [possuiHolding]);

    const handlePercentualInventarioChange = (e) => {
        let value = parseFloat(e.target.value);
        if (isNaN(value)) value = 0;
        if (value < 4) value = 4;
        if (value > 20) value = 20;
        setPercentualInventario(value);
    };

    const handleAddProtecaoTemporaria = (tipo) => {
        const newProtecao = {
            id: uuidv4(),
            nome: `Proteção Temporária (${tipo === 'renda' ? 'Renda' : 'Custo de Vida'})`,
            cobertura: tipo === 'renda' ? rendaMensal : custoDeVidaMensal,
            observacoes: 'Contratado'
        };
        setProtecoesTemporarias(prev => [...prev, newProtecao]);
    };

    const handleDeleteProtecao = (id) => {
        setProtecoesTemporarias(prev => prev.filter(p => p.id !== id));
    };

    const handleStartEdit = (item) => {
        setEditingItemId(item.id);
        setEditingItemData({ cobertura: item.cobertura, observacoes: item.observacoes });
    };

    const handleCancelEdit = () => {
        setEditingItemId(null);
    };

    const handleSaveEdit = (id) => {
        setProtecoesTemporarias(prev => prev.map(p =>
            p.id === id ? { ...p, cobertura: parseFloat(editingItemData.cobertura) || 0, observacoes: editingItemData.observacoes } : p
        ));
        setEditingItemId(null);
    };

    const handleAddDespesaFutura = () => {
        const newDespesa = {
            id: uuidv4(),
            nome: 'Nova Despesa',
            anoInicio: new Date().getFullYear(),
            valorMensal: 1000,
            prazoMeses: 12
        };
        setDespesasFuturas(prev => [...prev, newDespesa]);
    };

    const handleDeleteDespesaFutura = (id) => {
        setDespesasFuturas(prev => prev.filter(d => d.id !== id));
    };

    const handleStartEditFutura = (item) => {
        setEditingFuturaId(item.id);
        setEditingFuturaData({ ...item });
    };

    const handleCancelEditFutura = () => {
        setEditingFuturaId(null);
    };

    const handleSaveEditFutura = (id) => {
        setDespesasFuturas(prev => prev.map(d =>
            d.id === id ? { ...d, ...editingFuturaData, valorMensal: parseFloat(editingFuturaData.valorMensal) || 0, prazoMeses: parseInt(editingFuturaData.prazoMeses) || 0, anoInicio: parseInt(editingFuturaData.anoInicio) || 0 } : d
        ));
        setEditingFuturaId(null);
    };

    const handleAddPatrimonial = () => {
        const newItem = {
            id: uuidv4(),
            nome: 'Seguro Auto',
            dataVencimento: new Date().toISOString().split('T')[0],
            empresa: 'Empresa Exemplo',
            valor: 50000
        };
        setProtecaoPatrimonial(prev => [...prev, newItem]);
    };

    const handleDeletePatrimonial = (id) => {
        setProtecaoPatrimonial(prev => prev.filter(p => p.id !== id));
    };

    const handleStartEditPatrimonial = (item) => {
        setEditingPatrimonialId(item.id);
        setEditingPatrimonialData({ ...item });
    };

    const handleCancelEditPatrimonial = () => {
        setEditingPatrimonialId(null);
    };

    const handleSaveEditPatrimonial = (id) => {
        setProtecaoPatrimonial(prev => prev.map(p =>
            p.id === id ? { ...p, ...editingPatrimonialData, valor: parseFloat(editingPatrimonialData.valor) || 0 } : p
        ));
        setEditingPatrimonialId(null);
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center">
                <Card>
                    <p className="text-sm text-slate-800 dark:text-white">Cobertura Invalidez</p>
                    <p className="text-2xl font-bold text-[#00d971]">{formatCurrency(totalCoberturaInvalidez)}</p>
                </Card>
                <Card>
                    <p className="text-sm text-slate-800 dark:text-white">Cobertura Morte</p>
                    <p className="text-2xl font-bold text-[#00d971]">{formatCurrency(totalCoberturaMorte)}</p>
                </Card>
                <Card>
                    <p className="text-sm text-slate-800 dark:text-white">Doenças Graves</p>
                    <p className="text-2xl font-bold text-[#00d971]">{formatCurrency(coberturaDoencasGraves)}</p>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
                <div className="space-y-6">
                    <Card>
                        <div className="flex items-center gap-3 mb-4">
                            <Users className="text-[#00d971]" size={24} />
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Planejamento Sucessório</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm items-end">
                             <div className="md:col-span-1">
                                <label className="font-medium text-slate-800 dark:text-white">Patrimônio Total:</label>
                                <input type="number" value={patrimonioTotal} readOnly className="mt-1 w-full bg-[white] dark:bg-[white] text-slate-800 dark:text-slate-800 rounded-md px-2 py-1 border border-[#3e388b] focus:outline-none focus:ring-1 focus:ring-[#00d971] opacity-70" />
                            </div>
                            <div className="flex items-end gap-4 md:col-span-2">
                                <div>
                                    <label className="block font-medium text-slate-800 dark:text-white">Inventário (%):</label>
                                    <input type="number" value={percentualInventario} onChange={handlePercentualInventarioChange} disabled={possuiHolding} min="4" max="20" className="mt-1 w-full bg-[white] dark:bg-[white] text-slate-800 dark:text-slate-800 rounded-md px-2 py-1 border border-[#3e388b] focus:outline-none focus:ring-1 focus:ring-[#00d971] disabled:opacity-50" />
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer pb-1">
                                    <input type="checkbox" checked={possuiHolding} onChange={e => setPossuiHolding(e.target.checked)} className="form-checkbox h-4 w-4 text-[#00d971] bg-gray-700 border-gray-600 rounded focus:ring-[#00d971]" />
                                    <span className="text-slate-800 dark:text-white">Holding</span>
                                </label>
                            </div>
                        </div>
                        <div className="space-y-4 text-sm mt-6">
                             <div>
                                <div className="flex justify-between items-center bg-[#201b5d]/50 dark:bg-[#00d971] p-2 rounded-t-lg">
                                    <h3 className="font-bold text-white">Despesas Futuras</h3>
                                    <button onClick={handleAddDespesaFutura} className="text-xs flex items-center gap-1 text-[#00d971] dark:text-[white] hover:brightness-90"><PlusCircle size={14} /> Adicionar</button>
                                </div>
                                <div className="space-y-1 bg-[#201b5d]/20 dark:bg-[#00d971]/20 p-2 rounded-b-lg">
                                    {despesasFuturas.length > 0 && (
                                        <div className="grid grid-cols-12 gap-2 items-center px-2 pb-2 border-b border-[#3e388b] font-bold text-slate-800 dark:text-white">
                                            <p className="col-span-3">Descrição</p>
                                            <p className="col-span-2">Início</p>
                                            <p className="col-span-2">Valor/Mês</p>
                                            <p className="col-span-2">Prazo</p>
                                            <p className="col-span-1">Total</p>
                                            <p className="col-span-2"></p>
                                        </div>
                                    )}
                                    {despesasFuturas.length > 0 ? despesasFuturas.map(item => (
                                        <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-2 hover:bg-[#3e388b]/30 rounded">
                                            {editingFuturaId === item.id ? (
                                                <>
                                                    <input type="text" value={editingFuturaData.nome} onChange={e => setEditingFuturaData({...editingFuturaData, nome: e.target.value})} className="col-span-3 bg-white dark:bg-[#201b5d] text-slate-800 dark:text-white rounded-md px-1 py-0.5 border border-[#00d971]"/>
                                                    <input type="number" value={editingFuturaData.anoInicio} onChange={e => setEditingFuturaData({...editingFuturaData, anoInicio: e.target.value})} className="col-span-2 bg-white dark:bg-[#201b5d] text-slate-800 dark:text-white rounded-md px-1 py-0.5 border border-[#00d971]"/>
                                                    <input type="number" value={editingFuturaData.valorMensal} onChange={e => setEditingFuturaData({...editingFuturaData, valorMensal: e.target.value})} className="col-span-2 bg-white dark:bg-[#201b5d] text-slate-800 dark:text-white rounded-md px-1 py-0.5 border border-[#00d971]"/>
                                                    <input type="number" value={editingFuturaData.prazoMeses} onChange={e => setEditingFuturaData({...editingFuturaData, prazoMeses: e.target.value})} className="col-span-2 bg-white dark:bg-[#201b5d] text-slate-800 dark:text-white rounded-md px-1 py-0.5 border border-[#00d971]"/>
                                                    <div className="col-span-3 flex justify-end items-center gap-3">
                                                        <button onClick={() => handleSaveEditFutura(item.id)} className="text-slate-800 dark:text-white hover:text-[#00d971]">Salvar</button>
                                                        <button onClick={handleCancelEditFutura} className="text-slate-800 dark:text-white hover:text-red-400">X</button>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="col-span-3 text-slate-800 dark:text-white">{item.nome}</p>
                                                    <p className="col-span-2 text-slate-800 dark:text-white">{item.anoInicio}</p>
                                                    <p className="col-span-2 text-slate-800 dark:text-white">{formatCurrency(item.valorMensal)}</p>
                                                    <p className="col-span-2 text-slate-800 dark:text-white">{item.prazoMeses} meses</p>
                                                    <p className="col-span-1 font-semibold text-slate-800 dark:text-white">{formatCurrency(item.valorMensal * item.prazoMeses)}</p>
                                                    <div className="col-span-2 flex justify-end items-center gap-3">
                                                        <button onClick={() => handleStartEditFutura(item)} className="text-slate-800 dark:text-white hover:text-[#00d971]"><Edit size={16} /></button>
                                                        <button onClick={() => handleDeleteDespesaFutura(item.id)} className="text-slate-800 dark:text-white hover:text-red-400"><Trash2 size={16} /></button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )) : <p className="text-center text-slate-800 dark:text-white p-2 text-xs">Nenhuma despesa futura adicionada.</p>}
                                </div>
                            </div>
                             <div className="flex justify-between items-center p-3 border-t border-[#3e388b] mt-4">
                                <h3 className="text-base font-bold text-slate-800 dark:text-white">Total Cobertura de Morte:</h3>
                                <p className="text-base font-bold text-[#00d971]">{formatCurrency(totalCoberturaMorte)}</p>
                            </div>
                        </div>
                    </Card>
                    <Card>
                        <div className="flex items-center gap-3 mb-4">
                            <Stethoscope className="text-[#00d971]" size={24} />
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Cobertura de Doenças Graves</h2>
                        </div>
                         <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-6 mb-2">
                                <p className="font-medium text-slate-800 dark:text-white">Tempo de cobertura:</p>
                                {[12, 18, 24].map(tempo => (
                                    <label key={tempo} className="flex items-center gap-2 cursor-pointer">
                                        <input type="radio" name="doencas-tempo" value={tempo} checked={doencasGravesTempo === tempo} onChange={() => setDoencasGravesTempo(tempo)} className="form-radio h-4 w-4 text-[#00d971] bg-gray-700 border-gray-600 focus:ring-[#00d971]" />
                                        <span className="text-slate-800 dark:text-white">{tempo} meses</span>
                                    </label>
                                ))}
                            </div>
                             <div className="flex items-center gap-6 mb-4">
                                <p className="font-medium text-slate-800 dark:text-white">Base de cálculo:</p>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="doencas-base" value="renda" checked={doencasGravesBase === 'renda'} onChange={() => setDoencasGravesBase('renda')} className="form-radio h-4 w-4 text-[#00d971] bg-gray-700 border-gray-600 focus:ring-[#00d971]" />
                                    <span className="text-slate-800 dark:text-white">Renda</span>
                                </label>
                                 <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="doencas-base" value="custo" checked={doencasGravesBase === 'custo'} onChange={() => setDoencasGravesBase('custo')} className="form-radio h-4 w-4 text-[#00d971] bg-gray-700 border-gray-600 focus:ring-[#00d971]" />
                                    <span className="text-slate-800 dark:text-white">Custo de Vida</span>
                                </label>
                            </div>
                             <div className="bg-[#201b5d]/50 dark:bg-[#00d971] p-3 rounded-lg flex justify-between items-center">
                                <p className="text-base font-semibold text-white dark:text-white">Cobertura Necessária:</p>
                                <p className="text-lg font-bold text-[#00d971] dark:text-white">{formatCurrency(coberturaDoencasGraves)}</p>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Coluna Direita */}
                <div className="space-y-6">
                    <Card>
                        <div className="flex items-center gap-3 mb-4">
                            <HeartHandshake className="text-[#00d971]" size={24} />
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Cobertura Invalidez</h2>
                        </div>
                        <div className="space-y-4 text-sm">
                            <div>
                                <div className="flex justify-between items-center bg-[#201b5d]/50 dark:bg-[#00d971] p-2 rounded-t-lg">
                                    <h3 className="font-bold text-white">Invalidez Permanente</h3>
                                </div>
                                <div className="space-y-1 bg-[#201b5d]/20 dark:bg-[#00d971]/20 p-3 rounded-b-lg">
                                    <div className="flex items-center gap-6 mb-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="protecao-permanente" value="renda" checked={tipoProtecaoPermanente === 'renda'} onChange={() => setTipoProtecaoPermanente('renda')} className="form-radio h-4 w-4 text-[#00d971] bg-gray-700 border-gray-600 focus:ring-[#00d971]" />
                                            <span className="text-slate-800 dark:text-white">Proteção da Renda</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="protecao-permanente" value="custo" checked={tipoProtecaoPermanente === 'custo'} onChange={() => setTipoProtecaoPermanente('custo')} className="form-radio h-4 w-4 text-[#00d971] bg-gray-700 border-gray-600 focus:ring-[#00d971]" />
                                            <span className="text-slate-800 dark:text-white">Custo de Vida</span>
                                        </label>
                                    </div>
                                    <div className="grid grid-cols-12 gap-2 items-center p-2 rounded">
                                        <p className="col-span-4 text-slate-800 dark:text-white">{protecaoPermanenteSelecionada.nome}</p>
                                        <p className="col-span-4 font-semibold text-slate-800 dark:text-white">{formatCurrency(protecaoPermanenteSelecionada.cobertura)}</p>
                                        <p className="col-span-4 text-slate-800 dark:text-white italic">{protecaoPermanenteSelecionada.observacoes}</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center bg-[#201b5d]/50 dark:bg-[#00d971] p-2 rounded-t-lg">
                                    <h3 className="font-bold text-white">Invalidez Temporária</h3>
                                    <div className="flex gap-4">
                                        <button onClick={() => handleAddProtecaoTemporaria('renda')} className="text-xs flex items-center gap-1 text-[#00d971] hover:brightness-90"><PlusCircle size={14} /> Renda</button>
                                        <button onClick={() => handleAddProtecaoTemporaria('custo')} className="text-xs flex items-center gap-1 text-[#00d971] hover:brightness-90"><PlusCircle size={14} /> Custo de Vida</button>
                                    </div>
                                </div>
                                <div className="space-y-1 bg-[#201b5d]/20 dark:bg-[#00d971]/20 p-2 rounded-b-lg">
                                    {protecoesTemporarias.length > 0 ? protecoesTemporarias.map(item => (
                                        <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-2 hover:bg-[#3e388b]/30 rounded">
                                            {editingItemId === item.id ? (
                                                <>
                                                    <p className="col-span-4 text-slate-800 dark:text-white text-xs">{item.nome}</p>
                                                    <input type="number" value={editingItemData.cobertura} onChange={e => setEditingItemData({...editingItemData, cobertura: e.target.value})} className="col-span-3 bg-[#201b5d] text-slate-800 dark:text-white rounded-md px-1 py-0.5 border border-[#00d971]"/>
                                                    <input type="text" value={editingItemData.observacoes} onChange={e => setEditingItemData({...editingItemData, observacoes: e.target.value})} className="col-span-3 bg-[#201b5d] text-slate-800 dark:text-white rounded-md px-1 py-0.5 border border-[#00d971]"/>
                                                    <div className="col-span-2 flex justify-end items-center gap-3">
                                                        <button onClick={() => handleSaveEdit(item.id)} className="text-slate-800 dark:text-white hover:text-[#00d971]">Salvar</button>
                                                        <button onClick={handleCancelEdit} className="text-slate-800 dark:text-white hover:text-red-400">X</button>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="col-span-4 text-slate-800 dark:text-white">{item.nome}</p>
                                                    <p className="col-span-3 font-semibold text-white">{formatCurrency(item.cobertura)}</p>
                                                    <p className="col-span-3 text-slate-800 dark:text-white italic">{item.observacoes}</p>
                                                    <div className="col-span-2 flex justify-end items-center gap-3">
                                                        <button onClick={() => handleStartEdit(item)} className="text-slate-800 dark:text-white hover:text-[#00d971]"><Edit size={16} /></button>
                                                        <button onClick={() => handleDeleteProtecao(item.id)} className="text-slate-800 dark:text-white hover:text-red-400"><Trash2 size={16} /></button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )) : <p className="text-center text-slate-800 dark:text-white p-2 text-xs">Nenhuma proteção adicionada.</p>}
                                </div>
                            </div>
                        </div>
                    </Card>
                    <Card>
                         <div className="flex justify-between items-center bg-[#201b5d]/50 p-2 rounded-t-lg mb-2">
                            <h3 className="font-bold text-white flex items-center gap-2"><Car size={18}/> Proteção Patrimonial</h3>
                            <button onClick={handleAddPatrimonial} className="text-xs flex items-center gap-1 text-[#00d971] hover:brightness-90"><PlusCircle size={14} /> Adicionar Seguro</button>
                        </div>
                         <div className="space-y-1 bg-[#201b5d]/20 p-2 rounded-b-lg text-sm">
                            {protecaoPatrimonial.length > 0 && (
                                <div className="grid grid-cols-12 gap-2 items-center px-2 pb-2 border-b border-[#3e388b] font-bold text-slate-800 dark:text-white">
                                    <p className="col-span-3">Nome</p>
                                    <p className="col-span-3">Empresa</p>
                                    <p className="col-span-2">Vencimento</p>
                                    <p className="col-span-2">Valor</p>
                                    <p className="col-span-2"></p>
                                </div>
                            )}
                            {protecaoPatrimonial.length > 0 ? protecaoPatrimonial.map(item => (
                                <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-2 hover:bg-[#3e388b]/30 rounded">
                                    {editingPatrimonialId === item.id ? (
                                        <>
                                            <input type="text" value={editingPatrimonialData.nome} onChange={e => setEditingPatrimonialData({...editingPatrimonialData, nome: e.target.value})} className="col-span-3 bg-[#201b5d] text-slate-800 dark:text-white rounded-md px-1 py-0.5 border border-[#00d971]"/>
                                            <input type="text" value={editingPatrimonialData.empresa} onChange={e => setEditingPatrimonialData({...editingPatrimonialData, empresa: e.target.value})} className="col-span-3 bg-[#201b5d] text-slate-800 dark:text-white rounded-md px-1 py-0.5 border border-[#00d971]"/>
                                            <input type="date" value={editingPatrimonialData.dataVencimento} onChange={e => setEditingPatrimonialData({...editingPatrimonialData, dataVencimento: e.target.value})} className="col-span-2 bg-[#201b5d] text-slate-800 dark:text-white rounded-md px-1 py-0.5 border border-[#00d971]"/>
                                            <input type="number" value={editingPatrimonialData.valor} onChange={e => setEditingPatrimonialData({...editingPatrimonialData, valor: e.target.value})} className="col-span-2 bg-[#201b5d] text-slate-800 dark:text-white rounded-md px-1 py-0.5 border border-[#00d971]"/>
                                            <div className="col-span-2 flex justify-end items-center gap-3">
                                                <button onClick={() => handleSaveEditPatrimonial(item.id)} className="text-slate-800 dark:text-white hover:text-[#00d971]">Salvar</button>
                                                <button onClick={handleCancelEditPatrimonial} className="text-slate-800 dark:text-white hover:text-red-400">X</button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <p className="col-span-3 text-slate-800 dark:text-white">{item.nome}</p>
                                            <p className="col-span-3 text-slate-800 dark:text-white">{item.empresa}</p>
                                            <p className="col-span-2 text-slate-800 dark:text-white">{item.dataVencimento}</p>
                                            <p className="col-span-2 font-semibold text-white">{formatCurrency(item.valor)}</p>
                                            <div className="col-span-2 flex justify-end items-center gap-3">
                                                <button onClick={() => handleStartEditPatrimonial(item)} className="text-slate-800 dark:text-white hover:text-[#00d971]"><Edit size={16} /></button>
                                                <button onClick={() => handleDeletePatrimonial(item.id)} className="text-slate-800 dark:text-white hover:text-red-400"><Trash2 size={16} /></button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )) : <p className="text-center text-slate-800 dark:text-white p-2 text-xs">Nenhum seguro patrimonial adicionado.</p>}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default TelaProtecao;