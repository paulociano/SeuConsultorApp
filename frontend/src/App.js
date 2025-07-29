import { Routes, Route, useLocation, Navigate } from 'react-router-dom';
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
import { useUserStore } from './stores/useUserStore';
import { Toaster } from 'sonner';
import { useState } from 'react';
import clsx from 'clsx';
import Sidebar from './components/SideBar/SideBar';

const ProtectedRoutes = () => {
    const location = useLocation();
    // 1. O estado que controla se a sidebar está colapsada é criado aqui.
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="bg-slate-100 dark:bg-gray-900 text-slate-900 dark:text-white min-h-screen font-sans">
            {/* 2. A função 'setIsCollapsed' é passada como prop para o Sidebar. */}
            <Sidebar 
                isCollapsed={isCollapsed} 
                setIsCollapsed={setIsCollapsed} 
            />
            
            <main className={clsx(
                "p-4 md:p-6 transition-all duration-300 ease-in-out",
                isCollapsed ? "ml-20" : "ml-64"
            )}>
                <PageTransition key={location.pathname}>
                    <Routes>
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
                        
                        <Route path="*" element={<Navigate to="/objetivos" replace />} />
                    </Routes>
                </PageTransition>
            </main>
        </div>
    );
};

export default function App() {
    const isAuthenticated = useUserStore((state) => state.isAuthenticated);
    
    return (
        <>
            <Toaster position="top-right" richColors closeButton />

            <Routes>
                {isAuthenticated ? (
                    <Route path="/*" element={<ProtectedRoutes />} />
                ) : (
                    <Route path="*" element={<TelaAutenticacao />} />
                )}
            </Routes>
        </>
    );
}
