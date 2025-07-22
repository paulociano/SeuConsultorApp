// src/pages/auth/TelaLogin.js

import { useState } from 'react'; // 1. Importar o useState
import logo from '../../assets/logo.svg';
import { LogIn } from 'lucide-react';

// 2. Adicionar { setUsuario } como uma propriedade recebida
const TelaLogin = ({ onNavigateToRegister, setIsAuthenticated, setUsuario }) => {
  // 3. Criar estados para os campos de email e senha
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(''); // Estado para guardar mensagens de erro

  // 4. Transformar a função handleLogin em uma função assíncrona para lidar com a API
  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); // Limpa erros anteriores

    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email, senha: password }), // Envia os dados do estado
      });

      const data = await response.json();

      if (response.ok) {
        // Se a resposta do backend for positiva (status 2xx)
        setUsuario(data.usuario); // Atualiza os dados do usuário no App.js
        setIsAuthenticated(true); // Informa ao App.js que a autenticação foi bem-sucedida
      } else {
        // Se o backend retornar um erro (ex: 401 - Não Autorizado)
        setError(data.message || 'Ocorreu um erro no login.');
      }
    } catch (err) {
      // Erro de rede ou se o backend estiver offline
      console.error('Falha ao conectar com o servidor:', err);
      setError('Não foi possível conectar ao servidor. Tente novamente.');
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-[#201b5d] rounded-xl shadow-lg h-[500px]">
        {/* ... (código do cabeçalho não muda) ... */}
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
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                {/* 5. Conectar o input ao estado */}
                <input 
                    type="email" 
                    required 
                    className="w-full px-3 py-2 mt-1 text-slate-900 dark:text-white bg-slate-100 dark:bg-[#2a246f] border border-slate-300 dark:border-[#3e388b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d971]" 
                    placeholder="seu@email.com"
                    value={email} // Define o valor a partir do estado
                    onChange={(e) => setEmail(e.target.value)} // Atualiza o estado ao digitar
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label>
                {/* 6. Conectar o input ao estado */}
                <input 
                    type="password" 
                    required 
                    className="w-full px-3 py-2 mt-1 text-slate-900 dark:text-white bg-slate-100 dark:bg-[#2a246f] border border-slate-300 dark:border-[#3e388b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d971]" 
                    placeholder="********"
                    value={password} // Define o valor a partir do estado
                    onChange={(e) => setPassword(e.target.value)} // Atualiza o estado ao digitar
                />
            </div>

            {/* 7. Exibir a mensagem de erro, se houver */}
            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <button type="submit" className="w-full py-2 font-semibold text-black bg-[#00d971] rounded-md hover:brightness-90 transition duration-300 flex items-center justify-center gap-2 text-base">
                <LogIn size={18} /> Entrar
            </button>
        </form>
        {/* ... (código do rodapé não muda) ... */}
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Não tem uma conta?{' '}
            <button type="button" onClick={onNavigateToRegister} className="font-medium text-[#00d971] hover:underline">Cadastre-se</button>
        </p>
    </div>
  );
};

export default TelaLogin;