import React, { useState } from 'react';
import TelaLogin from './TelaLogin';
import TelaCadastro from './TelaCadastro';
import FlippableCard from '../../components/Card/FlippableCard';

// O componente agora não precisa de receber nenhuma prop,
// pois os seus filhos (Login, Cadastro) obtêm o que precisam da useUserStore.
const TelaAutenticacao = () => {
    const [isFlipped, setIsFlipped] = useState(false);

    return (
        <div className="flex items-center justify-center min-h-screen p-4 bg-slate-100 dark:bg-gray-900">
            <div className="w-full max-w-md">
                <FlippableCard
                    isFlipped={isFlipped}
                    front={
                        <TelaLogin
                            onNavigateToRegister={() => setIsFlipped(true)}
                        />
                    }
                    back={
                        <TelaCadastro
                            onNavigateToLogin={() => setIsFlipped(false)}
                        />
                    }
                />
            </div>
        </div>
    );
};

export default TelaAutenticacao;
