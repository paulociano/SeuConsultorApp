import React, { useState, useEffect } from 'react';
import { CATEGORIAS_FLUXO } from '../../components/constants/Categorias';

const ModalEditarTransacao = ({ transacao, onSalvar, onFechar }) => {
  const [form, setForm] = useState({
    id: '',
    date: '',
    description: '',
    amount: '',
    type: 'debit',
    category: ''
  });

  useEffect(() => {
    if (transacao) {
      setForm({
        id: transacao.id,
        date: transacao.date?.substring(0, 10), // formatar para input date
        description: transacao.description || '',
        amount: transacao.amount || '',
        type: transacao.type || 'debit',
        category: transacao.category || ''
      });
    }
  }, [transacao]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    // Transforma amount em número antes de salvar
    onSalvar({
      ...form,
      amount: Number(form.amount),
    });
    onFechar();
  };

  if (!transacao) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-[#201b5d] p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-lg font-bold mb-4 text-slate-800 dark:text-white">Editar Transação</h2>
        
        <div className="space-y-4">
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full p-2 rounded border border-slate-300 dark:border-[#3e388b] bg-white dark:bg-[#200b5d] text-slate-800 dark:text-white"
          />
          <input
            type="text"
            name="description"
            placeholder="Descrição"
            value={form.description}
            onChange={handleChange}
            className="w-full p-2 rounded border border-slate-300 dark:border-[#3e388b] bg-white dark:bg-[#200b5d] text-slate-800 dark:text-white"
          />
          <input
            type="number"
            name="amount"
            placeholder="Valor"
            value={form.amount}
            onChange={handleChange}
            className="w-full p-2 rounded border border-slate-300 dark:border-[#3e388b] bg-white dark:bg-[#200b5d] text-slate-800 dark:text-white"
          />

          <select
            name="type"
            value={form.type}
            onChange={handleChange}
            className="w-full p-2 rounded border border-slate-300 dark:border-[#3e388b] bg-white dark:bg-[#200b5d] text-slate-800 dark:text-white"
          >
            <option value="debit">Débito</option>
            <option value="credit">Crédito</option>
          </select>

          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full p-2 rounded border border-slate-300 dark:border-[#3e388b] bg-white dark:bg-[#200b5d] text-slate-800 dark:text-white"
          >
            <option value="">Sem categoria</option>
            {Object.entries(CATEGORIAS_FLUXO).map(([key, { label }]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-4 mt-6">
          <button onClick={onFechar} className="text-sm px-4 py-2 bg-slate-300 dark:bg-slate-700 rounded hover:brightness-90">Cancelar</button>
          <button onClick={handleSubmit} className="text-sm px-4 py-2 bg-[#00d971] text-white rounded hover:brightness-110">Salvar</button>
        </div>
      </div>
    </div>
  );
};

export default ModalEditarTransacao;