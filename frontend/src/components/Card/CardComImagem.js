import React from 'react';
import { useContext } from 'react';
import { ThemeContext } from '../../ThemeContext'; // Assumindo que você tem um ThemeContext

const CardComImagem = ({ imageSrc, imageAlt, title, description, children, onClick, className }) => {
  const { theme } = useContext(ThemeContext);

  const baseClasses = `
    rounded-xl shadow-md p-6 flex flex-col
    ${theme === 'dark' ? 'bg-[#2a246f]' : 'bg-white'}
    ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}
    ${className || ''}
  `;

  return (
    <div className={baseClasses} onClick={onClick}>
      {imageSrc && (
        <div className="mb-4 rounded-lg overflow-hidden">
          <img src={imageSrc} alt={imageAlt} className="w-full h-40 object-cover" />
        </div>
      )}
      {title && (
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">
          {title}
        </h3>
      )}
      {description && (
        <p className="text-gray-600 dark:text-gray-300 mb-4 text-sm">
          {description}
        </p>
      )}
      {children} {/* Para qualquer conteúdo adicional, como a barra de progresso */}
    </div>
  );
};

export default CardComImagem;