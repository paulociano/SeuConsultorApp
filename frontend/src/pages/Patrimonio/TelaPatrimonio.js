import { useState, useEffect, useContext, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, LabelList } from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import Card from '../../components/Card/Card';
import { Coins, CarFront, Building2, Landmark, Gift, Package, DollarSign, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { PIE_COLORS } from '../../components/constants/PieColors';
import { ThemeContext } from '../../ThemeContext';

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
    const handleAddItem = () => { const newItem = { id: crypto.randomUUID(), nome: 'Novo Item', valor: 0 }; setPatrimonioData(prev => ({ ...prev, [abaAtiva]: [...prev[abaAtiva], newItem] })); };
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

export default TelaPatrimonio;