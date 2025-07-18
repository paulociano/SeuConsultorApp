import React from 'react';

const FlipCardCategoria = ({ icon: Icon, label, total, color = '#00d971' }) => {
  return (
    <div className="min-h-40 flex flex-col justify-between w-full [perspective:1000px]">
      <div className="relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] hover:[transform:rotateY(180deg)]">
        
        {/* Frente */}
        <div className="absolute w-full h-full [backface-visibility:hidden] bg-white dark:bg-[#201b5d] rounded-xl shadow-md border dark:border-[#201b5d] overflow-hidden">
          {/* Faixa colorida superior */}
          <div
            className="flex items-center justify-start px-4 py-2 gap-2"
            style={{ backgroundColor: `${color}40` }} // cor da categoria
          >
          <div className="rounded-full p-2" style={{ backgroundColor: `${color}40` }}>
              <Icon size={20} style={{ color }} />
          </div>
            <p className="text-sm text-right text-slate-800 dark:text-white">{label}</p>
          </div>

          {/* Conteúdo do card */}
          <div className="p-4 flex flex-col justify-between text-center h-[calc(100%-52px)]">
            <div className="mt-2">
              <p className="text-2xl font-bold  text-slate-800 dark:text-white">
                {total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </div>
        </div>

        {/* Verso */}
        <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-white dark:bg-[#1a174a] text-slate-800 dark:text-white rounded-xl p-4 shadow-md border flex flex-col justify-center items-center text-center">
          <p className="text-xl font-bold text-green-400 mt-2">+5%</p>
          <p className="text-sm font-medium">do último mês</p>
        </div>
      </div>
    </div>
  );
};

export default FlipCardCategoria;
