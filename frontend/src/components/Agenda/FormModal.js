// src/components/Agenda/FormModal.js

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { X, Save, PlusCircle, Trash2, DollarSign, AlertCircle } from 'lucide-react';

const financialCategories = ["Orçamento", "Investimentos", "Auditoria", "Planeamento Tributário", "Revisão de Dívidas", "Relatórios Financeiros", "Outros"];
const compromissoStatusOptions = ['Pendente', 'Confirmado', 'Cancelado', 'Realizado'];
const actionItemStatusOptions = ['Pendente', 'Em Progresso', 'Concluído'];

// ** CORREÇÃO APLICADA AQUI **
// Os componentes do formulário foram movidos para FORA do componente FormModal.
// Isso garante que eles não sejam recriados a cada renderização.

const Input = ({ name, placeholder, value, onChange, type = "text", theme }) => (
    <input
      type={type} name={name} placeholder={placeholder} value={value || ''} onChange={onChange}
      className={`w-full p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#00d971]`}
    />
);

const Textarea = ({ name, placeholder, value, onChange, rows = 3, theme }) => (
    <textarea
      name={name} placeholder={placeholder} value={value || ''} onChange={onChange} rows={rows}
      className={`w-full p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#00d971]`}
    />
);

const Select = ({ name, value, onChange, children, theme }) => (
  <select name={name} value={value || ''} onChange={onChange} className={`w-full p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#00d971]`}>
      {children}
  </select>
);


// O componente principal do Modal permanece o mesmo, mas agora usa os componentes estáveis definidos acima.
export const FormModal = ({ isOpen, onClose, content, onSave, theme }) => {
  const [formData, setFormData] = useState({});
  const [newActionItem, setNewActionItem] = useState({ description: "", responsible: "", deadline: "", status: "Pendente" });

  useEffect(() => {
    // Quando o modal abre, inicializa o estado do formulário
    if (!isOpen) return;

    if (content?.data) {
      // MODO EDIÇÃO: Preenche o formulário com dados existentes
      if (content.type === 'ata') {
        setFormData({
          ...content.data,
          participantesPresentes: Array.isArray(content.data.participantes_presentes) ? content.data.participantes_presentes.join(', ') : (content.data.participantes_presentes || ''),
          actionItems: content.data.action_items || []
        });
      } else { // compromisso
        setFormData({
          ...content.data,
          data: content.data.data ? new Date(content.data.data).toISOString().substring(0, 16) : "",
          participantes: Array.isArray(content.data.participantes) ? content.data.participantes.join(', ') : (content.data.participantes || ''),
        });
      }
    } else {
      // MODO CRIAÇÃO: Prepara um formulário em branco
      if (content?.type === 'ata') {
        setFormData(content.initialData || {
          titulo: "", resumo: "", participantesPresentes: "", deliberacoes: "",
          categoriaFinanceira: "", tipoDecisaoFinanceira: "", valorEnvolvido: "",
          impactoEsperado: "", actionItems: [],
        });
      } else { // compromisso
        setFormData({
          titulo: "", data: "", local: "", participantes: "",
          linkReuniao: "", descricaoDetalhada: "", status: "Pendente",
        });
      }
    }
  }, [isOpen, content]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveClick = () => {
    if (!formData.titulo) {
      toast.error("O campo 'Título' é obrigatório.");
      return;
    }
    onSave(content.type, formData);
  };
  
  const addActionItem = () => {
    if (!newActionItem.description) {
      toast.error("A descrição do item de ação é obrigatória.");
      return;
    }
    const updatedActionItems = [...(formData.actionItems || []), { ...newActionItem, id: Date.now() }];
    setFormData(prev => ({ ...prev, actionItems: updatedActionItems }));
    setNewActionItem({ description: "", responsible: "", deadline: "", status: "Pendente" });
  };

  const removeActionItem = (idToRemove) => {
    const updatedActionItems = formData.actionItems.filter(item => item.id !== idToRemove);
    setFormData(prev => ({ ...prev, actionItems: updatedActionItems }));
  };
  
  const renderAtaForm = () => (
    <div className="space-y-4">
      <Input name="titulo" placeholder="Título da Ata" value={formData.titulo} onChange={handleChange} theme={theme} />
      <Textarea name="resumo" placeholder="Resumo da Reunião" value={formData.resumo} onChange={handleChange} theme={theme} />
      <Input name="participantesPresentes" placeholder="Participantes (separados por vírgula)" value={formData.participantesPresentes} onChange={handleChange} theme={theme} />
      <Textarea name="deliberacoes" placeholder="Principais Deliberações" value={formData.deliberacoes} onChange={handleChange} theme={theme} />
      
      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2"><DollarSign size={20} /> Detalhes Financeiros</h3>
        <Select name="categoriaFinanceira" value={formData.categoriaFinanceira} onChange={handleChange} theme={theme}>
            <option value="">Selecione a Categoria Financeira</option>
            {financialCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </Select>
        <Input name="tipoDecisaoFinanceira" placeholder="Tipo de Decisão Financeira" value={formData.tipoDecisaoFinanceira} onChange={handleChange} theme={theme}/>
        <Input name="valorEnvolvido" type="number" placeholder="Valor Envolvido (R$)" value={formData.valorEnvolvido} onChange={handleChange} theme={theme}/>
        <Textarea name="impactoEsperado" placeholder="Impacto Financeiro Esperado" value={formData.impactoEsperado} onChange={handleChange} rows={2} theme={theme}/>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4 space-y-4">
        <h3 className="text-lg font-bold flex items-center gap-2"><AlertCircle size={20} /> Itens de Ação</h3>
        <div className="space-y-2">
            {formData.actionItems?.map(item => (
                <div key={item.id} className={`p-2 rounded-md flex justify-between items-center text-sm ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                    <span>{item.description} ({item.responsible})</span>
                    <button onClick={() => removeActionItem(item.id)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                </div>
            ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <input type="text" placeholder="Nova Ação" value={newActionItem.description} onChange={(e) => setNewActionItem({...newActionItem, description: e.target.value})} className={`p-2 rounded-md border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-200 border-gray-300'} w-full`}/>
          <input type="text" placeholder="Responsável" value={newActionItem.responsible} onChange={(e) => setNewActionItem({...newActionItem, responsible: e.target.value})} className={`p-2 rounded-md border ${theme === 'dark' ? 'bg-gray-700 border-gray-600' : 'bg-gray-200 border-gray-300'} w-full`} />
        </div>
        <button type="button" onClick={addActionItem} className="flex items-center gap-2 px-3 py-1.5 text-sm font-semibold bg-blue-600 text-white rounded-md hover:bg-blue-700"><PlusCircle size={16} /> Adicionar Item de Ação</button>
      </div>
    </div>
  );

  const renderCompromissoForm = () => (
    <div className="space-y-4">
        <Input name="titulo" placeholder="Título do Compromisso" value={formData.titulo} onChange={handleChange} theme={theme} />
        <Input name="data" type="datetime-local" placeholder="Data e Hora" value={formData.data} onChange={handleChange} theme={theme} />
        <Input name="local" placeholder="Local (ou 'Online')" value={formData.local} onChange={handleChange} theme={theme} />
        <Input name="participantes" placeholder="Participantes (separados por vírgula)" value={formData.participantes} onChange={handleChange} theme={theme} />
        <Input name="linkReuniao" type="url" placeholder="Link da Reunião (opcional)" value={formData.linkReuniao} onChange={handleChange} theme={theme} />
        <Textarea name="descricaoDetalhada" placeholder="Descrição / Pauta" value={formData.descricaoDetalhada} onChange={handleChange} theme={theme} />
        <Select name="status" value={formData.status} onChange={handleChange} theme={theme}>
            {compromissoStatusOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </Select>
    </div>
  );
  
  // O AnimatePresence garante que o modal não seja removido da árvore DOM imediatamente,
  // permitindo que as animações de saída ocorram.
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: 50, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 50, opacity: 0 }}
            className={`relative w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}
            onClick={e => e.stopPropagation()}
          >
            <header className="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
              <h2 className="text-2xl font-bold">{content.title}</h2>
              <button onClick={onClose} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><X size={24} /></button>
            </header>
            
            <main className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
              {content.type === 'ata' ? renderAtaForm() : renderCompromissoForm()}
            </main>
            
            <footer className="p-4 bg-gray-100 dark:bg-gray-800/50 flex justify-end gap-3 border-t border-gray-200 dark:border-gray-700">
              <button onClick={onClose} className="px-5 py-2.5 rounded-lg bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600">Cancelar</button>
              <button onClick={handleSaveClick} className="flex items-center gap-2 bg-[#00d971] hover:brightness-90 text-black font-semibold px-5 py-2.5 rounded-lg shadow-md">
                <Save size={20} /> {content.data ? 'Salvar Alterações' : 'Criar'}
              </button>
            </footer>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};