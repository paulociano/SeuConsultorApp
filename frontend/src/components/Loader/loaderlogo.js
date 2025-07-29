import React from 'react';
import logo from '../../assets/logo.svg'; // Garanta que o caminho para o seu logo está correto
import './loaderlogo.css';

/**
 * Componente que exibe o logo da aplicação com uma animação de "pulso".
 * Ideal para ser usado em telas de carregamento.
 */
const LoaderLogo = () => {
  return (
    <div className="loader-container">
      <img src={logo} className="loader-logo" alt="Carregando..." />
    </div>
  );
};

export default LoaderLogo;
