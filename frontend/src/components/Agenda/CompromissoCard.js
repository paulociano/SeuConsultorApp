// src/components/Agenda/CompromissoCard.js

import React from 'react';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Edit, Trash2, ArrowRight, Clock, Users, MapPin, Link2 } from 'lucide-react';

export const CompromissoCard = ({ compromisso, onEdit, onDelete, onConvertToAta, theme }) => {
  const statusColors = {
    Marcado: "border-l-4 border-[#00d971]",
    Realizado: "border-l-4 border-blue-500",
    Cancelado: "border-l-4 border-red-500",
    Pendente: "border-l-4 border-yellow-500",
    Confirmado: "border-l-4 border-blue-500",
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
      className={clsx(`rounded-2xl shadow-lg flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${theme === 'dark' ? 'bg-gray-800 border border-gray-700' : 'bg-white border'}`, statusColors[compromisso.status])}
    >
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-lg mb-2 text-gray-900 dark:text-white">{compromisso.titulo}</h3>
          <span className={clsx('text-xs font-bold px-3 py-1 rounded-full', {
            'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300': compromisso.status === 'Marcado' || compromisso.status === 'Realizado',
            'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300': compromisso.status === 'Confirmado',
            'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300': compromisso.status === 'Cancelado',
            'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300': compromisso.status === 'Pendente',
          })}>{compromisso.status}</span>
        </div>
        
        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300 mt-2">
            <p className="flex items-center gap-2"><Clock size={14} /> {new Date(compromisso.data).toLocaleString('pt-BR', { dateStyle: 'full', timeStyle: 'short', timeZone: 'UTC' })}</p>
            {compromisso.local && <p className="flex items-center gap-2"><MapPin size={14} /> {compromisso.local}</p>}
            
            {/* ** CORREÇÃO DE EXIBIÇÃO APLICADA AQUI **
              Este bloco agora lida com dados antigos (string) e novos (array) sem quebrar.
            */}
            {compromisso.participantes && compromisso.participantes.length > 0 && (
                <p className="flex items-center gap-2">
                    <Users size={14} />
                    {Array.isArray(compromisso.participantes)
                        ? compromisso.participantes.join(', ')
                        : compromisso.participantes
                    }
                </p>
            )}
            
            {compromisso.link_reuniao && <a href={compromisso.link_reuniao} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-500 hover:underline"><Link2 size={14} /> Link da Reunião</a>}
        </div>
      </div>
      
      <div className="bg-gray-50 dark:bg-gray-800/50 p-3 flex justify-between items-center gap-3 border-t border-gray-200 dark:border-gray-700">
        <div>
          {compromisso.status === "Realizado" && (
            <button onClick={() => onConvertToAta(compromisso)} className="bg-green-600 text-white px-3 py-1.5 rounded-lg text-sm font-semibold hover:bg-green-700 flex items-center gap-2 transition-colors">
              <ArrowRight size={14} /> Converter em Ata
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
            <button onClick={() => onEdit(compromisso)} className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 font-semibold text-sm flex items-center gap-1.5 transition-colors"><Edit size={14} /> Editar</button>
            <button onClick={() => onDelete(compromisso.id)} className="text-red-500 hover:text-red-600 dark:hover:text-red-400 font-semibold text-sm flex items-center gap-1.5 transition-colors"><Trash2 size={14} /> Excluir</button>
        </div>
      </div>
    </motion.div>
  );
};