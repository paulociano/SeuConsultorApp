import { useState, useContext, useMemo, useEffect } from 'react';
import Card from '../../components/Card/Card';
import { formatCurrency } from '../../utils/formatters';
import { Edit, PlusCircle, Trash2 } from 'lucide-react';
import ReactECharts from 'echarts-for-react';
import { ThemeContext } from '../../ThemeContext';
import { v4 as uuidv4 } from 'uuid';
import { useAquisicaoStore } from '../../stores/useAquisicaoStore';

// O componente agora recebe apenas props de configuração, não mais de dados ou handlers.
const TelaAquisicaoGenerica = ({ titulo, descricaoBem, permitirFGTS, tipo }) => {
    const { theme } = useContext(ThemeContext);
    // Conecta-se à store para obter estados e ações
    const { imoveis, automoveis, isLoading, fetchAquisicoes, saveAquisicao } = useAquisicaoStore();

    const initialFormState = useMemo(() => ({
        descricao: descricaoBem,
        valorTotal: permitirFGTS ? 500000 : 80000,
        valorDisponivel: 10000,
        aporteMensal: permitirFGTS ? 3000 : 1500,
        rentabilidadeMensal: 0.85,
        possuiFGTS: permitirFGTS,
        valorFGTS: permitirFGTS ? 50000 : 0,
        entradaPercentual: 20,
        segurosMensal: permitirFGTS ? 69 : 25,
        tarifasMensal: 25,
        jurosFinanciamento: 9.99,
        prazoFinanciamentoAnos: permitirFGTS ? 30 : 5,
        tabelaAmortizacao: 'SAC',
        reajusteAnualFinanciamento: 3.0,
        prazoConsorcio: permitirFGTS ? 200 : 80,
        taxaAdmTotal: 18.5,
        lancePercentual: 55,
        reajusteAnualConsorcio: 4.5,
    }), [descricaoBem, permitirFGTS]);

    const [novoCaso, setNovoCaso] = useState(initialFormState);
    const [casos, setCasos] = useState([]);
    const [casoSelecionado, setCasoSelecionado] = useState(null);
    const [activeChart, setActiveChart] = useState('acumulo');

    const [percentualReducao, setPercentualReducao] = useState(0);
    const [percentualEmbutido, setPercentualEmbutido] = useState(0);

    // Efeito para buscar os dados da store na montagem do componente
    useEffect(() => {
        fetchAquisicoes();
    }, [fetchAquisicoes]);

    // Efeito que sincroniza o estado local com os dados vindos da store
    useEffect(() => {
        const dadosDaStore = tipo === 'imoveis' ? imoveis : automoveis;
        if (dadosDaStore && dadosDaStore.length > 0) {
            setCasos(dadosDaStore);
            handleSelectCaso(dadosDaStore[0]);
        } else {
            setCasos([]);
            setCasoSelecionado(null);
            setNovoCaso(initialFormState);
        }
    }, [imoveis, automoveis, tipo, initialFormState]);

    const handleSelectCaso = (caso) => {
        setNovoCaso(caso);
        setCasoSelecionado(caso);
    };

    // Handlers que agora chamam a ação 'saveAquisicao' da store
    const handleUpdateCaso = () => {
        if (!casoSelecionado) return;
        const casoAtualizado = { ...novoCaso, id: casoSelecionado.id };
        const novosCasos = casos.map(c => c.id === casoSelecionado.id ? casoAtualizado : c);
        setCasos(novosCasos);
        setCasoSelecionado(casoAtualizado);
        saveAquisicao(tipo, novosCasos);
    };

    const handleDeleteCaso = (idToDelete) => {
        const novosCasos = casos.filter(c => c.id !== idToDelete);
        setCasos(novosCasos);
        saveAquisicao(tipo, novosCasos);

        if (casoSelecionado?.id === idToDelete) {
            setCasoSelecionado(null);
            setNovoCaso(initialFormState);
        }
    };

    const handleAddCaso = (e) => {
        e.preventDefault();
        if (!novoCaso.descricao || !novoCaso.valorTotal) return;
        const casoAdicionado = { ...novoCaso, id: uuidv4() };
        const novosCasos = [...casos, casoAdicionado];
        setCasos(novosCasos);
        setCasoSelecionado(casoAdicionado);
        saveAquisicao(tipo, novosCasos);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        const val = type === 'checkbox' ? checked : (type === 'number' ? parseFloat(value) || 0 : value);
        setNovoCaso(prev => ({
            ...prev,
            [name]: val,
            ...(name === 'possuiFGTS' && !checked && { valorFGTS: 0 })
        }));
    };

    const calcularPrevisaoComJuros = (valorAlvo, valorDisponivel, aporteMensal, rentabilidade) => {
        if (valorAlvo <= valorDisponivel) return { meses: 0, data: 'Imediata' };
        if (aporteMensal <= 0 && valorDisponivel < valorAlvo) return { meses: Infinity, data: 'N/A' };
        const taxaDecimal = rentabilidade / 100;
        let mesesNecessarios = 0;
        let acumulado = valorDisponivel;
        while (acumulado < valorAlvo) {
            acumulado = acumulado * (1 + taxaDecimal) + aporteMensal;
            mesesNecessarios++;
            if (mesesNecessarios > 1200) return { meses: Infinity, data: 'Acima de 100 anos' };
        }
        const dataAtual = new Date();
        const dataFutura = new Date(dataAtual.setMonth(dataAtual.getMonth() + mesesNecessarios));
        const nomeMes = dataFutura.toLocaleString('pt-BR', { month: 'long' });
        const ano = dataFutura.getFullYear();
        return { meses: mesesNecessarios, data: `${nomeMes.charAt(0).toUpperCase() + nomeMes.slice(1)}/${ano}` };
    };

    const previsaoEntradaFinanciamento = useMemo(() => {
        if (!casoSelecionado) return { meses: 0, data: 'N/A' };
        const { valorTotal, entradaPercentual, valorDisponivel, aporteMensal, rentabilidadeMensal, possuiFGTS, valorFGTS } = casoSelecionado;
        const valorEntrada = valorTotal * (entradaPercentual / 100);
        const capitalInicialTotal = valorDisponivel + (permitirFGTS && possuiFGTS ? valorFGTS : 0);
        return calcularPrevisaoComJuros(valorEntrada, capitalInicialTotal, aporteMensal, rentabilidadeMensal);
    }, [casoSelecionado, permitirFGTS]);

    const previsaoLanceConsorcio = useMemo(() => {
        if (!casoSelecionado) return { meses: 0, data: 'N/A' };
        const { valorTotal, lancePercentual, taxaAdmTotal, prazoConsorcio, valorDisponivel, aporteMensal, rentabilidadeMensal, possuiFGTS, valorFGTS } = casoSelecionado;
        const valorLance = valorTotal * (lancePercentual / 100);
        const valorTotalConsorcio = valorTotal * (1 + taxaAdmTotal / 100);
        const parcelaConsorcioInicial = prazoConsorcio > 0 ? valorTotalConsorcio / prazoConsorcio : 0;
        const aporteLiquidoParaLance = aporteMensal - parcelaConsorcioInicial;
        const capitalInicialTotal = valorDisponivel + (permitirFGTS && possuiFGTS ? valorFGTS : 0);
        return calcularPrevisaoComJuros(valorLance, capitalInicialTotal, aporteLiquidoParaLance, rentabilidadeMensal);
    }, [casoSelecionado, permitirFGTS]);

    const previsaoAVista = useMemo(() => {
        if (!casoSelecionado) return { meses: 0, data: 'N/A' };
        const { valorTotal, valorDisponivel, aporteMensal, rentabilidadeMensal, possuiFGTS, valorFGTS } = casoSelecionado;
        const capitalInicialTotal = valorDisponivel + (permitirFGTS && possuiFGTS ? valorFGTS : 0);
        return calcularPrevisaoComJuros(valorTotal, capitalInicialTotal, aporteMensal, rentabilidadeMensal);
    }, [casoSelecionado, permitirFGTS]);
    
    const projecaoData = useMemo(() => {
        if (!casoSelecionado) return [];
        const {
            valorTotal, valorDisponivel, aporteMensal, rentabilidadeMensal, possuiFGTS, valorFGTS,
            entradaPercentual, segurosMensal, tarifasMensal, jurosFinanciamento, prazoFinanciamentoAnos, tabelaAmortizacao, reajusteAnualFinanciamento,
            prazoConsorcio, taxaAdmTotal, lancePercentual, reajusteAnualConsorcio
        } = casoSelecionado;
        const taxaJurosMensal = rentabilidadeMensal / 100;
        const maxPrazo = Math.max(prazoFinanciamentoAnos * 12, prazoConsorcio, 360);
        const data = [];
        let capitalLiquidoFin = valorDisponivel; let capitalLiquidoCon = valorDisponivel; let capitalLiquidoAVista = valorDisponivel;
        let saldoDevedorFin = valorTotal - (valorTotal * (entradaPercentual/100)); let saldoDevedorConsorcio = valorTotal * (1 + taxaAdmTotal / 100);
        let parcelaConsorcioAtual = prazoConsorcio > 0 ? saldoDevedorConsorcio / prazoConsorcio : 0; let foiContemplado = false;
        const { meses: mesesParaEntrada } = previsaoEntradaFinanciamento; const { meses: mesesParaLance } = previsaoLanceConsorcio; const { meses: mesesParaAVista } = previsaoAVista;
        for (let i = 1; i <= maxPrazo; i++) {
            let parcelaFin = 0; if (i > mesesParaEntrada && (i - mesesParaEntrada) % 12 === 1 && (i - mesesParaEntrada) > 1) { const reajuste = (1 + reajusteAnualFinanciamento / 100); saldoDevedorFin *= reajuste; }
            if (i >= mesesParaEntrada) { const prazoMesesFin = prazoFinanciamentoAnos * 12; const valorFinanciado = valorTotal - (valorTotal * (entradaPercentual/100)); if (i - mesesParaEntrada < prazoMesesFin && valorFinanciado > 0) { const taxaMensalJuros = jurosFinanciamento / 12 / 100; if (tabelaAmortizacao === 'SAC') { const amortizacao = saldoDevedorFin / (prazoMesesFin - (i - mesesParaEntrada)); parcelaFin = (saldoDevedorFin * taxaMensalJuros) + amortizacao; saldoDevedorFin -= amortizacao; } else { parcelaFin = saldoDevedorFin * (taxaMensalJuros * Math.pow(1 + taxaMensalJuros, prazoMesesFin - (i - mesesParaEntrada))) / (Math.pow(1 + taxaMensalJuros, prazoMesesFin - (i - mesesParaEntrada)) - 1); const jurosDaParcela = saldoDevedorFin * taxaMensalJuros; saldoDevedorFin -= (parcelaFin - jurosDaParcela); } } }
            const desembolsoFin = parcelaFin > 0 ? parcelaFin + segurosMensal + tarifasMensal : 0; const capacidadePoupancaFin = aporteMensal - desembolsoFin;
            let parcelaConsorcioDoMes = 0; if (i <= prazoConsorcio && saldoDevedorConsorcio > 0) { if ((i - 1) > 0 && (i - 1) % 12 === 0) { const reajuste = (1 + reajusteAnualConsorcio / 100); if (foiContemplado) { saldoDevedorConsorcio *= reajuste; const prazoRestante = prazoConsorcio - (i - 1); parcelaConsorcioAtual = prazoRestante > 0 ? saldoDevedorConsorcio / prazoRestante : 0; } else { let valorCartaAtual = (saldoDevedorConsorcio / (1 + taxaAdmTotal/100)) * prazoConsorcio / (prazoConsorcio - (i-1)); valorCartaAtual *= reajuste; saldoDevedorConsorcio = valorCartaAtual * (1 + taxaAdmTotal/100) / prazoConsorcio * (prazoConsorcio-(i-1)); parcelaConsorcioAtual = (valorCartaAtual * (1+taxaAdmTotal/100))/prazoConsorcio; } } const valorLanceSimulado = valorTotal * (lancePercentual / 100); if (i === mesesParaLance && !foiContemplado && valorLanceSimulado > 0) { const lanceEfetivo = Math.min(valorLanceSimulado, saldoDevedorConsorcio); saldoDevedorConsorcio -= lanceEfetivo; foiContemplado = true; const prazoRestante = prazoConsorcio - (i - 1); parcelaConsorcioAtual = prazoRestante > 0 ? saldoDevedorConsorcio / prazoRestante : 0; } saldoDevedorConsorcio -= parcelaConsorcioAtual; parcelaConsorcioDoMes = parcelaConsorcioAtual; }
            const capacidadePoupancaCon = aporteMensal - parcelaConsorcioDoMes; const fgtsDisponivel = permitirFGTS && possuiFGTS ? valorFGTS : 0;
            if (i < mesesParaEntrada) { capitalLiquidoFin = capitalLiquidoFin * (1 + taxaJurosMensal) + aporteMensal; } else { if(i === mesesParaEntrada) { const valorEntrada = valorTotal * (entradaPercentual/100); capitalLiquidoFin -= Math.max(0, valorEntrada - fgtsDisponivel); } capitalLiquidoFin = capitalLiquidoFin * (1 + taxaJurosMensal) + capacidadePoupancaFin; }
            if (i < mesesParaLance) { capitalLiquidoCon = capitalLiquidoCon * (1 + taxaJurosMensal) + capacidadePoupancaCon; } else { if (i === mesesParaLance) { const valorDoLance = valorTotal * (lancePercentual/100); capitalLiquidoCon -= Math.max(0, valorDoLance - fgtsDisponivel); } capitalLiquidoCon = capitalLiquidoCon * (1 + taxaJurosMensal) + capacidadePoupancaCon; }
            if (i < mesesParaAVista) { capitalLiquidoAVista = capitalLiquidoAVista * (1 + taxaJurosMensal) + aporteMensal; } else { if (i === mesesParaAVista) { capitalLiquidoAVista -= Math.max(0, valorTotal - fgtsDisponivel); } capitalLiquidoAVista = capitalLiquidoAVista * (1 + taxaJurosMensal) + aporteMensal; }
            if (i % 12 === 0) { data.push({ ano: i / 12, capacidadePoupancaFin, capacidadePoupancaCon, parcelaFinanciamento: parcelaFin, parcelaConsorcio: parcelaConsorcioDoMes, acumuloFinanciamento: capitalLiquidoFin, acumuloConsorcio: capitalLiquidoCon, acumuloAVista: capitalLiquidoAVista }); }
        }
        return data;
    }, [casoSelecionado, previsaoEntradaFinanciamento, previsaoLanceConsorcio, previsaoAVista, permitirFGTS]);

   const getChartOptions = useMemo(() => {
    if (!projecaoData || projecaoData.length === 0) return {};

    const anos = projecaoData.map(p => p.ano);
    const seriesMapping = {
        acumulo: {
            legend: ['Capital (À Vista)', 'Capital (Financiamento)', 'Capital (Consórcio)'],
            series: [
                { name: 'Capital (À Vista)', type: 'line', areaStyle: {}, emphasis: { focus: 'series' }, symbol: 'none', data: projecaoData.map(p => p.acumuloAVista), color: '#ffc658' },
                { name: 'Capital (Financiamento)', type: 'line', areaStyle: {}, emphasis: { focus: 'series' }, symbol: 'none', data: projecaoData.map(p => p.acumuloFinanciamento), color: '#00d971' },
                { name: 'Capital (Consórcio)', type: 'line', stack: 'Total', areaStyle: {}, emphasis: { focus: 'series' }, symbol: 'none', data: projecaoData.map(p => p.acumuloConsorcio), color: '#c084fc' },
            ],
        },
        capacidade: {
            legend: ['Poupança Mensal (Financiamento)', 'Poupança Mensal (Consórcio)'],
            series: [
                { name: 'Poupança Mensal (Financiamento)', type: 'line', areaStyle: {}, emphasis: { focus: 'series' }, symbol: 'none', data: projecaoData.map(p => p.capacidadePoupancaFin), color: '#00d971' },
                { name: 'Poupança Mensal (Consórcio)', type: 'line', areaStyle: {}, emphasis: { focus: 'series' }, symbol: 'none', data: projecaoData.map(p => p.capacidadePoupancaCon), color: '#c084fc' },
            ]
        },
        parcela: {
            legend: ['Parcela Financiamento', 'Parcela Consórcio'],
            series: [
                { name: 'Parcela Financiamento', type: 'line', step: 'end', symbol: 'none', data: projecaoData.map(p => p.parcelaFinanciamento), color: '#00d971' },
                { name: 'Parcela Consórcio', type: 'line', step: 'end', symbol: 'none', data: projecaoData.map(p => p.parcelaConsorcio), color: '#c084fc' },
            ]
        }
    };
    
    const currentConfig = seriesMapping[activeChart];

    return {
        backgroundColor: 'transparent',
        tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
        legend: { data: currentConfig.legend, textStyle: { color: theme === 'dark' ? '#ccc' : '#333' } },
        grid: { left: '3%', right: '4%', bottom: '20%', containLabel: true },
        xAxis: { type: 'category', boundaryGap: false, data: anos, axisLine: { lineStyle: { color: theme === 'dark' ? '#888' : '#ccc' } } },
        yAxis: { type: 'value', axisLine: { lineStyle: { color: theme === 'dark' ? '#888' : '#ccc' } }, splitLine: { lineStyle: { color: theme === 'dark' ? '#3e388b' : '#eee' } }, axisLabel: { formatter: (value) => formatCurrency(value) } },
        series: currentConfig.series,
        dataZoom: [ { type: 'inside', start: 0, end: 100 }, { type: 'slider', start: 0, end: 100, handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z', handleSize: '80%', handleStyle: { color: '#fff', shadowBlur: 3, shadowColor: 'rgba(0, 0, 0, 0.6)', shadowOffsetX: 2, shadowOffsetY: 2 } } ]
    };
    }, [projecaoData, activeChart, theme]);

    const projecaoConsorcioComparativo = useMemo(() => {
        if (!casoSelecionado) return { cenarioPadrao: [], cenarioReduzido: null, cenarioEmbutido: null };

        const calcularCenario = (params) => {
            const { 
                valorTotal, valorDisponivel, aporteMensal, rentabilidadeMensal, taxaAdmTotal, 
                prazoConsorcio, lancePercentual, possuiFGTS, valorFGTS, reajusteAnualConsorcio 
            } = casoSelecionado;
            
            const { reducao, embutido } = params;
            const taxaJurosMensal = rentabilidadeMensal / 100;
            const maxPrazo = prazoConsorcio;
            const data = [];
            let capitalLiquido = valorDisponivel;
            let foiContemplado = false;
            const creditoContratado = embutido > 0 ? valorTotal / (1 - embutido / 100) : valorTotal;
            let saldoDevedor = creditoContratado * (1 + taxaAdmTotal / 100);
            let parcelaCheia = prazoConsorcio > 0 ? saldoDevedor / prazoConsorcio : 0;
            const lanceTotalNecessario = valorTotal * (lancePercentual / 100);
            const valorDoLanceEmbutido = embutido > 0 ? creditoContratado * (embutido / 100) : 0;
            const lanceDeRecursoProprio = Math.max(0, lanceTotalNecessario - valorDoLanceEmbutido);
            const parcelaConsideradaParaPrevisao = reducao > 0 ? parcelaCheia * (1 - reducao / 100) : parcelaCheia;
            const aporteLiquidoParaLance = aporteMensal - parcelaConsideradaParaPrevisao;
            const capitalInicialTotal = valorDisponivel + (permitirFGTS && possuiFGTS ? valorFGTS : 0);
            const { meses: mesesParaLance } = calcularPrevisaoComJuros(lanceDeRecursoProprio, capitalInicialTotal, aporteLiquidoParaLance, rentabilidadeMensal);
            
            for (let i = 1; i <= maxPrazo; i++) {
                let parcelaDoMes = parcelaCheia;
                if ((i - 1) > 0 && (i - 1) % 12 === 0) {
                    const reajuste = (1 + reajusteAnualConsorcio / 100);
                    if (foiContemplado) {
                        saldoDevedor *= reajuste;
                        const prazoRestante = prazoConsorcio - (i - 1);
                        parcelaCheia = prazoRestante > 0 ? saldoDevedor / prazoRestante : 0;
                    } else {
                        let valorCartaAtual = (saldoDevedor / (1 + taxaAdmTotal/100)) * prazoConsorcio / (prazoConsorcio - (i-1));
                        valorCartaAtual *= reajuste;
                        saldoDevedor = valorCartaAtual * (1 + taxaAdmTotal/100) / prazoConsorcio * (prazoConsorcio-(i-1));
                        parcelaCheia = (valorCartaAtual * (1+taxaAdmTotal/100))/prazoConsorcio;
                    }
                }
                if (i === mesesParaLance && !foiContemplado) {
                    const lanceEfetivo = lanceTotalNecessario;
                    saldoDevedor -= lanceEfetivo;
                    foiContemplado = true;
                    const prazoRestante = prazoConsorcio - (i - 1);
                    parcelaCheia = prazoRestante > 0 ? saldoDevedor / prazoRestante : 0;
                    const fgtsDisponivel = permitirFGTS && possuiFGTS ? valorFGTS : 0;
                    capitalLiquido -= Math.max(0, lanceDeRecursoProprio - fgtsDisponivel);
                }
                if (!foiContemplado && reducao > 0) {
                    parcelaDoMes = parcelaCheia * (1 - reducao / 100);
                } else {
                    parcelaDoMes = parcelaCheia;
                }
                const capacidadePoupanca = aporteMensal - parcelaDoMes;
                capitalLiquido = capitalLiquido * (1 + taxaJurosMensal) + capacidadePoupanca;
                if (saldoDevedor > 0) {
                    saldoDevedor -= parcelaDoMes;
                }
                if (i % 12 === 0) {
                    data.push({
                        ano: i / 12,
                        acumuloCapital: capitalLiquido,
                        capacidadePoupanca: capacidadePoupanca,
                        parcela: parcelaDoMes
                    });
                }
            }
            return data;
        };

        const cenarioPadrao = calcularCenario({ reducao: 0, embutido: 0 });
        const cenarioReduzido = percentualReducao > 0 ? calcularCenario({ reducao: percentualReducao, embutido: 0 }) : null;
        const cenarioEmbutido = percentualEmbutido > 0 ? calcularCenario({ reducao: 0, embutido: percentualEmbutido }) : null;
        return { cenarioPadrao, cenarioReduzido, cenarioEmbutido };
    }, [casoSelecionado, percentualReducao, percentualEmbutido, permitirFGTS]);

    const getConsorcioChartOptions = (tipoGrafico) => {
        const { cenarioPadrao, cenarioReduzido, cenarioEmbutido } = projecaoConsorcioComparativo;
        if (!cenarioPadrao || cenarioPadrao.length === 0) return {};
        const anos = cenarioPadrao.map(p => p.ano);
        const series = [];
        const legend = [];
        const seriesMapping = {
            acumulo: {
                padrao: cenarioPadrao.map(p => p.acumuloCapital),
                reduzido: cenarioReduzido ? cenarioReduzido.map(p => p.acumuloCapital) : [],
                embutido: cenarioEmbutido ? cenarioEmbutido.map(p => p.acumuloCapital) : []
            },
            capacidade: {
                padrao: cenarioPadrao.map(p => p.capacidadePoupanca),
                reduzido: cenarioReduzido ? cenarioReduzido.map(p => p.capacidadePoupanca) : [],
                embutido: cenarioEmbutido ? cenarioEmbutido.map(p => p.capacidadePoupanca) : []
            },
            parcelas: {
                padrao: cenarioPadrao.map(p => p.parcela),
                reduzido: cenarioReduzido ? cenarioReduzido.map(p => p.parcela) : [],
                embutido: cenarioEmbutido ? cenarioEmbutido.map(p => p.parcela) : []
            }
        };

        legend.push('Padrão');
        series.push({ name: 'Padrão', type: 'line', symbol: 'none', data: seriesMapping[tipoGrafico].padrao, color: '#c084fc' });
        if (cenarioReduzido) {
            legend.push(`Redução ${percentualReducao}%`);
            series.push({ name: `Redução ${percentualReducao}%`, type: 'line', symbol: 'none', data: seriesMapping[tipoGrafico].reduzido, color: '#ffc658' });
        }
        if (cenarioEmbutido) {
            legend.push(`Embutido ${percentualEmbutido}%`);
            series.push({ name: `Embutido ${percentualEmbutido}%`, type: 'line', symbol: 'none', data: seriesMapping[tipoGrafico].embutido, color: '#00d971' });
        }

        return {
            backgroundColor: 'transparent',
            tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
            legend: { data: legend, textStyle: { color: theme === 'dark' ? '#ccc' : '#333' } },
            grid: { left: '3%', right: '4%', bottom: '20%', containLabel: true },
            xAxis: { type: 'category', boundaryGap: false, data: anos, axisLine: { lineStyle: { color: theme === 'dark' ? '#888' : '#ccc' } } },
            yAxis: { type: 'value', axisLine: { lineStyle: { color: theme === 'dark' ? '#888' : '#ccc' } }, splitLine: { lineStyle: { color: theme === 'dark' ? '#3e388b' : '#eee' } }, axisLabel: { formatter: (value) => formatCurrency(value) } },
            series: series,
            dataZoom: [ { type: 'inside', start: 0, end: 100 }, { type: 'slider', start: 0, end: 100, handleIcon: 'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z', handleSize: '80%', handleStyle: { color: '#fff', shadowBlur: 3, shadowColor: 'rgba(0, 0, 0, 0.6)', shadowOffsetX: 2, shadowOffsetY: 2 } } ]
        };
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00d971]"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white mb-4">{titulo}</h1>
            
            <Card className="mb-6">
                 <form onSubmit={handleAddCaso}>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Dados Gerais da Simulação</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 text-sm">
                        <div className="md:col-span-2">
                            <label className="block font-medium text-gray-700 dark:text-gray-300">Descrição</label>
                            <input type="text" name="descricao" value={novoCaso.descricao} onChange={handleInputChange} className="mt-1 w-full bg-white dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-2 py-1 border border-slate-300 dark:border-[#3e388b]"/>
                        </div>
                        <div><label className="block font-medium text-gray-700 dark:text-gray-300">Valor do Bem</label><input type="number" name="valorTotal" value={novoCaso.valorTotal} onChange={handleInputChange} className="mt-1 w-full bg-white dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-2 py-1 border border-slate-300 dark:border-[#3e388b]"/></div>
                        <div><label className="block font-medium text-gray-700 dark:text-gray-300">Disponível Hoje</label><input type="number" name="valorDisponivel" value={novoCaso.valorDisponivel} onChange={handleInputChange} className="mt-1 w-full bg-white dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-2 py-1 border border-slate-300 dark:border-[#3e388b]"/></div>
                        <div><label className="block font-medium text-gray-700 dark:text-gray-300">Aporte Mensal</label><input type="number" name="aporteMensal" value={novoCaso.aporteMensal} onChange={handleInputChange} className="mt-1 w-full bg-white dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-2 py-1 border border-slate-300 dark:border-[#3e388b]"/></div>
                        <div><label className="block font-medium text-gray-700 dark:text-gray-300">Rentabilidade Mensal (%)</label><input type="number" name="rentabilidadeMensal" value={novoCaso.rentabilidadeMensal} onChange={handleInputChange} step="0.01" className="mt-1 w-full bg-white dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-2 py-1 border border-slate-300 dark:border-[#3e388b]"/></div>
                        
                        {permitirFGTS && (
                            <div className="md:col-span-2 flex items-end gap-4">
                                <label className="flex items-center gap-2 cursor-pointer pb-1"><input type="checkbox" name="possuiFGTS" checked={novoCaso.possuiFGTS} onChange={handleInputChange} className="form-checkbox h-4 w-4 text-[#00d971] bg-gray-700 border-gray-600 rounded focus:ring-[#00d971]" /><span className="text-gray-700 dark:text-gray-300">Possui FGTS?</span></label>
                                {novoCaso.possuiFGTS && (
                                    <div className="flex-1"><label className="block font-medium text-gray-700 dark:text-gray-300">Valor FGTS</label><input type="number" name="valorFGTS" value={novoCaso.valorFGTS} onChange={handleInputChange} className="mt-1 w-full bg-white dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-2 py-1 border border-slate-300 dark:border-[#3e388b]"/></div>
                                )}
                            </div>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 border-t border-slate-200 dark:border-[#3e388b] pt-4">Parâmetros do Financiamento</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><label className="block font-medium text-gray-600 dark:text-gray-400">Juros (% a.a.)</label><input type="number" name="jurosFinanciamento" value={novoCaso.jurosFinanciamento} onChange={handleInputChange} className="w-full bg-white dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-2 py-1 border border-slate-300 dark:border-[#3e388b]"/></div>
                                <div><label className="block font-medium text-gray-600 dark:text-gray-400">Prazo (anos)</label><input type="number" name="prazoFinanciamentoAnos" value={novoCaso.prazoFinanciamentoAnos} onChange={handleInputChange} className="w-full bg-white dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-2 py-1 border border-slate-300 dark:border-[#3e388b]"/></div>
                                <div><label className="block font-medium text-gray-600 dark:text-gray-400">Entrada (%)</label><input type="number" name="entradaPercentual" value={novoCaso.entradaPercentual} onChange={handleInputChange} className="w-full bg-white dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-2 py-1 border border-slate-300 dark:border-[#3e388b]"/></div>
                                <div><label className="block font-medium text-gray-600 dark:text-gray-400">Tabela</label><select name="tabelaAmortizacao" value={novoCaso.tabelaAmortizacao} onChange={handleInputChange} className="w-full bg-white dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-2 py-1 border border-slate-300 dark:border-[#3e388b]"><option value="SAC">SAC</option><option value="Price">Price</option></select></div>
                                <div><label className="block font-medium text-gray-600 dark:text-gray-400">Seguros (R$/mês)</label><input type="number" name="segurosMensal" value={novoCaso.segurosMensal} onChange={handleInputChange} className="w-full bg-white dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-2 py-1 border border-slate-300 dark:border-[#3e388b]"/></div>
                                <div><label className="block font-medium text-gray-600 dark:text-gray-400">Tarifas (R$/mês)</label><input type="number" name="tarifasMensal" value={novoCaso.tarifasMensal} onChange={handleInputChange} className="w-full bg-white dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-2 py-1 border border-slate-300 dark:border-[#3e388b]"/></div>
                                <div className="md:col-span-2"><label className="block font-medium text-gray-600 dark:text-gray-400">Reajuste Anual do Saldo Devedor (%)</label><input type="number" name="reajusteAnualFinanciamento" value={novoCaso.reajusteAnualFinanciamento} onChange={handleInputChange} className="w-full bg-white dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-2 py-1 border border-slate-300 dark:border-[#3e388b]"/></div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2 border-t border-slate-200 dark:border-[#3e388b] pt-4">Parâmetros do Consórcio</h3>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div><label className="block font-medium text-gray-600 dark:text-gray-400">Taxa Adm Total (%)</label><input type="number" name="taxaAdmTotal" value={novoCaso.taxaAdmTotal} onChange={handleInputChange} className="w-full bg-white dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-2 py-1 border border-slate-300 dark:border-[#3e388b]"/></div>
                                <div><label className="block font-medium text-gray-600 dark:text-gray-400">Prazo (meses)</label><input type="number" name="prazoConsorcio" value={novoCaso.prazoConsorcio} onChange={handleInputChange} className="w-full bg-white dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-2 py-1 border border-slate-300 dark:border-[#3e388b]"/></div>
                                <div><label className="block font-medium text-gray-600 dark:text-gray-400">Lance (%)</label><input type="number" name="lancePercentual" value={novoCaso.lancePercentual} onChange={handleInputChange} className="w-full bg-white dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-2 py-1 border border-slate-300 dark:border-[#3e388b]"/></div>
                                <div><label className="block font-medium text-gray-600 dark:text-gray-400">Reajuste Anual (%)</label><input type="number" name="reajusteAnualConsorcio" value={novoCaso.reajusteAnualConsorcio} onChange={handleInputChange} className="w-full bg-white dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-2 py-1 border border-slate-300 dark:border-[#3e388b]"/></div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-6 flex justify-end gap-4">
                        <button type="button" onClick={handleUpdateCaso} disabled={!casoSelecionado} className="bg-blue-600 text-white font-semibold py-2 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"><Edit size={16}/> Atualizar Simulação</button>
                        <button type="submit" className="bg-[#00d971] text-black font-semibold py-2 px-6 rounded-md hover:brightness-90 flex items-center justify-center gap-2"><PlusCircle size={18}/> Adicionar como Nova</button>
                    </div>
                </form>
            </Card>

            {casos.length > 0 && (
                 <div className="mb-6">
                     <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Simulações Salvas</h3>
                     <div className="flex flex-wrap gap-2">
                        {casos.map(c => (
                            <div key={c.id} className="flex items-center rounded-full bg-white dark:bg-[#2a246f] hover:bg-slate-100 dark:hover:bg-[#3e388b] transition-colors has-[:focus]:ring-2 ring-blue-500/50">
                                <button onClick={() => handleSelectCaso(c)} className={`pl-3 pr-2 py-1 text-xs transition-colors ${casoSelecionado?.id === c.id ? 'text-blue-600 dark:text-[#00d971] font-bold' : 'text-slate-700 dark:text-white'}`}>{c.descricao}</button>
                                <button onClick={(e) => { e.stopPropagation(); handleDeleteCaso(c.id); }} className="pr-2 text-gray-500 dark:text-gray-400 hover:text-red-500"><Trash2 size={12} /></button>
                            </div>
                        ))}
                     </div>
                </div>
            )}
            
            {casoSelecionado && (
                <>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <Card><h3 className="font-bold text-base text-slate-800 dark:text-white">Financiamento</h3><div className="p-2 rounded-lg text-xs"><p className="text-gray-600 dark:text-gray-400">Previsão p/ Entrada:</p><p className="font-bold text-lg text-[#00d971]">{previsaoEntradaFinanciamento.data}</p></div></Card>
                            <Card><h3 className="font-bold text-base text-slate-800 dark:text-white">Consórcio</h3><div className="p-2 rounded-lg text-xs"><p className="text-gray-600 dark:text-gray-400">Previsão p/ Lance:</p><p className="font-bold text-lg text-[#00d971]">{previsaoLanceConsorcio.data}</p></div></Card>
                            <Card><h3 className="font-bold text-base text-slate-800 dark:text-white">À Vista</h3><div className="p-2 rounded-lg text-xs"><p className="text-gray-600 dark:text-gray-400">Previsão para Acumular Valor Total:</p><p className="font-bold text-lg text-[#00d971]">{previsaoAVista.data}</p></div></Card>
                        </div>
                        <Card>
                            <div className="flex justify-center border-b border-slate-200 dark:border-b-[#3e388b] mb-4">
                                <button onClick={() => setActiveChart('acumulo')} className={`px-4 py-2 text-sm font-medium transition-colors ${activeChart === 'acumulo' ? 'border-b-2 border-[#00d971] text-[#00d971]' : 'text-gray-500 dark:text-gray-400'}`}>Acúmulo de Capital</button>
                                <button onClick={() => setActiveChart('capacidade')} className={`px-4 py-2 text-sm font-medium transition-colors ${activeChart === 'capacidade' ? 'border-b-2 border-[#00d971] text-[#00d971]' : 'text-gray-500 dark:text-gray-400'}`}>Capacidade de Poupar</button>
                                <button onClick={() => setActiveChart('parcela')} className={`px-4 py-2 text-sm font-medium transition-colors ${activeChart === 'parcela' ? 'border-b-2 border-[#00d971] text-[#00d971]' : 'text-gray-500 dark:text-gray-400'}`}>Valor da Parcela</button>
                            </div>
                            <div className="h-96">
                               <ReactECharts
                                    option={getChartOptions}
                                    style={{ height: '100%', width: '100%' }}
                                    notMerge={true}
                                    lazyUpdate={true}
                                />
                            </div>
                        </Card>
                    </div>

                    {/* NOVA SEÇÃO DE COMPARATIVO DE CONSÓRCIO */}
                    <div className="mt-8">
                        <h2 className="text-xl font-bold text-slate-800 dark:text-white mb-4">Comparativo de Cenários de Consórcio</h2>
                        <Card className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                                <div>
                                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">Parcela Reduzida (até a contemplação)</label>
                                    <select value={percentualReducao} onChange={(e) => setPercentualReducao(parseFloat(e.target.value))} className="w-full bg-white dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-2 py-1 border border-slate-300 dark:border-[#3e388b]">
                                        <option value="0">Sem Redução</option>
                                        <option value="30">Redução de 30%</option>
                                        <option value="50">Redução de 50%</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block font-medium text-gray-700 dark:text-gray-300 mb-2">Lance Embutido (do valor do crédito)</label>
                                    <select value={percentualEmbutido} onChange={(e) => setPercentualEmbutido(parseFloat(e.target.value))} className="w-full bg-white dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-2 py-1 border border-slate-300 dark:border-[#3e388b]">
                                        <option value="0">Sem Lance Embutido</option>
                                        <option value="10">10%</option>
                                        <option value="20">20%</option>
                                        <option value="30">30%</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                                <Card>
                                    <h3 className="font-bold text-center text-base text-slate-800 dark:text-white mb-2">Acúmulo de Capital (Consórcio)</h3>
                                    <div className="h-80">
                                        <ReactECharts option={getConsorcioChartOptions('acumulo')} style={{ height: '100%', width: '100%' }} notMerge={true} />
                                    </div>
                                </Card>
                                 <Card>
                                    <h3 className="font-bold text-center text-base text-slate-800 dark:text-white mb-2">Capacidade de Poupar (Consórcio)</h3>
                                    <div className="h-80">
                                        <ReactECharts option={getConsorcioChartOptions('capacidade')} style={{ height: '100%', width: '100%' }} notMerge={true} />
                                    </div>
                                </Card>
                                <Card>
                                    <h3 className="font-bold text-center text-base text-slate-800 dark:text-white mb-2">Valor da Parcela (Consórcio)</h3>
                                    <div className="h-80">
                                        <ReactECharts option={getConsorcioChartOptions('parcelas')} style={{ height: '100%', width: '100%' }} notMerge={true} />
                                    </div>
                                </Card>
                            </div>
                        </Card>
                    </div>
                </>
            )}
        </div>
    );
};

export default TelaAquisicaoGenerica;