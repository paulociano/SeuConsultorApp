import React, { useState } from 'react';
import { UserPlus, LoaderCircle } from 'lucide-react';
// 1. Importar a store do utilizador
import { useUserStore } from '../../stores/useUserStore';

const TelaCadastro = ({ onNavigateToLogin }) => {
  // 2. Obter a ação de cadastro e o estado de carregamento da store
  const { cadastro, isLoading } = useUserStore();

  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(null);

  const handleCadastro = async (e) => {
    e.preventDefault();
    setErro(null);

    // 3. Chamar a ação de cadastro da store
    const result = await cadastro({ nome, email, senha });

    if (result && result.success) {
      // Se o cadastro foi bem-sucedido, navega para o login
      onNavigateToLogin();
    } else if (result) {
      // Se houver uma mensagem de erro específica do backend
      setErro(result.message);
    } else {
      // Erro genérico (a store já deve ter mostrado um toast)
      setErro('Não foi possível realizar o cadastro.');
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-[#2a246f] rounded-xl shadow-lg h-auto min-h-[500px]">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Crie a sua Conta</h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">Comece a sua jornada para a saúde financeira</p>
        </div>
        <form className="space-y-4" onSubmit={handleCadastro}>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
                <input 
                    type="text" required 
                    className="w-full px-3 py-2 mt-1 text-slate-900 dark:text-white bg-slate-100 dark:bg-[#2a246f] border border-slate-300 dark:border-[#3e388b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d971]" 
                    placeholder="O seu Nome Completo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    disabled={isLoading}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input 
                    type="email" required 
                    className="w-full px-3 py-2 mt-1 text-slate-900 dark:text-white bg-slate-100 dark:bg-[#2a246f] border border-slate-300 dark:border-[#3e388b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d971]" 
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label>
                <input 
                    type="password" required 
                    className="w-full px-3 py-2 mt-1 text-slate-900 dark:text-white bg-slate-100 dark:bg-[#2a246f] border border-slate-300 dark:border-[#3e388b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d971]" 
                    placeholder="Crie uma senha forte"
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    disabled={isLoading}
                />
            </div>

            <button 
                type="submit" 
                className="w-full py-2 font-semibold text-black bg-[#00d971] rounded-md hover:brightness-90 transition duration-300 flex items-center justify-center gap-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
            >
                {isLoading ? (
                    <LoaderCircle size={18} className="animate-spin" />
                ) : (
                    <UserPlus size={18} />
                )}
                {isLoading ? 'A registar...' : 'Registar'}
            </button>
        </form>

        {erro && (
          <p className="text-center text-sm font-medium text-red-500">{erro}</p>
        )}

        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Já tem uma conta?{' '}
            <button type="button" onClick={onNavigateToLogin} className="font-medium text-[#00d971] hover:underline">Faça login</button>
        </p>
    </div>
  );
};

export default TelaCadastro;
