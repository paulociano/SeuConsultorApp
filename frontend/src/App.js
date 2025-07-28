import { useState, useMemo, useContext, useEffect } from 'react';
import { Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
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
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
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
import PageTransition from './utils/PageTransition';
import { toast } from 'sonner';

// Componente interno para conter a lógica principal e poder usar os hooks do Router
const AppContent = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const navigate = useNavigate();
    const location = useLocation();
    
    // State for UI and navigation
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [openMenu, setOpenMenu] = useState('objetivos');
    const [perfilAberto, setPerfilAberto] = useState(false);
    const [transacaoSelecionada, setTransacaoSelecionada] = useState(null);
    const [isTransacaoModalOpen, setIsTransacaoModalOpen] = useState(false);
    
    // Application data states
    const [usuario, setUsuario] = useState({});
    const [transacoes, setTransacoes] = useState([]);
    const [patrimonioData, setPatrimonioData] = useState({ ativos: [], dividas: [] });
    const [protecaoData, setProtecaoData] = useState({ invalidez: [], despesasFuturas: [], patrimonial: [] });
    const [aposentadoriaData, setAposentadoriaData] = useState(null);
    const [simuladorPgblData, setSimuladorPgblData] = useState(null);
    const [aquisicaoData, setAquisicaoData] = useState({ imoveis: [], automoveis: [] });
    const [milhasData, setMilhasData] = useState({ carteiras: [], metas: [] });
    const [atas, setAtas] = useState([]);
    const [agenda, setAgenda] = useState([]);
    const [objetivos, setObjetivos] = useState([]);
    const [reservaInvestimentos, setReservaInvestimentos] = useState({});

    // Effect to check for existing token on initial load
    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (token) {
            setIsAuthenticated(true);
        } else {
            navigate('/login');
        }
    }, [navigate]);

    // Effect to fetch all initial data when user is authenticated
    useEffect(() => {
        const fetchInitialData = async () => {
            if (isAuthenticated) {
                const token = localStorage.getItem('authToken');
                if (!token) {
                    setIsAuthenticated(false);
                    return;
                }
                try {
                    const headers = { 'Authorization': `Bearer ${token}` };
                    const endpoints = [
                        'perfil', 'transacoes', 'ativos', 'dividas', 'orcamento', 'aposentadoria',
                        'simulador-pgbl', 'aquisicoes/imoveis', 'aquisicoes/automoveis',
                        'milhas/carteiras', 'milhas/metas', 'atas', 'agenda', 'objetivos'
                    ];
                    const requests = endpoints.map(endpoint => fetch(`http://localhost:3001/api/${endpoint}`, { headers }));
                    const responses = await Promise.all(requests);

                    for (const res of responses) {
                        if (!res.ok) {
                            if (res.status === 401 || res.status === 403) throw new Error('Sessão inválida ou expirada');
                            throw new Error('Falha ao buscar dados do servidor');
                        }
                    }
                    
                    const data = await Promise.all(responses.map(res => res.json()));
                    
                    const perfilData = data[0];
                    setProtecaoData(perfilData.protecao || { invalidez: [], despesasFuturas: [], patrimonial: [] });
                    setUsuario({ ...perfilData.usuario, categorias: data[4] || [] });
                    setTransacoes(data[1] || []);
                    setPatrimonioData({ ativos: data[2] || [], dividas: data[3] || [] });
                    setAposentadoriaData(data[5]);
                    setSimuladorPgblData(data[6]);
                    setAquisicaoData({ imoveis: data[7] || [], automoveis: data[8] || [] });
                    setMilhasData({ carteiras: data[9] || [], metas: data[10] || [] });
                    setAtas(data[11] || []);
                    setAgenda(data[12] || []);
                    setObjetivos(data[13] || []);

                } catch (error) {
                    console.error('Erro ao buscar dados iniciais:', error);
                    toast.error(error.message || 'Sua sessão expirou. Faça login novamente.');
                    handleLogout();
                }
            }
        };
        fetchInitialData();
    }, [isAuthenticated]);

    // --- API Request Helper ---
    const apiRequest = async (endpoint, method = 'GET', body = null) => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            toast.error("Usuário não autenticado.");
            handleLogout();
            return null;
        }
        try {
            const options = {
                method,
                headers: { 'Authorization': `Bearer ${token}` }
            };
            if (body) {
                options.headers['Content-Type'] = 'application/json';
                options.body = JSON.stringify(body);
            }
            const response = await fetch(`http://localhost:3001/api${endpoint}`, options);
            if (response.status === 204) return true;
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `Erro ${response.status}` }));
                if(response.status === 401 || response.status === 403) handleLogout();
                throw new Error(errorData.message || `Falha na requisição ${method} ${endpoint}`);
            }
            return response.json();
        } catch (error) {
            toast.error(error.message);
            return null;
        }
    };
    
    // --- CRUD Handlers ---
    const handleSaveObjetivo = async (objetivo) => {
        const isEditing = !!objetivo.id;
        const endpoint = isEditing ? `/objetivos/${objetivo.id}` : '/objetivos';
        const method = isEditing ? 'PUT' : 'POST';
        
        const savedObjetivo = await apiRequest(endpoint, method, objetivo);
        
        if (savedObjetivo) {
            if (isEditing) {
                setObjetivos(prev => prev.map(o => o.id === savedObjetivo.id ? savedObjetivo : o));
            } else {
                setObjetivos(prev => [...prev, savedObjetivo]);
            }
            toast.success('Objetivo salvo com sucesso!');
        }
    };

    const handleDeleteObjetivo = async (objetivoId) => {
        if (!window.confirm("Tem certeza que deseja apagar este objetivo?")) return;
        if (await apiRequest(`/objetivos/${objetivoId}`, 'DELETE')) {
            setObjetivos(prev => prev.filter(o => o.id !== objetivoId));
            toast.success("Objetivo apagado!");
        }
    };

    const handleSaveProtecaoItem = async (item, tipo) => {
        const endpoint = item.id ? `/protecao/${tipo}/${item.id}` : `/protecao/${tipo}`;
        const method = item.id ? 'PUT' : 'POST';
        const savedItem = await apiRequest(endpoint, method, item);
        if (savedItem) {
            const stateKey = tipo === 'despesas' ? 'despesasFuturas' : tipo;
            setProtecaoData(prev => ({ ...prev, [stateKey]: item.id ? prev[stateKey].map(i => i.id === savedItem.id ? savedItem : i) : [savedItem, ...prev[stateKey]] }));
            toast.success("Item de proteção salvo!");
        }
    };
    const handleDeleteProtecaoItem = async (itemId, tipo) => {
        if (!window.confirm("Tem certeza?")) return;
        if (await apiRequest(`/protecao/${tipo}/${itemId}`, 'DELETE')) {
            const stateKey = tipo === 'despesas' ? 'despesasFuturas' : tipo;
            setProtecaoData(prev => ({ ...prev, [stateKey]: prev[stateKey].filter(i => i.id !== itemId) }));
            toast.success("Item apagado!");
        }
    };
    const handleSaveTransacao = async (transacao) => {
        const endpoint = transacao.id ? `/transacoes/${transacao.id}` : '/transacoes';
        const method = transacao.id ? 'PUT' : 'POST';
        const savedTransacao = await apiRequest(endpoint, method, transacao);
        if (savedTransacao) {
            setTransacoes(prev => transacao.id ? prev.map(t => t.id === savedTransacao.id ? savedTransacao : t) : [savedTransacao, ...prev]);
            toast.success('Transação salva!');
        }
    };
    const handleDeleteTransacao = async (transactionId) => {
        if (!window.confirm("Tem certeza?")) return;
        if (await apiRequest(`/transacoes/${transactionId}`, 'DELETE')) {
            setTransacoes(prev => prev.filter(t => t.id !== transactionId));
            toast.success('Transação apagada!');
        }
    };
    const handleSavePatrimonioItem = async (item, tipoItem) => {
        const endpoint = item.id ? `/${tipoItem}/${item.id}` : `/${tipoItem}`;
        const method = item.id ? 'PUT' : 'POST';
        const savedItem = await apiRequest(endpoint, method, item);
        if (savedItem) {
            setPatrimonioData(prev => ({ ...prev, [tipoItem]: item.id ? prev[tipoItem].map(i => i.id === savedItem.id ? savedItem : i) : [savedItem, ...prev[tipoItem]] }));
            toast.success("Item de patrimônio salvo!");
        }
    };
    const handleDeletePatrimonioItem = async (itemId, tipoItem) => {
        if (!window.confirm("Tem certeza?")) return;
        if (await apiRequest(`/${tipoItem}/${itemId}`, 'DELETE')) {
            setPatrimonioData(prev => ({ ...prev, [tipoItem]: prev[tipoItem].filter(i => i.id !== itemId) }));
            toast.success("Item apagado!");
        }
    };
    const handleSaveAposentadoria = async (data) => {
        const savedData = await apiRequest('/aposentadoria', 'POST', data);
        if (savedData) { setAposentadoriaData(savedData); toast.success("Plano de aposentadoria salvo!"); }
    };
    const handleSaveSimuladorPgbl = async (data) => {
        const savedData = await apiRequest('/simulador-pgbl', 'POST', data);
        if (savedData) { setSimuladorPgblData(savedData); toast.success("Simulação PGBL/VGBL salva!"); }
    };
    const handleSaveAquisicao = async (tipo, casos) => {
        const savedCasos = await apiRequest(`/aquisicoes/${tipo}`, 'POST', casos);
        if (savedCasos) { setAquisicaoData(prev => ({ ...prev, [tipo]: savedCasos })); toast.success("Simulações salvas!"); }
    };

    
    const handleSaveOrcamentoItem = async (itemData, categoriaPaiId) => {
        const isEditing = !!itemData.id;
        const endpoint = isEditing ? `/orcamento/itens/${itemData.id}` : '/orcamento/itens';
        const method = isEditing ? 'PUT' : 'POST';

        const payload = {
            nome: itemData.nome,
            valor_planejado: itemData.sugerido,
            valor_atual: itemData.atual,
            categoria_planejamento: itemData.categoria_planejamento
        };
        if (!isEditing) {
            payload.categoria_id = categoriaPaiId;
        }
        
        const itemSalvo = await apiRequest(endpoint, method, payload);

        if (itemSalvo) {
            setUsuario(currentUser => {
                const novasCategorias = JSON.parse(JSON.stringify(currentUser.categorias));
                const categoriaAlvo = novasCategorias.find(cat => cat.id === (isEditing ? itemSalvo.categoria_id : categoriaPaiId));

                if (!categoriaAlvo) {
                    console.error("Lógica de atualização falhou: Categoria não encontrada.");
                    return currentUser;
                }

                if (isEditing) {
                    const itemIndex = categoriaAlvo.subItens.findIndex(i => i.id === itemSalvo.id);
                    if (itemIndex > -1) {
                        categoriaAlvo.subItens[itemIndex] = {
                            ...categoriaAlvo.subItens[itemIndex],
                            id: itemSalvo.id,
                            nome: itemSalvo.nome,
                            sugerido: parseFloat(itemSalvo.valor_planejado),
                            atual: parseFloat(itemSalvo.valor_atual),
                            categoria_planejamento: itemSalvo.categoria_planejamento
                        };
                    }
                } else {
                    categoriaAlvo.subItens.push({
                        id: itemSalvo.id,
                        nome: itemSalvo.nome,
                        sugerido: parseFloat(itemSalvo.valor_planejado),
                        atual: parseFloat(itemSalvo.valor_atual),
                        categoria_planejamento: itemSalvo.categoria_planejamento
                    });
                }
                
                return {
                    ...currentUser,
                    categorias: novasCategorias,
                };
            });

            toast.success('Item do orçamento salvo!');
        }
    };

    const handleDeleteOrcamentoItem = async (itemId) => {
        if (!window.confirm("Tem certeza?")) return;
        if (await apiRequest(`/orcamento/itens/${itemId}`, 'DELETE')) {
            setUsuario(prev => ({ ...prev, categorias: prev.categorias.map(cat => ({ ...cat, subItens: cat.subItens.filter(i => i.id !== itemId) })) }));
            toast.success('Item do orçamento apagado.');
        }
    };
    const handleSaveMilhasItem = async (item, tipo) => {
        const endpoint = item.id ? `/milhas/${tipo}/${item.id}` : `/milhas/${tipo}`;
        const method = item.id ? 'PUT' : 'POST';
        const savedItem = await apiRequest(endpoint, method, item);
        if (savedItem) {
            setMilhasData(prev => ({ ...prev, [tipo]: item.id ? prev[tipo].map(i => i.id === savedItem.id ? savedItem : i) : [savedItem, ...prev[tipo]] }));
            toast.success(`Item de ${tipo === 'carteiras' ? 'carteira' : 'meta'} salvo!`);
        }
    };
    const handleDeleteMilhasItem = async (itemId, tipo) => {
        if (!window.confirm("Tem certeza?")) return;
        if (await apiRequest(`/milhas/${tipo}/${itemId}`, 'DELETE')) {
            setMilhasData(prev => ({ ...prev, [tipo]: prev[tipo].filter(i => i.id !== itemId) }));
            toast.success("Item apagado!");
        }
    };
    const handleSaveAta = async (ata) => {
        const endpoint = ata.id ? `/atas/${ata.id}` : '/atas';
        const method = ata.id ? 'PUT' : 'POST';
        const savedAta = await apiRequest(endpoint, method, ata);
        if (savedAta) {
            setAtas(prev => ata.id ? prev.map(a => a.id === savedAta.id ? savedAta : a) : [savedAta, ...prev]);
            toast.success(`Ata ${ata.id ? 'atualizada' : 'salva'}!`);
        }
        return savedAta;
    };
    const handleDeleteAta = async (ataId) => {
        if (!window.confirm("Tem certeza?")) return;
        if (await apiRequest(`/atas/${ataId}`, 'DELETE')) {
            setAtas(prev => prev.filter(a => a.id !== ataId));
            toast.success('Ata apagada!');
        }
    };
    const handleSaveCompromisso = async (compromisso) => {
        const endpoint = compromisso.id ? `/agenda/${compromisso.id}` : '/agenda';
        const method = compromisso.id ? 'PUT' : 'POST';
        const savedCompromisso = await apiRequest(endpoint, method, compromisso);
        if (savedCompromisso) {
            setAgenda(prev => {
                const newList = compromisso.id ? prev.map(c => c.id === savedCompromisso.id ? savedCompromisso : c) : [savedCompromisso, ...prev];
                return newList.sort((a, b) => new Date(a.data) - new Date(b.data));
            });
            toast.success(`Compromisso ${compromisso.id ? 'atualizado' : 'salvo'}!`);
        }
        return savedCompromisso;
    };
    const handleDeleteCompromisso = async (compromissoId) => {
        if (!window.confirm("Tem certeza?")) return;
        if (await apiRequest(`/agenda/${compromissoId}`, 'DELETE')) {
            setAgenda(prev => prev.filter(c => c.id !== compromissoId));
            toast.success('Compromisso apagado!');
        }
    };


    const handleLogout = () => {
        localStorage.removeItem('authToken');
        setIsAuthenticated(false);
        setUsuario({}); setTransacoes([]); setPatrimonioData({ ativos: [], dividas: [] });
        setProtecaoData({ invalidez: [], despesasFuturas: [], patrimonial: [] });
        setAposentadoriaData(null); setSimuladorPgblData(null);
        setAquisicaoData({ imoveis: [], automoveis: [] }); setMilhasData({ carteiras: [], metas: [] });
        setAtas([]); setAgenda([]);
        setObjetivos([]);
        setReservaInvestimentos({});
        navigate('/login');
    };

    const { orcamentoCalculos, donutChartData } = useMemo(() => {
        const normalizeString = (str) => str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const defaultReturn = {
            orcamentoCalculos: { totalReceitas: { atual: 0, sugerido: 0 }, totalDespesas: { atual: 0, sugerido: 0 }, saldoAtual: 0, saldoSugerido: 0 },
            donutChartData: []
        };
        if (!usuario || !usuario.categorias || usuario.categorias.length === 0) return defaultReturn;
        try {
            let totalReceitasAtual = 0;
            let totalDespesasAtual = 0;
            const totaisDespesasPorTipo = { 'Fixos': 0, 'Variáveis': 0, 'Investimentos': 0, 'Proteção': 0, 'Outros': 0 };
            usuario.categorias.forEach(cat => {
                if (cat.tipo === 'receita') {
                    totalReceitasAtual += cat.subItens.reduce((acc, item) => acc + (item.atual || 0), 0);
                    return;
                }
                const totalCatAtual = cat.subItens.reduce((acc, item) => acc + (item.atual || 0), 0);
                totalDespesasAtual += totalCatAtual;
                const nomeNormalizado = normalizeString(cat.nome.toLowerCase());
                if (cat.tipo === 'protecao' || nomeNormalizado.includes('protecao')) totaisDespesasPorTipo['Proteção'] += totalCatAtual;
                else if (nomeNormalizado.includes('fixa')) totaisDespesasPorTipo['Fixos'] += totalCatAtual;
                else if (nomeNormalizado.includes('variavel')) totaisDespesasPorTipo['Variáveis'] += totalCatAtual;
                else if (nomeNormalizado.includes('investimento')) totaisDespesasPorTipo['Investimentos'] += totalCatAtual;
                else if (totalCatAtual > 0) totaisDespesasPorTipo['Outros'] += totalCatAtual;
            });
            const saldoAtual = totalReceitasAtual - totalDespesasAtual;
            const newDonutChartData = Object.keys(totaisDespesasPorTipo).map(key => ({ name: key, value: totaisDespesasPorTipo[key] })).filter(item => item.value > 0);
            return {
                orcamentoCalculos: { totalReceitas: { atual: totalReceitasAtual, sugerido: 0 }, totalDespesas: { atual: totalDespesasAtual, sugerido: 0 }, saldoAtual, saldoSugerido: 0 },
                donutChartData: newDonutChartData
            };
        } catch (e) {
            console.error("Erro ao calcular orçamento:", e);
            return defaultReturn;
        }
    }, [usuario.categorias]);

    const rendaMensal = useMemo(() => {
        if (!usuario.categorias) return 0;
        return usuario.categorias
            .filter(c => c.tipo === 'receita')
            .reduce((acc, cat) => acc + cat.subItens.reduce((subAcc, item) => subAcc + (item.atual || 0), 0), 0);
    }, [usuario.categorias]);
    
    const custoDeVidaMensal = useMemo(() => {
        if (!usuario.categorias) return 0;
        return usuario.categorias.filter(c => c.nome.toLowerCase().includes('fixa') || c.nome.toLowerCase().includes('variável')).reduce((acc, cat) => acc + cat.subItens.reduce((subAcc, item) => subAcc + (item.atual || 0), 0), 0);
    }, [usuario.categorias]);

    const patrimonioTotal = useMemo(() => {
        const totalAtivos = patrimonioData.ativos.reduce((sum, item) => sum + parseFloat(item.valor || 0), 0);
        const totalDividas = patrimonioData.dividas.reduce((sum, item) => sum + parseFloat(item.valor || 0), 0);
        return totalAtivos - totalDividas;
    }, [patrimonioData]);

    const investimentosDisponiveis = useMemo(() => patrimonioData.ativos.filter(ativo => ativo.tipo === 'Investimentos'), [patrimonioData.ativos]);

    const investimentosDisponiveisParaObjetivos = useMemo(() => {
        const idsInvestimentosReserva = Object.keys(reservaInvestimentos).filter(id => reservaInvestimentos[id]);
        return patrimonioData.ativos.filter(ativo => 
            ativo.tipo === 'Investimentos' && !idsInvestimentosReserva.includes(String(ativo.id))
        );
    }, [patrimonioData.ativos, reservaInvestimentos]);


    // --- Menu and Page Rendering ---
    const menuItems = [
        { id: 'objetivos', label: 'Objetivos', icon: Target, path: '/objetivos' },
        { id: 'orcamento', label: 'Orçamento', icon: BarChart2, path: '/orcamento' },
        { id: 'fluxo', label: 'Fluxo', icon: ArrowRightLeft, subItems: [
            { id: 'fluxoTransacoes', label: 'Transações', icon: Coins, path: '/fluxo/transacoes' },
            { id: 'fluxoPlanejamento', label: 'Planejamento', icon: CheckSquare, path: '/fluxo/planejamento' }
        ]},
        { id: 'patrimonio', label: 'Patrimônio', icon: Landmark, path: '/patrimonio' },
        { id: 'protecao', label: 'Proteção', icon: Shield, path: '/protecao' },
        { id: 'reserva', label: 'Reserva', icon: PiggyBank, path: '/reserva' },
        { id: 'aposentadoria', label: 'Aposentadoria', icon: TreePalm, subItems: [
            { id: 'aposentadoriaAportes', label: 'Aportes', icon: ChartLine, path: '/aposentadoria/aportes' },
            { id: 'aposentadoriaPGBL', label: 'Estratégia PGBL', icon: HandCoins, path: '/aposentadoria/pgbl' }
        ]},
        { id: 'aquisicao', label: 'Aquisição', icon: ShoppingCart, subItems: [
            { id: 'aquisicaoImoveis', label: 'Imóveis', icon: Building2, path: '/aquisicao/imoveis' },
            { id: 'aquisicaoAutomoveis', label: 'Automóveis', icon: Car, path: '/aquisicao/automoveis' }
        ]},
        { id: 'viagens', label: 'Viagens', icon: Plane, subItems: [
            { id: 'viagensMilhas', label: 'Milhas', icon: PlaneTakeoff, path: '/viagens/milhas' },
            { id: 'viagensCartoes', label: 'Cartões', icon: CreditCard, path: '/viagens/cartoes' }
        ]},
        { id: 'EducacaoFinanceira', label: 'Educação Financeira', icon: BookOpen, path: '/educacao' },
        { id: 'agendaReunioes', label: 'Reuniões e Agenda', icon: CalendarDays, path: '/agenda' }
    ];
    
    // Função para lidar com o clique no menu, usando o navigate do React Router
    const handleMenuClick = (id, path, hasSubItems) => {
        if (hasSubItems) {
            // Se tem sub-itens, apenas abre/fecha o menu
            setOpenMenu(prevOpenMenu => (prevOpenMenu === id ? null : id));
        }
        if (path) {
            // Se tem um caminho, navega para ele
            navigate(path);
        }
    };


    if (!isAuthenticated && location.pathname !== '/login') {
        return <TelaAutenticacao setIsAuthenticated={setIsAuthenticated} setUsuario={setUsuario} />;
    }

    if (isAuthenticated && location.pathname === '/login') {
        navigate('/objetivos');
        return null; 
    }

    return (
        <div className="bg-slate-100 dark:bg-gray-900 text-slate-900 dark:text-white min-h-screen font-sans">
            {isAuthenticated && (
                <aside className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-[#201b5d] shadow-md z-20 flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-[#3e388b]">
                        <div className="flex items-center gap-2">
                            <img src={logo} alt="Logo SeuConsultor" className="h-6 w-auto" style={{ filter: 'invert(42%) sepia(93%) saturate(2000%) hue-rotate(133deg) brightness(100%) contrast(107%)' }} />
                            <span className="font-montserrat text-slate-900 dark:text-white text-sm font-extrabold">SeuConsultor</span>
                        </div>
                        <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-[#3e388b]/50">
                            {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
                        </button>
                    </div>
                    
                    <nav className="flex-1 min-h-0">
                        <SimpleBar style={{ height: '100%' }}>
                            <div className="p-3 space-y-1">
                                {menuItems.map(item => (
                                    <div key={item.id}>
                                        <button 
                                            onClick={() => handleMenuClick(item.id, item.path, !!item.subItems)} 
                                            className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-left transition-colors duration-200 ${location.pathname.startsWith(item.path || `/` + item.id) || openMenu === item.id ? 'bg-slate-200 dark:bg-[#00d971] text-slate-900 dark:text-black' : 'text-gray-600 dark:text-white hover:bg-slate-100 dark:hover:bg-[#3e388b]/50'}`}
                                        >
                                            <span className="flex items-center gap-2"><item.icon size={16} />{item.label}</span>
                                            {item.subItems && <ChevronDown size={14} className={`transform transition-transform ${openMenu === item.id ? 'rotate-180' : ''}`} />}
                                        </button>
                                        {item.subItems && openMenu === item.id && (
                                            <div className="ml-6 mt-1 space-y-1">
                                                {item.subItems.map(sub => (
                                                    <Link 
                                                        key={sub.id} 
                                                        to={sub.path} 
                                                        className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm w-full text-left ${location.pathname === sub.path ? 'bg-slate-100 dark:bg-[#00d971] text-slate-900 dark:text-black' : 'text-gray-500 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-[#3e388b]/50'}`}
                                                    >
                                                        <sub.icon size={14} />{sub.label}
                                                    </Link>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </SimpleBar>
                    </nav>

                    <div className="border-t border-slate-200 dark:border-[#3e388b] p-3">
                        <button onClick={() => setPerfilAberto(prev => !prev)} className="w-full flex items-center justify-between hover:bg-slate-100 dark:hover:bg-[#3e388b]/50 px-3 py-2 rounded-md transition">
                            <div className="flex items-center gap-3">
                                <img src={usuario.imagem_url || `https://ui-avatars.com/api/?name=${usuario.nome || 'U'}&background=00d971&color=000`} alt="avatar" className="w-8 h-8 rounded-full object-cover border" />
                                <span className="text-sm font-medium text-slate-800 dark:text-white">{usuario.nome}</span>
                            </div>
                            <ChevronDown size={16} className={`transition-transform duration-300 ${!perfilAberto ? 'rotate-180' : 'rotate-0'}`} />
                        </button>
                        <div className={`grid transition-all duration-300 ease-in-out ${perfilAberto ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0 mt-0'} overflow-hidden`}>
                            <div className="min-h-0">
                                <div className="space-y-2 pl-11">
                                    <button onClick={() => { navigate('/configuracoes'); setPerfilAberto(false); }} className="w-full text-left text-sm text-gray-600 dark:text-gray-300 hover:underline">⚙️ Configurações</button>
                                    <button onClick={handleLogout} className="w-full text-left text-sm text-red-500 hover:underline">⏻ Sair</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </aside>
            )}
            <main className={isAuthenticated ? "ml-64 p-4 md:p-6 transition-all duration-300" : ""}>
                <PageTransition key={location.pathname}>
                    <Routes>
                        <Route path="/login" element={<TelaAutenticacao setIsAuthenticated={setIsAuthenticated} setUsuario={setUsuario} />} />
                        <Route path="/objetivos" element={<TelaObjetivos objetivos={objetivos} onSave={handleSaveObjetivo} onDelete={handleDeleteObjetivo} investimentosDisponiveis={investimentosDisponiveisParaObjetivos} patrimonio={patrimonioData.ativos} />} />
                        <Route path="/orcamento" element={<TelaOrcamento categorias={usuario.categorias || []} onSaveItem={handleSaveOrcamentoItem} onDeleteItem={handleDeleteOrcamentoItem} orcamentoCalculos={orcamentoCalculos} chartData={donutChartData} />} />
                        <Route path="/reserva" element={<TelaReservaEmergencia orcamento={usuario.categorias || []} investimentosDisponiveis={investimentosDisponiveis} investimentosSelecionados={reservaInvestimentos} onSelectionChange={setReservaInvestimentos} />} />
                        <Route path="/aposentadoria/aportes" element={<TelaAposentadoria dadosIniciais={aposentadoriaData} onSave={handleSaveAposentadoria} />} />
                        <Route path="/patrimonio" element={<TelaPatrimonio patrimonioData={patrimonioData} patrimonioTotal={patrimonioTotal} onSaveItem={handleSavePatrimonioItem} onDeleteItem={handleDeletePatrimonioItem} />} />
                        <Route 
                            path="/protecao" 
                            element={<TelaProtecao 
                                        rendaMensal={rendaMensal}
                                        custoDeVidaMensal={custoDeVidaMensal}
                                        patrimonioTotal={patrimonioTotal}
                                        protecaoData={protecaoData}
                                        onSaveItem={handleSaveProtecaoItem}
                                        onDeleteItem={handleDeleteProtecaoItem}
                                        usuario={usuario} 
                                    />} 
                        />
                        <Route path="/fluxo/transacoes" element={<TelaFluxoDeCaixa transacoes={transacoes} handleCategoryChange={(id, cat) => handleSaveTransacao({...transacoes.find(t=>t.id===id), categoria: cat})} handleIgnoreToggle={(id) => handleSaveTransacao({...transacoes.find(t=>t.id===id), ignorada: !transacoes.find(t=>t.id===id).ignorada})} onAdicionarClick={() => {setTransacaoSelecionada(null); setIsTransacaoModalOpen(true);}} onEditClick={(t) => {setTransacaoSelecionada(t); setIsTransacaoModalOpen(true);}} onDeleteClick={handleDeleteTransacao} />} />
                        <Route path="/fluxo/planejamento" element={<TelaPlanejamento orcamento={usuario.categorias} gastosReais={transacoes} />} />
                        <Route path="/aquisicao/imoveis" element={<TelaAquisicaoImoveis dadosIniciais={aquisicaoData.imoveis} onSave={(data) => handleSaveAquisicao('imoveis', data)} />} />
                        <Route path="/aquisicao/automoveis" element={<TelaAquisicaoAutomoveis dadosIniciais={aquisicaoData.automoveis} onSave={(data) => handleSaveAquisicao('automoveis', data)} />} />
                        <Route path="/viagens/milhas" element={<TelaMilhas carteiras={milhasData.carteiras} metas={milhasData.metas} onSave={handleSaveMilhasItem} onDelete={handleDeleteMilhasItem} />} />
                        <Route path="/viagens/cartoes" element={<TelaCartoes />} />
                        <Route path="/educacao" element={<TelaEducacaoFinanceira />} />
                        <Route path="/aposentadoria/pgbl" element={<TelaSimuladorPGBL dadosIniciais={simuladorPgblData} onSave={handleSaveSimuladorPgbl} />} />
                        <Route path="/configuracoes" element={<TelaConfiguracoesPerfil usuario={usuario} setUsuario={setUsuario} />} />
                        <Route path="/agenda" element={<TelaReunioesAgenda atasIniciais={atas} agendaInicial={agenda} onSaveAta={handleSaveAta} onDeleteAta={handleDeleteAta} onSaveCompromisso={handleSaveCompromisso} onDeleteCompromisso={handleDeleteCompromisso} />} />
                        
                        {/* Rota padrão para usuários autenticados */}
                        <Route path="*" element={isAuthenticated ? <TelaObjetivos objetivos={objetivos} onSave={handleSaveObjetivo} onDelete={handleDeleteObjetivo} investimentosDisponiveis={investimentosDisponiveisParaObjetivos} patrimonio={patrimonioData.ativos} /> : <TelaAutenticacao setIsAuthenticated={setIsAuthenticated} setUsuario={setUsuario} />} />
                    </Routes>
                </PageTransition>
            </main>
            {isTransacaoModalOpen && (
                <ModalNovaTransacao transacao={transacaoSelecionada} onSave={handleSaveTransacao} onClose={() => { setIsTransacaoModalOpen(false); setTransacaoSelecionada(null); }} />
            )}
        </div>
    );
};

// Componente principal que exportamos
export default function App() {
  // A única responsabilidade dele é renderizar o AppContent
  // que agora está dentro do contexto do Router (definido em index.js)
  return (
      <AppContent />
  );
}
