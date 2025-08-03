import { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import logo from '../../assets/logo.svg';
import { ThemeContext } from '../../ThemeContext';
import { useUserStore } from '../../stores/useUserStore';
import {
  PiggyBank,
  BarChart2,
  Shield,
  ShoppingCart,
  ChevronDown,
  Car,
  Target,
  Landmark,
  Coins,
  Building2,
  CheckSquare,
  ArrowRightLeft,
  TreePalm,
  CreditCard,
  PlaneTakeoff,
  BookOpen,
  HandCoins,
  ChartLine,
  Plane,
  CalendarDays,
  Sun,
  Moon,
  ChevronLeft,
  Settings,
} from 'lucide-react';
import SimpleBar from 'simplebar-react';
import 'simplebar-react/dist/simplebar.min.css';
import clsx from 'clsx';

const menuItems = [
  { id: 'objetivos', label: 'Objetivos', icon: Target, path: '/objetivos' },
  { id: 'orcamento', label: 'Orçamento', icon: BarChart2, path: '/orcamento' },
  {
    id: 'fluxo',
    label: 'Fluxo',
    icon: ArrowRightLeft,
    subItems: [
      { id: 'fluxoTransacoes', label: 'Transações', icon: Coins, path: '/fluxo/transacoes' },
      {
        id: 'fluxoPlanejamento',
        label: 'Planejamento',
        icon: CheckSquare,
        path: '/fluxo/planejamento',
      },
    ],
  },
  { id: 'patrimonio', label: 'Património', icon: Landmark, path: '/patrimonio' },
  { id: 'protecao', label: 'Proteção', icon: Shield, path: '/protecao' },
  { id: 'reserva', label: 'Reserva', icon: PiggyBank, path: '/reserva' },
  {
    id: 'aposentadoria',
    label: 'Aposentadoria',
    icon: TreePalm,
    subItems: [
      {
        id: 'aposentadoriaAportes',
        label: 'Aportes',
        icon: ChartLine,
        path: '/aposentadoria/aportes',
      },
      {
        id: 'aposentadoriaPGBL',
        label: 'Estratégia PGBL',
        icon: HandCoins,
        path: '/aposentadoria/pgbl',
      },
    ],
  },
  {
    id: 'aquisicao',
    label: 'Aquisição',
    icon: ShoppingCart,
    subItems: [
      { id: 'aquisicaoImoveis', label: 'Imóveis', icon: Building2, path: '/aquisicao/imoveis' },
      { id: 'aquisicaoAutomoveis', label: 'Automóveis', icon: Car, path: '/aquisicao/automoveis' },
    ],
  },
  {
    id: 'viagens',
    label: 'Viagens',
    icon: Plane,
    subItems: [
      { id: 'viagensMilhas', label: 'Milhas', icon: PlaneTakeoff, path: '/viagens/milhas' },
      { id: 'viagensCartoes', label: 'Cartões', icon: CreditCard, path: '/viagens/cartoes' },
    ],
  },
  { id: 'EducacaoFinanceira', label: 'Educação Financeira', icon: BookOpen, path: '/educacao' },
  { id: 'agendaReunioes', label: 'Reuniões e Agenda', icon: CalendarDays, path: '/agenda' },
];

// 1. O componente recebe o estado 'isCollapsed' e a função 'setIsCollapsed'
export default function Sidebar({ isCollapsed, setIsCollapsed }) {
  const { usuario, logout } = useUserStore();
  const { theme, toggleTheme } = useContext(ThemeContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [openMenu, setOpenMenu] = useState('objetivos');
  const [perfilAberto, setPerfilAberto] = useState(false);

  const handleMenuClick = (id, path, hasSubItems) => {
    if (isCollapsed) {
      setIsCollapsed(false); // Expande a barra se estiver colapsada e um item for clicado
    }
    if (hasSubItems) {
      setOpenMenu((prevOpenMenu) => (prevOpenMenu === id ? null : id));
    }
    if (path) {
      navigate(path);
    }
  };

  const handleMouseEnter = () => {
    if (isCollapsed) {
      setIsCollapsed(false); // Expande e fixa ao passar o mouse
    }
  };

  return (
    <aside
      className={clsx(
        'fixed top-0 left-0 h-full bg-white dark:bg-[#201b5d] shadow-lg z-20 flex flex-col transition-all duration-300 ease-in-out',
        isCollapsed ? 'w-20' : 'w-64'
      )}
      onMouseEnter={handleMouseEnter}
    >
      {/* 2. Este botão agora chama a função 'setIsCollapsed' que veio do App.js */}
      <button
        onClick={() => setIsCollapsed((prev) => !prev)}
        className="absolute top-1/2 -right-3 z-30 w-6 h-6 bg-slate-200 dark:bg-[#3e388b] rounded-full flex items-center justify-center text-slate-600 dark:text-white hover:bg-slate-300 dark:hover:bg-[#00d971] transition-all"
        aria-label="Toggle Sidebar"
      >
        <ChevronLeft
          size={16}
          className={clsx('transition-transform duration-300', isCollapsed && 'rotate-180')}
        />
      </button>

      <div
        className={clsx(
          'flex items-center p-4 border-b border-slate-200 dark:border-[#3e388b] transition-all',
          isCollapsed ? 'justify-center' : 'justify-between'
        )}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <img
            src={logo}
            alt="Logo SeuConsultor"
            className={clsx('flex-shrink-0 transition-all duration-300', 'h-8 w-8')}
            style={{
              filter:
                'invert(42%) sepia(93%) saturate(2000%) hue-rotate(133deg) brightness(100%) contrast(107%)',
            }}
          />
          <span
            className={clsx(
              'font-montserrat text-slate-900 dark:text-white text-sm font-extrabold transition-opacity duration-200',
              isCollapsed && 'opacity-0'
            )}
          >
            SeuConsultor
          </span>
        </div>
        <button
          onClick={toggleTheme}
          className={clsx(
            'p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-[#3e388b]/50 transition-opacity',
            isCollapsed && 'opacity-0 pointer-events-none'
          )}
        >
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
      </div>

      <nav className="flex-1 min-h-0">
        <SimpleBar style={{ height: '100%' }}>
          <div className="p-3 space-y-1">
            {menuItems.map((item) => (
              <div key={item.id}>
                <button
                  onClick={() => handleMenuClick(item.id, item.path, !!item.subItems)}
                  className={clsx(
                    'w-full flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium text-left transition-colors duration-200',
                    location.pathname.startsWith(item.path || `/` + item.id) || openMenu === item.id
                      ? 'bg-slate-200 dark:bg-[#00d971] text-slate-900 dark:text-black'
                      : 'text-gray-600 dark:text-white hover:bg-slate-100 dark:hover:bg-[#3e388b]/50'
                  )}
                >
                  <div className="flex items-center gap-3">
                    <item.icon size={20} className="flex-shrink-0" />
                    <span
                      className={clsx(
                        'whitespace-nowrap transition-opacity',
                        isCollapsed && 'opacity-0'
                      )}
                    >
                      {item.label}
                    </span>
                  </div>
                  {item.subItems && (
                    <ChevronDown
                      size={14}
                      className={clsx(
                        'transform transition-all',
                        openMenu === item.id ? 'rotate-180' : '',
                        isCollapsed && 'opacity-0'
                      )}
                    />
                  )}
                </button>
                {!isCollapsed && item.subItems && openMenu === item.id && (
                  <div className="ml-6 mt-1 space-y-1">
                    {item.subItems.map((sub) => (
                      <Link
                        key={sub.id}
                        to={sub.path}
                        className={`flex items-center gap-2 px-3 py-1 rounded-md text-sm w-full text-left ${location.pathname === sub.path ? 'bg-slate-100 dark:bg-[#00d971] text-slate-900 dark:text-black' : 'text-gray-500 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-[#3e388b]/50'}`}
                      >
                        <sub.icon size={14} />
                        {sub.label}
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
        <button
          onClick={
            isCollapsed ? () => navigate('/configuracoes') : () => setPerfilAberto((prev) => !prev)
          }
          className={clsx(
            'w-full flex items-center hover:bg-slate-100 dark:hover:bg-[#3e388b]/50 px-3 py-2 rounded-md transition-all',
            isCollapsed ? 'justify-center' : 'justify-between'
          )}
        >
          {isCollapsed ? (
            <Settings size={22} className="text-gray-500 dark:text-gray-300" />
          ) : (
            <>
              <div className="flex items-center gap-3 overflow-hidden">
                <img
                  src={
                    usuario?.imagem_url ||
                    `https://ui-avatars.com/api/?name=${usuario?.nome || 'U'}&background=00d971&color=000`
                  }
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover border flex-shrink-0"
                />
                <span className="text-sm font-medium text-slate-800 dark:text-white whitespace-nowrap">
                  {usuario?.nome}
                </span>
              </div>
              <ChevronDown
                size={16}
                className={clsx(
                  'transition-transform duration-300 flex-shrink-0',
                  !perfilAberto ? 'rotate-180' : 'rotate-0'
                )}
              />
            </>
          )}
        </button>
        {!isCollapsed && (
          <div
            className={`grid transition-all duration-300 ease-in-out ${perfilAberto ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0 mt-0'} overflow-hidden`}
          >
            <div className="min-h-0">
              <div className="space-y-2 pl-11">
                <button
                  onClick={() => {
                    navigate('/configuracoes');
                    setPerfilAberto(false);
                  }}
                  className="w-full text-left text-sm text-gray-600 dark:text-gray-300 hover:underline"
                >
                  Configurações
                </button>
                <button
                  onClick={logout}
                  className="w-full text-left text-sm text-red-500 hover:underline"
                >
                  Sair
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
