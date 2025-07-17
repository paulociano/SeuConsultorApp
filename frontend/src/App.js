import { useState, useMemo, useEffect, useContext } from 'react';
import logo from './assets/logo.svg';
import { ThemeContext } from './ThemeContext';
import { 
    PiggyBank, BarChart2, Shield, ShoppingCart, Menu, X, ChevronDown, Car, Target, Landmark, Coins, Building2, 
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
import { CATEGORIAS_FLUXO } from './components/constants/Categorias';
import { mockTransacoes } from './components/mocks/mockTransacoes';
import { categorizeByAI } from './components/constants/categorizeByAI';
import { initialPatrimonioData } from './components/constants/initialPatrimonioData';
import { initialOrcamentoData } from './components/constants/initialOrcamentoData';
import PageTransition from './utils/PageTransition';


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

    const gastosReais = useMemo(() => {
    // Calcula os totais a partir do ESTADO 'transacoes', não do mock original
    const totais = transacoes
        .filter(t => t.type === 'debit' && !t.isIgnored) // Garante que transações ignoradas não sejam somadas
        .reduce((acc, t) => {
            const categoriaKey = t.category;
            if (categoriaKey) {
                if (!acc[categoriaKey]) {
                    acc[categoriaKey] = 0;
                }
                acc[categoriaKey] += t.amount;
            }
            return acc;
        }, {});

    // Mapeia para o formato esperado pela tela de Planejamento
    return Object.entries(totais).map(([key, value]) => ({
        id: key,
        label: CATEGORIAS_FLUXO[key]?.label || key,
        total: value
    }));
  }, [transacoes]); // O hook agora depende do estado 'transacoes' para recalcular
    useEffect(() => {
        const transacoesCategorizadas = mockTransacoes.map(t => ({
            ...t,
            category: t.type === 'credit' ? 'receita' : categorizeByAI(t.description),
            isIgnored: false
        }));
        setTransacoes(transacoesCategorizadas);
    }, []);

    const handleCategoryChange = (transactionId, newCategory) => {
        setTransacoes(prev => prev.map(t => t.id === transactionId ? { ...t, category: newCategory || null } : t));
    };

    const handleIgnoreToggle = (transactionId) => {
        setTransacoes(prev => prev.map(t => t.id === transactionId ? { ...t, isIgnored: !t.isIgnored } : t));
    };

    const [isTransacaoModalOpen, setIsTransacaoModalOpen] = useState(false);

    const handleSaveTransacao = (novaTransacao) => {
    // Simula a categorização por IA se não for uma receita
    const transacaoFinal = {
        ...novaTransacao,
        category: novaTransacao.type === 'credit' ? 'receita' : categorizeByAI(novaTransacao.description) || novaTransacao.category
    };
    setTransacoes(prev => [transacaoFinal, ...prev].sort((a, b) => new Date(b.date) - new Date(a.date)));
    setIsTransacaoModalOpen(false); // Fecha o modal
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
            case 'fluxoTransacoes': return <TelaFluxoDeCaixa transacoes={transacoes} handleCategoryChange={handleCategoryChange} handleIgnoreToggle={handleIgnoreToggle} onAdicionarClick={() => setIsTransacaoModalOpen(true)} />;
            case 'fluxoPlanejamento': return <TelaPlanejamento orcamento={categorias} gastosReais={gastosReais} />;
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
      <nav className="bg-white dark:bg-[#201b5d] shadow-lg">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
             <div className="flex-shrink-0 flex items-center gap-2">
                <img src={logo} alt="Logo SeuConsultor" className="h-6 w-auto" style={{ filter: 'invert(42%) sepia(93%) saturate(2000%) hue-rotate(133deg) brightness(100%) contrast(107%)' }} />
                <span className="font-montserrat text-slate-900 dark:text-white text-xs font-extrabold">SeuConsultor</span>
             </div>
             
             <div className="hidden md:flex items-center text-slate-800 space-x-1">
                {menuItems.map(item => (
                    <div key={item.id} className="relative">
                        <button
                            onClick={(e) => { e.preventDefault(); if (item.subItems) { setOpenMenu(openMenu === item.id ? null : item.id); } else { setCurrentPage(item.id); setOpenMenu(null); } }}
                            className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${currentPage.startsWith(item.id) ? 'bg-slate-200 dark:bg-[#00d971] text-slate-900 dark:text-black' : 'text-gray-600 dark:text-white hover:bg-slate-200/50 dark:hover:bg-[#3e388b]/50'}`}
                        >
                            <item.icon size={16} /><span>{item.label}</span>
                            {item.subItems && <ChevronDown size={14} className={`transition-transform ${openMenu === item.id ? 'rotate-180' : ''}`} />}
                        </button>
                        {item.subItems && openMenu === item.id && (
                             <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-[#201b5d] border border-slate-200 dark:border-[#3e388b] rounded-md shadow-lg z-10">
                                {item.subItems.map(subItem => (
                                    <a key={subItem.id} href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(subItem.id); setOpenMenu(null); }} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 dark:text-white hover:bg-slate-100 dark:hover:bg-[#3e388b] w-full">
                                        <subItem.icon size={16} />{subItem.label}
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
                <ThemeToggleButton />
             </div>

             <div className="md:hidden flex items-center gap-2">
                <ThemeToggleButton />
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="inline-flex items-center justify-center p-2 rounded-md text-slate-800 dark:text-slate-800 hover:text-white hover:bg-slate-100 dark:hover:bg-[#3e388b]/50 focus:outline-none">
                    <span className="sr-only">Abrir menu</span>
                    {isMobileMenuOpen ? <X size={24} className="text-slate-800 dark:text-white" /> : <Menu size={24} className="text-slate-800 dark:text-white" />}
                </button>
             </div>
          </div>
        </div>
      </nav>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#201b5d] shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                {menuItems.map(item => ( !item.subItems ? ( <a key={item.id} href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(item.id); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 px-3 py-2 rounded-md text-base font-medium ${currentPage === item.id ? 'bg-slate-200 dark:bg-[#00d971] text-slate-900 dark:text-white' : 'text-gray-600 dark:text-white hover:bg-slate-100 dark:hover:bg-[#3e388b]/50'}`}> <item.icon size={20}/>{item.label}</a> ) : ( <div key={item.id} className="text-gray-600 dark:text-white"> <div className="px-3 pt-2 pb-1 text-sm font-bold text-slate-800 dark:text-white">{item.label}</div> {item.subItems.map(subItem => ( <a key={subItem.id} href="#" onClick={(e) => { e.preventDefault(); setCurrentPage(subItem.id); setIsMobileMenuOpen(false); }} className={`flex items-center gap-3 pl-8 pr-3 py-2 rounded-md text-base font-medium ${currentPage === subItem.id ? 'bg-slate-200 dark:bg-[#00d971] text-slate-900 dark:text-black' : 'text-gray-600 dark:text-white hover:bg-slate-100 dark:hover:bg-[#3e388b]/50'}`}> <subItem.icon size={20}/>{subItem.label}</a>))}</div>)))}
            </div>
        </div>
      )}
      
      <main className="p-4 md:p-6">{renderPage()}</main>
      {/* ADICIONE O NOVO MODAL AQUI */}
      <ModalNovaTransacao 
        isOpen={isTransacaoModalOpen} 
        onClose={() => setIsTransacaoModalOpen(false)} 
        onSave={handleSaveTransacao}
      />
    </div>
  );
}
