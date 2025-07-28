import { useState, useEffect, useContext, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { formatCurrency } from '../../utils/formatters';
import Card from '../../components/Card/Card';
import { Coins, CarFront, Building2, Landmark, Gift, Package, DollarSign, PlusCircle, Edit, Trash2 } from 'lucide-react';
import { PIE_COLORS } from '../../components/constants/PieColors';
import { ThemeContext } from '../../ThemeContext';
import { usePatrimonioStore } from '../../stores/usePatrimonioStore';

// --- Componente do Modal para Adicionar/Editar Item (sem alterações) ---
const ModalPatrimonioItem = ({ item, tipo, onClose, onSave }) => {
    const isEdicao = !!item.id;
    const [nome, setNome] = useState(item.nome || '');
    const [valor, setValor] = useState(item.valor || '');
    
    const handleSubmit = (e) => {
        e.preventDefault();
        if (!nome || !valor || parseFloat(valor) <= 0) {
            alert("Por favor, preencha todos os campos com valores válidos.");
            return;
        }
        onSave({ id: item.id, nome, valor: parseFloat(valor), tipo: item.tipo || tipo });
        onClose();
    };
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-[#201b5d] rounded-xl shadow-lg p-8 w-full max-w-md">
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white mb-6">
                    {isEdicao ? 'Editar' : 'Adicionar'} Item
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Nome / Descrição</label>
                        <input type="text" value={nome} onChange={(e) => setNome(e.target.value)} required className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-600 dark:text-gray-400">Valor (R$)</label>
                        <input type="number" value={valor} onChange={(e) => setValor(e.target.value)} required step="0.01" className="mt-1 w-full bg-slate-100 dark:bg-[#2a246f] text-slate-900 dark:text-white rounded-md px-3 py-2 border border-slate-300 dark:border-[#3e388b]"/>
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


// --- Componente Principal da Tela de Patrimônio ---
// 2. As props foram removidas. O componente agora é autônomo.
const TelaPatrimonio = () => {
    const { theme } = useContext(ThemeContext);
    
    // 3. Aceder ao estado e às ações diretamente da store
    const { ativos, dividas, isLoading, fetchPatrimonio, savePatrimonioItem, deletePatrimonioItem } = usePatrimonioStore();

    const patrimonioCategorias = [ { id: 'investimentos', nome: 'Investimentos', icon: Coins }, { id: 'automoveis', nome: 'Automóveis', icon: CarFront }, { id: 'imoveis', nome: 'Imóveis', icon: Building2 }, { id: 'contaBancaria', nome: 'Conta Bancária', icon: Landmark }, { id: 'beneficios', nome: 'Benefícios', icon: Gift }, { id: 'outros', nome: 'Outros', icon: Package }, { id: 'dividas', nome: 'Dívidas', icon: DollarSign }, ];
    const [abaAtiva, setAbaAtiva] = useState('investimentos');
    const [modalState, setModalState] = useState({ isOpen: false, item: null });

    // 4. Chamar a função para carregar os dados quando o componente montar
    useEffect(() => {
        fetchPatrimonio();
    }, [fetchPatrimonio]);

    // --- LÓGICA DE DADOS (MEMOIZED) ---
    // Os cálculos agora usam os dados diretamente da store
    const totalAtivos = useMemo(() => ativos.reduce((acc, item) => acc + parseFloat(item.valor), 0), [ativos]);
    const totalDividas = useMemo(() => dividas.reduce((acc, item) => acc + parseFloat(item.valor), 0), [dividas]);
    const patrimonioTotal = useMemo(() => totalAtivos - totalDividas, [totalAtivos, totalDividas]);

    const compositionBarData = useMemo(() => [
        { name: 'Ativos', value: totalAtivos, fill: '#3b82f6' },
        { name: 'Passivos', value: totalDividas, fill: '#ef4444' },
        { name: 'Líquido', value: patrimonioTotal, fill: '#00d971' },
    ], [totalAtivos, totalDividas, patrimonioTotal]);
    
    const assetDonutData = useMemo(() => {
        const groupedAssets = ativos.reduce((acc, item) => {
            const tipo = item.tipo || 'Outros';
            if (!acc[tipo]) {
                acc[tipo] = 0;
            }
            acc[tipo] += parseFloat(item.valor);
            return acc;
        }, {});

        return Object.entries(groupedAssets || {})
            .map(([name, value], index) => ({
                name,
                value,
                fill: PIE_COLORS[index % PIE_COLORS.length]
            }))
            .filter(item => item.value > 0);
    }, [ativos]);

    const RADIAN = Math.PI / 180;
    const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        if (percent < 0.05) return null;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);
        return <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="12px" fontWeight="bold">{`${(percent * 100).toFixed(0)}%`}</text>;
    };

    // --- HANDLERS CONECTADOS À STORE ---
    const handleOpenModal = (item = {}) => {
        setModalState({ isOpen: true, item });
    };

    const handleCloseModal = () => {
        setModalState({ isOpen: false, item: null });
    };

    // 5. A função de salvar agora chama a ação 'savePatrimonioItem' da store
    const handleSave = (item) => {
        const tipoDoItem = patrimonioCategorias.find(c => c.id === abaAtiva)?.nome || 'Outros';
        const itemParaSalvar = { ...item, tipo: item.tipo || tipoDoItem };
        
        const tipoDaAba = abaAtiva === 'dividas' ? 'dividas' : 'ativos';
        savePatrimonioItem(itemParaSalvar, tipoDaAba);
    };
    
    // 6. A função de apagar agora chama a ação 'deletePatrimonioItem' da store
    const handleDelete = (itemId) => {
        const tipoDaAba = abaAtiva === 'dividas' ? 'dividas' : 'ativos';
        deletePatrimonioItem(itemId, tipoDaAba);
    };

    const itensExibidos = useMemo(() => {
        if (abaAtiva === 'dividas') {
            return dividas;
        }
        const categoriaSelecionada = patrimonioCategorias.find(c => c.id === abaAtiva)?.nome;
        return ativos.filter(item => item.tipo === categoriaSelecionada);
    }, [abaAtiva, ativos, dividas]);

    // O `isLoading` agora vem diretamente da store
    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
                <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00d971]"></div>
            </div>
        );
    }

    // --- RENDERIZAÇÃO DO COMPONENTE (sem alterações na estrutura do JSX) ---
    return (
        <div className="max-w-7xl mx-auto space-y-6">
            {modalState.isOpen && (
                <ModalPatrimonioItem
                    item={modalState.item}
                    tipo={patrimonioCategorias.find(c => c.id === abaAtiva)?.nome}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Composição Geral</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <BarChart data={compositionBarData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={theme === 'dark' ? 0.2 : 0.1} />
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" width={80} tick={{ fontSize: 12, fill: theme === 'dark' ? '#a39ee8' : '#6b7280' }} />
                            <Tooltip formatter={(value) => formatCurrency(value)} cursor={{ fill: 'transparent' }} contentStyle={theme === 'dark' ? { backgroundColor: '#201b5d', border: '1px solid #3e388b' } : {}}/>
                            <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={25}>
                                {compositionBarData.map((entry) => ( <Cell key={`cell-${entry.name}`} fill={entry.fill} /> ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </Card>

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

                <Card>
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4">Evolução do Patrimônio</h3>
                    <div className="flex items-center justify-center h-[250px] text-gray-500">Gráfico de evolução em breve.</div>
                </Card>
            </div>

            <Card>
                <div className="flex items-center border-b border-slate-200 dark:border-b-[#3e388b] overflow-x-auto">
                    {patrimonioCategorias.map(cat => ( <button key={cat.id} onClick={() => setAbaAtiva(cat.id)} className={`flex-shrink-0 flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors duration-200 border-b-2 ${abaAtiva === cat.id ? 'border-[#00d971] text-[#00d971]' : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-slate-800 dark:hover:text-white'}`}> <cat.icon size={16} />{cat.nome} </button> ))}
                </div>
                <div className="mt-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-white capitalize">{patrimonioCategorias.find(c => c.id === abaAtiva)?.nome}</h2>
                        <button onClick={() => handleOpenModal()} className="text-xs flex items-center gap-1 text-[#00d971] hover:brightness-90 font-semibold"><PlusCircle size={14} /> Adicionar Item</button>
                    </div>
                    <div className="space-y-2 text-sm">
                        {itensExibidos.length > 0 ? itensExibidos.map(item => ( 
                            <div key={item.id} className="grid grid-cols-12 gap-4 items-center p-2 hover:bg-slate-100 dark:hover:bg-[#2a246f]/50 rounded">
                                <p className="col-span-8 text-slate-800 dark:text-gray-300">{item.nome}</p>
                                <p className="col-span-2 font-semibold text-slate-900 dark:text-white">{formatCurrency(item.valor)}</p>
                                <div className="col-span-2 flex justify-end items-center gap-3">
                                    <button onClick={() => handleOpenModal(item)} className="text-gray-500 dark:text-gray-400 hover:text-[#00d971]"><Edit size={16} /></button>
                                    <button onClick={() => handleDelete(item.id)} className="text-gray-500 dark:text-gray-400 hover:text-red-500"><Trash2 size={16} /></button>
                                </div>
                            </div> 
                        )) : <p className="text-center text-gray-500 dark:text-gray-400 p-4 text-xs">Nenhum item adicionado nesta categoria.</p>}
                    </div>
                </div>
            </Card>
        </div>
    );
};

export default TelaPatrimonio;
