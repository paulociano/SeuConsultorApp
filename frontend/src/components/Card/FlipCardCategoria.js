import React, { useMemo } from 'react';

/**
 * Componente de card que vira ao passar o mouse, exibindo um resumo da categoria na frente
 * e uma comparação percentual no verso.
 * @param {object} props
 * @param {React.ComponentType} props.icon - O componente de ícone a ser exibido.
 * @param {string} props.label - O nome da categoria.
 * @param {number} props.total - O valor total gasto na categoria.
 * @param {string} [props.color='#00d971'] - A cor de destaque para a categoria.
 * @param {string} props.verso - O texto a ser exibido no verso do card, contendo a comparação.
 */
const FlipCardCategoria = ({ icon: Icon, label, total, color = '#00d971', verso }) => {
  
  // Analisa a string 'verso' para separar a porcentagem do texto descritivo.
  const { porcentagem, texto } = useMemo(() => {
    if (!verso) {
      return { porcentagem: null, texto: "Sem dados para comparação." };
    }

    // Expressão regular para encontrar valores percentuais como: +15.2%, -5%, 10.5%
    const regex = /([+-]?\d+[.,]?\d*%)/;
    const match = verso.match(regex);

    // Se encontrar uma porcentagem, separa o valor do texto.
    if (match) {
      const percentValue = match[0];
      return {
        porcentagem: percentValue,
        texto: "em relação ao mês anterior",
      };
    }

    // Trata a mensagem de "Gasto novo".
    if (verso.includes("Gasto novo")) {
         return { porcentagem: "Novo", texto: "gasto este mês" };
    }

    // Caso padrão para outras mensagens (ex: "Selecione um mês...").
    return { porcentagem: null, texto: verso };

  }, [verso]);

  return (
    <div className="min-h-40 flex flex-col justify-between w-full [perspective:1000px]">
      <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] hover:[transform:rotateY(180deg)]">
        
        {/* Frente do Card */}
        <div className="absolute w-full h-full [backface-visibility:hidden] bg-white dark:bg-[#201b5d] rounded-xl shadow-md border dark:border-[#201b5d] overflow-hidden">
          {/* Faixa colorida superior */}
          <div
            className="flex items-center justify-start px-4 py-2 gap-2"
            style={{ backgroundColor: `${color}40` }}
          >
            <div className="rounded-full p-2" style={{ backgroundColor: `${color}40` }}>
              <Icon size={20} style={{ color }} />
            </div>
            <p className="text-sm font-medium text-slate-800 dark:text-white">{label}</p>
          </div>
          {/* Conteúdo principal (total) */}
          <div className="p-4 flex flex-col justify-center items-center text-center h-[calc(100%-52px)]">
            <p className="text-2xl font-bold text-slate-800 dark:text-white">
              {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          </div>
        </div>

        {/* Verso do Card */}
        <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white dark:bg-[#1a174a] text-slate-800 dark:text-white rounded-xl p-4 shadow-md border flex flex-col justify-center items-center text-center">
          {porcentagem ? (
            <>
              <p className="text-3xl font-bold text-[#00d971]">{porcentagem}</p>
              <p className="text-sm mt-1">{texto}</p>
            </>
          ) : (
            <p className="text-base font-medium px-2">{texto}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default FlipCardCategoria;
