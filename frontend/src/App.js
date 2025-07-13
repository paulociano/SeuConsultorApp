import React, { useState, useMemo, useEffect, createContext, useContext } from 'react';
import ReactECharts from 'echarts-for-react';
import { PieChart, Pie, Cell, LabelList, Brush, LineChart, Line, BarChart, Bar, ResponsiveContainer, Legend, Tooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid } from 'recharts';
import logo from './assets/logo.svg';
import userImage from './assets/persona.jpg';
import dadosDosCartoes from './data/cartoes_credito.json';
import { ThemeContext } from './ThemeContext';
import { 
    Home, UserPlus, LogIn, PiggyBank, BarChart2, Shield, ShoppingCart, 
    Briefcase, Menu, X, PlusCircle, ChevronDown, ChevronRight, 
    Trash2, Edit, DollarSign, HeartHandshake, Users, 
    Stethoscope, Car, Target, Landmark, Coins, CarFront, Building2, 
    Gift, Package, Film, Eye, EyeOff, School, Plane, ArrowLeft, CheckSquare, ArrowRightLeft,
    TreePalm,
    Utensils,
    HandCoins,
    CreditCard,
    Award,
    PlaneTakeoff,
    Pencil
} from 'lucide-react';
import { motion, AnimatePresence} from 'framer-motion';
import { Sun, Moon } from 'lucide-react';

const mockInvestimentos = [
    { id: 'inv1', nome: 'Tesouro Selic', valor: 5000 },
    { id: 'inv2', nome: 'CDB 100% CDI', valor: 10000 },
    { id: 'inv3', nome: 'Fundo DI', valor: 7500 },
    { id: 'inv4', nome: 'Poupança', valor: 2000 },
];

const initialPatrimonioData = {
    investimentos: [{ id: 1, nome: 'Ações Nacionais', valor: 50000 }],
    automoveis: [{ id: 2, nome: 'Carro Principal', valor: 90000 }],
    imoveis: [{ id: 3, nome: 'Apartamento', valor: 450000 }],
    contaBancaria: [{ id: 4, nome: 'Conta Corrente', valor: 12000 }],
    beneficios: [],
    outros: [],
    dividas: [{ id: 5, nome: 'Financiamento Veículo', valor: 35000 }],
};

const PIE_COLORS = ['#00d971', '#a39ee8', '#FFBB28', '#FF8042', '#AF19FF'];

// --- Dados de Exemplo para a Tela de Objetivos ---
const mockObjetivos = [
    { id: 1, nome: 'Casa na Praia', icon: Home, valorAlvo: 800000, valorAtual: 350000, investimentosLinkados: ['inv1', 'inv3'] },
    { id: 2, nome: 'Viagem ao Japão', icon: Plane, valorAlvo: 40000, valorAtual: 15000, investimentosLinkados: ['inv2'] },
    { id: 3, nome: 'Carro Novo', icon: Car, valorAlvo: 120000, valorAtual: 95000, investimentosLinkados: ['inv1'] },
    { id: 4, nome: 'Fundo de Emergência', icon: Shield, valorAlvo: 50000, valorAtual: 50000, investimentosLinkados: ['inv1', 'inv2'] },
    { id: 5, nome: 'Aposentadoria', icon: Briefcase, valorAlvo: 2000000, valorAtual: 450000, investimentosLinkados: ['inv3'] },
    { id: 6, nome: 'Educação dos Filhos', icon: School, valorAlvo: 250000, valorAtual: 80000, investimentosLinkados: ['inv1'] },
];

// Definições de Categorias e Ícones para o Fluxo de Caixa
const CATEGORIAS_FLUXO = {
    alimentacao: { label: 'Alimentação', icon: Utensils, color: '#f97316' },
    transporte: { label: 'Transporte', icon: Car, color: '#3b82f6' },
    moradia: { label: 'Moradia', icon: Home, color: '#ef4444' },
    lazer: { label: 'Lazer', icon: Film, color: '#14b8a6' },
    compras: { label: 'Compras', icon: ShoppingCart, color: '#8b5cf6' },
    saude: { label: 'Saúde', icon: Stethoscope, color: '#ec4899' },
    servicos: { label: 'Serviços e Taxas', icon: HandCoins, color: '#6b7280' },
    outros: { label: 'Outros', icon: Package, color: '#facc15' }
};

// Dados de Exemplo - No futuro, isso viria de uma sincronização bancária
const mockTransacoes = [
  { id: 1, date: '2025-07-07', description: 'iFood Pedido #1234', amount: 54.90, type: 'debit', sourceAccount: 'Cartão de Crédito Nubank' },
  { id: 2, date: '2025-07-07', description: 'Uber Viagens', amount: 22.50, type: 'debit', sourceAccount: 'Cartão de Crédito Nubank' },
  { id: 3, date: '2025-07-06', description: 'Salário Empresa X', amount: 7000.00, type: 'credit', sourceAccount: 'Conta Corrente Itaú' },
  { id: 4, date: '2025-07-06', description: 'Supermercado Pão de Açúcar', amount: 432.80, type: 'debit', sourceAccount: 'Cartão de Débito Itaú' },
  { id: 5, date: '2025-07-05', description: 'Cinema Cinemark', amount: 65.00, type: 'debit', sourceAccount: 'Cartão de Crédito Nubank' },
  { id: 6, date: '2025-07-05', description: 'Pagamento Fatura Net', amount: 119.90, type: 'debit', sourceAccount: 'Conta Corrente Itaú' },
  { id: 7, date: '2025-07-04', description: 'Farmácia Droga Raia', amount: 89.50, type: 'debit', sourceAccount: 'Cartão de Débito Itaú' },
  { id: 8, date: '2025-07-03', description: 'Compra na Amazon.com.br', amount: 159.90, type: 'debit', sourceAccount: 'Cartão de Crédito Nubank' },
];

const initialOrcamentoData = [
    { id: 'renda', nome: 'Renda', tipo: 'receita', icon: DollarSign, subItens: [ { id: 1, nome: 'Salário', atual: 7000, sugerido: 7000, categoriaId: null } ] },
    { 
        id: 'fixo', // O ID pode continuar como 'fixo' ou mudar para 'despesas-fixas'
        nome: 'Despesas Fixas', // <-- NOME ALTERADO AQUI
        tipo: 'despesa', 
        icon: Home, 
        // Adicionadas as categorias de Moradia e Serviços aqui
        subItens: [ 
            { id: 2, nome: 'Aluguel', atual: 1500, sugerido: 1500, categoriaId: 'moradia' }, 
            { id: 3, nome: 'Energia', atual: 250, sugerido: 220, categoriaId: 'moradia' },
            // Adicione mais itens fixos aqui se necessário
        ] 
    },
    { 
        id: 'variavel', 
        nome: 'Despesas Variáveis', 
        tipo: 'despesa', 
        icon: ShoppingCart, 
        // A lógica aqui agora permite adicionar qualquer despesa variável com uma categoria
        subItens: [
             { id: 4, nome: 'Supermercado', atual: 800, sugerido: 750, categoriaId: 'alimentacao' },
             { id: 5, nome: 'Gasolina', atual: 300, sugerido: 350, categoriaId: 'transporte' }
        ]
    },
    { id: 'investimento', nome: 'Investimento', tipo: 'despesa', icon: Briefcase, subItens: [ { id: 6, nome: 'Ações', atual: 500, sugerido: 700, categoriaId: 'outros' } ] },
    { id: 'protecao', nome: 'Proteção', tipo: 'despesa', icon: Shield, subItens: [ { id: 7, nome: 'Seguro de Vida', atual: 100, sugerido: 100, categoriaId: 'outros' } ] },
];

const ModalObjetivo = ({ isOpen, onClose, onSave }) => {
    const [nome, setNome] = useState('');
    const [valorAlvo, setValorAlvo] = useState('');
    
    const iconesDisponiveis = [
        { name: 'Casa', component: Home }, { name: 'Avião', component: Plane }, { name: 'Carro', component: Car },
        { name: 'Escudo', component: Shield }, { name: 'Maleta', component: Briefcase }, { name: 'Educação', component: School },
        { name: 'Presente', component: Gift }, { name: 'Coração', component: HeartHandshake },
    ];
    const [iconeSelecionado, setIconeSelecionado] = useState(iconesDisponiveis[0].component);
    const [investimentosSelecionados, setInvestimentosSelecionados] = useState(new Set());

    const handleToggleInvestimento = (invId) => {
        setInvestimentosSelecionados(prev => {
            const newSet = new Set(prev);
            if (newSet.has(invId)) {
                newSet.delete(invId);
            } else {
                newSet.add(invId);
            }
            return newSet;
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!nome || !valorAlvo) return;
        
        const dadosObjetivo = {
            nome,
            icon: iconeSelecionado,
            valorAlvo: parseFloat(valorAlvo),
            investimentosLinkados: Array.from(investimentosSelecionados)
        };
        
        onSave(dadosObjetivo);
        // Limpa o formulário para a próxima vez
        setNome('');
        setValorAlvo('');
        setIconeSelecionado(iconesDisponiveis[0].component);
        setInvestimentosSelecionados(new Set());
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white dark:bg-[#201b5d] rounded-xl shadow-lg p-8 w-full max-w-lg">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Novo Objetivo</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Nome do Objetivo</label><input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/></div>
                        <div><label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Valor Alvo (R$)</label><input type="number" value={valorAlvo} onChange={(e) => setValorAlvo(e.target.value)} required className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/></div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Ícone</label>
                        <div className="grid grid-cols-4 md:grid-cols-8 gap-2">{iconesDisponiveis.map((IconInfo, index) => { const Icone = IconInfo.component; const isSelected = iconeSelecionado === Icone; return ( <button key={index} type="button" onClick={() => setIconeSelecionado(Icone)} className={`p-3 rounded-lg flex items-center justify-center transition-all ${isSelected ? 'bg-[#00d971] text-white scale-110' : 'bg-slate-200 dark:bg-[#2a246f] text-gray-600 dark:text-gray-300 hover:bg-slate-300 dark:hover:bg-[#3e388b]'}`}><Icone size={24}/></button> )})}</div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">Vincular Investimentos</label>
                        <div className="space-y-2 max-h-40 overflow-y-auto p-2 bg-slate-100 dark:bg-[#2a246f] rounded-lg">
                            {mockInvestimentos.map(inv => (
                                <label key={inv.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-200 dark:hover:bg-[#3e388b] cursor-pointer">
                                    <input type="checkbox" checked={investimentosSelecionados.has(inv.id)} onChange={() => handleToggleInvestimento(inv.id)} className="form-checkbox h-4 w-4 text-[#00d971] bg-slate-300 dark:bg-gray-700 border-gray-600 rounded focus:ring-0"/>
                                    <span className="text-sm text-slate-800 dark:text-gray-300">{inv.nome}</span>
                                    <span className="ml-auto text-sm font-semibold text-slate-800 dark:text-white">{formatCurrency(inv.valor)}</span>
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300">Cancelar</button>
                        <button type="submit" className="px-6 py-2 text-sm font-medium text-black bg-[#00d971] rounded-lg hover:brightness-90">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const TelaObjetivos = () => {
    const { theme } = useContext(ThemeContext);
    
    const mockObjetivosInicial = [
        { id: 1, nome: 'Casa na Praia', icon: Home, valorAlvo: 800000, investimentosLinkados: ['inv1', 'inv3'] },
        { id: 2, nome: 'Viagem ao Japão', icon: Plane, valorAlvo: 40000, investimentosLinkados: ['inv2'] },
        { id: 3, nome: 'Carro Novo', icon: Car, valorAlvo: 120000, investimentosLinkados: ['inv1'] },
        { id: 4, nome: 'Fundo de Emergência', icon: Shield, valorAlvo: 50000, investimentosLinkados: ['inv1', 'inv2'] },
    ];

    const [objetivos, setObjetivos] = useState(mockObjetivosInicial);
    const [objetivoSelecionadoId, setObjetivoSelecionadoId] = useState(null);
    const [objetivoHoveredId, setObjetivoHoveredId] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const objetivosCalculados = useMemo(() => {
        return objetivos.map(obj => {
            const valorAtual = obj.investimentosLinkados.reduce((acc, invId) => {
                const investimento = mockInvestimentos.find(i => i.id === invId);
                return acc + (investimento ? investimento.valor : 0);
            }, 0);
            return { ...obj, valorAtual };
        });
    }, [objetivos]);

    const metaSelecionada = useMemo(() => {
        return objetivosCalculados.find(o => o.id === objetivoSelecionadoId);
    }, [objetivosCalculados, objetivoSelecionadoId]);

    const progressoMetaDetalhe = useMemo(() => {
        if (!metaSelecionada) return null;
        const percentual = metaSelecionada.valorAlvo > 0 ? (metaSelecionada.valorAtual / metaSelecionada.valorAlvo) * 100 : 0;
        return {
            percentual: Math.min(percentual, 100),
            donutData: [
                { name: 'Alcançado', value: metaSelecionada.valorAtual },
                { name: 'Faltante', value: Math.max(0, metaSelecionada.valorAlvo - metaSelecionada.valorAtual) }
            ]
        }
    }, [metaSelecionada]);

    const handleSaveObjetivo = (dadosDoForm) => {
        const novoObjetivo = { ...dadosDoForm, id: Date.now() };
        setObjetivos(prev => [...prev, novoObjetivo]);
        setIsModalOpen(false);
    };

    const handleDeleteObjetivo = (id) => {
        if (window.confirm("Tem certeza que deseja excluir este objetivo?")) {
            setObjetivos(prev => prev.filter(o => o.id !== id));
            setObjetivoSelecionadoId(null);
        }
    };
    
    const raioBase = 120;
    const objetivosPorAnel = [];
    for (let i = 0; i < objetivosCalculados.length; i += 5) {
        objetivosPorAnel.push(objetivosCalculados.slice(i, i + 5));
    }

    return (
        <div className="max-w-6xl mx-auto">
            <AnimatePresence mode="wait">
                {metaSelecionada ? (
                    <motion.div
                        key="detalhe"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <div className="max-w-xl mx-auto">
                            <button onClick={() => setObjetivoSelecionadoId(null)} className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white mb-4"><ArrowLeft size={16} /> Voltar para todos os objetivos</button>
                            <Card>
                                <div className="flex flex-col items-center text-center">
                                    <div className="flex justify-end w-full gap-4 -mt-2 -mr-2">
                                         <button onClick={() => handleDeleteObjetivo(metaSelecionada.id)} className="text-gray-500 dark:text-gray-400 hover:text-red-500"><Trash2 size={18}/></button>
                                    </div>
                                    <div className="p-4 bg-slate-200 dark:bg-[#2a246f] rounded-full mb-4 -mt-4">
                                        <metaSelecionada.icon size={32} className="text-[#00d971]" />
                                    </div>
                                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white">{metaSelecionada.nome}</h1>
                                    <p className="text-lg text-gray-500 dark:text-gray-400 mt-1">Alcançado: <span className="font-bold text-[#00d971]">{formatCurrency(metaSelecionada.valorAtual)}</span> de {formatCurrency(metaSelecionada.valorAlvo)}</p>
                                    <div className="relative w-48 h-48 my-4">
                                        <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={progressoMetaDetalhe.donutData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius="70%" outerRadius="90%" startAngle={90} endAngle={-270} paddingAngle={2}><Cell fill="#00d971" stroke="none" /><Cell fill={theme === 'dark' ? '#2a246f' : '#e2e8f0'} stroke="none" /></Pie></PieChart></ResponsiveContainer>
                                        <div className="absolute inset-0 flex items-center justify-center"><span className="text-3xl font-bold text-slate-800 dark:text-white">{progressoMetaDetalhe.percentual.toFixed(0)}%</span></div>
                                    </div>
                                    <div className="w-full text-left mt-4">
                                        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">Investimentos Vinculados</h3>
                                        <div className="space-y-2">
                                            {metaSelecionada.investimentosLinkados.length > 0 ? metaSelecionada.investimentosLinkados.map(invId => {
                                                const investimento = mockInvestimentos.find(i => i.id === invId);
                                                return ( <div key={invId} className="flex justify-between items-center p-3 bg-slate-100 dark:bg-[#2a246f] rounded-lg"><span className="font-medium text-slate-700 dark:text-gray-300">{investimento ? investimento.nome : 'Investimento não encontrado'}</span><span className="font-bold text-slate-800 dark:text-white">{investimento ? formatCurrency(investimento.valor) : ''}</span></div> );
                                            }) : <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">Nenhum investimento vinculado a este objetivo.</p>}
                                        </div>
                                    </div>
                                </div>
                            </Card>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="geral"
                        initial={{ opacity: 0, scale: 1.05 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.05 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                    >
                        <div className="flex flex-col items-center justify-center pt-4 relative min-h-[500px] mb-4">
                            <div className="relative flex items-center justify-center" style={{ width: `${(raioBase + objetivosPorAnel.length * 80) * 2}px`, height: `${(raioBase + objetivosPorAnel.length * 80) * 2}px` }}>
                                <div className="absolute z-30"><img src={userImage} alt="Usuário" className="w-24 h-24 rounded-full border-4 border-white dark:border-[#201b5d] shadow-lg"/></div>
                                {objetivosPorAnel.map((anel, anelIndex) => {
                                    const raioAtual = raioBase + (anelIndex * 80);
                                    const totalObjetivosNoAnel = anel.length;
                                    return (
                                        <React.Fragment key={anelIndex}>
                                            <div className="absolute top-1/2 left-1/2 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-full animate-spin-slow pointer-events-none" style={{ width: `${raioAtual * 2}px`, height: `${raioAtual * 2}px`, transform: 'translate(-50%, -50%)' }}></div>
                                            {anel.map((objetivo, objIndex) => {
                                                let angulo = (objIndex / totalObjetivosNoAnel) * 2 * Math.PI - (Math.PI / 2);
                                                if (anelIndex % 2 !== 0) { const anguloOffset = Math.PI / totalObjetivosNoAnel; angulo += anguloOffset; }
                                                const x = raioAtual * Math.cos(angulo);
                                                const y = raioAtual * Math.sin(angulo);
                                                const Icone = objetivo.icon;
                                                const progressoData = [ { value: objetivo.valorAtual }, { value: Math.max(0, objetivo.valorAlvo - objetivo.valorAtual) } ];
                                                const porcentagemAtingida = objetivo.valorAlvo > 0 ? (objetivo.valorAtual / objetivo.valorAlvo) * 100 : 0;
                                                return (
                                                    <div key={objetivo.id} className="absolute flex flex-col items-center z-10" style={{ top: '50%', left: '50%', transform: `translate(-50%, -50%) translate(${x}px, ${y}px)` }} onMouseEnter={() => setObjetivoHoveredId(objetivo.id)} onMouseLeave={() => setObjetivoHoveredId(null)}>
                                                        <div className="relative w-20 h-20">
                                                            <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={progressoData} dataKey="value" startAngle={90} endAngle={-270} innerRadius="85%" outerRadius="100%" cy="50%" cx="50%" paddingAngle={2}><Cell fill="#00d971" stroke="none" /><Cell fill={theme === 'dark' ? '#2a246f' : '#e2e8f0'} stroke="none"/></Pie></PieChart></ResponsiveContainer>
                                                            <button onClick={() => setObjetivoSelecionadoId(objetivo.id)} className="absolute inset-2 bg-white dark:bg-[#2a246f] rounded-full flex items-center justify-center shadow-md transform transition-transform hover:scale-110" title={objetivo.nome}>
                                                                {objetivoHoveredId === objetivo.id ? ( <span className="text-xs font-bold text-slate-800 dark:text-white">{porcentagemAtingida.toFixed(0)}%</span> ) : ( <Icone size={24} className="text-[#00d971]" /> )}
                                                            </button>
                                                        </div>
                                                        <p className="mt-2 text-xs font-semibold text-center text-slate-600 dark:text-gray-400 w-24 truncate">{objetivo.nome}</p>
                                                    </div>
                                                )
                                            })}
                                        </React.Fragment>
                                    )
                                })}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <button onClick={() => setIsModalOpen(true)} className="fixed bottom-10 right-10 bg-[#00d971] text-black w-16 h-16 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform z-30">
                <PlusCircle size={32} />
            </button>
            <ModalObjetivo isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveObjetivo} />
        </div>
    );
};


// --- FUNÇÕES UTILITÁRIAS ---
const formatCurrency = (value) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

// --- COMPONENTES DE TELA ---

const TelaLogin = ({ onNavigateToRegister, setIsAuthenticated }) => {
  const handleLogin = (e) => { e.preventDefault(); setIsAuthenticated(true); };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-[#201b5d] rounded-xl shadow-lg h-[500px]">
        <div className="text-center">
            <img 
                src={logo} 
                alt="Logo SeuConsultor" 
                className="h-20 w-auto mx-auto mb-4"
                style={{ filter: 'invert(42%) sepia(93%) saturate(2000%) hue-rotate(133deg) brightness(100%) contrast(107%)' }} 
            />
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Bem-vindo!</h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">Faça login para controlar suas finanças</p>
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label><input type="email" required className="w-full px-3 py-2 mt-1 text-slate-900 dark:text-white bg-slate-100 dark:bg-[#2a246f] border border-slate-300 dark:border-[#3e388b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d971]" placeholder="seu@email.com" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label><input type="password" required className="w-full px-3 py-2 mt-1 text-slate-900 dark:text-white bg-slate-100 dark:bg-[#2a246f] border border-slate-300 dark:border-[#3e388b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d971]" placeholder="********" /></div>
            <button type="submit" className="w-full py-2 font-semibold text-black bg-[#00d971] rounded-md hover:brightness-90 transition duration-300 flex items-center justify-center gap-2 text-base"><LogIn size={18} /> Entrar</button>
        </form>
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Não tem uma conta?{' '}
            <button type="button" onClick={onNavigateToRegister} className="font-medium text-[#00d971] hover:underline">Cadastre-se</button>
        </p>
    </div>
  );
};

const TelaCadastro = ({ onNavigateToLogin, setCurrentPage }) => {
  const handleCadastro = (e) => { e.preventDefault(); alert("Cadastro realizado!"); onNavigateToLogin(); };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-[#2a246f] rounded-xl shadow-lg h-[500px]">
        <div className="text-center"><h1 className="text-3xl font-bold text-slate-900 dark:text-white">Crie sua Conta</h1><p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">Comece sua jornada para a saúde financeira</p></div>
        <form className="space-y-4" onSubmit={handleCadastro}>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label><input type="text" required className="w-full px-3 py-2 mt-1 text-slate-900 dark:text-white bg-slate-100 dark:bg-[#2a246f] border border-slate-300 dark:border-[#3e388b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d971]" placeholder="Seu Nome Completo" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label><input type="email" required className="w-full px-3 py-2 mt-1 text-slate-900 dark:text-white bg-slate-100 dark:bg-[#2a246f] border border-slate-300 dark:border-[#3e388b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d971]" placeholder="seu@email.com" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label><input type="password" required className="w-full px-3 py-2 mt-1 text-slate-900 dark:text-white bg-slate-100 dark:bg-[#2a246f] border border-slate-300 dark:border-[#3e388b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d971]" placeholder="Crie uma senha forte" /></div>
            <button type="submit" className="w-full py-2 font-semibold text-black bg-[#00d971] rounded-md hover:brightness-90 transition duration-300 flex items-center justify-center gap-2 text-base"><UserPlus size={18} /> Cadastrar</button>
        </form>
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Já tem uma conta?{' '}
            <button type="button" onClick={onNavigateToLogin} className="font-medium text-[#00d971] hover:underline">Faça login</button>
        </p>
    </div>
  );
};

const FlippableCard = ({ isFlipped, front, back }) => {
    return (
        // Define o ambiente 3D para o efeito de perspectiva
        <div style={{ perspective: '1200px' }}>
            <motion.div
                className="relative w-full h-[500px]" // Altura fixa para o card
                style={{ transformStyle: 'preserve-3d' }}
                initial={false}
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.7, ease: "easeInOut" }}
            >
                {/* Lado da Frente (Login) */}
                <div className="absolute w-full h-full" style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
                    {front}
                </div>
                {/* Lado de Trás (Cadastro), já pré-rotacionado */}
                <div className="absolute w-full h-full" style={{ transform: 'rotateY(180deg)', backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}>
                    {back}
                </div>
            </motion.div>
        </div>
    );
};

const TelaAutenticacao = ({ setIsAuthenticated, setCurrentPage }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    // Funções para simular login/cadastro foram movidas para dentro dos componentes filhos
    // para manter este componente limpo e focado no layout e na animação.

    return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-slate-100 dark:bg-gray-900">
            {/* ##### CORREÇÃO ADICIONADA AQUI ##### */}
            {/* Esta div wrapper força a largura correta para o card animado */}
            <div className="w-full max-w-md">
                <FlippableCard
                    isFlipped={isFlipped}
                    front={
                        <TelaLogin 
                            onNavigateToRegister={() => setIsFlipped(true)} 
                            setIsAuthenticated={setIsAuthenticated} 
                        />
                    }
                    back={
                        <TelaCadastro 
                            onNavigateToLogin={() => setIsFlipped(false)} 
                            setCurrentPage={setCurrentPage} 
                        />
                    }
                />
            </div>
        </div>
    );
};

const Card = ({ children, className = '' }) => (
    <div className={`bg-white dark:bg-[#201b5d] p-4 rounded-xl shadow-lg border border-slate-200 dark:border-transparent ${className}`}>
        {children}
    </div>
);

const ModalItemOrcamento = ({ isOpen, onClose, onSave, context }) => {
    const isEditing = !!context.item;
    const [nome, setNome] = useState(isEditing ? context.item.nome : '');
    const [valor, setValor] = useState(isEditing ? context.item.atual.toString() : '');
    // Novo estado para a categoria selecionada
    const [categoriaId, setCategoriaId] = useState(isEditing ? context.item.categoriaId : 'outros');

    // Limpa o formulário quando o modal é fechado ou o contexto muda
    useEffect(() => {
        if (isOpen) {
            if (isEditing) {
                setNome(context.item.nome);
                setValor(context.item.atual.toString());
                setCategoriaId(context.item.categoriaId || 'outros');
            } else {
                setNome('');
                setValor('');
                setCategoriaId('outros');
            }
        }
    }, [isOpen, context, isEditing]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        const dadosSalvos = {
            nome,
            valor: parseFloat(valor),
            id: isEditing ? context.item.id : null,
            categoriaId: context.category.tipo === 'despesa' ? categoriaId : null // Salva a categoria apenas para despesas
        };
        onSave(dadosSalvos);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-[#201b5d] rounded-lg p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">{isEditing ? 'Editar Item' : `Adicionar em ${context.category.nome}`}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Nome</label>
                        <input value={nome} onChange={(e) => setNome(e.target.value)} type="text" required className="w-full mt-1 px-3 py-2 text-slate-900 dark:text-white bg-slate-100 dark:bg-[#2a246f] border border-slate-300 dark:border-[#3e388b] rounded-md"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Valor (R$)</label>
                        <input value={valor} onChange={(e) => setValor(e.target.value)} type="number" step="0.01" required className="w-full mt-1 px-3 py-2 text-slate-900 dark:text-white bg-slate-100 dark:bg-[#2a246f] border border-slate-300 dark:border-[#3e388b] rounded-md"/>
                    </div>
                    
                    {/* NOVO CAMPO: Seletor de Categoria (só aparece para despesas) */}
                    {context.category.tipo === 'despesa' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Categoria</label>
                            <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} className="w-full mt-1 px-3 py-2 text-slate-900 dark:text-white bg-slate-100 dark:bg-[#2a246f] border border-slate-300 dark:border-[#3e388b] rounded-md">
                                {Object.entries(CATEGORIAS_FLUXO).map(([key, { label }]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex items-center justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="text-gray-600 dark:text-gray-300 hover:text-slate-900 dark:hover:text-white transition">Cancelar</button>
                        <button type="submit" className="bg-[#00d971] hover:brightness-90 text-black font-bold py-2 px-4 rounded-lg">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const CustomPieLegend = ({ payload, chartData }) => {
    return (
        <div className="mt-4 text-xs">
            <div className="flex items-center justify-between font-bold mb-2 px-1">
                <span className="text-slate-800 dark:text-white">Categoria</span>
                <div className="flex gap-4">
                    <span className="text-slate-800 dark:text-white w-12 text-center">Atual</span>
                    <span className="text-slate-800 dark:text-white w-12 text-center">Sugerido</span>
                </div>
            </div>
            <ul className="flex flex-col gap-1">
                {payload.map((entry) => {
                    const itemData = chartData.find(d => d.name === entry.value);
                    if (!itemData) return null;
                    return (
                        <li key={`item-${entry.value}`} className="flex items-center justify-between p-1 rounded-md hover:bg-white/5">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-slate-800 dark:text-white">{entry.value}</span>
                            </div>
                            <div className="flex gap-4">
                                <span className="font-semibold text-slate-800 dark:text-white w-12 text-center">{itemData.percAtual}%</span>
                                <span className="font-semibold text-[#a39ee8] w-12 text-center">{itemData.percSugerido}%</span>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

const TelaOrcamento = ({ categorias, setCategorias, orcamentoCalculos, pieChartData }) => {
    const [expandedCategories, setExpandedCategories] = useState({});
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalContext, setModalContext] = useState({ mode: 'add', category: null, item: null });
    const [editingSugeridoId, setEditingSugeridoId] = useState(null);
    const [sugeridoInputValue, setSugeridoInputValue] = useState("");

    const toggleCategory = (categoryId) => setExpandedCategories(prev => ({ ...prev, [categoryId]: !prev[categoryId] }));
    
    const handleOpenModal = (mode, category, item = null) => {
        setModalContext({ mode, category, item });
        setIsModalOpen(true);
    };

    const handleSaveItem = ({ nome, valor, id, categoriaId }) => {
        const categoryIdToUpdate = modalContext.category.id;
        setCategorias(prev => prev.map(cat => {
            if (cat.id === categoryIdToUpdate) {
                let subItensAtualizados;
                if (id) { // Modo de Edição
                    subItensAtualizados = cat.subItens.map(item => 
                        item.id === id ? { ...item, nome, atual: valor, categoriaId: categoriaId !== undefined ? categoriaId : item.categoriaId } : item
                    );
                } else { // Modo de Criação
                    const novoItem = { id: Date.now(), nome, atual: valor, sugerido: valor, categoriaId };
                    subItensAtualizados = [...cat.subItens, novoItem];
                }
                return { ...cat, subItens: subItensAtualizados };
            }
            return cat;
        }));
    };

    const handleDeleteItem = (categoryId, itemId) => {
        setCategorias(prev => prev.map(cat => {
            if (cat.id === categoryId) return { ...cat, subItens: cat.subItens.filter(item => item.id !== itemId) };
            return cat;
        }));
    };

    const handleEditSugeridoClick = (item) => {
        setEditingSugeridoId(item.id);
        setSugeridoInputValue(item.sugerido.toString());
    };

    const handleSugeridoSave = (categoryId, itemId) => {
        const newValue = parseFloat(sugeridoInputValue);
        if (!isNaN(newValue)) {
            setCategorias(prev => prev.map(cat => {
                if (cat.id === categoryId) {
                    return { ...cat, subItens: cat.subItens.map(item => item.id === itemId ? { ...item, sugerido: newValue } : item) };
                }
                return cat;
            }));
        }
        setEditingSugeridoId(null);
    };

    const handleSugeridoInputKeyDown = (e, categoryId, itemId) => {
        if (e.key === 'Enter') handleSugeridoSave(categoryId, itemId);
        if (e.key === 'Escape') setEditingSugeridoId(null);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            <div className="lg:col-span-3 gap-4">
                <Card className="mb-4">
                    <div>
                        <div className="grid grid-cols-3 items-center gap-4 p-2 text-sm"><span className="font-semibold text-slate-800 dark:text-white"></span><span className="font-semibold text-slate-800 dark:text-white text-right">Atual</span><span className="font-semibold text-slate-800 dark:text-white text-right">Sugerido</span></div>
                        {categorias.map(cat => {
                            const Icon = cat.icon;
                            const isExpanded = !!expandedCategories[cat.id];
                            const totalAtual = cat.subItens.reduce((acc, item) => acc + item.atual, 0);
                            const percAtual = orcamentoCalculos.atual.despesas > 0 ? (totalAtual / orcamentoCalculos.atual.despesas) * 100 : 0;
                            const corTexto = cat.tipo === 'receita' ? 'text-[#00d971]' : 'text-red-400';
                            return (
                                <div key={cat.id} className="border-t border-[#3e388b]">
                                    <div className="grid grid-cols-3 items-center gap-4 p-2 hover:bg-[#3e388b]/30 rounded-lg cursor-pointer text-slate-800" onClick={() => toggleCategory(cat.id)}>
                                        <div className="flex items-center gap-2"><button className="text-slate-800 dark:text-white hover:text-white">{isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}</button><Icon size={18} className="text-slate-800 dark:text-white" /><span className="font-bold text-slate-600 dark:text-white">{cat.nome}</span></div>
                                        <div className={`text-right font-semibold ${corTexto}`}>{cat.tipo === 'despesa' && <span className="text-xs text-slate-800 dark:text-white mr-2">({percAtual.toFixed(1)}%)</span>}{formatCurrency(totalAtual)}</div>
                                        <div className="text-right font-semibold text-[#a39ee8]">{formatCurrency(cat.subItens.reduce((acc, item) => acc + item.sugerido, 0))}</div>
                                    </div>
                                    {isExpanded && (<div className="pl-10 pr-4 pb-2 space-y-2 text-xs">
                                        {cat.subItens.map(item => (<div key={item.id} className="grid grid-cols-3 items-center gap-4">
                                            <span className="text-slate-800 dark:text-white col-span-1">{item.nome}</span>
                                            <div className="flex justify-end items-center gap-2"><span className="text-slate-800 dark:text-white text-right">{formatCurrency(item.atual)}</span><button onClick={(e) => {e.stopPropagation(); handleOpenModal('edit', cat, item)}} className="text-slate-800 dark:text-white hover:text-[#00d971]"><Edit size={12}/></button><button onClick={(e) => {e.stopPropagation(); handleDeleteItem(cat.id, item.id)}} className="text-slate-800 dark:text-white hover:text-red-400"><Trash2 size={12}/></button></div>
                                            <div className="text-right flex justify-end items-center gap-2">
                                                {editingSugeridoId === item.id ? (
                                                    <input type="number" value={sugeridoInputValue} onChange={(e) => setSugeridoInputValue(e.target.value)} onBlur={() => handleSugeridoSave(cat.id, item.id)} onKeyDown={(e) => handleSugeridoInputKeyDown(e, cat.id, item.id)} className="w-20 bg-white dark:bg-[#201b5d] text-slate-800 dark:text-white text-right rounded-md px-1 py-0.5 border border-[#00d971] focus:outline-none focus:ring-1 focus:ring-[#00d971]" autoFocus onClick={(e) => e.stopPropagation()} />
                                                ) : (
                                                    <>
                                                        <span className="text-[#a39ee8]">{formatCurrency(item.sugerido)}</span>
                                                        <button onClick={(e) => {e.stopPropagation(); handleEditSugeridoClick(item)}} className="text-slate-800 dark:text-white hover:text-[#00d971]"><Edit size={12} /></button>
                                                    </>
                                                )}
                                            </div>
                                        </div>))}
                                        <div className="pt-2"><button onClick={(e) => {e.stopPropagation(); handleOpenModal('add', cat)}} className="flex items-center gap-2 text-xs text-[#00d971] hover:brightness-90 font-semibold"><PlusCircle size={14} />Adicionar</button></div>
                                    </div>)}
                                </div>
                            );
                        })}
                    </div>
                </Card>
                <Card>
                    <div className="grid grid-cols-3 gap-4 text-center text-sm space-y-1">
                        <div></div><div className="font-bold text-slate-800 dark:text-white">Atual</div><div className="font-bold text-slate-800 dark:text-white">Sugerido</div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-center mt-2 border-t border-[#3e388b] pt-3">
                        <div className="text-left font-semibold text-slate-800 dark:text-white text-sm">Saldo esperado</div>
                        <div className="font-semibold text-base text-[#00d971]">{formatCurrency(orcamentoCalculos.atual.receitas - orcamentoCalculos.atual.despesas)}</div>
                        <div className="font-semibold text-base text-[#a39ee8]">{formatCurrency(orcamentoCalculos.sugerido.receitas - orcamentoCalculos.sugerido.despesas)}</div>
                    </div>
                </Card>
            </div>
            <div className="lg:col-span-2">
                <Card>
                    <h2 className="text-lg font-bold text-white mb-4 text-center">Divisão de Gastos</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <h3 className="text-center font-semibold text-slate-800 dark:text-white mb-2 text-sm">Atual</h3>
                            <ResponsiveContainer width="100%" height={150}>
                                <PieChart>
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                    <Pie data={pieChartData} dataKey="valueAtual" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                                        {pieChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div>
                            <h3 className="text-center font-semibold text-[#a39ee8] mb-2 text-sm">Sugerido</h3>
                            <ResponsiveContainer width="100%" height={150}>
                                <PieChart>
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                    <Pie data={pieChartData} dataKey="valueSugerido" nameKey="name" cx="50%" cy="50%" outerRadius={60} label>
                                        {pieChartData.map((entry, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                    <CustomPieLegend payload={pieChartData.map((d, i) => ({ value: d.name, color: PIE_COLORS[i % PIE_COLORS.length] }))} chartData={pieChartData} />
                </Card>
            </div>
            <ModalItemOrcamento isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSaveItem} context={modalContext} />
        </div>
    );
};

// --- TELA DE PROTEÇÃO ---
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
            id: Date.now(),
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
            id: Date.now(),
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
            id: Date.now(),
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
                                                    <input type="text" value={editingFuturaData.nome} onChange={e => setEditingFuturaData({...editingFuturaData, nome: e.target.value})} className="col-span-3 bg-[#201b5d] text-slate-800 dark:text-white rounded-md px-1 py-0.5 border border-[#00d971]"/>
                                                    <input type="number" value={editingFuturaData.anoInicio} onChange={e => setEditingFuturaData({...editingFuturaData, anoInicio: e.target.value})} className="col-span-2 bg-[#201b5d] text-slate-800 dark:text-white rounded-md px-1 py-0.5 border border-[#00d971]"/>
                                                    <input type="number" value={editingFuturaData.valorMensal} onChange={e => setEditingFuturaData({...editingFuturaData, valorMensal: e.target.value})} className="col-span-2 bg-[#201b5d] text-slate-800 dark:text-white rounded-md px-1 py-0.5 border border-[#00d971]"/>
                                                    <input type="number" value={editingFuturaData.prazoMeses} onChange={e => setEditingFuturaData({...editingFuturaData, prazoMeses: e.target.value})} className="col-span-2 bg-[#201b5d] text-slate-800 dark:text-white rounded-md px-1 py-0.5 border border-[#00d971]"/>
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
                                                    <p className="col-span-1 font-semibold text-white">{formatCurrency(item.valorMensal * item.prazoMeses)}</p>
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

// --- TELA DE RESERVA DE EMERGÊNCIA ---
const TelaReservaEmergencia = ({ orcamentoCalculos }) => {
    const [cenario, setCenario] = useState('cenario1');
    const [mesesReservaIdeal, setMesesReservaIdeal] = useState(6);
    const [investimentosSelecionados, setInvestimentosSelecionados] = useState({});

    const baseCalculo = useMemo(() => {
        const { fixos, variaveis, investimentos, renda } = orcamentoCalculos.categorias;
        switch (cenario) {
            case 'cenario1': return fixos + (variaveis * 0.7);
            case 'cenario2': return fixos + variaveis;
            case 'cenario3': return fixos + variaveis + investimentos;
            case 'cenario4': return renda;
            default: return 0;
        }
    }, [cenario, orcamentoCalculos]);

    const reservaMinima = baseCalculo * 3;
    const reservaIdeal = baseCalculo * mesesReservaIdeal;

    const handleSelectInvestimento = (invId) => {
        setInvestimentosSelecionados(prev => ({...prev, [invId]: !prev[invId]}));
    };

    const totalAcumulado = useMemo(() => {
        return mockInvestimentos.reduce((acc, inv) => {
            if(investimentosSelecionados[inv.id]) {
                return acc + inv.valor;
            }
            return acc;
        }, 0);
    }, [investimentosSelecionados]);

    const progresso = reservaIdeal > 0 ? (totalAcumulado / reservaIdeal) * 100 : 0;

    return (
        <div className="max-w-4xl mx-auto">
            <Card className="mb-4">
                <div className="flex items-center gap-3 mb-4">
                    <Target className="text-[#00d971]" size={24} />
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">Cálculo da Reserva</h2>
                </div>
                <div className="mb-4">
                    <label className="block text-sm font-medium text-slate-800 dark:text-white mb-2">Selecione o cenário para o cálculo base:</label>
                    <select value={cenario} onChange={(e) => setCenario(e.target.value)} className="w-full bg-[white] text-slate-800 dark:text-slate-800 rounded-md px-2 py-2 border border-[#3e388b] focus:outline-none focus:ring-1 focus:ring-[#00d971]">
                        <option value="cenario1">Fixos + 70% dos Variáveis</option>
                        <option value="cenario2">Fixos + Variáveis</option>
                        <option value="cenario3">Fixos + Variáveis + Investimentos</option>
                        <option value="cenario4">Renda</option>
                    </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                    <div className="bg-[#201b5d]/50 p-3 rounded-lg">
                        <p className="text-sm text-slate-800 dark:text-white">Reserva Mínima (3 meses)</p>
                        <p className="text-xl font-bold text-white mt-1">{formatCurrency(reservaMinima)}</p>
                    </div>
                    <div className="bg-[#201b5d]/50 p-3 rounded-lg">
                        <div className="flex justify-center items-center gap-2">
                             <p className="text-sm text-slate-800 dark:text-white">Reserva Ideal</p>
                             <select value={mesesReservaIdeal} onChange={e => setMesesReservaIdeal(parseInt(e.target.value))} className="bg-transparent text-white border-none focus:ring-0 p-0 text-sm">
                                {[...Array(22).keys()].map(i => <option key={i+3} value={i+3}>{i+3} meses</option>)}
                             </select>
                        </div>
                        <p className="text-2xl font-bold text-[#00d971] mt-1">{formatCurrency(reservaIdeal)}</p>
                    </div>
                </div>
            </Card>
            <Card>
                 <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Composição da Reserva</h2>
                 <p className="text-sm text-slate-800 dark:text-white mb-2">Selecione os investimentos que compõem sua reserva de emergência:</p>
                 <div className="space-y-2 text-sm">
                    {mockInvestimentos.map(inv => (
                        <label key={inv.id} className="flex items-center justify-between p-2 bg-[#201b5d]/50 rounded-lg cursor-pointer">
                            <div className="flex items-center gap-3">
                                <input type="checkbox" checked={!!investimentosSelecionados[inv.id]} onChange={() => handleSelectInvestimento(inv.id)} className="form-checkbox h-4 w-4 text-[#00d971] bg-gray-700 border-gray-600 rounded focus:ring-[#00d971]" />
                                <span className="text-white">{inv.nome}</span>
                            </div>
                            <span className="font-semibold text-slate-800 dark:text-white">{formatCurrency(inv.valor)}</span>
                        </label>
                    ))}
                 </div>
                 <div className="mt-6">
                    <div className="flex justify-between items-center mb-1">
                        <p className="text-sm text-slate-800 dark:text-white">Progresso da Reserva Ideal</p>
                        <p className="text-sm font-bold text-[#00d971]">{formatCurrency(totalAcumulado)} / {formatCurrency(reservaIdeal)}</p>
                    </div>
                    <div className="w-full bg-[#201b5d] rounded-full h-4">
                        <div className="bg-[#00d971] h-4 rounded-full text-xs text-black flex items-center justify-center font-bold" style={{ width: `${Math.min(progresso, 100)}%` }}>
                           {progresso.toFixed(1)}%
                        </div>
                    </div>
                 </div>
            </Card>
        </div>
    );
};

// --- TELA DE APOSENTADORIA ---
const TelaAposentadoria = () => {
    const [idadeAtual, setIdadeAtual] = useState(30);
    const [idadeAposentadoria, setIdadeAposentadoria] = useState(65);
    const [patrimonioInicial, setPatrimonioInicial] = useState(50000);
    const [rendaDesejada, setRendaDesejada] = useState(5000);
    const [rentabilidadeAnual, setRentabilidadeAnual] = useState(8);
    const [tipoPrevidencia, setTipoPrevidencia] = useState('VGBL');
    const [aportes, setAportes] = useState([{ id: 1, ano: 1, valor: 1000 }]);
    const [aporteRestante, setAporteRestante] = useState(0);

    const { projectionData, capitalNecessario, valorAcumulado } = useMemo(() => {
        const taxaMensal = Math.pow(1 + rentabilidadeAnual / 100, 1 / 12) - 1;
        const anosContribuicao = Math.max(0, idadeAposentadoria - idadeAtual);

        let acumulado = patrimonioInicial;
        const data = [{ idade: idadeAtual, valor: acumulado }];

        // Fase de Acumulação
        for (let i = 0; i < anosContribuicao; i++) {
            const anoAtualContribuicao = i + 1;
            const aporteEspecifico = aportes.find(a => a.ano === anoAtualContribuicao);
            const aporteDoAno = (aporteEspecifico ? aporteEspecifico.valor : aporteRestante) * 12;

            acumulado = (acumulado + aporteDoAno) * (1 + (taxaMensal * 12));
            data.push({ idade: idadeAtual + i + 1, valor: Math.max(0, acumulado) });
        }
        const valorFinalAcumulado = acumulado;

        // Cálculo do Capital Necessário para a renda desejada
        const taxaIR = 0.10; // Alíquota fixa de 10% para regime regressivo de longo prazo
        let capitalNecessarioCalc = 0;
        if(rentabilidadeAnual > 0) {
            const rendimentoLiquidoAnual = (rentabilidadeAnual / 100) * (1 - taxaIR);
            if (rendimentoLiquidoAnual > 0) {
                 capitalNecessarioCalc = (rendaDesejada * 12) / rendimentoLiquidoAnual;
            }
        }

        // Fase de Retirada (sem rendimento para simplificar a projeção de consumo)
        let idadeRetirada = idadeAposentadoria;
        let saldoRetirada = valorFinalAcumulado;
        if(saldoRetirada > 0) {
            while(saldoRetirada > 0 && idadeRetirada < 100) {
                idadeRetirada++;
                saldoRetirada -= (rendaDesejada * 12);
                data.push({ idade: idadeRetirada, valor: Math.max(0, saldoRetirada) });
            }
        }

        // Garante que o gráfico vá até os 100 anos
        const ultimaIdade = data.length > 0 ? data[data.length - 1].idade : idadeAtual;
        if (ultimaIdade < 100) {
            for (let i = ultimaIdade + 1; i <= 100; i++) {
                data.push({ idade: i, valor: 0 });
            }
        }

        return { projectionData: data, capitalNecessario: capitalNecessarioCalc, valorAcumulado: valorFinalAcumulado };
    }, [idadeAtual, idadeAposentadoria, patrimonioInicial, aportes, aporteRestante, rendaDesejada, rentabilidadeAnual, tipoPrevidencia]);

    const handleAporteChange = (id, novoValor) => {
        setAportes(prev => prev.map(a => a.id === id ? {...a, valor: parseFloat(novoValor) || 0} : a));
    };

    const addAporteAno = () => {
        setAportes(prev => {
            const proximoAno = prev.length + 1;
            const anosContribuicao = idadeAposentadoria - idadeAtual;
            if (proximoAno >= anosContribuicao) return prev;
            return [...prev, {id: Date.now(), ano: proximoAno, valor: prev[prev.length - 1]?.valor || 1000}]
        });
    };

    const anosRestantes = (idadeAposentadoria - idadeAtual) - aportes.length;

    return (
        <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className='space-y-4'>
                    <Card>
                        <h2 className="text-lg font-bold text-white mb-4">Parâmetros Iniciais</h2>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <label className="block font-medium text-slate-800 dark:text-white">Idade Atual</label>
                                <input type="number" value={idadeAtual} onChange={e => setIdadeAtual(parseInt(e.target.value) || 0)} className="mt-1 w-15 bg-[white] dark:bg-[#201b5d] text-slate-800 dark:text-white rounded-md px-2 py-1 border border-[#3e388b]"/>
                            </div>
                             <div>
                                <label className="block font-medium text-slate-800 dark:text-white">Idade Aposentadoria</label>
                                <input type="number" value={idadeAposentadoria} onChange={e => setIdadeAposentadoria(parseInt(e.target.value) || 0)} className="mt-1 w-25  bg-[white] dark:bg-[#201b5d] text-slate-800 dark:text-white rounded-md px-2 py-1 border border-[#3e388b]"/>
                            </div>
                             <div>
                                <label className="block font-medium text-slate-800 dark:text-white">Patrimônio Inicial</label>
                                <input type="number" value={patrimonioInicial} onChange={e => setPatrimonioInicial(parseFloat(e.target.value) || 0)} className="mt-1 w-25 bg-[white] dark:bg-[#201b5d] text-slate-800 dark:text-white rounded-md px-2 py-1 border border-[#3e388b]"/>
                            </div>
                            <div>
                                <label className="block font-medium text-slate-800 dark:text-white">Renda Mensal Desejada</label>
                                <input type="number" value={rendaDesejada} onChange={e => setRendaDesejada(parseFloat(e.target.value) || 0)} className="mt-1 w-20  bg-[white] dark:bg-[#201b5d]  text-slate-800 dark:text-white rounded-md px-2 py-1 border border-[#3e388b]"/>
                            </div>
                             <div>
                                <label className="block font-medium text-slate-800 dark:text-white">Rentabilidade Anual (%)</label>
                                <input type="number" value={rentabilidadeAnual} onChange={e => setRentabilidadeAnual(parseFloat(e.target.value) || 0)} className="mt-1 w-16  bg-[white] dark:bg-[#201b5d] text-slate-800 dark:text-white rounded-md px-2 py-1 border border-[#3e388b]"/>
                            </div>
                             <div>
                                <label className="block font-medium text-slate-800 dark:text-white">Tipo de Previdência</label>
                                <select value={tipoPrevidencia} onChange={e => setTipoPrevidencia(e.target.value)} className="mt-1 w-full  bg-[white] dark:bg-[#201b5d] text-slate-800 dark:text-white rounded-md px-2 py-1 border border-[#3e388b]">
                                    <option value="VGBL">VGBL</option>
                                    <option value="PGBL">PGBL</option>
                                </select>
                            </div>
                        </div>
                    </Card>
                     <Card>
                        <div className="flex justify-between items-center mb-2">
                             <h2 className="text-lg font-bold text-white">Plano de Aportes</h2>
                             <button onClick={addAporteAno} disabled={anosRestantes <= 0} className="text-xs flex items-center gap-1 text-[#00d971] hover:brightness-90 disabled:opacity-50 disabled:cursor-not-allowed"><PlusCircle size={14} /> Adicionar Ano</button>
                        </div>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                        {aportes.map((aporte) => (
                            <div key={aporte.id} className="flex items-center gap-4 text-sm">
                                <label className="text-slate-800 dark:text-white w-16">Ano {aporte.ano}:</label>
                                <input type="number" value={aporte.valor} onChange={e => handleAporteChange(aporte.id, e.target.value)} className="w-20  bg-[white] dark:bg-[#201b5d] text-slate-800 dark:text-white rounded-md px-2 py-1 border border-[#3e388b]"/>
                            </div>
                        ))}
                         {anosRestantes > 0 && (
                            <div className="flex items-center gap-4 text-sm pt-2 border-t border-[#3e388b]">
                                <label className="text-slate-800 dark:text-white w-28">Restante ({anosRestantes} anos):</label>
                                <input type="number" value={aporteRestante} onChange={e => setAporteRestante(parseFloat(e.target.value) || 0)} className="w-20   bg-[white] dark:bg-[#201b5d] text-slate-800 dark:text-white rounded-md px-2 py-1 border border-[#3e388b]"/>
                            </div>
                         )}
                        </div>
                    </Card>
                </div>
                <Card>
                     <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Projeção</h2>
                     <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={projectionData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                                <defs>
                                    <linearGradient id="colorValor" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#00d971" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#00d971" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#3e388b" />
                                <XAxis type="number" dataKey="idade" stroke="#a39ee8" tick={{ fontSize: 12 }} domain={[idadeAtual, 100]} />
                                <YAxis stroke="#a39ee8" tick={{ fontSize: 12 }} tickFormatter={(value) => new Intl.NumberFormat('pt-BR', { notation: 'compact', compactDisplay: 'short' }).format(value)} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#2a246f', border: '1px solid #3e388b', borderRadius: '0.5rem' }}
                                    labelStyle={{ color: '#ffffff' }}
                                    formatter={(value) => [formatCurrency(value), 'Patrimônio']}
                                />
                                <Area type="monotone" dataKey="valor" stroke="#00d971" fillOpacity={1} fill="url(#colorValor)" />
                            </AreaChart>
                        </ResponsiveContainer>
                     </div>
                     <div className="grid grid-cols-2 gap-4 mt-4 text-center">
                        <div className="bg-[#201b5d]/50 p-3 rounded-lg">
                            <p className="text-sm text-slate-800 dark:text-white">Capital Necessário</p>
                            <p className="text-xl font-bold text-[#a39ee8] mt-1">{formatCurrency(capitalNecessario)}</p>
                        </div>
                        <div className="bg-[#201b5d]/50 p-3 rounded-lg">
                            <p className="text-sm text-slate-800 dark:text-white">Você terá</p>
                            <p className="text-xl font-bold text-[#00d971] mt-1">{formatCurrency(valorAcumulado)}</p>
                        </div>
                     </div>
                </Card>
            </div>
        </div>
    );
};

// --- TELA DE PATRIMÔNIO ---
const TelaPatrimonio = ({ patrimonioData, setPatrimonioData, patrimonioTotal }) => {
    // --- ESTADO E CONFIGURAÇÕES DO COMPONENTE ---
    const { theme } = useContext(ThemeContext);
    const patrimonioCategorias = [ { id: 'investimentos', nome: 'Investimentos', icon: Coins }, { id: 'automoveis', nome: 'Automóveis', icon: CarFront }, { id: 'imoveis', nome: 'Imóveis', icon: Building2 }, { id: 'contaBancaria', nome: 'Conta Bancária', icon: Landmark }, { id: 'beneficios', nome: 'Benefícios', icon: Gift }, { id: 'outros', nome: 'Outros', icon: Package }, { id: 'dividas', nome: 'Dívidas', icon: DollarSign }, ];
    const [abaAtiva, setAbaAtiva] = useState('investimentos');
    const [editingItemId, setEditingItemId] = useState(null);
    const [editingItemData, setEditingItemData] = useState({ nome: '', valor: '' });
    const [historicoPatrimonio, setHistoricoPatrimonio] = useState([ { date: new Date().toISOString().slice(0, 10), value: patrimonioTotal } ]);

    // --- LÓGICA DE DADOS (MEMOIZED) ---
    useEffect(() => {
        setHistoricoPatrimonio(prevHistory => {
            const ultimoRegistro = prevHistory[prevHistory.length - 1];
            if (ultimoRegistro && ultimoRegistro.value !== patrimonioTotal) {
                return [...prevHistory, { date: new Date().toISOString().slice(0, 10), value: patrimonioTotal }];
            }
            return prevHistory;
        });
    }, [patrimonioTotal]);

    // Dados para o Gráfico de Barras (Ativos, Passivos, Líquido)
    const compositionBarData = useMemo(() => {
        const totalAtivos = Object.keys(patrimonioData).filter(key => key !== 'dividas').reduce((acc, key) => acc + (patrimonioData[key]?.reduce((sum, item) => sum + item.valor, 0) || 0), 0);
        const totalPassivos = patrimonioData.dividas?.reduce((sum, item) => sum + item.valor, 0) || 0;
        return [
            { name: 'Ativos', value: totalAtivos, fill: '#3b82f6' },
            { name: 'Passivos', value: totalPassivos, fill: '#ef4444' },
            { name: 'Líquido', value: patrimonioTotal, fill: '#00d971' },
        ]; // Removido o .sort() para manter a ordem definida
    }, [patrimonioData, patrimonioTotal]);
    
    // Dados para o Gráfico de Donut (Composição dos Ativos)
    const assetDonutData = useMemo(() => {
        const categoryLabels = { investimentos: 'Investimentos', automoveis: 'Automóveis', imoveis: 'Imóveis', contaBancaria: 'Conta Bancária', beneficios: 'Benefícios', outros: 'Outros' };
        return Object.keys(categoryLabels)
            .map((key, index) => ({
                name: categoryLabels[key],
                value: patrimonioData[key]?.reduce((sum, item) => sum + item.valor, 0) || 0,
                fill: PIE_COLORS[index % PIE_COLORS.length]
            }))
            .filter(item => item.value > 0);
    }, [patrimonioData]);

    // Dados para o Gráfico de Linha (Evolução no tempo)
    const evolutionChartData = useMemo(() => {
    if (!historicoPatrimonio || historicoPatrimonio.length === 0) return [];

    // 1. Cria um objeto para guardar o último registro de cada mês
    const monthlySnapshots = {};

    // 2. Percorre todo o histórico de transações
    historicoPatrimonio.forEach(entry => {
        const yearMonth = entry.date.slice(0, 7); // Cria uma chave "AAAA-MM"
        // Sempre substitui pelo registro mais recente daquele mês
        monthlySnapshots[yearMonth] = entry;
    });

    // 3. Converte os valores do objeto de volta para um array
    const lastEntryPerMonth = Object.values(monthlySnapshots);

    // 4. Formata o array final para o gráfico
    return lastEntryPerMonth.map(entry => ({
        label: new Date(entry.date).toLocaleDateString('pt-BR', {
            month: 'short',
            year: '2-digit',
            timeZone: 'UTC' // Importante para evitar problemas de fuso horário
        }),
        value: entry.value
    }));
    }, [historicoPatrimonio]);

    // ##### NOVO: Função para renderizar os percentuais no gráfico de Donut #####
    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        // Não renderiza o rótulo para fatias muito pequenas
        if (percent < 0.05) {
            return null;
        }
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="12px" fontWeight="bold">
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    // --- HANDLERS PARA A LISTA DE ITENS ---
    const handleAddItem = () => { const newItem = { id: Date.now(), nome: 'Novo Item', valor: 0 }; setPatrimonioData(prev => ({ ...prev, [abaAtiva]: [...prev[abaAtiva], newItem] })); };
    const handleDeleteItem = (id) => { setPatrimonioData(prev => ({ ...prev, [abaAtiva]: prev[abaAtiva].filter(item => item.id !== id) })); };
    const handleStartEdit = (item) => { setEditingItemId(item.id); setEditingItemData({ nome: item.nome, valor: item.valor }); };
    const handleCancelEdit = () => { setEditingItemId(null); };
    const handleSaveEdit = (id) => { setPatrimonioData(prev => ({ ...prev, [abaAtiva]: prev[abaAtiva].map(item => item.id === id ? { ...item, ...editingItemData, valor: parseFloat(editingItemData.valor) || 0 } : item) })); setEditingItemId(null); };

    // --- RENDERIZAÇÃO DO COMPONENTE ---
    return (
        <div className="max-w-7xl mx-auto space-y-6">

            {/* Layout em Grade para os 3 Gráficos Principais */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* CARD 1: Gráfico de Barras Horizontais */}
                <Card>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Composição Geral</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={compositionBarData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={theme === 'dark' ? 0.2 : 0.1} />
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12, fill: theme === 'dark' ? '#a39ee8' : '#6b7280' }} />
                            <Tooltip formatter={(value) => formatCurrency(value)} cursor={{ fill: 'transparent' }} contentStyle={theme === 'dark' ? { backgroundColor: '#201b5d', border: '1px solid #3e388b' } : {}}/>
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={25}> {/* <-- ALTERAÇÃO 3: Barras mais finas */}
                                {/* ##### ALTERAÇÃO 2: Adiciona os valores nas barras ##### */}
                                <LabelList 
                                    dataKey="value" 
                                    position="right" 
                                    offset={5} 
                                    formatter={(value) => formatCurrency(value)}
                                    style={{ fill: theme === 'dark' ? '#a39ee8' : '#374151', fontSize: '12px' }}
                                />
                                {compositionBarData.map((entry) => ( <Cell key={`cell-${entry.name}`} fill={entry.fill} /> ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

                {/* CARD 2: Gráfico de Donut */}
                <Card>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Composição dos Ativos</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <PieChart>
                            <Pie data={assetDonutData} dataKey="value" nameKey="name" innerRadius="30%" outerRadius="80%" labelLine={false} label={renderCustomizedLabel} cx="50%" cy="50%">
                                {assetDonutData.map((entry) => ( <Cell key={`cell-${entry.name}`} fill={entry.fill} /> ))}
                            </Pie>
                            <Tooltip formatter={(value) => [formatCurrency(value), 'Valor']} contentStyle={theme === 'dark' ? { backgroundColor: 'white', border: '1px solid #3e388b' } : {}}/>
                            <Legend iconSize={10} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>

                {/* CARD 3: Gráfico de Linha da Evolução */}
                <Card>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Evolução do Patrimônio</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <LineChart data={evolutionChartData} margin={{ top: 5, right: 20, left: 0, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={theme === 'dark' ? 0.2 : 0.1} />
                            <XAxis dataKey="label" tick={{ fontSize: 10, fill: theme === 'dark' ? '#a39ee8' : '#6b7280' }} interval="preserveStartEnd" />
                            <YAxis tickFormatter={(v) => new Intl.NumberFormat('pt-BR', {notation: 'compact',compactDisplay: 'short'}).format(v)} tick={{ fontSize: 10, fill: theme === 'dark' ? '#a39ee8' : '#6b7280' }} />
                            <Tooltip formatter={(value) => [formatCurrency(value), 'Patrimônio']} contentStyle={theme === 'dark' ? { backgroundColor: '#201b5d', border: '1px solid #3e388b' } : {}} labelStyle={theme === 'dark' ? { color: '#a39ee8' } : {}}/>
                            <Line type="monotone" dataKey="value" name="Patrimônio Líquido" stroke="#00d971" strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 6 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            {/* Card inferior para gerenciar os itens (seu código mantido) */}
            <Card>
                <div className="flex items-center border-b border-slate-200 dark:border-b-[#3e388b] overflow-x-auto">
                    {patrimonioCategorias.map(cat => ( <button key={cat.id} onClick={() => setAbaAtiva(cat.id)} className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors duration-200 border-b-2 ${abaAtiva === cat.id ? 'border-[#00d971] text-[#00d971]' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white'}`}> <cat.icon size={16} />{cat.nome} </button> ))}
                </div>
                <div className="mt-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white capitalize">{patrimonioCategorias.find(c => c.id === abaAtiva)?.nome}</h2>
                        <button onClick={handleAddItem} className="text-xs flex items-center gap-1 text-[#00d971] hover:brightness-90 font-semibold"><PlusCircle size={14} /> Adicionar Item</button>
                    </div>
                    <div className="space-y-2 text-sm">
                        {patrimonioData[abaAtiva] && patrimonioData[abaAtiva].length > 0 ? patrimonioData[abaAtiva].map(item => ( <div key={item.id} className="grid grid-cols-12 gap-4 items-center p-2 hover:bg-slate-100 dark:hover:bg-[#2a246f]/50 rounded"> {editingItemId === item.id ? ( <> <input type="text" value={editingItemData.nome} onChange={e => setEditingItemData({...editingItemData, nome: e.target.value})} className="col-span-6 bg-white dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-2 py-1 border border-slate-300 dark:border-[#3e388b]"/> <input type="number" value={editingItemData.valor} onChange={e => setEditingItemData({...editingItemData, valor: e.target.value})} className="col-span-4 bg-white dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-2 py-1 border border-slate-300 dark:border-[#3e388b]"/> <div className="col-span-2 flex justify-end items-center gap-3"> <button onClick={() => handleSaveEdit(item.id)} className="text-slate-600 dark:text-gray-300 hover:text-[#00d971]">Salvar</button> <button onClick={handleCancelEdit} className="text-slate-600 dark:text-gray-300 hover:text-red-500">X</button> </div> </> ) : ( <> <p className="col-span-6 text-slate-800 dark:text-gray-300">{item.nome}</p> <p className="col-span-4 font-semibold text-slate-900 dark:text-white">{formatCurrency(item.valor)}</p> <div className="col-span-2 flex justify-end items-center gap-3"> <button onClick={() => handleStartEdit(item)} className="text-gray-500 dark:text-gray-400 hover:text-[#00d971]"><Edit size={16} /></button> <button onClick={() => handleDeleteItem(item.id)} className="text-gray-500 dark:text-gray-400 hover:text-red-500"><Trash2 size={16} /></button> </div> </> )} </div> )) : <p className="text-center text-gray-500 dark:text-gray-400 p-4 text-xs">Nenhum item adicionado nesta categoria.</p>}
                    </div>
                </div>
            </Card>
        </div>
    );
};

// 1. COMPONENTE GENÉRICO REUTILIZÁVEL
const TelaAquisicaoGenerica = ({ titulo, descricaoBem, permitirFGTS }) => {
    const { theme } = useContext(ThemeContext);
    
    const initialFormState = {
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
    };

    const [novoCaso, setNovoCaso] = useState(initialFormState);
    const [casos, setCasos] = useState([]);
    const [casoSelecionado, setCasoSelecionado] = useState(null);
    const [activeChart, setActiveChart] = useState('acumulo');

    const handleSelectCaso = (caso) => {
        setNovoCaso(caso);
        setCasoSelecionado(caso);
    };

    const handleUpdateCaso = () => {
        if (!casoSelecionado) return;
        const casoAtualizado = { ...novoCaso, id: casoSelecionado.id };
        setCasos(prev => prev.map(c => c.id === casoSelecionado.id ? casoAtualizado : c));
        setCasoSelecionado(casoAtualizado);
        alert("Simulação atualizada com sucesso!");
    };

    const handleDeleteCaso = (idToDelete) => {
        setCasos(prev => prev.filter(c => c.id !== idToDelete));
        if (casoSelecionado?.id === idToDelete) {
            setCasoSelecionado(null);
            setNovoCaso(initialFormState);
        }
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

    const handleAddCaso = (e) => {
        e.preventDefault();
        if (!novoCaso.descricao || !novoCaso.valorTotal) return;
        const casoAdicionado = { ...novoCaso, id: Date.now() };
        setCasos(prev => [...prev, casoAdicionado]);
        setCasoSelecionado(casoAdicionado);
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

    return (
        <div className="max-w-6xl mx-auto">
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
            )}
        </div>
    );
};

// 2. COMPONENTES DE TELA ESPECÍFICOS
const TelaAquisicaoImoveis = () => {
    return (
        <TelaAquisicaoGenerica
            descricaoBem="Apartamento na Praia"
            permitirFGTS={true}
        />
    );
};

const TelaAquisicaoAutomoveis = () => {
    return (
        <TelaAquisicaoGenerica
            descricaoBem="Carro 0km"
            permitirFGTS={false}
        />
    );
};

const categorizeByAI = (description) => {
    const desc = description.toLowerCase();
    if (desc.includes('ifood') || desc.includes('restaurante')) return 'alimentacao';
    if (desc.includes('uber') || desc.includes('99') || desc.includes('posto')) return 'transporte';
    if (desc.includes('supermercado') || desc.includes('mercado')) return 'alimentacao';
    if (desc.includes('cinema') || desc.includes('show') || desc.includes('bar')) return 'lazer';
    if (desc.includes('amazon') || desc.includes('livraria') || desc.includes('loja')) return 'compras';
    if (desc.includes('farmácia') || desc.includes('droga')) return 'saude';
    if (desc.includes('net') || desc.includes('claro') || desc.includes('taxa')) return 'servicos';
    return null; // Retorna null para que o usuário possa categorizar
};

// PASSO 1: ADICIONE ESTE NOVO COMPONENTE AO SEU ARQUIVO

const ModalNovaTransacao = ({ isOpen, onClose, onSave }) => {
    const [descricao, setDescricao] = useState('');
    const [valor, setValor] = useState('');
    const [data, setData] = useState(new Date().toISOString().slice(0, 10));
    const [tipo, setTipo] = useState('debit');
    const [categoriaId, setCategoriaId] = useState('outros');

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!descricao || !valor || !data) return;
        
        const novaTransacao = {
            id: Date.now(),
            date: data,
            description: descricao,
            amount: parseFloat(valor),
            type: tipo,
            sourceAccount: 'Conta Manual',
            // Salva a categoria apenas se for uma despesa
            category: tipo === 'debit' ? categoriaId : null, 
            isIgnored: false,
        };
        
        onSave(novaTransacao);
        onClose(); // Fecha o modal após salvar
    };
    
    // Limpa o formulário ao fechar
    const handleClose = () => {
        setDescricao('');
        setValor('');
        setData(new Date().toISOString().slice(0, 10));
        setTipo('debit');
        setCategoriaId('outros');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white dark:bg-[#201b5d] rounded-xl shadow-lg p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">Adicionar Transação</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Descrição</label>
                        <input type="text" value={descricao} onChange={(e) => setDescricao(e.target.value)} required className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Valor (R$)</label>
                            <input type="number" value={valor} onChange={(e) => setValor(e.target.value)} required step="0.01" className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/>
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Data</label>
                            <input type="date" value={data} onChange={(e) => setData(e.target.value)} required className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <label className="flex items-center gap-2">
                            <input type="radio" value="debit" checked={tipo === 'debit'} onChange={(e) => setTipo(e.target.value)} className="form-radio h-4 w-4 text-[#00d971] bg-slate-300 dark:bg-gray-700 border-gray-600 focus:ring-0"/>
                            <span className="text-slate-800 dark:text-white">Despesa</span>
                        </label>
                        <label className="flex items-center gap-2">
                            <input type="radio" value="credit" checked={tipo === 'credit'} onChange={(e) => setTipo(e.target.value)} className="form-radio h-4 w-4 text-[#00d971] bg-slate-300 dark:bg-gray-700 border-gray-600 focus:ring-0"/>
                             <span className="text-slate-800 dark:text-white">Receita</span>
                        </label>
                    </div>

                    {tipo === 'debit' && (
                        <div>
                            <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Categoria</label>
                            <select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} className="w-full mt-1 px-3 py-2 text-slate-900 dark:text-white bg-slate-100 dark:bg-[#2a246f] border border-slate-300 dark:border-[#3e388b] rounded-md">
                                {Object.entries(CATEGORIAS_FLUXO).map(([key, { label }]) => (
                                    <option key={key} value={key}>{label}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={handleClose} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300">Cancelar</button>
                        <button type="submit" className="px-6 py-2 text-sm font-medium text-black bg-[#00d971] rounded-lg hover:brightness-90">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const TelaFluxoDeCaixa = ({ transacoes, handleCategoryChange, handleIgnoreToggle, onAdicionarClick }) => {
    const [filtros, setFiltros] = useState({ mes: 'todos', ano: 'todos', categoria: 'todas', busca: '' });

    // ##### NOVO: Lógica para gerar as opções dos filtros dinamicamente #####
    const opcoesFiltro = useMemo(() => {
        const datas = transacoes.map(t => new Date(t.date));
        const anos = [...new Set(datas.map(d => d.getFullYear()))].sort((a,b) => b - a);
        const meses = [
            { v: 1, n: 'Janeiro' }, { v: 2, n: 'Fevereiro' }, { v: 3, n: 'Março' },
            { v: 4, n: 'Abril' }, { v: 5, n: 'Maio' }, { v: 6, n: 'Junho' },
            { v: 7, n: 'Julho' }, { v: 8, n: 'Agosto' }, { v: 9, n: 'Setembro' },
            { v: 10, n: 'Outubro' }, { v: 11, n: 'Novembro' }, { v: 12, n: 'Dezembro' }
        ];
        return { anos, meses };
    }, [transacoes]);

    // ##### NOVO: Lógica principal de filtragem das transações #####
    const transacoesFiltradas = useMemo(() => {
        return transacoes.filter(t => {
            const dataTransacao = new Date(t.date);
            const anoTransacao = dataTransacao.getFullYear();
            const mesTransacao = dataTransacao.getMonth() + 1; // getMonth() é 0-indexed

            const filtroAnoOk = filtros.ano === 'todos' || anoTransacao === parseInt(filtros.ano);
            const filtroMesOk = filtros.mes === 'todos' || mesTransacao === parseInt(filtros.mes);
            
            const filtroCategoriaOk = (() => {
                if (filtros.categoria === 'todas') return true;
                if (filtros.categoria === 'nao-categorizadas') return t.category === null;
                return t.category === filtros.categoria;
            })();

            const filtroBuscaOk = filtros.busca === '' || t.description.toLowerCase().includes(filtros.busca.toLowerCase());

            return filtroAnoOk && filtroMesOk && filtroCategoriaOk && filtroBuscaOk;
        });
    }, [transacoes, filtros]);
    
    // ##### ALTERAÇÃO: Sumário agora usa os dados filtrados #####
    const sumarioPorCategoria = useMemo(() => {
        const gastos = transacoesFiltradas.filter(t => t.type === 'debit' && !t.isIgnored && t.category !== 'receita');
        const totais = gastos.reduce((acc, t) => {
            if (t.category) {
                if (!acc[t.category]) acc[t.category] = 0;
                acc[t.category] += t.amount;
            }
            return acc;
        }, {});
        return Object.entries(totais).map(([key, value]) => ({ id: key, ...CATEGORIAS_FLUXO[key], total: value, })).sort((a, b) => b.total - a.total);
    }, [transacoesFiltradas]);

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltros(prev => ({...prev, [name]: value}));
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            
            {/* ##### NOVO: Barra de Filtros e Busca ##### */}
            <Card>
                <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Resumo por Categoria (Gastos)</h2>
                <div className="grid grid-cols-3 md:grid-cols-2 lg:grid-cols-6 gap-2 border-rounded-lg">
                    {sumarioPorCategoria.map(cat => {
                        const Icon = cat.icon;
                        return (
                            <div key={cat.id} className="p-4 rounded-lg flex items-center gap-4" style={{ backgroundColor: `${cat.color}50` }}>
                                <div className="p-2 rounded-full" style={{ backgroundColor: `${cat.color}80`}}><Icon size={20} style={{ color: cat.color }}/></div>
                                <div><p className="text-sm text-slate-800 dark:text-white">{cat.label}</p><p className="text-lg font-bold text-slate-600 dark:text-white ">{formatCurrency(cat.total)}</p></div>
                            </div>
                        )
                    })}
                </div>
            </Card>
            <Card>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input 
                        type="text"
                        name="busca"
                        placeholder="Pesquisar na descrição..."
                        value={filtros.busca}
                        onChange={handleFiltroChange}
                        className="md:col-span-2 w-full bg-white dark:bg-[#200b5d] text-slate-800 dark:text-white rounded-md px-3 py-2 border border-[#3e388b] focus:ring-1 focus:ring-[#00d971]"
                    />
                    <select name="categoria" value={filtros.categoria} onChange={handleFiltroChange} className="w-full bg-white dark:bg-[#200b5d] text-slate-800 dark:text-white text-sm rounded-md p-2 border border-[#3e388b] focus:ring-1 focus:ring-[#00d971]">
                        <option value="todas">Todas as Categorias</option>
                        {Object.entries(CATEGORIAS_FLUXO).map(([key, { label }]) => (<option key={key} value={key}>{label}</option>))}
                        <option value="nao-categorizadas">Não Categorizadas</option>
                    </select>
                    <div className="grid grid-cols-2 gap-2">
                        <select name="mes" value={filtros.mes} onChange={handleFiltroChange} className="w-full bg-white dark:bg-[#200b5d] text-slate-800 dark:text-white text-sm rounded-md p-2 border border-[#3e388b] focus:ring-1 focus:ring-[#00d971]">
                           <option value="todos">Mês</option>
                           {opcoesFiltro.meses.map(m => <option key={m.v} value={m.v}>{m.n}</option>)}
                        </select>
                        <select name="ano" value={filtros.ano} onChange={handleFiltroChange} className="w-full bg-white dark:bg-[#200b5d] text-slate-800 dark:text-white text-sm rounded-md p-2 border border-[#3e388b] focus:ring-1 focus:ring-[#00d971]">
                            <option value="todos">Ano</option>
                            {opcoesFiltro.anos.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>
                </div>
            </Card>

            <Card>
                <div className="flex justify-between items-center border-b border-slate-200 dark:border-[#3e388b] pb-4 mb-4">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Transações</h2>
                    <button onClick={onAdicionarClick} className="text-xs flex items-center gap-1 text-[#00d971] hover:brightness-90 font-semibold">
                        <PlusCircle size={14} /> Adicionar Transação
                    </button>
                </div>
                <div className="space-y-2">
                    <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-bold text-slate-800 dark:text-white px-4 py-2">
                        <div className="col-span-1">Data</div><div className="col-span-4">Descrição</div><div className="col-span-3">Categoria</div><div className="col-span-2 text-right">Valor</div><div className="col-span-2 text-center">Ações</div>
                    </div>
                    {/* ##### ALTERAÇÃO: Renderiza a lista filtrada ##### */}
                    {transacoesFiltradas.map(t => {
                        const isCredit = t.type === 'credit';
                        const categoriaInfo = t.category ? CATEGORIAS_FLUXO[t.category] : null;
                        return (
                            <div key={t.id} className={`grid grid-cols-12 gap-4 items-center p-3 rounded-lg transition-colors ${t.isIgnored ? 'bg-gray-800/50 opacity-60' : 'bg-white dark:bg-[#201b5d] text-slate-800 dark:text-white hover:bg-[#2a246f]/70'}`}>
                                <div className="col-span-4 md:col-span-1 text-sm text-slate-800 dark:text-white">{new Date(t.date).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</div>
                                <div className="col-span-8 md:col-span-4 text-slate-800 dark:text-white font-medium">{t.description}</div>
                                <div className="col-span-12 md:col-span-3">
                                    {isCredit ? <span className="text-xs font-bold bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Receita</span> : (
                                        <select value={t.category || ''} onChange={(e) => handleCategoryChange(t.id, e.target.value)} className="w-full bg-white dark:bg-[#201b5d] text-slate-800 dark:text-white text-sm rounded-md p-1 border border-[#3e388b] focus:ring-1 focus:ring-[#00d971]">
                                            <option value="">Selecione...</option>
                                            {Object.entries(CATEGORIAS_FLUXO).map(([key, { label }]) => (<option key={key} value={key}>{label}</option>))}
                                        </select>
                                    )}
                                </div>
                                <div className={`col-span-6 md:col-span-2 text-right font-semibold ${isCredit ? 'text-green-400' : 'text-red-400'}`}>{isCredit ? '+' : '-'} {formatCurrency(t.amount)}</div>
                                <div className="col-span-6 md:col-span-2 flex justify-center"><button onClick={() => handleIgnoreToggle(t.id)} title={t.isIgnored ? "Restaurar Transação" : "Ignorar Transação"} className="text-slate-800 dark:text-white hover:text-white">{t.isIgnored ? <Eye size={18} /> : <EyeOff size={18} />}</button></div>
                            </div>
                        )
                    })}
                </div>
            </Card>
        </div>
    );
};

const TelaPlanejamento = ({ orcamento, gastosReais }) => {
    const { theme } = useContext(ThemeContext);

    // Estado para os filtros (Mês e Ano)
    const [filtroData, setFiltroData] = useState({
        mes: new Date().getMonth() + 1, // Padrão para o mês atual
        ano: new Date().getFullYear(),   // Padrão para o ano atual
    });

    // Lógica para gerar as opções dos filtros dinamicamente
    const opcoesFiltro = useMemo(() => {
        const datas = mockTransacoes.map(t => new Date(t.date));
        const anos = [...new Set(datas.map(d => d.getFullYear()))].sort((a, b) => b - a);
        const meses = [
            { v: 1, n: 'Janeiro' }, { v: 2, n: 'Fevereiro' }, { v: 3, n: 'Março' },
            { v: 4, n: 'Abril' }, { v: 5, n: 'Maio' }, { v: 6, n: 'Junho' },
            { v: 7, n: 'Julho' }, { v: 8, n: 'Agosto' }, { v: 9, n: 'Setembro' },
            { v: 10, n: 'Outubro' }, { v: 11, n: 'Novembro' }, { v: 12, n: 'Dezembro' }
        ];
        return { anos, meses };
    }, []);

    // Filtra os gastos reais com base no período selecionado
    const gastosFiltrados = useMemo(() => {
        const totais = mockTransacoes
            .filter(t => {
                const dataTransacao = new Date(t.date);
                return t.type === 'debit' &&
                       dataTransacao.getFullYear() === filtroData.ano &&
                       (dataTransacao.getMonth() + 1) === filtroData.mes;
            })
            .reduce((acc, t) => {
                const categoriaKey = categorizeByAI(t.description);
                if (categoriaKey) {
                    if (!acc[categoriaKey]) acc[categoriaKey] = 0;
                    acc[categoriaKey] += t.amount;
                }
                return acc;
            }, {});

        return Object.entries(totais).map(([key, value]) => ({ id: key, total: value }));
    }, [filtroData]);

    // Compara as metas do orçamento com os gastos já filtrados
    const dadosPlanejamento = useMemo(() => {
        const metasAgrupadas = orcamento
            .filter(cat => cat.tipo === 'despesa')
            .flatMap(cat => cat.subItens)
            .reduce((acc, item) => {
                if (item.categoriaId) {
                    if (!acc[item.categoriaId]) {
                        acc[item.categoriaId] = {
                            id: item.categoriaId,
                            nome: CATEGORIAS_FLUXO[item.categoriaId]?.label || item.categoriaId,
                            icon: CATEGORIAS_FLUXO[item.categoriaId]?.icon || Package,
                            meta: 0
                        };
                    }
                    acc[item.categoriaId].meta += item.sugerido;
                }
                return acc;
            }, {});
        
        return Object.values(metasAgrupadas).map(meta => {
            const gastoReal = gastosFiltrados.find(gasto => gasto.id === meta.id);
            const realizado = gastoReal ? gastoReal.total : 0;
            const percentual = meta.meta > 0 ? (realizado / meta.meta) * 100 : 0;
            
            return { ...meta, realizado, percentual };
        });
    }, [orcamento, gastosFiltrados]);

    const handleFiltroChange = (e) => {
        const { name, value } = e.target;
        setFiltroData(prev => ({ ...prev, [name]: parseInt(value) }));
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Card>
                {/* ##### FILTROS RESTAURADOS AQUI ##### */}
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-white">Planejamento de Metas</h2>
                    <div className="flex gap-2">
                        <select name="mes" value={filtroData.mes} onChange={handleFiltroChange} className="w-full bg-white dark:bg-[#2a246f] text-slate-900 dark:text-white text-sm rounded-md p-2 border border-slate-300 dark:border-[#3e388b] focus:ring-1 focus:ring-[#00d971]">
                           {opcoesFiltro.meses.map(m => <option key={m.v} value={m.v}>{m.n}</option>)}
                        </select>
                        <select name="ano" value={filtroData.ano} onChange={handleFiltroChange} className="w-full bg-white dark:bg-[#2a246f] text-slate-900 dark:text-white text-sm rounded-md p-2 border border-slate-300 dark:border-[#3e388b] focus:ring-1 focus:ring-[#00d971]">
                            {opcoesFiltro.anos.map(a => <option key={a} value={a}>{a}</option>)}
                        </select>
                    </div>
                </div>

                <div className="space-y-5">
                    {dadosPlanejamento.map(item => {
                        if (item.meta <= 0 && item.realizado <= 0) return null;
                        const Icone = item.icon;
                        const progressoCor = item.realizado > item.meta ? 'bg-red-500' : 'bg-green-500';
                        const larguraBarra = Math.min(item.percentual, 100);

                        return (
                            <div key={item.id}>
                                <div className="flex justify-between items-center mb-1">
                                    <div className="flex items-center gap-2">
                                        <Icone size={16} className="text-slate-600 dark:text-gray-300" />
                                        <span className="font-bold text-slate-800 dark:text-white">{item.nome}</span>
                                    </div>
                                    <div className="text-sm font-semibold text-slate-600 dark:text-gray-300">
                                        <span className={item.realizado > item.meta ? 'text-red-500' : 'text-green-500'}>{formatCurrency(item.realizado)}</span> / {formatCurrency(item.meta)}
                                    </div>
                                </div>
                                <div className="relative w-full bg-slate-200 dark:bg-slate-700 rounded-full h-5">
                                    <div className={`h-full rounded-full transition-all duration-500 ${progressoCor}`} style={{ width: `${larguraBarra}%` }}></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-xs font-bold text-white drop-shadow-[0_1.2px_1.2px_rgba(0,0,0,0.8)]">
                                            {item.percentual.toFixed(0)}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            </Card>
        </div>
    );
};

// PASSO 1: ADICIONE ESTE NOVO COMPONENTE AO SEU ARQUIVO

const TicketDeViagem = ({ viagem, onEdit, onDelete }) => {
    const { theme } = useContext(ThemeContext);
    const progresso = viagem.valorAlvo > 0 ? (viagem.milhasAtuais / viagem.milhasNecessarias) * 100 : 0;
    
    return (
        <Card className="flex flex-col md:flex-row overflow-hidden p-0">
            {/* Seção Esquerda - Informações do Voo */}
            <div className="p-4 md:p-6 flex-grow">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{viagem.companhia}</p>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">{viagem.nomeDestino}</h3>
                    </div>
                    <Plane size={24} className="text-[#00d971]" />
                </div>
                <div className="flex items-end justify-between mt-4">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Origem</p>
                        <p className="text-2xl font-mono text-slate-800 dark:text-white">{viagem.origem}</p>
                    </div>
                    <div className="flex-grow flex items-center mx-4">
                        <div className="w-full border-t border-dashed border-slate-400 dark:border-slate-600"></div>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-right">Destino</p>
                        <p className="text-2xl font-mono text-slate-800 dark:text-white">{viagem.destino}</p>
                    </div>
                </div>
            </div>

            {/* Seção Direita - Progresso e Ações */}
            <div className="bg-slate-100 dark:bg-[#2a246f] p-4 md:p-6 md:border-l-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col justify-between md:w-1/3">
                <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-gray-300">Progresso da Meta</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{viagem.milhasAtuais.toLocaleString('pt-BR')} / <span className="text-lg text-gray-500 dark:text-gray-400">{viagem.milhasNecessarias.toLocaleString('pt-BR')}</span></p>
                    <div className="w-full bg-slate-300 dark:bg-slate-700 rounded-full h-2 mt-1">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(progresso, 100)}%` }}></div>
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-4">
                    <button onClick={onEdit} className="text-gray-500 dark:text-gray-400 hover:text-blue-500"><Pencil size={18}/></button>
                    <button onClick={onDelete} className="text-gray-500 dark:text-gray-400 hover:text-red-500"><Trash2 size={18}/></button>
                </div>
            </div>
        </Card>
    );
};

const ModalNovaViagem = ({ isOpen, onClose, onSave, viagemExistente }) => {
    const isEditing = !!viagemExistente;
    const [origem, setOrigem] = useState(isEditing ? viagemExistente.origem : 'GRU');
    const [destino, setDestino] = useState(isEditing ? viagemExistente.destino : 'NRT');
    const [nomeDestino, setNomeDestino] = useState(isEditing ? viagemExistente.nomeDestino : 'Tóquio, Japão');
    const [companhia, setCompanhia] = useState(isEditing ? viagemExistente.companhia : 'LATAM Pass');
    const [milhasNecessarias, setMilhasNecessarias] = useState(isEditing ? viagemExistente.milhasNecessarias : '');
    const [milhasAtuais, setMilhasAtuais] = useState(isEditing ? viagemExistente.milhasAtuais : 0);

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ 
            ...viagemExistente, // Mantém o ID e outras propriedades se estiver editando
            origem, destino, nomeDestino, companhia, 
            milhasNecessarias: parseFloat(milhasNecessarias), 
            milhasAtuais: parseFloat(milhasAtuais)
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
         <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 animate-fade-in">
            <div className="bg-white dark:bg-[#201b5d] rounded-xl shadow-lg p-8 w-full max-w-lg">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">{isEditing ? 'Editar Viagem' : 'Nova Meta de Viagem'}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Nome do Destino</label><input type="text" value={nomeDestino} onChange={e => setNomeDestino(e.target.value)} required className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/></div>
                        <div><label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Companhia/Programa</label><input type="text" value={companhia} onChange={e => setCompanhia(e.target.value)} required className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/></div>
                        <div><label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Origem (Sigla)</label><input type="text" value={origem} onChange={e => setOrigem(e.target.value.toUpperCase())} maxLength="3" required className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/></div>
                        <div><label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Destino (Sigla)</label><input type="text" value={destino} onChange={e => setDestino(e.target.value.toUpperCase())} maxLength="3" required className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/></div>
                        <div><label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Milhas Necessárias</label><input type="number" value={milhasNecessarias} onChange={e => setMilhasNecessarias(e.target.value)} required className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/></div>
                        <div><label className="block font-medium text-gray-600 dark:text-gray-400">Milhas Atuais</label><input type="number" value={milhasAtuais} onChange={e => setMilhasAtuais(e.target.value)} required className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/></div>
                    </div>
                    <div className="flex justify-end gap-4 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300">Cancelar</button>
                        <button type="submit" className="px-6 py-2 text-sm font-medium text-black bg-[#00d971] rounded-lg hover:brightness-90">Salvar</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// PASSO 3: SUBSTITUA O PLACEHOLDER DA TelaMilhas POR ESTE CÓDIGO

// Dados de exemplo para iniciar a tela
const mockViagens = [
    { id: 1, origem: 'GRU', destino: 'NRT', nomeDestino: 'Tóquio, Japão', companhia: 'LATAM Pass', milhasNecessarias: 120000, milhasAtuais: 45000 },
    { id: 2, origem: 'GIG', destino: 'CDG', nomeDestino: 'Paris, França', companhia: 'Smiles', milhasNecessarias: 85000, milhasAtuais: 85000 },
];

const TelaMilhas = () => {
    const [viagens, setViagens] = useState(mockViagens);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viagemParaEditar, setViagemParaEditar] = useState(null);

    const handleOpenModalParaCriar = () => {
        setViagemParaEditar(null);
        setIsModalOpen(true);
    };

    const handleOpenModalParaEditar = (viagem) => {
        setViagemParaEditar(viagem);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setViagemParaEditar(null);
    };

    const handleSaveViagem = (dadosViagem) => {
        if (viagemParaEditar) {
            // Edita uma viagem existente
            setViagens(prev => prev.map(v => v.id === viagemParaEditar.id ? { ...v, ...dadosViagem } : v));
        } else {
            // Adiciona uma nova viagem
            setViagens(prev => [...prev, { ...dadosViagem, id: Date.now() }]);
        }
    };
    
    const handleDeleteViagem = (id) => {
        if (window.confirm("Tem certeza que deseja excluir esta meta de viagem?")) {
            setViagens(prev => prev.filter(v => v.id !== id));
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-slate-800 dark:text-white">Planejamento de Milhas</h1>
                <button onClick={handleOpenModalParaCriar} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#00d971] text-black rounded-lg hover:brightness-90 transition-transform hover:scale-105">
                    <PlusCircle size={18} />
                    Adicionar Viagem
                </button>
            </div>

            <div className="space-y-6">
                {viagens.map(viagem => (
                    <TicketDeViagem 
                        key={viagem.id} 
                        viagem={viagem}
                        onEdit={() => handleOpenModalParaEditar(viagem)}
                        onDelete={() => handleDeleteViagem(viagem.id)}
                    />
                ))}
            </div>

            <ModalNovaViagem
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveViagem}
                viagemExistente={viagemParaEditar}
            />
        </div>
    );
};

const CardDeComparacao = ({ cartao }) => {
    // Se nenhum cartão for selecionado, mostra o placeholder
    if (!cartao) {
        return (
            <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-lg h-[200px] flex items-center justify-center">
                <p className="text-slate-500 dark:text-gray-400">Selecione um cartão acima</p>
            </div>
        );
    }

    // Lógica para processar os dados do JSON
    const anuidadeNumerica = parseFloat(cartao.anuidade?.replace('R$', '').replace('.', '').replace(',', '.')) || 0;
    const beneficiosLista = cartao.outros_beneficios?.split('|').map(b => b.trim()) || [];
    const temSalaVip = cartao.salas_vip && cartao.salas_vip.toLowerCase() !== 'não tem';

    return (
        // O componente agora começa diretamente com os detalhes
        <div className="space-y-4">
            {cartao.matchScore && (
                <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Seu Match Score</p>
                    <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className={`h-2 flex-1 rounded-full ${i < cartao.matchScore ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                        ))}
                    </div>
                </div>
            )}

            <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Pontuação:</span><span className="font-semibold text-slate-800 dark:text-white text-right">{cartao.acúmulo_de_pontos}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Anuidade:</span><span className="font-semibold text-slate-800 dark:text-white">{formatCurrency(anuidadeNumerica)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Sala VIP:</span><span className={`font-semibold ${temSalaVip ? 'text-green-500' : 'text-red-500'}`}>{temSalaVip ? 'Sim' : 'Não'}</span></div>
                
                {beneficiosLista.length > 0 && (
                    <div className="pt-2">
                        <p className="font-medium text-gray-500 dark:text-gray-400 mb-1">Outros Benefícios:</p>
                        <ul className="list-disc list-inside text-slate-800 dark:text-white space-y-1">
                            {beneficiosLista.map((b, i) => <li key={i}>{b}</li>)}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

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

const PageTransition = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, x: 15 }} // Estado inicial (invisível e um pouco à direita)
    animate={{ opacity: 1, x: 0 }}  // Estado final (visível e na posição correta)
    exit={{ opacity: 0, x: -15 }}   // Estado de saída (invisível e um pouco à esquerda)
    transition={{ duration: 0.3 }}  // Duração da animação (0.3 segundos)
  >
    {children}
  </motion.div>
);

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
    { id: 'protecao', label: 'Proteção', icon: Shield },
    { id: 'reserva', label: 'Reserva', icon: PiggyBank },
    { id: 'aposentadoria', label: 'Aposentadoria', icon: TreePalm },
    { id: 'patrimonio', label: 'Patrimônio', icon: Landmark },
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
            case 'aposentadoria': content = <TelaAposentadoria />; break;
            case 'patrimonio': content = <TelaPatrimonio patrimonioData={patrimonioData} setPatrimonioData={setPatrimonioData} patrimonioTotal={patrimonioTotal} />; break;
            case 'fluxoTransacoes': return <TelaFluxoDeCaixa transacoes={transacoes} handleCategoryChange={handleCategoryChange} handleIgnoreToggle={handleIgnoreToggle} onAdicionarClick={() => setIsTransacaoModalOpen(true)} />;
            case 'fluxoPlanejamento': return <TelaPlanejamento orcamento={categorias} gastosReais={gastosReais} />;
            case 'aquisicaoImoveis': content = <TelaAquisicaoImoveis />; break;
            case 'aquisicaoAutomoveis': content = <TelaAquisicaoAutomoveis />; break;
            case 'objetivos': return <TelaObjetivos />; break;
            case 'outrosMilhas': return <TelaMilhas />; break;
            case 'outrosCartoes': return <TelaCartoes />; break;
            default: content = <TelaObjetivos />; break;
        }
    }

    // Envolve o conteúdo da página com o componente de transição e adiciona a key
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
