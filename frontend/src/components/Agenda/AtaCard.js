// src/components/Agenda/AtaCard.js

import React from 'react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Tag, DollarSign } from 'lucide-react';

export const AtaCard = ({ ata, onEdit, onDelete, theme }) => {
  const actionItems = ata.action_items || [];
  const completedItems = actionItems.filter(item => item.status === 'Concluído').length;
  const progress = actionItems.length > 0 ? (completedItems / actionItems.length) * 100 : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
      className={`rounded-2xl shadow-lg flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border'}`}
    >
      <div className="p-5 flex-grow">
        <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{ata.titulo}</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
          {new Date(ata.data_criacao).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' })}
        </p>
        <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-3">{ata.resumo}</p>
        
        <div className="flex flex-wrap gap-2 text-xs mb-4">
          {ata.categoria_financeira && (
            <span className="flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 px-2 py-1 rounded-full font-medium">
              <Tag size={14} /> {ata.categoria_financeira}
            </span>
          )}
          {ata.valor_envolvido > 0 && (
            <span className="flex items-center gap-1.5 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 px-2 py-1 rounded-full font-medium">
              <DollarSign size={14} /> R$ {parseFloat(ata.valor_envolvido).toFixed(2)}
            </span>
          )}
        </div>

        {actionItems.length > 0 && (
          <div className="dark:bg-[#2a246f]">
            <div className="flex justify-between items-center mb-1">
              <h4 className="text-sm font-semibold text-gray-800 dark:text-gray-200">Itens de Ação</h4>
              <span className="text-xs font-bold text-gray-600 dark:text-gray-400">{completedItems}/{actionItems.length}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bbg-[#2a246f] rounded-full h-1.5">
              <motion.div 
                className="bg-gradient-to-r from-[#00d971] to-green-500 h-1.5 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.8, ease: "easeInOut" }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="bg-gray-50 dark:bg-[#2a246f] p-3 flex justify-end items-center gap-3 border-t border-gray-200 dark:border-gray-700">
        <button onClick={() => onEdit(ata)} className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 font-semibold text-sm flex items-center gap-1.5 transition-colors"><Edit size={14} /> Editar</button>
        <button onClick={() => onDelete(ata.id)} className="text-red-500 hover:text-red-600 dark:hover:text-red-400 font-semibold text-sm flex items-center gap-1.5 transition-colors"><Trash2 size={14} /> Excluir</button>
      </div>
    </motion.div>
  );
};