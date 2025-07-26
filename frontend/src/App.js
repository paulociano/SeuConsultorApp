import { useState, useMemo, useContext, useEffect } from 'react';
import logo from './assets/logo.svg';
import { ThemeContext } from './ThemeContext';
import {
    PiggyBank, BarChart2, Shield, ShoppingCart, ChevronDown, Car, Target, Landmark, Coins, Building2,
    CheckSquare, ArrowRightLeft, TreePalm, CreditCard, Award, PlaneTakeoff, BookOpen, HandCoins,
    ChartLine,
    Plane,
    CalendarDays
} from 'lucide-react';
import { Sun, Moon } from 'lucide-react';
import TelaObjetivos from './pages/Objetivos/TelaObjetivos';
import TelaAutenticacao from './pages/auth/TelaAutenticacao';
import TelaReservaEmergencia from './pages/Reserva/TelaReservaEmergencia';
import TelaAposentadoria from './pages/Aposentadoria/TelaAposentadoria';
import TelaOrcamento from './pages/Orcamento/TelaOrcamento';
import TelaProtecao from './pages/Protecao/TelaProtecao';
import TelaPatrimonio from './pages/Patrimonio/TelaPatrimonio';
import TelaAquisicaoImoveis from './pages/Aquisicao/TelaAquisicaoImoveis';
import TelaAquisicaoAutomoveis from './pages/Aquisicao/TelaAquisicaoAutomoveis';
import TelaFluxoDeCaixa from './pages/Fluxo/TelaFluxoCaixa';
import TelaPlanejamento from './pages/Planejamento/TelaPlanejamento';
import TelaMilhas from './pages/Viagens/TelaMilhas';
import TelaCartoes from './pages/Viagens/TelaCartoes';
import TelaEducacaoFinanceira from './pages/Educacao/TelaEducacaoFinanceira';
import TelaSimuladorPGBL from './pages/Aposentadoria/TelaSimuladorPGBL';
import TelaConfiguracoesPerfil from './pages/Configuracoes/TelaConfiguracoesPerfil';
import TelaReunioesAgenda from './pages/Agenda/TelaReunioesAgenda';
import ModalNovaTransacao from './components/Modals/ModalNovaTransacao';
import { categorizeByAI } from './components/constants/categorizeByAI';
import PageTransition from './utils/PageTransition';
import { toast } from 'sonner';


export default function App() {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const [currentPage, setCurrentPage] = useState('objetivos');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [patrimonioData, setPatrimonioData] = useState({ ativos: [], dividas: [] });
    const [openMenu, setOpenMenu] = useState(null);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [transacoes, setTransacoes] = useState([]);
    const [perfilAberto, setPerfilAberto] = useState(false);
    const [transacaoSelecionada, setTransacaoSelecionada] = useState(null);
    const [usuario, setUsuario] = useState({});
    const [protecao, setProtecao] = useState([]);
    const [isTransacaoModalOpen, setIsTransacaoModalOpen] = useState(false);

    // CORREÇÃO: Efeito para verificar token na montagem inicial
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setIsAuthenticated(true);
        }
        if (theme !== 'dark') {
            toggleTheme();
        }
    }, []); // Executa apenas uma vez

    // CORREÇÃO: Efeito para buscar dados quando autenticado e se os dados não foram carregados
    useEffect(() => {
        const fetchInitialData = async () => {
            // Condição para evitar re-fetching desnecessário
            if (isAuthenticated && !usuario.categorias) {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    setIsAuthenticated(false);
                    return;
                }

                try {
                    const headers = { 'Authorization': `Bearer ${token}` };
                    const [perfilRes, transacoesRes, ativosRes, dividasRes, orcamentoRes] = await Promise.all([
                        fetch('http://localhost:3001/api/perfil', { headers }),
                        fetch('http://localhost:3001/api/transacoes', { headers }),
                        fetch('http://localhost:3001/api/ativos', { headers }),
                        fetch('http://localhost:3001/api/dividas', { headers }),
                        fetch('http://localhost:3001/api/orcamento', { headers })
                    ]);

                    if (!perfilRes.ok || !transacoesRes.ok || !ativosRes.ok || !dividasRes.ok || !orcamentoRes.ok) {
                        throw new Error('Sessão inválida ou falha ao buscar dados');
                    }

                    const perfilData = await perfilRes.json();
                    const transacoesData = await transacoesRes.json();
                    const ativosData = await ativosRes.json();
                    const dividasData = await dividasRes.json();
                    const orcamentoData = await orcamentoRes.json();
                    
                    setProtecao(perfilData.protecao || []);
                    setTransacoes(transacoesData || []);
                    setPatrimonioData({ ativos: ativosData || [], dividas: dividasData || [] });
                    // Unifica a atualização do estado do usuário
                    setUsuario({ ...perfilData.usuario, categorias: orcamentoData || [] });

                } catch (error) {
                    console.error('Erro ao buscar dados iniciais:', error);
                    localStorage.removeItem('authToken');
                    setIsAuthenticated(false);
                }
            }
        };
        
        fetchInitialData();
    }, [isAuthenticated, usuario]); // Depende do estado de autenticação e do usuário


    const handleSaveTransacao = async (transacao) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        const isEdicao = !!transacao.id;
        const method = isEdicao ? 'PUT' : 'POST';
        const endpoint = isEdicao ? `http://localhost:3001/api/transacoes/${transacao.id}` : 'http://localhost:3001/api/transacoes';

        try {
            const response = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(transacao)
            });

            if (!response.ok) throw new Error("Falha ao salvar a transação.");
            
            const transacaoSalva = await response.json();

            if (isEdicao) {
                setTransacoes(prev => prev.map(t => t.id === transacaoSalva.id ? transacaoSalva : t));
                toast.success("Transação atualizada!");
            } else {
                setTransacoes(prev => [transacaoSalva, ...prev]);
                toast.success("Transação adicionada!");
            }

            setIsTransacaoModalOpen(false);
            setTransacaoSelecionada(null);

        } catch (error) {
            toast.error("Erro ao salvar transação.");
        }
    };
    
    const handleDeleteTransacao = async (transactionId) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        if (!window.confirm("Tem certeza que deseja apagar esta transação?")) return;

        try {
            const response = await fetch(`http://localhost:3001/api/transacoes/${transactionId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error("Falha ao apagar a transação.");

            setTransacoes(prev => prev.filter(t => t.id !== transactionId));
            toast.success("Transação apagada!");

        } catch (error) {
            toast.error("Erro ao apagar transação.");
        }
    };

    const handleSavePatrimonioItem = async (item, tipoItem) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        const isEdicao = !!item.id;
        const method = isEdicao ? 'PUT' : 'POST';
        const endpoint = isEdicao ? `http://localhost:3001/api/${tipoItem}/${item.id}` : `http://localhost:3001/api/${tipoItem}`;

        try {
            const response = await fetch(endpoint, {
                method: method,
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(item)
            });

            if (!response.ok) throw new Error(`Falha ao salvar ${tipoItem}.`);

            const itemSalvo = await response.json();

            setPatrimonioData(prev => {
                const listaAtualizada = isEdicao
                    ? prev[tipoItem].map(i => i.id === itemSalvo.id ? itemSalvo : i)
                    : [itemSalvo, ...prev[tipoItem]];
                return { ...prev, [tipoItem]: listaAtualizada };
            });
            
            toast.success(`${tipoItem.slice(0, -1)} salvo com sucesso!`);

        } catch (error) {
            toast.error(`Erro ao salvar ${tipoItem.slice(0, -1)}.`);
        }
    };

    const handleDeletePatrimonioItem = async (itemId, tipoItem) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        if (!window.confirm(`Tem certeza que deseja apagar este item?`)) return;

        try {
            const response = await fetch(`http://localhost:3001/api/${tipoItem}/${itemId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error(`Falha ao apagar ${tipoItem}.`);

            setPatrimonioData(prev => ({
                ...prev,
                [tipoItem]: prev[tipoItem].filter(i => i.id !== itemId)
            }));

            toast.success(`${tipoItem.slice(0, -1)} apagado com sucesso!`);

        } catch (error) {
            toast.error(`Erro ao apagar ${tipoItem.slice(0, -1)}.`);
        }
    };

    const handleUpdateOrcamentoMeta = async (itemId, novoValorPlanejado) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        try {
            const response = await fetch(`http://localhost:3001/api/orcamento/itens/${itemId}/meta`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ valor_planejado: novoValorPlanejado })
            });

            if (!response.ok) throw new Error('Falha ao atualizar a meta.');
            const itemAtualizado = await response.json();

            setUsuario(prevUsuario => {
                const novasCategorias = prevUsuario.categorias.map(cat => ({
                    ...cat,
                    subItens: cat.subItens.map(item => 
                        item.id === itemAtualizado.id 
                        ? { ...item, sugerido: parseFloat(itemAtualizado.valor_planejado) } 
                        : item
                    )
                }));
                return { ...prevUsuario, categorias: novasCategorias };
            });
            toast.success("Meta do orçamento atualizada!");
        } catch (error) {
            toast.error("Erro ao atualizar a meta.");
        }
    };

    const handleSaveOrcamentoItem = async (itemData, categoriaPaiId) => {
    const token = localStorage.getItem('authToken');
    if (!token) return;

    const isEdicao = !!itemData.id;
    const method = isEdicao ? 'PUT' : 'POST';
    const endpoint = isEdicao 
        ? `http://localhost:3001/api/orcamento/itens/${itemData.id}` 
        : 'http://localhost:3001/api/orcamento/itens';

    // O corpo da requisição está correto e envia todos os dados necessários
    const body = {
        nome: itemData.nome,
        valor_planejado: itemData.valor_planejado,
        categoria_planejamento: itemData.categoria_planejamento,
    };

    if (isEdicao) {
        const itemOriginal = usuario.categorias
            .flatMap(c => c.subItens)
            .find(i => i.id === itemData.id);
        body.valor_atual = itemOriginal?.atual || 0; // Mantém o valor_atual existente
    } else {
        body.categoria_id = categoriaPaiId; // ID da categoria-pai (ex: Despesas Fixas)
    }

    try {
        const response = await fetch(endpoint, {
            method,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify(body)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.message || 'Falha ao salvar o item do orçamento.');
        }
        
        const itemSalvo = await response.json();
        const itemFormatado = {
            id: itemSalvo.id,
            nome: itemSalvo.nome,
            sugerido: parseFloat(itemSalvo.valor_planejado),
            atual: parseFloat(itemSalvo.valor_atual),
            categoria_planejamento: itemSalvo.categoria_planejamento
        };

        // CORREÇÃO: Lógica de atualização de estado foi simplificada e robustecida.
        setUsuario(prev => {
            const novasCategorias = prev.categorias.map(cat => {
                // Para cada categoria-pai, mapeamos seus sub-itens
                const novosSubItens = cat.subItens.map(subItem => {
                    // Se o sub-item atual for o que acabamos de editar, retornamos a versão nova e formatada.
                    if (subItem.id === itemFormatado.id) {
                        return itemFormatado;
                    }
                    // Caso contrário, retornamos o sub-item sem alterações.
                    return subItem;
                });

                // Se for um item novo, adicionamos ele à categoria-pai correta
                if (!isEdicao && cat.id === itemSalvo.categoria_id) {
                    novosSubItens.push(itemFormatado);
                }

                // Retornamos a categoria-pai com a lista de sub-itens potencialmente atualizada
                return { ...cat, subItens: novosSubItens };
            });

            // Retornamos o novo estado do usuário
            return { ...prev, categorias: novasCategorias };
        });

        toast.success(`Item ${isEdicao ? 'atualizado' : 'adicionado'} com sucesso!`);
    } catch (error) {
        toast.error(`Erro ao salvar: ${error.message}`);
    }
};

    const handleDeleteOrcamentoItem = async (itemId) => {
        const token = localStorage.getItem('authToken');
        if (!token) return;

        if (!window.confirm("Tem certeza que deseja apagar este item do orçamento?")) return;

        try {
            const response = await fetch(`http://localhost:3001/api/orcamento/itens/${itemId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Falha ao apagar o item.');

            setUsuario(prev => {
                const novasCategorias = prev.categorias.map(cat => ({
                    ...cat,
                    subItens: cat.subItens.filter(item => item.id !== itemId)
                }));
                return { ...prev, categorias: novasCategorias };
            });
            toast.success("Item apagado com sucesso!");
        } catch (error) {
            toast.error("Erro ao apagar o item.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
        setUsuario({});
        setTransacoes([]);
        setPatrimonioData({ ativos: [], dividas: [] });
        setCurrentPage('objetivos'); // Reset page
        if (theme !== 'dark') {
            toggleTheme();
        }
    };

    const setUsuarioCategorias = (newCategorias) => {
        setUsuario(prevUsuario => ({
            ...prevUsuario,
            categorias: newCategorias
        }));
    };

    const handleEditClick = (transacao) => {
        setTransacaoSelecionada(transacao);
        setIsTransacaoModalOpen(true);
    };

    function handleUpdateCobertura(id, novoValor) {
        setProtecao(prev =>
            prev.map(p => p.id === id ? { ...p, valor: novoValor } : p)
        );
    };

    const { orcamentoCalculos, pieChartData } = useMemo(() => {
        if (!usuario.categorias) return { orcamentoCalculos: {}, pieChartData: [] };
        const totais = { atual: { receitas: 0, despesas: 0 }, sugerido: { receitas: 0, despesas: 0 } };
        const totaisCategorias = { fixos: 0, variaveis: 0, investimentos: 0, renda: 0 };
        let pieData = [];
        if (usuario.categorias && usuario.categorias.length > 0) {
            usuario.categorias.forEach(cat => {
                const totalCatAtual = cat.subItens.reduce((acc, item) => acc + item.atual, 0);
                const totalCatSugerido = cat.subItens.reduce((acc, item) => acc + item.sugerido, 0);
                if (cat.tipo === 'receita') {
                    totais.atual.receitas += totalCatAtual;
                    totais.sugerido.receitas += totalCatSugerido;
                    totaisCategorias.renda += totalCatAtual;
                } else {
                    totais.atual.despesas += totalCatAtual;
                    totais.sugerido.despesas += totalCatSugerido;
                    pieData.push({ name: cat.nome, valueAtual: totalCatAtual, valueSugerido: totalCatSugerido });
                    if(cat.id === 'fixo') totaisCategorias.fixos += totalCatAtual;
                    if(cat.id === 'variavel') totaisCategorias.variaveis += totalCatAtual;
                    if(cat.id === 'investimento') totaisCategorias.investimentos += totalCatAtual;
                }
            });
        }
        const finalPieData = pieData.map(d => ({
            ...d,
            percAtual: totais.atual.despesas > 0 ? ((d.valueAtual / totais.atual.despesas) * 100).toFixed(1) : "0.0",
            percSugerido: totais.sugerido.despesas > 0 ? ((d.valueSugerido / totais.sugerido.despesas) * 100).toFixed(1) : "0.0",
        }));
        return { orcamentoCalculos: { ...totais, categorias: totaisCategorias }, pieChartData: finalPieData };
    }, [usuario.categorias]);

    const custoDeVidaMensal = useMemo(() => {
        if (!usuario.categorias || usuario.categorias.length === 0) return 0;
        return usuario.categorias
            .filter(c => c.id === 'fixo' || c.id === 'variavel')
            .reduce((acc, cat) => acc + cat.subItens.reduce((subAcc, item) => subAcc + item.atual, 0), 0);
    }, [usuario.categorias]);

    const patrimonioTotal = useMemo(() => {
        if (!patrimonioData || !patrimonioData.dividas) return 0;
        const totalAtivos = patrimonioData.ativos.reduce((sum, item) => sum + parseFloat(item.valor), 0);
        const totalDividas = patrimonioData.dividas.reduce((sum, item) => sum + parseFloat(item.valor), 0);
        return totalAtivos - totalDividas;
    }, [patrimonioData]);

    const handleCategoryChange = (transactionId, newCategory) => {
        setTransacoes(prev => prev.map(t => t.id === transactionId ? { ...t, category: newCategory || null } : t));
    };

    const handleIgnoreToggle = (transactionId) => {
        setTransacoes(prev => prev.map(t => t.id === transactionId ? { ...t, isIgnored: !t.isIgnored } : t));
    };

    const handleEditarMeta = (categoriaId, novaMeta) => {
        setUsuarioCategorias(prev =>
            prev.map(cat => {
                if (cat.tipo !== 'despesa') return cat;
                return { ...cat, subItens: cat.subItens.map(sub => sub.categoriaId === categoriaId ? { ...sub, sugerido: novaMeta } : sub) };
            })
        );
    };

    const menuItems = [
        { id: 'objetivos', label: 'Objetivos', icon: Target },
        { id: 'orcamento', label: 'Orçamento', icon: BarChart2 },
        { id: 'fluxo', label: 'Fluxo', icon: ArrowRightLeft,
            subItems: [
                { id: 'fluxoTransacoes', label: 'Transações', icon: Coins },
                { id: 'fluxoPlanejamento', label: 'Planejamento', icon: CheckSquare },
            ]
        },
        { id: 'patrimonio', label: 'Patrimônio', icon: Landmark },
        { id: 'protecao', label: 'Proteção', icon: Shield },
        { id: 'reserva', label: 'Reserva', icon: PiggyBank },
        {
            id: 'aposentadoria',
            label: 'Aposentadoria',
            icon: TreePalm,
            subItems: [
                { id:'aposentadoriaAportes', label: 'Aportes', icon: ChartLine},
                { id:'aposentadoriaPGBL', label: 'Estratégia PGBL', icon: HandCoins},
            ]
        },
        {
        id: 'aquisicao',
        label: 'Aquisição',
        icon: ShoppingCart,
        subItems: [
            { id: 'aquisicaoImoveis', label: 'Imóveis', icon: Building2 },
            { id: 'aquisicaoAutomoveis', label: 'Automóveis', icon: Car },
        ]
        },
        {
        id: 'viagens',
        label: 'Viagens',
        icon: Plane,
        subItems: [
            { id: 'viagensMilhas', label: 'Planejamento de Milhas', icon: PlaneTakeoff },
            { id: 'viagensCartoes', label: 'Cartões de Crédito', icon: CreditCard },
        ]
        },
        { id: 'EducacaoFinanceira', label: 'Educação Financeira', icon: BookOpen },
        { id: 'agendaReunioes', label: 'Reuniões e Agenda', icon: CalendarDays }
    ];

    const renderPage = () => {
        let content;
        if (!isAuthenticated) {
            return <TelaAutenticacao setIsAuthenticated={setIsAuthenticated} setUsuario={setUsuario} />;
        }
        
        switch (currentPage) {
            case 'orcamento':
                if (!usuario || !usuario.categorias) {
                    return <div className="flex justify-center items-center h-full text-lg">Carregando...</div>;
                }
                content = <TelaOrcamento 
                    categorias={usuario.categorias} 
                    onUpdateMeta={handleUpdateOrcamentoMeta}
                    onSaveItem={handleSaveOrcamentoItem}
                    onDeleteItem={handleDeleteOrcamentoItem}
                    orcamentoCalculos={orcamentoCalculos} 
                    pieChartData={pieChartData} 
                />;
                break;
            case 'protecao': content = <TelaProtecao rendaMensal={orcamentoCalculos.atual.receitas} custoDeVidaMensal={custoDeVidaMensal} patrimonioTotal={patrimonioTotal} protecao={protecao} onUpdateCobertura={handleUpdateCobertura}/>; break;
            case 'reserva': content = <TelaReservaEmergencia orcamentoCalculos={orcamentoCalculos} />; break;
            case 'aposentadoriaAportes': content = <TelaAposentadoria />; break;
            case 'patrimonio': 
                content = <TelaPatrimonio 
                    patrimonioData={patrimonioData} 
                    patrimonioTotal={patrimonioTotal}
                    onSaveItem={handleSavePatrimonioItem}
                    onDeleteItem={handleDeletePatrimonioItem}
                />; 
                break;
            case 'fluxoTransacoes':
                content = <TelaFluxoDeCaixa 
                    transacoes={transacoes} 
                    handleCategoryChange={handleCategoryChange} 
                    handleIgnoreToggle={handleIgnoreToggle} 
                    onAdicionarClick={() => {setTransacaoSelecionada(null); setIsTransacaoModalOpen(true);}} 
                    onEditClick={handleEditClick}
                    onDeleteClick={handleDeleteTransacao}
                />; 
                break;
            case 'fluxoPlanejamento': content = <TelaPlanejamento orcamento={usuario.categorias} gastosReais={transacoes} onEditarMeta={handleEditarMeta} />; break;
            case 'aquisicaoImoveis': content = <TelaAquisicaoImoveis />; break;
            case 'aquisicaoAutomoveis': content = <TelaAquisicaoAutomoveis />; break;
            case 'objetivos': content = <TelaObjetivos />; break;
            case 'viagensMilhas': content = <TelaMilhas />; break;
            case 'viagensCartoes': content = <TelaCartoes />; break;
            case 'EducacaoFinanceira': content = <TelaEducacaoFinanceira />; break;
            case 'aposentadoriaPGBL': content = <TelaSimuladorPGBL />; break;
            case 'configuracoesPerfil': content = <TelaConfiguracoesPerfil usuario={usuario} setUsuario={setUsuario} />; break;
            case 'agendaReunioes': content = <TelaReunioesAgenda />; break;
            default: content = <TelaObjetivos />; break;
        }

        return <PageTransition key={currentPage}>{content}</PageTransition>;
    };

    if (!isAuthenticated) {
        return renderPage();
    }

    const ThemeToggleButton = () => (
        <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-[#3e388b]/50">
            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
    );

    return (
        <div className="bg-slate-100 dark:bg-gray-900 text-slate-900 dark:text-white min-h-screen font-sans">
            <aside className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-[#201b5d] shadow-md z-20 flex flex-col">
                <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-[#3e388b]">
                    <div className="flex items-center gap-2">
                        <img src={logo} alt="Logo SeuConsultor" className="h-6 w-auto" style={{ filter: 'invert(42%) sepia(93%) saturate(2000%) hue-rotate(133deg) brightness(100%) contrast(107%)' }} />
                        <span className="font-montserrat text-slate-900 dark:text-white text-sm font-extrabold">SeuConsultor</span>
                    </div>
                    <ThemeToggleButton />
                </div>
                <nav className="flex-1 overflow-y-auto p-3 space-y-1">
                    {menuItems.map(item => (
                        <div key={item.id}>
                            <button
                                onClick={() => {
                                    if (item.subItems) {
                                        setOpenMenu(openMenu === item.id ? null : item.id);
                                    } else {
                                        setCurrentPage(item.id);
                                        setOpenMenu(null);
                                    }
                                }}
                                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-left transition-colors duration-200 ${currentPage.startsWith(item.id) ? 'bg-slate-200 dark:bg-[#00d971] text-slate-900 dark:text-black' : 'text-gray-600 dark:text-white hover:bg-slate-100 dark:hover:bg-[#3e388b]/50'}`}
                            >
                                <span className="flex items-center gap-2"><item.icon size={16} />{item.label}</span>
                                {item.subItems && <ChevronDown size={14} className={`transform transition-transform ${openMenu === item.id ? 'rotate-180' : ''}`} />}
                            </button>
                            {item.subItems && openMenu === item.id && (
                                <div className="ml-6 mt-1 space-y-1">
                                    {item.subItems.map(sub => (
                                        <button key={sub.id} onClick={() => { setCurrentPage(sub.id); setOpenMenu(null); }} className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm w-full text-left ${currentPage === sub.id ? 'bg-slate-100 dark:bg-[#00d971] text-slate-900 dark:text-black' : 'text-gray-500 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-[#3e388b]/50'}`}>
                                            <sub.icon size={14} />{sub.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>
                <div className="border-t border-slate-200 dark:border-[#3e388b] p-3">
                    <button onClick={() => setPerfilAberto(prev => !prev)} className="w-full flex items-center justify-between hover:bg-slate-100 dark:hover:bg-[#3e388b]/50 px-3 py-2 rounded-md transition">
                        <div className="flex items-center gap-3">
                            {usuario.imagem_url ? (
                                <img src={usuario.imagem_url} alt="avatar" className="w-8 h-8 rounded-full object-cover border" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-[#00d971] text-black font-bold flex items-center justify-center">
                                    {usuario.nome?.[0]?.toUpperCase() || 'U'}
                                </div>
                            )}
                            <span className="text-sm font-medium text-slate-800 dark:text-white">{usuario.nome}</span>
                        </div>
                        <ChevronDown size={16} className={`transition-transform duration-300 ${!perfilAberto ? 'rotate-180' : 'rotate-0'}`} />
                    </button>
                    <div className={`grid transition-all duration-300 ease-in-out ${perfilAberto ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0 mt-0'} overflow-hidden`}>
                        <div className="min-h-0">
                            <div className="space-y-2 pl-11">
                                <button onClick={() => { setCurrentPage('configuracoesPerfil'); setPerfilAberto(false); }} className="w-full text-left text-sm text-gray-600 dark:text-gray-300 hover:underline">⚙️ Configurações</button>
                                <button onClick={handleLogout} className="w-full text-left text-sm text-red-500 hover:underline">⏻ Sair</button>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
            {isMobileMenuOpen && (
                <div className="md:hidden bg-white dark:bg-[#201b5d] shadow-lg">
                    {/* ... Lógica do menu mobile ... */}
                </div>
            )}
            <main className="ml-64 p-4 md:p-6 transition-all duration-300">{renderPage()}</main>
            {isTransacaoModalOpen && (
                <ModalNovaTransacao
                    transacao={transacaoSelecionada}
                    onSave={handleSaveTransacao}
                    onClose={() => {
                        setIsTransacaoModalOpen(false);
                        setTransacaoSelecionada(null);
                    }}
                />
            )}
        </div>
    );
}