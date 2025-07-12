// src/ThemeContext.js

import React, { createContext, useState, useEffect } from 'react';

// Cria o Contexto que compartilhará os dados
export const ThemeContext = createContext();

// Cria o Componente "Provedor" que vai gerenciar e fornecer o estado do tema
export const ThemeProvider = ({ children }) => {
  // Tenta pegar o tema salvo no localStorage, ou usa 'dark' como padrão
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');

  // Efeito que roda toda vez que o estado 'theme' muda
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove a classe antiga e adiciona a nova na tag <html>
    root.classList.remove('light', 'dark');
    root.classList.add(theme);

    // Salva a preferência do usuário no localStorage
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Função para trocar o tema
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'dark' ? 'light' : 'dark'));
  };

  // Fornece o tema atual e a função de troca para todos os componentes filhos
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};