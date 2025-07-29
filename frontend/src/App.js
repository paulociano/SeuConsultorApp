import { useContext, useEffect, useState } from 'react';
import { Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import logo from './assets/logo.svg';
import { ThemeContext } from './ThemeContext';
import {
    PiggyBank, BarChart2, Shield, ShoppingCart, ChevronDown, Car, Target, Landmark, Coins, Building2,
    CheckSquare, ArrowRightLeft, TreePalm, CreditCard, PlaneTakeoff, BookOpen, HandCoins,
    ChartLine, Plane, CalendarDays
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
import PageTransition from './utils/PageTransition';
// 1. Importar a store do utilizador
import { useUserStore } from './stores/useUserStore';

// Componente que renderiza as rotas protegidas
const ProtectedRoutes = () => {
    // 2. Obter os dados do utilizador e a função de logout da store
    const { usuario, logout } = useUserStore();
    const { theme, toggleTheme } = useContext(ThemeContext);
    const navigate = useNavigate();
    const location = useLocation();
    
    // Estados locais apenas para controlo da UI do menu
    const [openMenu, setOpenMenu] = useState('objetivos');
    const [perfilAberto, setPerfilAberto] = useState(false);

    const menuItems = [
        { id: 'objetivos', label: 'Objetivos', icon: Target, path: '/objetivos' },
        { id: 'orcamento', label: 'Orçamento', icon: BarChart2, path: '/orcamento' },
        { id: 'fluxo', label: 'Fluxo', icon: ArrowRightLeft, subItems: [
            { id: 'fluxoTransacoes', label: 'Extrato', icon: Coins, path: '/fluxo/transacoes' },
            { id: 'fluxoPlanejamento', label: 'Planejamento', icon: CheckSquare, path: '/fluxo/planejamento' }
        ]},
        { id: 'patrimonio', label: 'Património', icon: Landmark, path: '/patrimonio' },
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
    
    const handleMenuClick = (id, path, hasSubItems) => {
        if (hasSubItems) { setOpenMenu(prevOpenMenu => (prevOpenMenu === id ? null : id)); }
        if (path) { navigate(path); }
    };

    return (
        <div className="bg-slate-100 dark:bg-gray-900 text-slate-900 dark:text-white min-h-screen font-sans">
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
                            <img src={usuario?.imagem_url || `https://ui-avatars.com/api/?name=${usuario?.nome || 'U'}&background=00d971&color=000`} alt="avatar" className="w-8 h-8 rounded-full object-cover border" />
                            <span className="text-sm font-medium text-slate-800 dark:text-white">{usuario?.nome}</span>
                        </div>
                        <ChevronDown size={16} className={`transition-transform duration-300 ${!perfilAberto ? 'rotate-180' : 'rotate-0'}`} />
                    </button>
                    <div className={`grid transition-all duration-300 ease-in-out ${perfilAberto ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0 mt-0'} overflow-hidden`}>
                        <div className="min-h-0">
                            <div className="space-y-2 pl-11">
                                <button onClick={() => { navigate('/configuracoes'); setPerfilAberto(false); }} className="w-full text-left text-sm text-gray-600 dark:text-gray-300 hover:underline">⚙️ Configurações</button>
                                <button onClick={logout} className="w-full text-left text-sm text-red-500 hover:underline">⏻ Sair</button>
                            </div>
                        </div>
                    </div>
                </div>
            </aside>
            <main className="ml-64 p-4 md:p-6 transition-all duration-300">
                <PageTransition key={location.pathname}>
                    <Routes>
                        {/* 3. Todas as rotas agora renderizam componentes autónomos, sem props de dados */}
                        <Route path="/objetivos" element={<TelaObjetivos />} />
                        <Route path="/orcamento" element={<TelaOrcamento />} />
                        <Route path="/reserva" element={<TelaReservaEmergencia />} />
                        <Route path="/aposentadoria/aportes" element={<TelaAposentadoria />} />
                        <Route path="/patrimonio" element={<TelaPatrimonio />} />
                        <Route path="/protecao" element={<TelaProtecao />} />
                        <Route path="/fluxo/transacoes" element={<TelaFluxoDeCaixa />} />
                        <Route path="/fluxo/planejamento" element={<TelaPlanejamento />} />
                        <Route path="/aquisicao/imoveis" element={<TelaAquisicaoImoveis />} />
                        <Route path="/aquisicao/automoveis" element={<TelaAquisicaoAutomoveis />} />
                        <Route path="/viagens/milhas" element={<TelaMilhas />} />
                        <Route path="/viagens/cartoes" element={<TelaCartoes />} />
                        <Route path="/educacao" element={<TelaEducacaoFinanceira />} />
                        <Route path="/aposentadoria/pgbl" element={<TelaSimuladorPGBL />} />
                        <Route path="/configuracoes" element={<TelaConfiguracoesPerfil />} />
                        <Route path="/agenda" element={<TelaReunioesAgenda />} />
                        
                        {/* Rota padrão para utilizadores autenticados */}
                        <Route path="*" element={<Navigate to="/objetivos" replace />} />
                    </Routes>
                </PageTransition>
            </main>
        </div>
    );
};

// Componente principal que gere a lógica de autenticação
export default function App() {
    // 4. A lógica de autenticação é lida diretamente da store.
    const isAuthenticated = useUserStore((state) => state.isAuthenticated);
    const location = useLocation();

    // 5. Renderiza as rotas protegidas ou a tela de autenticação
    return (
        <Routes>
            {isAuthenticated ? (
                <Route path="/*" element={<ProtectedRoutes />} />
            ) : (
                <Route path="*" element={<TelaAutenticacao />} />
            )}
        </Routes>
    );
}
