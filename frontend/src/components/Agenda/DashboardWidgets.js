import React from 'react';
import { CheckCircle, Clock, Calendar } from 'lucide-react';

export const DashboardWidgets = ({ upcomingCompromissos, pendingActionItems }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
      {/* Coluna Principal - Próximos Compromissos */}
      <div className="lg:col-span-2 p-6 rounded-2xl shadow-md bg-white dark:bg-[#2a246f]">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Próximos Compromissos</h2>
        {upcomingCompromissos.length > 0 ? (
          <div className="space-y-4">
            {upcomingCompromissos.map(c => (
              <div key={c.id} className="flex items-center gap-4 p-3 rounded-lg bg-gray-100 dark:bg-gray-900/50">
                <div className="bg-[#201b5d] text-white w-16 h-16 rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                  <span className="text-sm font-semibold">{new Date(c.data).toLocaleDateString('pt-BR', { month: 'short', timeZone: 'UTC' }).replace('.', '').toUpperCase()}</span>
                  <span className="text-2xl font-bold">{new Date(c.data).getUTCDate()}</span>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 dark:text-gray-200">{c.titulo}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
                    <Clock size={14} />
                    {new Date(c.data).toLocaleTimeString('pt-BR', { timeStyle: 'short', timeZone: 'UTC' })} {c.local && ` - ${c.local}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Calendar size={40} className="mx-auto text-gray-400 mb-2" />
            <p className="text-gray-500 font-semibold">Nenhum compromisso futuro.</p>
            <p className="text-sm text-gray-400">Aproveite o tempo livre ou planeje algo novo!</p>
          </div>
        )}
      </div>

      {/* Coluna Lateral - Itens de Ação Pendentes */}
      <div className="p-6 rounded-2xl shadow-md bg-white dark:bg-[#2a246f]">
        <h2 className="text-xl font-bold mb-4 text-gray-900 dark:text-white">Itens de Ação Pendentes</h2>
        {pendingActionItems.length > 0 ? (
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {pendingActionItems.map(item => (
              <div key={item.id} className="p-3 rounded-lg bg-yellow-100/50 dark:bg-yellow-900/30 border-l-4 border-yellow-400">
                <p className="font-semibold text-sm text-yellow-900 dark:text-yellow-200">{item.description}</p>
                <p className="text-xs text-yellow-700 dark:text-yellow-400">da ata: "{item.ataTitle}"</p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 flex flex-col items-center justify-center h-full">
            <CheckCircle size={40} className="mx-auto text-green-500 mb-2" />
            <p className="text-gray-500 font-semibold">Tudo em dia!</p>
            <p className="text-sm text-gray-400">Nenhum item de ação pendente.</p>
          </div>
        )}
      </div>
    </div>
  );
};