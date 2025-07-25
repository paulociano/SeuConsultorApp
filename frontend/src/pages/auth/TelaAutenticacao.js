// src/pages/auth/TelaAutenticacao.js

import React, { useState } from 'react';
import TelaLogin from './TelaLogin';
import TelaCadastro from './TelaCadastro';
import FlippableCard from '../../components/Card/FlippableCard';

// Recebe as funções do App.js para controlar o estado global
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
                            setUsuario={setUsuario} // Passa a função para TelaLogin
                        />
                    }
                    back={
                        <TelaCadastro
                            onNavigateToLogin={() => setIsFlipped(false)}
                            // Não precisa passar setCurrentPage aqui, a menos que haja uma navegação direta após o cadastro
                        />
                    }
                />
            </div>
        </div>
    );
};

export default TelaAutenticacao;