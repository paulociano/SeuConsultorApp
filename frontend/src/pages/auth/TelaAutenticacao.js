import React, { useState } from 'react';
import TelaLogin from './TelaLogin';
import TelaCadastro from './TelaCadastro';
import FlippableCard from '../../components/Card/FlippableCard';

// Receber setUsuario aqui
const TelaAutenticacao = ({ setIsAuthenticated, setCurrentPage, setUsuario }) => {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-slate-100 dark:bg-gray-900">
            <div className="w-full max-w-md">
                <FlippableCard
                    isFlipped={isFlipped}
                    front={
                        <TelaLogin 
                            onNavigateToRegister={() => setIsFlipped(true)} 
                            setIsAuthenticated={setIsAuthenticated} 
                            setUsuario={setUsuario} // E passar para TelaLogin
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

export default TelaAutenticacao;