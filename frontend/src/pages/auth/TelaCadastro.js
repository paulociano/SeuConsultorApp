import React, { useState } from 'react'; // 1. Importar o useState
import { UserPlus, LoaderCircle } from 'lucide-react'; // Importar um ícone de carregamento

const TelaCadastro = ({ onNavigateToLogin }) => {
  // 2. Criar estados para guardar os dados dos inputs e o feedback para o usuário
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState(null);
  const [carregando, setCarregando] = useState(false);

  // 3. Modificar a função de cadastro para se comunicar com o backend
  const handleCadastro = async (e) => {
    e.preventDefault(); // Impede o recarregamento da página
    setCarregando(true); // Inicia o feedback de carregamento
    setErro(null); // Limpa erros anteriores

    try {
      const response = await fetch('http://localhost:3001/cadastro', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ nome, email, senha }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Se a resposta do servidor não for de sucesso (ex: status 500)
        throw new Error(data.message || 'Não foi possível realizar o cadastro.');
      }

      // Se o cadastro foi bem-sucedido
      alert("Cadastro realizado com sucesso! Faça o login para continuar.");
      onNavigateToLogin(); // Navega para a tela de login

    } catch (error) {
      // Captura qualquer erro de rede ou o erro lançado acima
      setErro(error.message);
    } finally {
      // Este bloco sempre será executado, independentemente de sucesso ou erro
      setCarregando(false); // Finaliza o feedback de carregamento
    }
  };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-[#2a246f] rounded-xl shadow-lg h-auto min-h-[500px]">
        <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Crie sua Conta</h1>
            <p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">Comece sua jornada para a saúde financeira</p>
        </div>
        <form className="space-y-4" onSubmit={handleCadastro}>
            {/* 4. Conectar os inputs aos seus respectivos estados */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label>
                <input 
                    type="text" required 
                    className="w-full px-3 py-2 mt-1 text-slate-900 dark:text-white bg-slate-100 dark:bg-[#2a246f] border border-slate-300 dark:border-[#3e388b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d971]" 
                    placeholder="Seu Nome Completo"
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
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
                />
            </div>

            {/* 5. Modificar o botão para mostrar o estado de carregamento */}
            <button 
                type="submit" 
                className="w-full py-2 font-semibold text-black bg-[#00d971] rounded-md hover:brightness-90 transition duration-300 flex items-center justify-center gap-2 text-base disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={carregando}
            >
                {carregando ? (
                    <LoaderCircle size={18} className="animate-spin" />
                ) : (
                    <UserPlus size={18} />
                )}
                {carregando ? 'Cadastrando...' : 'Cadastrar'}
            </button>
        </form>

        {/* 6. Adicionar um local para exibir a mensagem de erro */}
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