import React, { useState, useMemo, useContext } from "react";
import { PlusCircle, Edit, Trash2, TrendingUp, DollarSign, AlertCircle, Sparkles, Gift, Wallet, Home, Target, Calculator } from "lucide-react";
import { ThemeContext } from "../../ThemeContext";
import ModalNovaViagem from "../../components/Modals/ModalNovaViagem";
import ModalWallet from "../../components/Modals/ModalWallet";

// Componente para exibir um "ticket" de viagem com o progresso
const TicketDeViagem = ({ viagem, onEdit, onDelete }) => (
    <div className={`p-4 rounded-lg shadow-md ${viagem.theme === 'dark' ? 'bg-gray-800' : 'bg-white'} border border-gray-200 dark:border-gray-700`}>
        <div className="flex justify-between items-start">
            <div>
                <h3 className="font-bold text-lg">{viagem.nomeDestino} ({viagem.destino})</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Programa Alvo: {viagem.programSuggestions?.[0]}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Custo: R$ {viagem.flightCostBRL?.toFixed(2)} ou ~{viagem.estimatedMiles?.toLocaleString()} milhas</p>
            </div>
            <div className="flex gap-2">
                <button onClick={onEdit} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"><Edit size={16} /></button>
                <button onClick={onDelete} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"><Trash2 size={16} className="text-red-500" /></button>
            </div>
        </div>
        <div className="mt-4">
            <div className="flex justify-between text-sm mb-1">
                <span>Progresso</span>
                <span>{viagem.progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div className="bg-green-500 h-2.5 rounded-full" style={{ width: `${viagem.progress}%` }}></div>
            </div>
        </div>
    </div>
);

// O componente agora recebe dados e funções via props
const TelaMilhas = ({ carteiras = [], metas = [], onSave, onDelete }) => {
    const { theme } = useContext(ThemeContext);
    const [activeTab, setActiveTab] = useState('dashboard');

    // Estados para controle dos modais
    const [isWalletModalOpen, setWalletModalOpen] = useState(false);
    const [walletToEdit, setWalletToEdit] = useState(null);
    const [isTripModalOpen, setTripModalOpen] = useState(false);
    const [tripToEdit, setTripToEdit] = useState(null);

    // Estado para as calculadoras
    const [calculatorState, setCalculatorState] = useState({
        pointsToConvert: 10000,
        bonusPercentage: 100,
        milesToSell: 50000,
        saleValuePerThousand: 21,
    });

    // Derivação de estado a partir das props
    const pointPrograms = useMemo(() => carteiras.filter(w => w.type === 'ponto'), [carteiras]);
    const milePrograms = useMemo(() => carteiras.filter(w => w.type === 'milha'), [carteiras]);
    const totalMilesValueBRL = useMemo(() => carteiras.reduce((total, wallet) => total + (wallet.balance / 1000) * wallet.avgCpm, 0), [carteiras]);
    const upcomingExpiration = useMemo(() => [...carteiras].filter(w => w.expiration).sort((a, b) => new Date(a.expiration) - new Date(b.expiration))[0], [carteiras]);

    const enhancedTripGoals = useMemo(() => metas.map(goal => {
        const targetProgramName = goal.programSuggestions?.[0]?.toLowerCase() || '';
        const relevantWallet = carteiras.find(w => w.name.toLowerCase() === targetProgramName.toLowerCase());
        const progress = relevantWallet && goal.estimatedMiles > 0 ? (relevantWallet.balance / goal.estimatedMiles) * 100 : 0;
        return { ...goal, progress: Math.min(progress, 100), theme };
    }), [metas, carteiras, theme]);

    const bonusConversionResult = useMemo(() => calculatorState.pointsToConvert * (1 + calculatorState.bonusPercentage / 100), [calculatorState.pointsToConvert, calculatorState.bonusPercentage]);
    const mileSaleResult = useMemo(() => (calculatorState.milesToSell / 1000) * calculatorState.saleValuePerThousand, [calculatorState.milesToSell, calculatorState.saleValuePerThousand]);

    // Handlers para os modais e calculadoras
    const handleCalculatorChange = (e) => {
        const { name, value } = e.target;
        setCalculatorState(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    }
    
    const handleOpenWalletModal = (wallet = null) => {
        setWalletToEdit(wallet);
        setWalletModalOpen(true);
    };

    const handleCloseWalletModal = () => {
        setWalletToEdit(null);
        setWalletModalOpen(false);
    };

    const handleSaveWallet = (walletData) => {
        onSave(walletData, 'carteiras'); // Chama a função do App.js
        handleCloseWalletModal();
    };

    const handleDeleteWallet = (walletId) => {
        onDelete(walletId, 'carteiras'); // Chama a função do App.js
    };

    const handleOpenTripModal = (trip = null) => {
        setTripToEdit(trip);
        setTripModalOpen(true);
    };

    const handleCloseTripModal = () => {
        setTripToEdit(null);
        setTripModalOpen(false);
    };

    const handleSaveTrip = (tripData) => {
        onSave(tripData, 'metas'); // Chama a função do App.js
        handleCloseTripModal();
    };

    const handleDeleteTrip = (tripId) => {
        onDelete(tripId, 'metas'); // Chama a função do App.js
    };

    // Componentes de UI internos
    const TabButton = ({ tabId, label, icon: Icon }) => (
        <button onClick={() => setActiveTab(tabId)} className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors duration-200 ${activeTab === tabId ? 'bg-[#00d971] text-slate-800 font-semibold' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
            <Icon size={18} />
            <span>{label}</span>
        </button>
    );

    const WalletCard = ({ wallet, onEdit, onDelete }) => (
        <div className={`p-4 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-[#2a246f]' : 'bg-white'} flex flex-col justify-between border border-gray-200 dark:border-gray-700`}>
            <div>
                <h4 className="text-xl font-bold">{wallet.name}</h4>
                <p className="text-2xl font-light my-2">{wallet.balance.toLocaleString()} <span className="text-sm">{wallet.type === 'ponto' ? 'pontos' : 'milhas'}</span></p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Meu CPM: R$ {wallet.avgCpm.toFixed(2)}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Expiração: {wallet.expiration ? new Date(wallet.expiration).toLocaleDateString('pt-BR', {timeZone: 'UTC'}) : 'N/A'}</p>
            </div>
            <div className="flex justify-end gap-2 mt-4">
                <button onClick={() => onEdit(wallet)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"><Edit size={16} /></button>
                <button onClick={() => onDelete(wallet.id)} className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"><Trash2 size={16} className="text-red-500" /></button>
            </div>
        </div>
    );

    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} p-4 sm:p-6 transition-colors duration-300`}>
            <div className="max-w-7xl mx-auto">
                <header className="mb-8 text-center">
                    <h1 className="text-3xl font-bold">Centro de Comando de Milhas</h1>
                    <p className="text-gray-500 dark:text-gray-400">Sua plataforma para transformar pontos em experiências.</p>
                </header>

                <nav className={`flex flex-wrap justify-center gap-2 md:gap-4 p-2 rounded-xl mb-8 shadow-md ${theme === 'dark' ? 'bg-[#201b5d]' : 'bg-white'}`}>
                    <TabButton tabId="dashboard" label="Dashboard" icon={Home} />
                    <TabButton tabId="wallets" label="Carteiras" icon={Wallet} />
                    <TabButton tabId="goals" label="Metas" icon={Target} />
                    <TabButton tabId="simulators" label="Simuladores" icon={Calculator} />
                </nav>

                <main>
                    {activeTab === 'dashboard' && (
                        <section className="space-y-6 animate-fade-in">
                            <h2 className="text-2xl font-semibold">Dashboard Geral</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="p-6 rounded-xl shadow-lg flex flex-col items-center justify-center bg-white dark:bg-gray-800">
                                    <DollarSign size={32} className="mb-2 text-green-400"/>
                                    <span className="text-2xl font-bold">R$ {totalMilesValueBRL.toFixed(2)}</span>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Valor Estimado do Portfólio</p>
                                </div>
                                <div className="p-6 rounded-xl shadow-lg flex flex-col items-center justify-center bg-white dark:bg-gray-800">
                                    <Sparkles size={32} className="mb-2 text-yellow-500"/>
                                    <span className="text-xl font-bold">{carteiras.reduce((sum, w) => sum + w.balance, 0).toLocaleString()}</span>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">Total de Pontos & Milhas</p>
                                </div>
                                <div className="p-6 rounded-xl shadow-lg flex flex-col items-center justify-center bg-white dark:bg-gray-800">
                                    <AlertCircle size={32} className="mb-2 text-red-500"/>
                                    {upcomingExpiration ? (
                                        <>
                                            <span className="text-xl font-bold">{upcomingExpiration.name}</span>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Expira em: {new Date(upcomingExpiration.expiration).toLocaleDateString('pt-BR', {timeZone: 'UTC'})}</p>
                                        </>
                                    ) : <p>Nenhuma expiração próxima.</p> }
                                </div>
                            </div>
                            <div className={`p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-[#2a246f]' : 'bg-white'}`}>
                                <h3 className="text-xl font-semibold mb-4">Resumo das Carteiras</h3>
                                <div className="space-y-3">
                                    {carteiras.map(w => (
                                        <div key={w.id} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                                            <span className="font-semibold">{w.name} ({w.type})</span>
                                            <span className="text-lg font-mono text-blue-600 dark:text-blue-400">{w.balance.toLocaleString()}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )}
                    {activeTab === 'wallets' && (
                        <section className="animate-fade-in">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-2xl font-semibold">Minhas Carteiras</h2>
                                <button onClick={() => handleOpenWalletModal()} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#00d971] text-slate-800 rounded-lg hover:brightness-90 shadow-md">
                                    <PlusCircle size={18} /> Adicionar
                                </button>
                            </div>
                            <div className="mb-8">
                                <h3 className="text-xl font-semibold mb-4 border-b border-gray-300 dark:border-gray-600 pb-2">Programas de Pontos</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {pointPrograms.map(w => <WalletCard key={w.id} wallet={w} onEdit={handleOpenWalletModal} onDelete={handleDeleteWallet} />)}
                                </div>
                                {pointPrograms.length === 0 && <p className="text-gray-500 mt-2">Adicione seus programas de pontos de bancos e cartões aqui.</p>}
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold mb-4 border-b border-gray-300 dark:border-gray-600 pb-2">Programas de Milhas Aéreas</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                    {milePrograms.map(w => <WalletCard key={w.id} wallet={w} onEdit={handleOpenWalletModal} onDelete={handleDeleteWallet} />)}
                                </div>
                                {milePrograms.length === 0 && <p className="text-gray-500 mt-2">Adicione seus programas de fidelidade de companhias aéreas aqui.</p>}
                            </div>
                        </section>
                    )}
                    {activeTab === 'goals' && (
                        <section className="animate-fade-in">
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-2xl font-semibold">Minhas Metas de Viagem</h2>
                                <button onClick={() => handleOpenTripModal()} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#00d971] text-slate-800 rounded-lg hover:brightness-90 shadow-md">
                                    <PlusCircle size={18} /> Nova Meta
                                </button>
                            </div>
                            <div className="space-y-4">
                                {enhancedTripGoals.map(viagem => <TicketDeViagem key={viagem.id} viagem={viagem} onEdit={() => handleOpenTripModal(viagem)} onDelete={() => handleDeleteTrip(viagem.id)} /> )}
                            </div>
                        </section>
                    )}
                    {activeTab === 'simulators' && (
                        <section className={`p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-[#2a246f]' : 'bg-white'} space-y-8 animate-fade-in`}>
                            <h2 className="text-2xl font-semibold text-center">Calculadoras e Simuladores</h2>
                            <div>
                                <div className="flex items-center gap-3 mb-4"><Gift size={24} className="text-purple-500" /> <h3 className="text-xl font-semibold">Transferência Bonificada</h3></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                    <div><label className="text-sm font-medium">Pontos a transferir</label><input name="pointsToConvert" type="number" value={calculatorState.pointsToConvert} onChange={handleCalculatorChange} className={`p-2 mt-1 rounded-lg border w-full ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`} /></div>
                                    <div><label className="text-sm font-medium">Bônus (%)</label><input name="bonusPercentage" type="number" value={calculatorState.bonusPercentage} onChange={handleCalculatorChange} className={`p-2 mt-1 rounded-lg border w-full ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`} /></div>
                                </div>
                                <div className="mt-4 text-center text-lg font-medium">Total de Milhas a Receber: <span className="text-[#00d971] font-bold">{bonusConversionResult.toLocaleString()}</span></div>
                            </div>
                            <hr className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`} />
                            <div>
                                <div className="flex items-center gap-3 mb-4"><TrendingUp size={24} className="text-green-500" /> <h3 className="text-xl font-semibold">Venda de Milhas</h3></div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                                    <div><label className="text-sm font-medium">Milhas a vender</label><input name="milesToSell" type="number" value={calculatorState.milesToSell} onChange={handleCalculatorChange} className={`p-2 mt-1 rounded-lg border w-full ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`} /></div>
                                    <div><label className="text-sm font-medium">Valor por 1.000 milhas (R$)</label><input name="saleValuePerThousand" type="number" step="0.01" value={calculatorState.saleValuePerThousand} onChange={handleCalculatorChange} className={`p-2 mt-1 rounded-lg border w-full ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`} /></div>
                                </div>
                                <div className="mt-4 text-center text-lg font-medium">Valor Estimado da Venda: <span className="text-blue-500 font-bold">R$ {mileSaleResult.toFixed(2)}</span></div>
                            </div>
                        </section>
                    )}
                </main>
            </div>
            
            <ModalWallet
                isOpen={isWalletModalOpen}
                onClose={handleCloseWalletModal}
                onSave={handleSaveWallet}
                walletExistente={walletToEdit}
            />

            <ModalNovaViagem
                isOpen={isTripModalOpen}
                onClose={handleCloseTripModal}
                onSave={handleSaveTrip}
                viagemExistente={tripToEdit}
                programasDisponiveis={milePrograms}
            />
        </div>
    );
};

export default TelaMilhas;
