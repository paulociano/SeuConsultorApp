import { createContext, useContext, useState } from 'react';

const DadosFinanceirosContext = createContext();

export const useDadosFinanceiros = () => useContext(DadosFinanceirosContext);

export const DadosFinanceirosProvider = ({ children }) => {
  const [dadosFinanceiros, setDadosFinanceiros] = useState({});

  const atualizarDados = (chave, dados) => {
    setDadosFinanceiros(prev => ({
      ...prev,
      [chave]: dados
    }));
  };

  return (
    <DadosFinanceirosContext.Provider value={{ dadosFinanceiros, atualizarDados }}>
      {children}
    </DadosFinanceirosContext.Provider>
  );
};
