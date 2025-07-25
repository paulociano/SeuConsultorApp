// src/pages/auth/TelaLogin.js

import { useState } from 'react';
import logo from '../../assets/logo.svg';
import { LogIn, LoaderCircle } from 'lucide-react'; // Importe o ícone de carregamento

const TelaLogin = ({ onNavigateToRegister, setIsAuthenticated, setUsuario }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [carregando, setCarregando] = useState(false); // Estado para controlar o carregamento

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setCarregando(true); // Inicia o carregamento

    try {
      const response = await fetch('http://localhost:3001/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: email, senha: password }),
      });

      const data = await response.json();

      if (response.ok) {
        // SUCESSO!
        // 1. Salvar o token no localStorage para manter a sessão
        localStorage.setItem('authToken', data.token);

        // 2. Atualizar o estado principal do App
        setUsuario(data.usuario);
        setIsAuthenticated(true);
      } else {
        // Erro vindo do backend
        setError(data.message || 'Ocorreu um erro no login.');
      }
    } catch (err) {
      // Erro de rede
      console.error('Falha ao conectar com o servidor:', err);
      setError('Não foi possível conectar ao servidor. Tente novamente.');
    } finally {
      // Este bloco sempre executa, com sucesso ou erro
      setCarregando(false); // Finaliza o carregamento
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-[#201b5d] rounded-xl shadow-lg h-auto min-h-[500px]">
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
          <input
            type="email"
            required
            className="w-full px-3 py-2 mt-1 text-slate-900 dark:text-white bg-slate-100 dark:bg-[#2a246f] border border-slate-300 dark:border-[#3e388b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d971]"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={carregando} // Desabilita o campo durante o carregamento
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label>
          <input
            type="password"
            required
            className="w-full px-3 py-2 mt-1 text-slate-900 dark:text-white bg-slate-100 dark:bg-[#2a246f] border border-slate-300 dark:border-[#3e388b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d971]"
            placeholder="********"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={carregando} // Desabilita o campo durante o carregamento
          />
        </div>

        {error && <p className="text-sm text-red-500 text-center">{error}</p>}

        <button
          type="submit"
          className="w-full py-2 font-semibold text-black bg-[#00d971] rounded-md hover:brightness-90 transition duration-300 flex items-center justify-center gap-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={carregando} // Desabilita o botão durante o carregamento
        >
          {carregando ? <LoaderCircle size={18} className="animate-spin" /> : <LogIn size={18} />}
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
      <p className="text-xs text-center text-gray-500 dark:text-gray-400">
        Não tem uma conta?{' '}
        <button type="button" onClick={onNavigateToRegister} className="font-medium text-[#00d971] hover:underline">Cadastre-se</button>
      </p>
    </div>
  );
};

export default TelaLogin;