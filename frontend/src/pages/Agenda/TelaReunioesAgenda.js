import React, { useState, useContext, useMemo, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@radix-ui/react-tabs";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, FileText, PlusCircle, Search, Trash2, Edit, Save, XCircle, AlertCircle, Tag, DollarSign } from "lucide-react";
import clsx from "clsx";
import { ThemeContext } from "../../ThemeContext"; 
import { toast } from 'sonner';
import { useAgendaStore } from "../../stores/useAgendaStore";
import LoaderLogo from "../../components/Loader/loaderlogo";

// Componente de Calendário Semanal (sem alterações)
function CalendarioSemanal({ compromissos }) {
  const diasSemana = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const horas = Array.from({ length: 12 }, (_, i) => 8 + i);

  const compromissosPorDia = {};
  diasSemana.forEach(dia => compromissosPorDia[dia] = []);

  (compromissos || []).forEach(evento => {
    const data = new Date(evento.data);
    const dia = data.toLocaleDateString('pt-BR', { weekday: 'short', timeZone: 'UTC' }).replace('.', '');
    const hora = data.getUTCHours();

    const diaMap = {
      "seg": "Seg", "ter": "Ter", "qua": "Qua", "qui": "Qui",
      "sex": "Sex", "sáb": "Sáb", "dom": "Dom"
    };

    const diaSemana = diaMap[dia.toLowerCase()];
    if (diaSemana && compromissosPorDia[diaSemana]) {
      compromissosPorDia[diaSemana].push({ ...evento, hora });
    }
  });

  return (
    <div className="overflow-x-auto border rounded-lg shadow mt-10 bg-white dark:bg-gray-800">
      <div className="grid grid-cols-8 min-w-[1000px]">
        <div className="bg-gray-100 dark:bg-gray-900 p-2 font-bold border-r border-gray-200 dark:border-gray-700">Horário</div>
        {diasSemana.map(dia => (
          <div key={dia} className="bg-gray-100 dark:bg-gray-900 p-2 text-center font-bold border-r border-gray-200 dark:border-gray-700">
            {dia}
          </div>
        ))}
      </div>
      {horas.map(hora => (
        <div key={hora} className="grid grid-cols-8 border-t border-gray-200 dark:border-gray-700 min-h-[60px]">
          <div className="border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 p-2 text-sm text-right pr-3">{hora}:00</div>
          {diasSemana.map(dia => (
            <div key={dia + hora} className="border-r border-gray-200 dark:border-gray-700 relative p-1">
              {compromissosPorDia[dia].filter(ev => ev.hora === hora).map(ev => (
                <div
                  key={ev.id}
                  className={clsx(`text-xs p-1 rounded shadow-sm overflow-hidden truncate`, {
                    'bg-[#201b5d] text-white': ev.status === 'Marcado',
                    'bg-green-600 text-white': ev.status === 'Realizado',
                    'bg-red-500 text-white': ev.status === 'Cancelado',
                    'bg-gray-300 text-black': !['Marcado', 'Realizado', 'Cancelado'].includes(ev.status),
                  })}
                  title={ev.descricao_detalhada || ev.titulo}
                >
                  {ev.titulo}
                </div>
              ))}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function TelaReunioesAgenda() {
  const { theme } = useContext(ThemeContext);

  const {
    atas,
    agenda,
    isLoading,
    fetchAgenda,
    saveAta,
    deleteAta,
    saveCompromisso,
    deleteCompromisso,
  } = useAgendaStore();

  useEffect(() => {
    fetchAgenda();
  }, [fetchAgenda]);

  const [novaAta, setNovaAta] = useState({
    titulo: "", resumo: "", participantesPresentes: "", deliberacoes: "",
    categoriaFinanceira: "", tipoDecisaoFinanceira: "", valorEnvolvido: "",
    impactoEsperado: "", actionItems: [],
  });
  const [newActionItem, setNewActionItem] = useState({ description: "", responsible: "", deadline: "", status: "Pendente" });
  const [novoEvento, setNovoEvento] = useState({
    titulo: "", data: "", local: "", participantes: "",
    linkReuniao: "", descricaoDetalhada: "", status: "Marcado",
  });

  const [editingAtaId, setEditingAtaId] = useState(null);
  const [editingEventoId, setEditingEventoId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterDate, setFilterDate] = useState("");

  const handleSaveAta = async () => {
    if (!novaAta.titulo || !novaAta.resumo) {
      toast.error("Título e Resumo são obrigatórios para a Ata.");
      return;
    }

    // *** CORREÇÃO APLICADA AQUI ***
    // Garante que o objeto enviado para a API tenha todos os campos esperados,
    // com os tipos de dados corretos, para passar na validação do backend.
    const valorFloat = parseFloat(novaAta.valorEnvolvido);

    const ataToSave = {
        id: editingAtaId, // Será null se for uma nova ata
        titulo: novaAta.titulo || "",
        resumo: novaAta.resumo || "",
        // Converte a string de participantes de volta para um array
        participantesPresentes: typeof novaAta.participantesPresentes === 'string' 
            ? novaAta.participantesPresentes.split(',').map(s => s.trim()).filter(Boolean) 
            : (novaAta.participantesPresentes || []),
        deliberacoes: novaAta.deliberacoes || "",
        categoriaFinanceira: novaAta.categoriaFinanceira || "",
        tipoDecisaoFinanceira: novaAta.tipoDecisaoFinanceira || "",
        // Converte o valor para número, tratando casos de campo vazio ou inválido como null
        valorEnvolvido: isNaN(valorFloat) ? null : valorFloat,
        impactoEsperado: novaAta.impactoEsperado || "",
        actionItems: novaAta.actionItems || [],
    };
    
    const savedAta = await saveAta(ataToSave);

    if (savedAta) {
      setEditingAtaId(null);
      setNovaAta({
        titulo: "", resumo: "", participantesPresentes: "", deliberacoes: "",
        categoriaFinanceira: "", tipoDecisaoFinanceira: "", valorEnvolvido: "",
        impactoEsperado: "", actionItems: [],
      });
      setNewActionItem({ description: "", responsible: "", deadline: "", status: "Pendente" });
    }
  };

  const iniciarEdicaoAta = (ata) => {
    setNovaAta({
      titulo: ata.titulo || "",
      resumo: ata.resumo || "",
      // Converte o array de participantes para uma string para o input
      participantesPresentes: Array.isArray(ata.participantes_presentes) ? ata.participantes_presentes.join(', ') : "",
      deliberacoes: ata.deliberacoes || "",
      categoriaFinanceira: ata.categoria_financeira || "",
      tipoDecisaoFinanceira: ata.tipo_decisao_financeira || "",
      valorEnvolvido: ata.valor_envolvido || "",
      impactoEsperado: ata.impacto_esperado || "",
      actionItems: ata.action_items || [],
    });
    setEditingAtaId(ata.id);
    window.scrollTo(0, 0);
  };

  const handleDeleteAta = (id) => {
    deleteAta(id);
  };

  const addActionItemToAta = () => {
    if (!newActionItem.description) {
      toast.error("Descrição do item de ação é obrigatória.");
      return;
    }
    setNovaAta(prev => ({
      ...prev,
      actionItems: [...(prev.actionItems || []), { ...newActionItem, id: Date.now() }]
    }));
    setNewActionItem({ description: "", responsible: "", deadline: "", status: "Pendente" });
  };

  const removeActionItemFromAta = (idToRemove) => {
    setNovaAta(prev => ({
      ...prev,
      actionItems: prev.actionItems.filter(item => item.id !== idToRemove)
    }));
  };

  const handleSaveEvento = async () => {
    if (!novoEvento.titulo || !novoEvento.data) {
      toast.error("Título e Data são obrigatórios para o Compromisso.");
      return;
    }
    const eventoToSave = { 
        ...novoEvento,
        // Converte a string de participantes de volta para um array
        participantes: typeof novoEvento.participantes === 'string'
            ? novoEvento.participantes.split(',').map(s => s.trim()).filter(Boolean)
            : (novoEvento.participantes || [])
    };
    if (editingEventoId) {
      eventoToSave.id = editingEventoId;
    }
    const savedEvento = await saveCompromisso(eventoToSave);
    if (savedEvento) {
      setEditingEventoId(null);
      setNovoEvento({
        titulo: "", data: "", local: "", participantes: "",
        linkReuniao: "", descricaoDetalhada: "", status: "Marcado",
      });
    }
  };

  const iniciarEdicaoEvento = (evento) => {
    setNovoEvento({
      ...evento,
      data: evento.data ? new Date(evento.data).toISOString().substring(0, 16) : "",
      // Converte o array de participantes para uma string para o input
      participantes: Array.isArray(evento.participantes) ? evento.participantes.join(', ') : "",
    });
    setEditingEventoId(evento.id);
    window.scrollTo(0, 0);
  };

  const handleDeleteEvento = (id) => {
    deleteCompromisso(id);
  };

  const atualizarStatusEvento = async (id, newStatus) => {
    const eventoOriginal = agenda.find(item => item.id === id);
    if (eventoOriginal) {
      await saveCompromisso({ ...eventoOriginal, status: newStatus });
    }
  };

  const statusStyles = {
    Marcado: "bg-[#00d971] text-black",
    Realizado: "bg-[#201b5d] text-white",
    Cancelado: "bg-red-500 text-white",
    Pendente: "bg-yellow-500 text-black",
    "Em Progresso": "bg-blue-500 text-white",
    Concluído: "bg-green-600 text-white",
  };

  const financialCategories = ["Orçamento", "Investimentos", "Auditoria", "Planeamento Tributário", "Revisão de Dívidas", "Relatórios Financeiros", "Outros"];

  const filteredAtas = useMemo(() => (atas || []).filter(ata => 
        (searchTerm ? (ata.titulo.toLowerCase().includes(searchTerm.toLowerCase()) || 
                      (ata.resumo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (Array.isArray(ata.participantes_presentes) ? ata.participantes_presentes.join(', ').toLowerCase().includes(searchTerm.toLowerCase()) : false)) : true) &&
        (filterStatus !== 'all' && financialCategories.includes(filterStatus) ? ata.categoria_financeira === filterStatus : true)
    ), [atas, searchTerm, filterStatus]);

  const filteredAgenda = useMemo(() => (agenda || []).filter(evento =>
        (searchTerm ? (evento.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (evento.local || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                      (Array.isArray(evento.participantes) ? evento.participantes.join(', ').toLowerCase().includes(searchTerm.toLowerCase()) : false)) : true) &&
        (filterStatus !== 'all' && !financialCategories.includes(filterStatus) ? evento.status === filterStatus : true) &&
        (filterDate ? new Date(evento.data).toISOString().split('T')[0] === filterDate : true)
    ).sort((a, b) => new Date(a.data) - new Date(b.data)), [agenda, searchTerm, filterStatus, filterDate]);

  if (isLoading) {
    return (
        <LoaderLogo />
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} p-6 transition-colors duration-300`}>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input type="text" placeholder="Buscar por título, resumo, participantes..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className={`w-full pl-10 pr-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#00d971]`} />
          </div>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={`px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#00d971]`}>
            <option value="all">Todos os Status/Categorias</option>
            <optgroup label="Status do Compromisso">
              <option value="Marcado">Marcado</option>
              <option value="Realizado">Realizado</option>
              <option value="Cancelado">Cancelado</option>
            </optgroup>
            <optgroup label="Categorias Financeiras (Atas)">
              {financialCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </optgroup>
          </select>
          <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className={`px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#00d971]`} />
        </div>

        <Tabs defaultValue="atas" className={`rounded-xl shadow-lg ${theme === 'dark' ? 'bg-[#2a246f]' : 'bg-white'}`}>
          <TabsList className="flex gap-2 p-4 border-b border-slate-200 dark:border-slate-700">
            <TabsTrigger value="atas" className={`px-4 py-2 text-base font-medium rounded-lg transition-colors ${theme === 'dark' ? 'text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white' : 'text-gray-600 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900'} data-[state=active]:shadow`}><FileText className="inline mr-2" size={20} />Atas de Reuniões</TabsTrigger>
            <TabsTrigger value="agenda" className={`px-4 py-2 text-base font-medium rounded-lg transition-colors ${theme === 'dark' ? 'text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white' : 'text-gray-600 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900'} data-[state=active]:shadow`}><Calendar className="inline mr-2" size={20} />Agenda</TabsTrigger>
          </TabsList>

          <TabsContent value="atas" className="p-6">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{editingAtaId ? "Editar Ata" : "Nova Ata de Reunião"}</h2>
              {/* Formulário de Ata */}
              <input type="text" placeholder="Título da Ata" value={novaAta.titulo} onChange={(e) => setNovaAta({ ...novaAta, titulo: e.target.value })} className={`w-full p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#00d971]`} />
              <textarea placeholder="Resumo da Ata" value={novaAta.resumo} onChange={(e) => setNovaAta({ ...novaAta, resumo: e.target.value })} rows="4" className={`w-full p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#00d971]`} />
              <input type="text" placeholder="Participantes Presentes (separados por vírgula)" value={novaAta.participantesPresentes} onChange={(e) => setNovaAta({ ...novaAta, participantesPresentes: e.target.value })} className={`w-full p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#00d971]`} />
              <textarea placeholder="Deliberações e Pontos Chave" value={novaAta.deliberacoes} onChange={(e) => setNovaAta({ ...novaAta, deliberacoes: e.target.value })} rows="3" className={`w-full p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#00d971]`} />

              {/* Seção Financeira */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6 space-y-4">
                  <h3 className="text-xl font-bold flex items-center gap-2"><DollarSign size={20} /> Detalhes Financeiros</h3>
                  <select value={novaAta.categoriaFinanceira} onChange={(e) => setNovaAta({ ...novaAta, categoriaFinanceira: e.target.value })} className={`w-full p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#00d971]`}>
                      <option value="">Selecione a Categoria Financeira</option>
                      {financialCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                  <input type="text" placeholder="Tipo de Decisão Financeira" value={novaAta.tipoDecisaoFinanceira} onChange={(e) => setNovaAta({ ...novaAta, tipoDecisaoFinanceira: e.target.value })} className={`w-full p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#00d971]`} />
                  <input type="number" placeholder="Valor Envolvido (R$)" value={novaAta.valorEnvolvido} onChange={(e) => setNovaAta({ ...novaAta, valorEnvolvido: e.target.value })} className={`w-full p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#00d971]`} />
                  <textarea placeholder="Impacto Esperado" value={novaAta.impactoEsperado} onChange={(e) => setNovaAta({ ...novaAta, impactoEsperado: e.target.value })} rows="2" className={`w-full p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#00d971]`} />
              </div>

              {/* Action Items */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6 space-y-4">
                <h3 className="text-xl font-bold flex items-center gap-2"><AlertCircle size={20} /> Itens de Ação</h3>
                {novaAta.actionItems && novaAta.actionItems.length > 0 && (
                  <div className="space-y-2 mb-4">
                    {novaAta.actionItems.map(item => (
                      <div key={item.id} className={`p-3 rounded-md flex justify-between items-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                        <div>
                          <p className="font-semibold">{item.description}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Responsável: {item.responsible} | Prazo: {item.deadline} | <span className={clsx("px-2 py-0.5 rounded text-xs", statusStyles[item.status])}>{item.status}</span></p>
                        </div>
                        <button onClick={() => removeActionItemFromAta(item.id)} className="text-red-500 hover:text-red-700"><Trash2 size={18} /></button>
                      </div>
                    ))}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <input type="text" placeholder="Descrição do Item" value={newActionItem.description} onChange={(e) => setNewActionItem({ ...newActionItem, description: e.target.value })} className={`md:col-span-2 p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'}`} />
                  <input type="text" placeholder="Responsável" value={newActionItem.responsible} onChange={(e) => setNewActionItem({ ...newActionItem, responsible: e.target.value })} className={`p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'}`} />
                  <input type="date" value={newActionItem.deadline} onChange={(e) => setNewActionItem({ ...newActionItem, deadline: e.target.value })} className={`p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'}`} />
                </div>
                <button onClick={addActionItemToAta} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded hover:bg-blue-700"><PlusCircle size={18} /> Adicionar Item</button>
              </div>

              <div className="flex gap-2 justify-end mt-4">
                <button onClick={handleSaveAta} className="flex items-center gap-2 bg-[#00d971] hover:brightness-90 text-black font-semibold px-5 py-2.5 rounded-lg shadow-md"><Save size={20} /> {editingAtaId ? "Salvar Edição" : "Salvar Ata"}</button>
                {editingAtaId && (<button onClick={() => { setEditingAtaId(null); setNovaAta({ titulo: "", resumo: "", participantesPresentes: "", deliberacoes: "", categoriaFinanceira: "", tipoDecisaoFinanceira: "", valorEnvolvido: "", impactoEsperado: "", actionItems: [] }); }} className="flex items-center gap-2 bg-gray-400 hover:bg-gray-500 text-white font-semibold px-5 py-2.5 rounded-lg shadow-md"><XCircle size={20} /> Cancelar</button>)}
              </div>

              {/* Lista de Atas */}
              {filteredAtas.length === 0 ? (
                <div className={`p-10 rounded-xl text-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} shadow-inner mt-8`}><FileText size={64} className="mx-auto mb-4 text-gray-400" /><h3 className="text-xl font-semibold">Nenhuma Ata encontrada.</h3></div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
                  <AnimatePresence>
                    {filteredAtas.map((ata) => (
                      <motion.div key={ata.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={`p-5 border rounded-lg ${theme === 'dark' ? 'border-[#3e388b] bg-gray-800' : 'border-gray-200 bg-white'} shadow-sm flex flex-col`}>
                        <h3 className="font-bold text-xl mb-2">{ata.titulo}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Data: {new Date(ata.data_criacao).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}</p>
                        <p className="text-sm flex-grow mb-3">{ata.resumo}</p>
                        {ata.categoria_financeira && (<p className="text-sm font-medium flex items-center gap-1 mb-1"><Tag size={16} /> Categoria: {ata.categoria_financeira}</p>)}
                        {ata.valor_envolvido > 0 && (<p className="text-sm font-medium flex items-center gap-1 mb-1"><DollarSign size={16} /> Valor: R$ {parseFloat(ata.valor_envolvido).toFixed(2)}</p>)}
                        {ata.action_items && ata.action_items.length > 0 && (
                          <div className="mt-2 text-sm"><h4 className="font-semibold mb-1">Itens de Ação:</h4><ul className="list-disc list-inside text-gray-600 dark:text-gray-300">{ata.action_items.map(item => (<li key={item.id}>{item.description} <span className={clsx("px-2 py-0.5 rounded text-xs", statusStyles[item.status])}>{item.status}</span></li>))}</ul></div>
                        )}
                        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <button onClick={() => iniciarEdicaoAta(ata)} className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-sm"><Edit size={16} /> Editar</button>
                          <button onClick={() => handleDeleteAta(ata.id)} className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm"><Trash2 size={16} /> Excluir</button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="agenda" className="p-6">
            <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">{editingEventoId ? "Editar Compromisso" : "Novo Compromisso"}</h2>
              {/* Formulário de Agenda */}
              <input type="text" placeholder="Título do Compromisso" value={novoEvento.titulo} onChange={(e) => setNovoEvento({ ...novoEvento, titulo: e.target.value })} className={`w-full p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#00d971]`} />
              <input type="datetime-local" value={novoEvento.data} onChange={(e) => setNovoEvento({ ...novoEvento, data: e.target.value })} className={`w-full p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#00d971]`} />
              <input type="text" placeholder="Local" value={novoEvento.local} onChange={(e) => setNovoEvento({ ...novoEvento, local: e.target.value })} className={`w-full p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#00d971]`} />
              <input type="text" placeholder="Participantes (separados por vírgula)" value={novoEvento.participantes} onChange={(e) => setNovoEvento({ ...novoEvento, participantes: e.target.value })} className={`w-full p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#00d971]`} />
              <input type="url" placeholder="Link da Reunião" value={novoEvento.linkReuniao} onChange={(e) => setNovoEvento({ ...novoEvento, linkReuniao: e.target.value })} className={`w-full p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#00d971]`} />
              <textarea placeholder="Descrição Detalhada / Pauta" value={novoEvento.descricaoDetalhada} onChange={(e) => setNovoEvento({ ...novoEvento, descricaoDetalhada: e.target.value })} rows="3" className={`w-full p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#00d971]`} />

              <div className="flex gap-2 justify-end mt-4">
                <button onClick={handleSaveEvento} className="flex items-center gap-2 bg-[#201b5d] hover:bg-[#3e388b] text-white font-semibold px-5 py-2.5 rounded-lg shadow-md"><Save size={20} /> {editingEventoId ? "Salvar Edição" : "Adicionar"}</button>
                {editingEventoId && (<button onClick={() => { setEditingEventoId(null); setNovoEvento({ titulo: "", data: "", local: "", participantes: "", linkReuniao: "", descricaoDetalhada: "", status: "Marcado" }); }} className="flex items-center gap-2 bg-gray-400 hover:bg-gray-500 text-white font-semibold px-5 py-2.5 rounded-lg shadow-md"><XCircle size={20} /> Cancelar</button>)}
              </div>

              {/* Lista de Compromissos */}
              <CalendarioSemanal compromissos={filteredAgenda} />
              
              {filteredAgenda.length === 0 ? (
                <div className={`p-10 rounded-xl text-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} shadow-inner mt-8`}><Calendar size={64} className="mx-auto mb-4 text-gray-400" /><h3 className="text-xl font-semibold">Nenhum Compromisso agendado.</h3></div>
              ) : (
                <div className="space-y-4 pt-6">
                  <AnimatePresence>
                    {filteredAgenda.map((item) => (
                      <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className={`p-5 border rounded-lg ${theme === 'dark' ? 'border-[#3e388b] bg-gray-800' : 'border-gray-200 bg-white'} shadow-sm flex flex-col`}>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-xl">{item.titulo}</h3>
                          <div className="flex gap-1">
                            {["Marcado", "Realizado", "Cancelado"].map((status) => (<button key={status} onClick={() => atualizarStatusEvento(item.id, status)} className={clsx("px-3 py-1 text-xs rounded-full font-semibold", item.status === status ? statusStyles[status] : "bg-gray-300 dark:bg-gray-600 hover:opacity-80")}>{status}</button>))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1"><Calendar size={14} className="inline mr-1" />{new Date(item.data).toLocaleString('pt-BR', { timeZone: 'UTC' })}</p>
                        {item.local && <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Local: {item.local}</p>}
                        {item.participantes && Array.isArray(item.participantes) && <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">Participantes: {item.participantes.join(', ')}</p>}
                        {item.link_reuniao && <p className="text-sm text-blue-500 hover:underline mb-1"><a href={item.link_reuniao} target="_blank" rel="noopener noreferrer">Link da Reunião</a></p>}
                        {item.descricao_detalhada && <p className="text-sm flex-grow mt-2">{item.descricao_detalhada}</p>}
                        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <button onClick={() => iniciarEdicaoEvento(item)} className="text-blue-500 hover:text-blue-700 flex items-center gap-1 text-sm"><Edit size={16} /> Editar</button>
                          <button onClick={() => handleDeleteEvento(item.id)} className="text-red-500 hover:text-red-700 flex items-center gap-1 text-sm"><Trash2 size={16} /> Excluir</button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
