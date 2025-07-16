import React from 'react';
import { UserPlus } from 'lucide-react';

const TelaCadastro = ({ onNavigateToLogin, setCurrentPage }) => {
  const handleCadastro = (e) => { e.preventDefault(); alert("Cadastro realizado!"); onNavigateToLogin(); };

  return (
    <div className="w-full max-w-md p-8 space-y-6 bg-white dark:bg-[#2a246f] rounded-xl shadow-lg h-[500px]">
        <div className="text-center"><h1 className="text-3xl font-bold text-slate-900 dark:text-white">Crie sua Conta</h1><p className="mt-2 text-gray-500 dark:text-gray-400 text-sm">Comece sua jornada para a saúde financeira</p></div>
        <form className="space-y-4" onSubmit={handleCadastro}>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Nome</label><input type="text" required className="w-full px-3 py-2 mt-1 text-slate-900 dark:text-white bg-slate-100 dark:bg-[#2a246f] border border-slate-300 dark:border-[#3e388b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d971]" placeholder="Seu Nome Completo" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label><input type="email" required className="w-full px-3 py-2 mt-1 text-slate-900 dark:text-white bg-slate-100 dark:bg-[#2a246f] border border-slate-300 dark:border-[#3e388b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d971]" placeholder="seu@email.com" /></div>
            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Senha</label><input type="password" required className="w-full px-3 py-2 mt-1 text-slate-900 dark:text-white bg-slate-100 dark:bg-[#2a246f] border border-slate-300 dark:border-[#3e388b] rounded-md focus:outline-none focus:ring-2 focus:ring-[#00d971]" placeholder="Crie uma senha forte" /></div>
            <button type="submit" className="w-full py-2 font-semibold text-black bg-[#00d971] rounded-md hover:brightness-90 transition duration-300 flex items-center justify-center gap-2 text-base"><UserPlus size={18} /> Cadastrar</button>
        </form>
        <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Já tem uma conta?{' '}
            <button type="button" onClick={onNavigateToLogin} className="font-medium text-[#00d971] hover:underline">Faça login</button>
        </p>
    </div>
  );
};

export default TelaCadastro;