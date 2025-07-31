import { formatCurrency } from '../../utils/formatters';
import { PlusCircle, Edit, Trash2, Users, Stethoscope, HeartHandshake, Car } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { usePatrimonioStore } from '../../stores/usePatrimonioStore';
import { useProtecaoStore } from '../../stores/useProtecaoStore';
import { useOrcamentoStore } from '../../stores/useOrcamentoStore';
import { useUserStore } from '../../stores/useUserStore';
import Card from '../../components/Card/Card';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import LoaderLogo from '../../components/Loader/loaderlogo';

// 1. O componente agora não recebe mais props. Ele busca tudo das stores.
const TelaProtecao = () => {
    // 2. Acesso ao estado e às ações de todas as stores necessárias.
    const { ativos, dividas, isLoading: isLoadingPatrimonio, fetchPatrimonio } = usePatrimonioStore();
    const { 
        invalidez, 
        despesasFuturas, 
        patrimonial, 
        isLoading: isLoadingProtecao,
        fetchProtecao, 
        saveProtecaoItem, 
        deleteProtecaoItem 
    } = useProtecaoStore();
    const { categorias, isLoading: isLoadingOrcamento, fetchOrcamento } = useOrcamentoStore();
    const { usuario } = useUserStore();


    // 3. Carrega todos os dados necessários quando o componente é montado.
    useEffect(() => {
        fetchPatrimonio();
        fetchProtecao();
        fetchOrcamento();
    }, [fetchPatrimonio, fetchProtecao, fetchOrcamento]);

    // Estados locais para controle da UI (sem alteração)
    const [rentabilidadeAnual] = useState(10);
    const [editingItemId, setEditingItemId] = useState(null);
    const [editingItemData, setEditingItemData] = useState({ nome: '', cobertura: '', observacoes: '' });
    const [tipoProtecaoPermanente, setTipoProtecaoPermanente] = useState('renda');
    const [percentualInventario, setPercentualInventario] = useState(15);
    const [possuiHolding, setPossuiHolding] = useState(false);
    const [editingFuturaId, setEditingFuturaId] = useState(null);
    const [editingFuturaData, setEditingFuturaData] = useState({ nome: '', ano_inicio: '', valor_mensal: '', prazo_meses: '' });
    const [doencasGravesTempo, setDoencasGravesTempo] = useState(12);
    const [doencasGravesBase, setDoencasGravesBase] = useState('renda');
    const [editingPatrimonialId, setEditingPatrimonialId] = useState(null);
    const [editingPatrimonialData, setEditingPatrimonialData] = useState({ nome: '', data_vencimento: '', empresa: '', valor: '' });

    // 4. Lógica de cálculo refatorada para usar dados das stores e ser mais segura contra 'undefined'.
    const { rendaMensal, custoDeVidaMensal } = useMemo(() => {
        if (!categorias || categorias.length === 0) {
            return { rendaMensal: 0, custoDeVidaMensal: 0 };
        }
        const renda = categorias
            .filter(c => c.tipo === 'receita')
            .flatMap(c => c.subItens)
            .reduce((sum, item) => sum + (parseFloat(item.atual) || 0), 0);
        
        const custo = categorias
            .filter(c => c.tipo === 'despesa')
            .flatMap(c => c.subItens)
            .reduce((sum, item) => sum + (parseFloat(item.atual) || 0), 0);

        return { rendaMensal: renda, custoDeVidaMensal: custo };
    }, [categorias]);

    const patrimonioTotal = useMemo(() => {
        const totalAtivos = (ativos || []).reduce((sum, item) => sum + parseFloat(item.valor || 0), 0);
        const totalDividas = (dividas || []).reduce((sum, item) => sum + parseFloat(item.valor || 0), 0);
        return totalAtivos - totalDividas;
    }, [ativos, dividas]);

    const { capitalRenda, capitalCustoVida } = useMemo(() => {
        const taxaIR = 15;
        if (rentabilidadeAnual <= 0) return { capitalRenda: 0, capitalCustoVida: 0 };
        const rendimentoBrutoDecimal = rentabilidadeAnual / 100;
        const taxaIrDecimal = taxaIR / 100;
        const rendimentoLiquidoDecimal = rendimentoBrutoDecimal * (1 - taxaIrDecimal);
        if (rendimentoLiquidoDecimal <= 0) return { capitalRenda: 0, capitalCustoVida: 0 };
        const capitalRendaCalc = (rendaMensal * 12) / rendimentoLiquidoDecimal;
        const capitalCustoVidaCalc = (custoDeVidaMensal * 12) / rendimentoLiquidoDecimal;
        return { capitalRenda: capitalRendaCalc, capitalCustoVida: capitalCustoVidaCalc };
    }, [rendaMensal, custoDeVidaMensal, rentabilidadeAnual]);

    const protecaoPermanenteSelecionada = useMemo(() => {
        return tipoProtecaoPermanente === 'renda'
            ? { id: 'auto-renda', nome: 'Proteção da Renda', cobertura: capitalRenda, observacoes: 'Cálculo automático' }
            : { id: 'auto-cv', nome: 'Proteção do Custo de Vida', cobertura: capitalCustoVida, observacoes: 'Cálculo automático' };
    }, [tipoProtecaoPermanente, capitalRenda, capitalCustoVida]);

    const totalCoberturaInvalidez = useMemo(() => {
        const totalTemporaria = (invalidez || []).reduce((acc, item) => acc + (parseFloat(item.cobertura) || 0), 0);
        return (protecaoPermanenteSelecionada.cobertura || 0) + totalTemporaria;
    }, [protecaoPermanenteSelecionada, invalidez]);

    const custoInventario = useMemo(() => {
        return patrimonioTotal * (percentualInventario / 100);
    }, [patrimonioTotal, percentualInventario]);

    const totalCoberturaMorte = useMemo(() => {
        const totalDespesasFuturas = (despesasFuturas || []).reduce((acc, item) => acc + ((parseFloat(item.valor_mensal) || 0) * (parseInt(item.prazo_meses, 10) || 0)), 0);
        return (custoInventario || 0) + totalDespesasFuturas;
    }, [custoInventario, despesasFuturas]);

    const coberturaDoencasGraves = useMemo(() => {
        const base = doencasGravesBase === 'renda' ? rendaMensal : custoDeVidaMensal;
        return (base || 0) * (doencasGravesTempo || 0);
    }, [doencasGravesBase, doencasGravesTempo, rendaMensal, custoDeVidaMensal]);

    // Handlers que agora chamam as ações da store
    const handleAddProtecaoTemporaria = (tipo) => {
        saveProtecaoItem({
            nome: `Proteção Temporária (${tipo === 'renda' ? 'Renda' : 'Custo de Vida'})`,
            cobertura: tipo === 'renda' ? rendaMensal : custoDeVidaMensal,
            observacoes: 'Contratado'
        }, 'invalidez');
    };
    const handleDeleteProtecao = (id) => deleteProtecaoItem(id, 'invalidez');
    const handleStartEdit = (item) => {
        setEditingItemId(item.id);
        setEditingItemData({ nome: item.nome, cobertura: item.cobertura, observacoes: item.observacoes });
    };
    const handleSaveEdit = (id) => {
        saveProtecaoItem({ id, ...editingItemData, cobertura: parseFloat(editingItemData.cobertura) || 0 }, 'invalidez');
        setEditingItemId(null);
    };

    const handleAddDespesaFutura = () => {
        saveProtecaoItem({
            nome: 'Nova Despesa',
            ano_inicio: new Date().getFullYear(),
            valor_mensal: 1000,
            prazo_meses: 12
        }, 'despesas');
    };
    const handleDeleteDespesaFutura = (id) => deleteProtecaoItem(id, 'despesas');
    const handleStartEditFutura = (item) => {
        setEditingFuturaId(item.id);
        setEditingFuturaData({ 
            nome: item.nome, 
            ano_inicio: item.ano_inicio, 
            valor_mensal: item.valor_mensal, 
            prazo_meses: item.prazo_meses 
        });
    };
    const handleSaveEditFutura = (id) => {
        saveProtecaoItem({ 
            id, 
            ...editingFuturaData,
            ano_inicio: parseInt(editingFuturaData.ano_inicio, 10) || 0,
            valor_mensal: parseFloat(editingFuturaData.valor_mensal) || 0,
            prazo_meses: parseInt(editingFuturaData.prazo_meses, 10) || 0,
        }, 'despesas');
        setEditingFuturaId(null);
    };

    const handleAddPatrimonial = () => {
        saveProtecaoItem({
            nome: 'Seguro Auto',
            data_vencimento: new Date().toISOString().split('T')[0],
            empresa: 'Empresa Exemplo',
            valor: 50000
        }, 'patrimonial');
    };
    const handleDeletePatrimonial = (id) => deleteProtecaoItem(id, 'patrimonial');
    const handleStartEditPatrimonial = (item) => {
        setEditingPatrimonialId(item.id);
        setEditingPatrimonialData({ ...item, data_vencimento: item.data_vencimento ? item.data_vencimento.split('T')[0] : '' });
    };
    const handleSaveEditPatrimonial = (id) => {
        saveProtecaoItem({ ...editingPatrimonialData, id, valor: parseFloat(editingPatrimonialData.valor) || 0 }, 'patrimonial');
        setEditingPatrimonialId(null);
    };
    
    const handleCancelEdit = () => setEditingItemId(null);
    const handleCancelEditFutura = () => setEditingFuturaId(null);
    const handleCancelEditPatrimonial = () => setEditingPatrimonialId(null);
    const handlePercentualInventarioChange = (e) => {
        let value = parseFloat(e.target.value);
        if (isNaN(value)) value = 0;
        if (value < 4) value = 4;
        if (value > 20) value = 20;
        setPercentualInventario(value);
    };

    const exportarPropostaPDF = () => {
        try {
            const doc = new jsPDF();
            doc.setFontSize(18);
            doc.text('Proposta de Proteção Financeira', 14, 22);
            doc.setFontSize(11);
            doc.text(`Cliente: ${usuario?.nome || 'Não informado'}`, 14, 30);
            doc.text(`Data de Emissão: ${new Date().toLocaleDateString('pt-BR')}`, 14, 36);

            autoTable(doc, {
                startY: 45,
                head: [['Resumo das Coberturas Recomendadas', 'Valor Sugerido']],
                body: [
                    ['Cobertura por Invalidez', formatCurrency(totalCoberturaInvalidez)],
                    ['Cobertura por Morte', formatCurrency(totalCoberturaMorte)],
                    ['Cobertura para Doenças Graves', formatCurrency(coberturaDoencasGraves)],
                ],
                theme: 'grid',
                headStyles: { fillColor: [32, 27, 93] },
            });
            // ... (resto da lógica de PDF)
            doc.save(`proposta_protecao_${usuario?.nome?.replace(/\s/g, '_') || 'cliente'}.pdf`);
        } catch (error) {
            console.error("❌ Erro ao gerar o PDF:", error);
            toast.error("Ocorreu um erro ao gerar o PDF.");
        }
    };

    const isLoading = isLoadingPatrimonio || isLoadingProtecao || isLoadingOrcamento;

    if (isLoading) {
        return (
            <LoaderLogo />
        );
    }

    // O JSX abaixo é o mesmo que você forneceu, sem alterações de layout.
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

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Coluna Esquerda */}
                <div className="space-y-6">
                    <Card>
                        <div className="flex items-center gap-3 mb-4">
                            <Users className="text-[#00d971]" size={24} />
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Planejamento Sucessório</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 text-sm items-end">
                             <div className="md:col-span-1">
                                <label className="font-medium text-slate-800 dark:text-white">Patrimônio Total:</label>
                                <input type="number" value={patrimonioTotal} readOnly className="mt-1 w-full bg-slate-200 dark:bg-gray-700 text-slate-800 dark:text-white rounded-md px-2 py-1 border border-slate-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-[#00d971] opacity-70" />
                            </div>
                            <div className="flex items-end gap-4 md:col-span-2">
                                <div>
                                    <label className="block font-medium text-slate-800 dark:text-white">Inventário (%):</label>
                                    <input type="number" value={percentualInventario} onChange={handlePercentualInventarioChange} disabled={possuiHolding} min="4" max="20" className="mt-1 w-full bg-white dark:bg-gray-800 text-slate-800 dark:text-white rounded-md px-2 py-1 border border-slate-300 dark:border-gray-600 focus:outline-none focus:ring-1 focus:ring-[#00d971] disabled:opacity-50" />
                                </div>
                                <label className="flex items-center gap-2 cursor-pointer pb-1">
                                    <input type="checkbox" checked={possuiHolding} onChange={e => setPossuiHolding(e.target.checked)} className="form-checkbox h-4 w-4 text-[#00d971] bg-gray-700 border-gray-600 rounded focus:ring-offset-0 focus:ring-2 focus:ring-[#00d971]" />
                                    <span className="text-slate-800 dark:text-white">Holding</span>
                                </label>
                            </div>
                        </div>
                        <div className="space-y-4 text-sm mt-6">
                             <div>
                                <div className="flex justify-between items-center bg-[#201b5d]/80 dark:bg-[#00d971]/80 p-2 rounded-t-lg">
                                    <h3 className="font-bold text-white">Despesas Futuras</h3>
                                    <button onClick={handleAddDespesaFutura} className="text-xs flex items-center gap-1 font-semibold text-white hover:text-gray-200"><PlusCircle size={14} /> Adicionar</button>
                                </div>
                                <div className="space-y-1 bg-slate-100 dark:bg-gray-800/50 p-2 rounded-b-lg">
                                    {(despesasFuturas || []).length > 0 && (
                                        <div className="grid grid-cols-12 gap-2 items-center px-2 pb-2 border-b border-slate-300 dark:border-gray-600 font-bold text-slate-600 dark:text-slate-300">
                                            <p className="col-span-3">Descrição</p>
                                            <p className="col-span-2">Início</p>
                                            <p className="col-span-2">Valor/Mês</p>
                                            <p className="col-span-2">Prazo</p>
                                            <p className="col-span-1">Total</p>
                                            <p className="col-span-2"></p>
                                        </div>
                                    )}
                                    {(despesasFuturas || []).length > 0 ? despesasFuturas.map(item => (
                                        <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-2 hover:bg-slate-200 dark:hover:bg-gray-700/50 rounded">
                                            {editingFuturaId === item.id ? (
                                                <>
                                                    <input type="text" value={editingFuturaData.nome} onChange={e => setEditingFuturaData({...editingFuturaData, nome: e.target.value})} className="col-span-3 bg-white dark:bg-gray-800 text-slate-800 dark:text-white rounded-md px-1 py-0.5 border border-slate-400 dark:border-gray-600"/>
                                                    <input type="number" value={editingFuturaData.ano_inicio} onChange={e => setEditingFuturaData({...editingFuturaData, ano_inicio: e.target.value})} className="col-span-2 bg-white dark:bg-gray-800 text-slate-800 dark:text-white rounded-md px-1 py-0.5 border border-slate-400 dark:border-gray-600"/>
                                                    <input type="number" value={editingFuturaData.valor_mensal} onChange={e => setEditingFuturaData({...editingFuturaData, valor_mensal: e.target.value})} className="col-span-2 bg-white dark:bg-gray-800 text-slate-800 dark:text-white rounded-md px-1 py-0.5 border border-slate-400 dark:border-gray-600"/>
                                                    <input type="number" value={editingFuturaData.prazo_meses} onChange={e => setEditingFuturaData({...editingFuturaData, prazo_meses: e.target.value})} className="col-span-2 bg-white dark:bg-gray-800 text-slate-800 dark:text-white rounded-md px-1 py-0.5 border border-slate-400 dark:border-gray-600"/>
                                                    <div className="col-span-2 flex justify-end items-center gap-3">
                                                        <button onClick={() => handleSaveEditFutura(item.id)} className="text-slate-600 dark:text-slate-300 hover:text-[#00d971]">Salvar</button>
                                                        <button onClick={handleCancelEditFutura} className="text-slate-600 dark:text-slate-300 hover:text-red-400">X</button>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="col-span-3 text-slate-800 dark:text-white">{item.nome}</p>
                                                    <p className="col-span-2 text-slate-800 dark:text-white">{item.ano_inicio}</p>
                                                    <p className="col-span-2 text-slate-800 dark:text-white">{formatCurrency(item.valor_mensal)}</p>
                                                    <p className="col-span-2 text-slate-800 dark:text-white">{item.prazo_meses} meses</p>
                                                    <p className="col-span-1 font-semibold text-slate-800 dark:text-white">{formatCurrency((item.valor_mensal || 0) * (item.prazo_meses || 0))}</p>
                                                    <div className="col-span-2 flex justify-end items-center gap-3">
                                                        <button onClick={() => handleStartEditFutura(item)} className="text-slate-600 dark:text-slate-300 hover:text-[#00d971]"><Edit size={16} /></button>
                                                        <button onClick={() => handleDeleteDespesaFutura(item.id)} className="text-slate-600 dark:text-slate-300 hover:text-red-400"><Trash2 size={16} /></button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )) : <p className="text-center text-slate-500 dark:text-gray-400 p-2 text-xs">Nenhuma despesa futura adicionada.</p>}
                                </div>
                            </div>
                             <div className="flex justify-between items-center p-3 border-t border-slate-300 dark:border-gray-600 mt-4">
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
                                        <input type="radio" name="doencas-tempo" value={tempo} checked={doencasGravesTempo === tempo} onChange={() => setDoencasGravesTempo(tempo)} className="form-radio h-4 w-4 text-[#00d971] bg-gray-700 border-gray-600 focus:ring-offset-0 focus:ring-2 focus:ring-[#00d971]" />
                                        <span className="text-slate-800 dark:text-white">{tempo} meses</span>
                                    </label>
                                ))}
                            </div>
                             <div className="flex items-center gap-6 mb-4">
                                <p className="font-medium text-slate-800 dark:text-white">Base de cálculo:</p>
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="doencas-base" value="renda" checked={doencasGravesBase === 'renda'} onChange={() => setDoencasGravesBase('renda')} className="form-radio h-4 w-4 text-[#00d971] bg-gray-700 border-gray-600 focus:ring-offset-0 focus:ring-2 focus:ring-[#00d971]" />
                                    <span className="text-slate-800 dark:text-white">Renda</span>
                                </label>
                                 <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="radio" name="doencas-base" value="custo" checked={doencasGravesBase === 'custo'} onChange={() => setDoencasGravesBase('custo')} className="form-radio h-4 w-4 text-[#00d971] bg-gray-700 border-gray-600 focus:ring-offset-0 focus:ring-2 focus:ring-[#00d971]" />
                                    <span className="text-slate-800 dark:text-white">Custo de Vida</span>
                                 </label>
                            </div>
                             <div className="bg-[#201b5d]/80 dark:bg-[#00d971]/80 p-3 rounded-lg flex justify-between items-center">
                                <p className="text-base font-semibold text-white">Cobertura Necessária:</p>
                                <p className="text-lg font-bold text-white">{formatCurrency(coberturaDoencasGraves)}</p>
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
                                <div className="flex justify-between items-center bg-[#201b5d]/80 dark:bg-[#00d971]/80 p-2 rounded-t-lg">
                                    <h3 className="font-bold text-white">Invalidez Permanente</h3>
                                </div>
                                <div className="space-y-1 bg-slate-100 dark:bg-gray-800/50 p-3 rounded-b-lg">
                                    <div className="flex items-center gap-6 mb-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="protecao-permanente" value="renda" checked={tipoProtecaoPermanente === 'renda'} onChange={() => setTipoProtecaoPermanente('renda')} className="form-radio h-4 w-4 text-[#00d971] bg-gray-700 border-gray-600 focus:ring-offset-0 focus:ring-2 focus:ring-[#00d971]" />
                                            <span className="text-slate-800 dark:text-white">Proteção da Renda</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="protecao-permanente" value="custo" checked={tipoProtecaoPermanente === 'custo'} onChange={() => setTipoProtecaoPermanente('custo')} className="form-radio h-4 w-4 text-[#00d971] bg-gray-700 border-gray-600 focus:ring-offset-0 focus:ring-2 focus:ring-[#00d971]" />
                                            <span className="text-slate-800 dark:text-white">Custo de Vida</span>
                                        </label>
                                    </div>
                                    <div className="grid grid-cols-12 gap-2 items-center p-2 rounded">
                                        <p className="col-span-4 text-slate-800 dark:text-white">{protecaoPermanenteSelecionada.nome}</p>
                                        <p className="col-span-4 font-semibold text-slate-800 dark:text-white">{formatCurrency(protecaoPermanenteSelecionada.cobertura)}</p>
                                        <p className="col-span-4 text-slate-500 dark:text-gray-400 italic">{protecaoPermanenteSelecionada.observacoes}</p>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <div className="flex justify-between items-center bg-[#201b5d]/80 dark:bg-[#00d971]/80 p-2 rounded-t-lg">
                                    <h3 className="font-bold text-white">Invalidez Temporária</h3>
                                    <div className="flex gap-4">
                                        <button onClick={() => handleAddProtecaoTemporaria('renda')} className="text-xs flex items-center gap-1 font-semibold text-white hover:text-gray-200"><PlusCircle size={14} /> Renda</button>
                                        <button onClick={() => handleAddProtecaoTemporaria('custo')} className="text-xs flex items-center gap-1 font-semibold text-white hover:text-gray-200"><PlusCircle size={14} /> Custo de Vida</button>
                                    </div>
                                </div>
                                <div className="space-y-1 bg-slate-100 dark:bg-gray-800/50 p-2 rounded-b-lg">
                                    {(invalidez || []).length > 0 ? invalidez.map(item => (
                                        <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-2 hover:bg-slate-200 dark:hover:bg-gray-700/50 rounded">
                                            {editingItemId === item.id ? (
                                                <>
                                                    <input type="text" value={editingItemData.nome} onChange={e => setEditingItemData({...editingItemData, nome: e.target.value})} className="col-span-4 bg-white dark:bg-gray-800 text-slate-800 dark:text-white rounded-md px-1 py-0.5 border border-slate-400 dark:border-gray-600"/>
                                                    <input type="number" value={editingItemData.cobertura} onChange={e => setEditingItemData({...editingItemData, cobertura: e.target.value})} className="col-span-3 bg-white dark:bg-gray-800 text-slate-800 dark:text-white rounded-md px-1 py-0.5 border border-slate-400 dark:border-gray-600"/>
                                                    <input type="text" value={editingItemData.observacoes} onChange={e => setEditingItemData({...editingItemData, observacoes: e.target.value})} className="col-span-3 bg-white dark:bg-gray-800 text-slate-800 dark:text-white rounded-md px-1 py-0.5 border border-slate-400 dark:border-gray-600"/>
                                                    <div className="col-span-2 flex justify-end items-center gap-3">
                                                        <button onClick={() => handleSaveEdit(item.id)} className="text-slate-600 dark:text-slate-300 hover:text-[#00d971]">Salvar</button>
                                                        <button onClick={handleCancelEdit} className="text-slate-600 dark:text-slate-300 hover:text-red-400">X</button>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <p className="col-span-4 text-slate-800 dark:text-white">{item.nome}</p>
                                                    <p className="col-span-3 font-semibold text-slate-800 dark:text-white">{formatCurrency(item.cobertura)}</p>
                                                    <p className="col-span-3 text-slate-500 dark:text-gray-400 italic">{item.observacoes}</p>
                                                    <div className="col-span-2 flex justify-end items-center gap-3">
                                                        <button onClick={() => handleStartEdit(item)} className="text-slate-600 dark:text-slate-300 hover:text-[#00d971]"><Edit size={16} /></button>
                                                        <button onClick={() => handleDeleteProtecao(item.id)} className="text-slate-600 dark:text-slate-300 hover:text-red-400"><Trash2 size={16} /></button>
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )) : <p className="text-center text-slate-500 dark:text-gray-400 p-2 text-xs">Nenhuma proteção temporária adicionada.</p>}
                                </div>
                            </div>
                        </div>
                    </Card>
                    <Card>
                         <div className="flex justify-between items-center bg-[#201b5d]/80 dark:bg-[#00d971]/80 p-2 rounded-t-lg mb-2">
                            <h3 className="font-bold text-white flex items-center gap-2"><Car size={18}/> Proteção Patrimonial</h3>
                            <button onClick={handleAddPatrimonial} className="text-xs flex items-center gap-1 font-semibold text-white hover:text-gray-200"><PlusCircle size={14} /> Adicionar Seguro</button>
                        </div>
                         <div className="space-y-1 bg-slate-100 dark:bg-gray-800/50 p-2 rounded-b-lg text-sm">
                            {(patrimonial || []).length > 0 && (
                                <div className="grid grid-cols-12 gap-2 items-center px-2 pb-2 border-b border-slate-300 dark:border-gray-600 font-bold text-slate-600 dark:text-slate-300">
                                    <p className="col-span-3">Nome</p>
                                    <p className="col-span-3">Empresa</p>
                                    <p className="col-span-2">Vencimento</p>
                                    <p className="col-span-2">Valor</p>
                                    <p className="col-span-2"></p>
                                </div>
                            )}
                            {(patrimonial || []).length > 0 ? patrimonial.map(item => (
                                <div key={item.id} className="grid grid-cols-12 gap-2 items-center p-2 hover:bg-slate-200 dark:hover:bg-gray-700/50 rounded">
                                    {editingPatrimonialId === item.id ? (
                                        <>
                                            <input type="text" value={editingPatrimonialData.nome} onChange={e => setEditingPatrimonialData({...editingPatrimonialData, nome: e.target.value})} className="col-span-3 bg-white dark:bg-gray-800 text-slate-800 dark:text-white rounded-md px-1 py-0.5 border border-slate-400 dark:border-gray-600"/>
                                            <input type="text" value={editingPatrimonialData.empresa} onChange={e => setEditingPatrimonialData({...editingPatrimonialData, empresa: e.target.value})} className="col-span-3 bg-white dark:bg-gray-800 text-slate-800 dark:text-white rounded-md px-1 py-0.5 border border-slate-400 dark:border-gray-600"/>
                                            <input type="date" value={editingPatrimonialData.data_vencimento} onChange={e => setEditingPatrimonialData({...editingPatrimonialData, data_vencimento: e.target.value})} className="col-span-2 bg-white dark:bg-gray-800 text-slate-800 dark:text-white rounded-md px-1 py-0.5 border border-slate-400 dark:border-gray-600"/>
                                            <input type="number" value={editingPatrimonialData.valor} onChange={e => setEditingPatrimonialData({...editingPatrimonialData, valor: e.target.value})} className="col-span-2 bg-white dark:bg-gray-800 text-slate-800 dark:text-white rounded-md px-1 py-0.5 border border-slate-400 dark:border-gray-600"/>
                                            <div className="col-span-2 flex justify-end items-center gap-3">
                                                <button onClick={() => handleSaveEditPatrimonial(item.id)} className="text-slate-600 dark:text-slate-300 hover:text-[#00d971]">Salvar</button>
                                                <button onClick={handleCancelEditPatrimonial} className="text-slate-600 dark:text-slate-300 hover:text-red-400">X</button>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <p className="col-span-3 text-slate-800 dark:text-white">{item.nome}</p>
                                            <p className="col-span-3 text-slate-800 dark:text-white">{item.empresa}</p>
                                            <p className="col-span-2 text-slate-800 dark:text-white">{item.data_vencimento ? new Date(item.data_vencimento).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : '-'}</p>
                                            <p className="col-span-2 font-semibold text-slate-800 dark:text-white">{formatCurrency(item.valor)}</p>
                                            <div className="col-span-2 flex justify-end items-center gap-3">
                                                <button onClick={() => handleStartEditPatrimonial(item)} className="text-slate-600 dark:text-slate-300 hover:text-[#00d971]"><Edit size={16} /></button>
                                                <button onClick={() => handleDeletePatrimonial(item.id)} className="text-slate-600 dark:text-slate-300 hover:text-red-400"><Trash2 size={16} /></button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )) : <p className="text-center text-slate-500 dark:text-gray-400 p-2 text-xs">Nenhum seguro patrimonial adicionado.</p>}
                        </div>
                    </Card>
                     <Card>
                        <div className="flex justify-between items-center p-3">
                            <h2 className="text-lg font-bold text-slate-800 dark:text-white">Exportar Proposta</h2>
                            <button
                                onClick={exportarPropostaPDF}
                                className="bg-[#00d971] hover:bg-[#00b860] text-black font-bold px-4 py-2 rounded-md text-sm transition-colors"
                            >
                                Exportar PDF
                            </button>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default TelaProtecao;