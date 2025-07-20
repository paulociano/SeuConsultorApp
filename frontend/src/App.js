import { useState, useMemo, useContext, useEffect } from 'react';
import logo from './assets/logo.svg';
import { ThemeContext } from './ThemeContext';
import { 
    PiggyBank, BarChart2, Shield, ShoppingCart, ChevronDown, Car, Target, Landmark, Coins, Building2, 
    CheckSquare, ArrowRightLeft, TreePalm, CreditCard, Award, PlaneTakeoff, BookOpen, HandCoins,
    ChartLine
} from 'lucide-react';
import { Sun, Moon } from 'lucide-react';
import TelaObjetivos from './pages/Objetivos/TelaObjetivos';
import TelaAutenticacao from './pages/auth/TelaAutenticacao';
import TelaReservaEmergencia from './pages/Reserva/TelaReservaEmergencia';
import TelaAposentadoria from './pages/Aposentadoria/TelaAposentadoria';
import TelaOrcamento from './pages/Orçamento/TelaOrcamento';
import TelaProtecao from './pages/Protecao/TelaProtecao';
import TelaPatrimonio from './pages/Patrimonio/TelaPatrimonio';
import TelaAquisicaoImoveis from './pages/Aquisicao/TelaAquisicaoImoveis';
import TelaAquisicaoAutomoveis from './pages/Aquisicao/TelaAquisicaoAutomoveis';
import TelaFluxoDeCaixa from './pages/Fluxo/TelaFluxoCaixa';
import TelaPlanejamento from './pages/Planejamento/TelaPlanejamento';
import TelaMilhas from './pages/Outros/TelaMilhas';
import TelaCartoes from './pages/Outros/TelaCartoes';
import TelaEducacaoFinanceira from './pages/Outros/TelaEducacaoFinanceira';
import TelaSimuladorPGBL from './pages/Aposentadoria/TelaSimuladorPGBL';
import ModalNovaTransacao from './components/Modals/ModalNovaTransacao';
import { categorizeByAI } from './components/constants/categorizeByAI';
import { initialPatrimonioData } from './components/constants/initialPatrimonioData';
import { initialOrcamentoData } from './components/constants/initialOrcamentoData';
import PageTransition from './utils/PageTransition';
import { Scrollbar } from 'react-scrollbars-custom';
import ModalEditarTransacao from './components/Modals/ModalEditTransacao';


export default function App() {
const { theme, toggleTheme } = useContext(ThemeContext);
  const [currentPage, setCurrentPage] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [categorias, setCategorias] = useState(initialOrcamentoData);
  const [patrimonioData, setPatrimonioData] = useState(initialPatrimonioData);
  const [openMenu, setOpenMenu] = useState(null);
  
  // Estado para controlar o menu móvel
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [transacoes, setTransacoes] = useState([]);
  const [perfilAberto, setPerfilAberto] = useState(false);
  const [transacaoSelecionada, setTransacaoSelecionada] = useState(null);

  useEffect(() => {
  if (theme !== 'dark') {
    toggleTheme();
  }
    }, []);

  const handleEditTransacao = (id, novosDadosOuLista) => {
  if (Array.isArray(novosDadosOuLista)) {
    setTransacoes(novosDadosOuLista);
    return;
  }

  setTransacoes(prev =>
    prev.map(t =>
      t.id === id
        ? {
            ...t,
            ...novosDadosOuLista,
            category:
              novosDadosOuLista.type === 'credit'
                ? 'receita'
                : categorizeByAI(novosDadosOuLista.description) || novosDadosOuLista.category || t.category,
          }
       : t
    )
  );
};

  // para editar:
  const handleEditClick = (transacao) => {
  setTransacaoSelecionada(transacao);
  setIsTransacaoModalOpen(true);
  };

  // Hooks useMemo (lógica interna completa restaurada)
  const { orcamentoCalculos, pieChartData } = useMemo(() => {
        const totais = { atual: { receitas: 0, despesas: 0 }, sugerido: { receitas: 0, despesas: 0 } };
        const totaisCategorias = { fixos: 0, variaveis: 0, investimentos: 0, renda: 0 };
        let pieData = [];
        categorias.forEach(cat => {
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
                if(cat.id === 'essencial') totaisCategorias.fixos += totalCatAtual;
                if(cat.id === 'variavel') totaisCategorias.variaveis += totalCatAtual;
                if(cat.id === 'investimento') totaisCategorias.investimentos += totalCatAtual;
            }
        });
        const finalPieData = pieData.map(d => ({
            ...d,
            percAtual: totais.atual.despesas > 0 ? ((d.valueAtual / totais.atual.despesas) * 100).toFixed(1) : "0.0",
            percSugerido: totais.sugerido.despesas > 0 ? ((d.valueSugerido / totais.sugerido.despesas) * 100).toFixed(1) : "0.0",
        }));
        return { orcamentoCalculos: { ...totais, categorias: totaisCategorias }, pieChartData: finalPieData };
    }, [categorias]);

    const custoDeVidaMensal = useMemo(() => {
        return categorias
            .filter(c => c.id === 'essencial' || c.id === 'variavel')
            .reduce((acc, cat) => acc + cat.subItens.reduce((subAcc, item) => subAcc + item.atual, 0), 0);
    }, [categorias]);

    const patrimonioTotal = useMemo(() => {
        const totalAtivos = Object.keys(patrimonioData)
            .filter(key => key !== 'dividas')
            .reduce((acc, key) => acc + patrimonioData[key].reduce((sum, item) => sum + item.valor, 0), 0);
        const totalDividas = patrimonioData.dividas.reduce((sum, item) => sum + item.valor, 0);
        return totalAtivos - totalDividas;
    }, [patrimonioData])

    const handleCategoryChange = (transactionId, newCategory) => {
        setTransacoes(prev => prev.map(t => t.id === transactionId ? { ...t, category: newCategory || null } : t));
    };

    const handleIgnoreToggle = (transactionId) => {
        setTransacoes(prev => prev.map(t => t.id === transactionId ? { ...t, isIgnored: !t.isIgnored } : t));
    };

    const [isTransacaoModalOpen, setIsTransacaoModalOpen] = useState(false);

    const handleSaveTransacao = (novaTransacao) => {
        const transacaoFinal = {
            ...novaTransacao,
            category:
            novaTransacao.type === 'credit'
                ? 'receita'
                : novaTransacao.category || categorizeByAI(novaTransacao.description),
        };

        if (transacaoSelecionada) {
            setTransacoes(prev =>
            prev.map(t => t.id === transacaoSelecionada.id ? { ...t, ...transacaoFinal } : t)
            );
        } else {
            setTransacoes(prev => [
            { ...transacaoFinal, id: Date.now().toString() },
            ...prev
            ]);
        }

        setIsTransacaoModalOpen(false);
        setTransacaoSelecionada(null);
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
        id: 'outros',
        label: 'Outros',
        icon: Award,
        subItems: [
            { id: 'outrosMilhas', label: 'Planejamento de Milhas', icon: PlaneTakeoff },
            { id: 'outrosCartoes', label: 'Cartões de Crédito', icon: CreditCard },
            { id: 'outrosEducacaoFinanceira', label: 'Educação Financeira', icon: BookOpen },
        ]
        }
    ];

    const renderPage = () => {
        let content;

        if (!isAuthenticated) {
            return <TelaAutenticacao setIsAuthenticated={setIsAuthenticated} setCurrentPage={setCurrentPage} />;
        } else {
            switch (currentPage) {
                case 'orcamento': content = <TelaOrcamento categorias={categorias} setCategorias={setCategorias} orcamentoCalculos={orcamentoCalculos} pieChartData={pieChartData} />; break;
                case 'protecao': content = <TelaProtecao rendaMensal={orcamentoCalculos.atual.receitas} custoDeVidaMensal={custoDeVidaMensal} patrimonioTotal={patrimonioTotal}/>; break;
                case 'reserva': content = <TelaReservaEmergencia orcamentoCalculos={orcamentoCalculos} />; break;
                case 'aposentadoriaAportes': content = <TelaAposentadoria />; break;
                case 'patrimonio': content = <TelaPatrimonio patrimonioData={patrimonioData} setPatrimonioData={setPatrimonioData} patrimonioTotal={patrimonioTotal} />; break;
                case 'fluxoTransacoes':  return <TelaFluxoDeCaixa transacoes={transacoes} handleCategoryChange={handleCategoryChange} handleIgnoreToggle={handleIgnoreToggle} handleEditTransacao={handleEditTransacao} onAdicionarClick={() => {setTransacaoSelecionada(null); setIsTransacaoModalOpen(true);}} onEditClick={(transacao) => {setTransacaoSelecionada(transacao); setIsTransacaoModalOpen(true);}}/>;
                case 'fluxoPlanejamento': return <TelaPlanejamento orcamento={categorias} gastosReais={transacoes} />;
                case 'aquisicaoImoveis': content = <TelaAquisicaoImoveis />; break;
                case 'aquisicaoAutomoveis': content = <TelaAquisicaoAutomoveis />; break;
                case 'objetivos': return <TelaObjetivos />;
                case 'outrosMilhas': return <TelaMilhas />;
                case 'outrosCartoes': return <TelaCartoes />;
                case 'outrosEducacaoFinanceira': return <TelaEducacaoFinanceira />;
                case 'aposentadoriaPGBL': return <TelaSimuladorPGBL />;
                default: content = <TelaObjetivos />; break;
            }
        }

        return (
            <PageTransition key={currentPage}>
                {content}
            </PageTransition>
        );
    };

    if (!isAuthenticated) { return renderPage(); }
    const ThemeToggleButton = () => (
        <button onClick={toggleTheme} className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-[#3e388b]/50">
        {/* Se o tema for 'dark', mostra a LUA. Se for 'light', mostra o SOL. */}
        {theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
    );
    return (
    <div className="bg-slate-100 dark:bg-gray-900 text-slate-900 dark:text-white min-h-screen font-sans">
      <aside className="fixed top-0 left-0 h-full w-64 bg-white dark:bg-[#201b5d] shadow-md z-20 flex flex-col">
        {/* TOPO - logo + tema */}
        <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-[#3e388b]">
            <div className="flex items-center gap-2">
            <img src={logo} alt="Logo SeuConsultor" className="h-6 w-auto" style={{ filter: 'invert(42%) sepia(93%) saturate(2000%) hue-rotate(133deg) brightness(100%) contrast(107%)' }} />
            <span className="font-montserrat text-slate-900 dark:text-white text-sm font-extrabold">SeuConsultor</span>
            </div>
            <ThemeToggleButton />
        </div>

        {/* MENU DE NAVEGAÇÃO */}
        <Scrollbar
            style={{ flex: 1 }}
            noScrollX
            trackYProps={{ style: { backgroundColor: 'transparent' } }}
            thumbYProps={{
                style: {
                width: '2px',
                backgroundColor: theme === 'dark' ? '#00d971/' : '#888',
                }
            }}
        >
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
                className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-left transition-colors duration-200 ${
                    currentPage.startsWith(item.id)
                    ? 'bg-slate-200 dark:bg-[#00d971] text-slate-900 dark:text-black'
                    : 'text-gray-600 dark:text-white hover:bg-slate-100 dark:hover:bg-[#3e388b]/50'
                }`}
                >
                <span className="flex items-center gap-2">
                    <item.icon size={16} />
                    {item.label}
                </span>
                {item.subItems && <ChevronDown size={14} className={`transform transition-transform ${openMenu === item.id ? 'rotate-180' : ''}`} />}
                </button>
                {item.subItems && openMenu === item.id && (
                <div className="ml-6 mt-1 space-y-1">
                    {item.subItems.map(sub => (
                    <button
                        key={sub.id}
                        onClick={() => { setCurrentPage(sub.id); setOpenMenu(null); }}
                        className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm w-full text-left ${
                        currentPage === sub.id
                            ? 'bg-slate-100 dark:bg-[#00d971] text-slate-900 dark:text-black'
                            : 'text-gray-500 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-[#3e388b]/50'
                        }`}
                    >
                        <sub.icon size={14} />
                        {sub.label}
                    </button>
                    ))}
                </div>
                )}
            </div>
            ))}
        </nav>
        </Scrollbar>
        {/* RODAPÉ FIXO - Perfil / Config / Logout */}
        <div className="border-t border-slate-200 dark:border-[#3e388b] p-3">
            <button
                onClick={() => setPerfilAberto(prev => !prev)}
                className="w-full flex items-center justify-between hover:bg-slate-100 dark:hover:bg-[#3e388b]/50 px-3 py-2 rounded-md transition"
            >
                <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-[#00d971] text-black font-bold flex items-center justify-center">PH</div>
                <span className="text-sm font-medium text-slate-800 dark:text-white">Paulo Henrique</span>
                </div>
                <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${!perfilAberto ? 'rotate-180' : 'rotate-0'}`}
                />
            </button>

            {/* Conteúdo colapsável com animação de altura e opacidade */}
            <div
                className={`grid transition-all duration-300 ease-in-out ${perfilAberto ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0 mt-0'} overflow-hidden`}
            >
                <div className="min-h-0">
                <div className="space-y-2 pl-11">
                    <button className="w-full text-left text-sm text-gray-600 dark:text-gray-300 hover:underline">⚙️ Configurações</button>
                    <button onClick={() => {
                         if (theme !== 'dark') toggleTheme();
                        setIsAuthenticated(false);
                        setCurrentPage('login');
                        setPerfilAberto(false);
                    }} className="w-full text-left text-sm text-red-500 hover:underline">⏻ Sair
                    </button>
                </div>
                </div>
            </div>
            </div>
        </aside>
        {isMobileMenuOpen && (
            <div className="md:hidden bg-white dark:bg-[#201b5d] shadow-lg">
                <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                    {menuItems.map(item => ( !item.subItems ? ( <a key={item.id} href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(item.id); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium ${currentPage === item.id ? 'bg-slate-200 dark:bg-[#00d971] text-slate-900 dark:text-white' : 'text-gray-600 dark:text-white hover:bg-slate-100 dark:hover:bg-[#3e388b]/50'}`}> <item.icon size={20}/>{item.label}</a> ) : ( <div key={item.id} className="text-gray-600 dark:text-white"> <div className="px-3 pt-2 pb-1 text-sm font-bold text-slate-800 dark:text-white">{item.label}</div> {item.subItems.map(subItem => ( <a key={subItem.id} href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(subItem.id); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 pl-8 pr-3 py-2 rounded-md text-base font-medium ${currentPage === subItem.id ? 'bg-slate-200 dark:bg-[#00d971] text-slate-900 dark:text-black' : 'text-gray-600 dark:text-white hover:bg-slate-100 dark:hover:bg-[#3e388b]/50'}`}> <subItem.icon size={20}/>{subItem.label}</a>))}</div>)))}
                </div>
            </div>
        )}
        <main className="ml-64 p-4 md:p-6 transition-all duration-300">{renderPage()}</main>
        {/* ADICIONE O NOVO MODAL AQUI */}
    {isTransacaoModalOpen && (
    <ModalNovaTransacao 
        transacao={transacaoSelecionada}
        onSave={handleSaveTransacao}
        onClose={() => {
        setIsTransacaoModalOpen(false);
        setTransacaoSelecionada(null);
        }}
    />
    )};
    </div>
    )
}
