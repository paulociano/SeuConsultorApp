import React, { useState, useContext, useMemo, useEffect } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@radix-ui/react-tabs";
import { motion, AnimatePresence } from "framer-motion";
import { Calendar, FileText, PlusCircle, Search, Trash2, Edit, Save, XCircle, AlertCircle, Tag, DollarSign } from "lucide-react";
import clsx from "clsx";
import { ThemeContext } from "../../ThemeContext"; // Assume ThemeContext is available

// Componente Toast básico para feedback visual (assumindo que já existe ou será incluído)
const Toast = ({ message, type, onClose }) => {
  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-gray-700';
  return (
    <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white ${bgColor} flex items-center justify-between z-50`}>
      <span>{message}</span>
      <button onClick={onClose} className="ml-4 font-bold">&times;</button>
    </div>
  );
};

export default function TelaReunioesAgenda() {
  const { theme } = useContext(ThemeContext);

  const [atas, setAtas] = useState([]);
  const [agenda, setAgenda] = useState([]);

  // Estados para formulário de nova ata
  const [novaAta, setNovaAta] = useState({
    titulo: "",
    resumo: "",
    participantesPresentes: "",
    deliberacoes: "",
    categoriaFinanceira: "",
    tipoDecisaoFinanceira: "",
    valorEnvolvido: "",
    impactoEsperado: "",
    actionItems: [], // Array de objetos para action items
  });

  // Estado temporário para adicionar um action item na ata
  const [newActionItem, setNewActionItem] = useState({ description: "", responsible: "", deadline: "", status: "Pendente" });

  // Estados para formulário de novo evento de agenda
  const [novoEvento, setNovoEvento] = useState({
    titulo: "",
    data: "",
    local: "",
    participantes: "",
    linkReuniao: "",
    descricaoDetalhada: "",
    status: "Marcado",
  });

  // Estados para edição
  const [editingAtaId, setEditingAtaId] = useState(null);
  const [editingEventoId, setEditingEventoId] = useState(null);

  // Estados para busca e filtros
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // 'all', 'Marcado', 'Realizado', 'Cancelado'
  const [filterDate, setFilterDate] = useState(""); // YYYY-MM-DD

  // Estados para Toast
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  // Efeito para esconder o toast automaticamente
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false);
        setToastMessage("");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showToast]);

  // Função para exibir o toast
  const displayToast = (message, type = "success") => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
  };

  // Funções de manipulação de Atas
  const adicionarAta = () => {
    if (!novaAta.titulo || !novaAta.resumo) {
      displayToast("Título e Resumo são obrigatórios para a Ata.", "error");
      return;
    }
    const ataToSave = { ...novaAta, id: Date.now(), data: new Date().toLocaleDateString() };
    if (editingAtaId) {
      setAtas((prev) => prev.map((ata) => (ata.id === editingAtaId ? ataToSave : ata)));
      displayToast("Ata atualizada com sucesso!", "success");
      setEditingAtaId(null);
    } else {
      setAtas((prev) => [...prev, ataToSave]);
      displayToast("Ata salva com sucesso!", "success");
    }
    setNovaAta({
      titulo: "",
      resumo: "",
      participantesPresentes: "",
      deliberacoes: "",
      categoriaFinanceira: "",
      tipoDecisaoFinanceira: "",
      valorEnvolvido: "",
      impactoEsperado: "",
      actionItems: [],
    });
    setNewActionItem({ description: "", responsible: "", deadline: "", status: "Pendente" }); // Reset action item form
  };

  const iniciarEdicaoAta = (ata) => {
    setNovaAta(ata); // Preenche o formulário com os dados da ata a ser editada
    setEditingAtaId(ata.id);
  };

  const deletarAta = (id) => {
    if (window.confirm("Tem certeza que deseja excluir esta Ata?")) {
      setAtas((prev) => prev.filter((ata) => ata.id !== id));
      displayToast("Ata excluída.", "error");
    }
  };

  // Funções de manipulação de Action Items dentro da Ata
  const addActionItemToAta = () => {
    if (!newActionItem.description) {
      displayToast("Descrição do item de ação é obrigatória.", "error");
      return;
    }
    setNovaAta(prev => ({
      ...prev,
      actionItems: [...prev.actionItems, { ...newActionItem, id: Date.now() }]
    }));
    setNewActionItem({ description: "", responsible: "", deadline: "", status: "Pendente" });
  };

  const removeActionItemFromAta = (idToRemove) => {
    setNovaAta(prev => ({
      ...prev,
      actionItems: prev.actionItems.filter(item => item.id !== idToRemove)
    }));
  };

  // Funções de manipulação de Eventos da Agenda
  const adicionarEvento = () => {
    if (!novoEvento.titulo || !novoEvento.data) {
      displayToast("Título e Data são obrigatórios para o Compromisso.", "error");
      return;
    }
    const eventoToSave = { ...novoEvento, id: Date.now() };
    if (editingEventoId) {
      setAgenda((prev) => prev.map((item) => (item.id === editingEventoId ? eventoToSave : item)));
      displayToast("Compromisso atualizado com sucesso!", "success");
      setEditingEventoId(null);
    } else {
      setAgenda((prev) => [...prev, eventoToSave]);
      displayToast("Compromisso adicionado!", "success");
    }
    setNovoEvento({
      titulo: "",
      data: "",
      local: "",
      participantes: "",
      linkReuniao: "",
      descricaoDetalhada: "",
      status: "Marcado",
    });
  };

  const iniciarEdicaoEvento = (evento) => {
    setNovoEvento(evento); // Preenche o formulário com os dados do evento a ser editado
    setEditingEventoId(evento.id);
  };

  const deletarEvento = (id) => {
    if (window.confirm("Tem certeza que deseja excluir este Compromisso?")) {
      setAgenda((prev) => prev.filter((item) => item.id !== id));
      displayToast("Compromisso excluído.", "error");
    }
  };

  const atualizarStatusEvento = (id, newStatus) => {
    setAgenda((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
    );
    displayToast(`Status do compromisso atualizado para ${newStatus}!`, "success");
  };

  // Estilos para os status
  const statusStyles = {
    Marcado: "bg-[#00d971] text-black", // Verde vibrante
    Realizado: "bg-[#201b5d] text-white", // Azul escuro
    Cancelado: "bg-red-500 text-white", // Vermelho
    Pendente: "bg-yellow-500 text-black", // Amarelo para action items
    "Em Progresso": "bg-blue-500 text-white", // Azul para action items
    Concluído: "bg-green-600 text-white", // Verde escuro para action items
  };

  // Filtro e Busca para Atas
  const filteredAtas = useMemo(() => {
    let currentAtas = [...atas];
    if (searchTerm) {
      currentAtas = currentAtas.filter(
        (ata) =>
          ata.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ata.resumo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (ata.participantesPresentes && ata.participantesPresentes.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    // Adicionar filtragem por categoria financeira se houver
    if (filterStatus && filterStatus !== "all" && filterStatus !== "Marcado" && filterStatus !== "Realizado" && filterStatus !== "Cancelado") { // Reuse filterStatus for category
        currentAtas = currentAtas.filter(ata => ata.categoriaFinanceira === filterStatus);
    }
    return currentAtas;
  }, [atas, searchTerm, filterStatus]);

  // Filtro e Busca para Agenda
  const filteredAgenda = useMemo(() => {
    let currentAgenda = [...agenda];
    if (searchTerm) {
      currentAgenda = currentAgenda.filter(
        (evento) =>
          evento.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (evento.local && evento.local.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (evento.participantes && evento.participantes.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (evento.descricaoDetalhada && evento.descricaoDetalhada.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    if (filterStatus !== "all") {
      currentAgenda = currentAgenda.filter((evento) => evento.status === filterStatus);
    }
    if (filterDate) {
      currentAgenda = currentAgenda.filter(
        (evento) => new Date(evento.data).toISOString().split('T')[0] === filterDate
      );
    }
    return currentAgenda.sort((a, b) => new Date(a.data) - new Date(b.data)); // Sempre ordenar por data
  }, [agenda, searchTerm, filterStatus, filterDate]);

  const financialCategories = [
    "Orçamento", "Investimentos", "Auditoria", "Planejamento Tributário",
    "Revisão de Dívidas", "Relatórios Financeiros", "Outros"
  ];

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} p-6 transition-colors duration-300`}>
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Barra de Busca e Filtros Globais */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por título, resumo, participantes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#00d971]`}
            />
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#00d971]`}
          >
            <option value="all">Todos os Status/Categorias</option>
            <optgroup label="Status do Compromisso">
              <option value="Marcado">Marcado</option>
              <option value="Realizado">Realizado</option>
              <option value="Cancelado">Cancelado</option>
            </optgroup>
            <optgroup label="Categorias Financeiras (Atas)">
                {financialCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                ))}
            </optgroup>
          </select>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => setFilterDate(e.target.value)}
            className={`px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#00d971]`}
          />
        </div>

        <Tabs defaultValue="atas" className={`rounded-xl shadow-lg ${theme === 'dark' ? 'bg-[#2a246f]' : 'bg-white'}`}>
          <TabsList className="flex gap-2 mb-6 p-4 border-b pb-2 border-slate-200 dark:border-slate-700">
            <TabsTrigger
              value="atas"
              className={`px-4 py-2 text-base font-medium rounded-lg transition-colors ${theme === 'dark' ? 'text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white' : 'text-gray-600 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900'} data-[state=active]:shadow`}
            >
              <FileText className="inline mr-2" size={20} />
              Atas de Reuniões
            </TabsTrigger>
            <TabsTrigger
              value="agenda"
              className={`px-4 py-2 text-base font-medium rounded-lg transition-colors ${theme === 'dark' ? 'text-gray-300 data-[state=active]:bg-gray-700 data-[state=active]:text-white' : 'text-gray-600 data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900'} data-[state=active]:shadow`}
            >
              <Calendar className="inline mr-2" size={20} />
              Agenda de Compromissos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="atas" className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                {editingAtaId ? "Editar Ata" : "Nova Ata de Reunião"}
              </h2>
              <input
                type="text"
                placeholder="Título da Ata"
                value={novaAta.titulo}
                onChange={(e) => setNovaAta({ ...novaAta, titulo: e.target.value })}
                className={`w-full p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#00d971]`}
              />
              <textarea
                placeholder="Resumo da Ata (com detalhes importantes e decisões)"
                value={novaAta.resumo}
                onChange={(e) => setNovaAta({ ...novaAta, resumo: e.target.value })}
                rows="4"
                className={`w-full p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#00d971]`}
              />
              <input
                type="text"
                placeholder="Participantes Presentes (nomes separados por vírgula)"
                value={novaAta.participantesPresentes}
                onChange={(e) => setNovaAta({ ...novaAta, participantesPresentes: e.target.value })}
                className={`w-full p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#00d971]`}
              />
              <textarea
                placeholder="Deliberações e Pontos Chave da Reunião"
                value={novaAta.deliberacoes}
                onChange={(e) => setNovaAta({ ...novaAta, deliberacoes: e.target.value })}
                rows="3"
                className={`w-full p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#00d971]`}
              />

              {/* Seção de Campos Financeiros para Ata */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6 space-y-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <DollarSign size={20} /> Detalhes Financeiros da Ata
                </h3>
                <select
                    value={novaAta.categoriaFinanceira}
                    onChange={(e) => setNovaAta({ ...novaAta, categoriaFinanceira: e.target.value })}
                    className={`w-full p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#00d971]`}
                >
                    <option value="">Selecione a Categoria Financeira</option>
                    {financialCategories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                    ))}
                </select>
                <input
                    type="text"
                    placeholder="Tipo de Decisão Financeira (ex: Aprovação de Gasto)"
                    value={novaAta.tipoDecisaoFinanceira}
                    onChange={(e) => setNovaAta({ ...novaAta, tipoDecisaoFinanceira: e.target.value })}
                    className={`w-full p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#00d971]`}
                />
                <input
                    type="number"
                    step="0.01"
                    placeholder="Valor Envolvido (R$)"
                    value={novaAta.valorEnvolvido}
                    onChange={(e) => setNovaAta({ ...novaAta, valorEnvolvido: parseFloat(e.target.value) || '' })}
                    className={`w-full p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#00d971]`}
                />
                <textarea
                    placeholder="Impacto Esperado da Decisão Financeira"
                    value={novaAta.impactoEsperado}
                    onChange={(e) => setNovaAta({ ...novaAta, impactoEsperado: e.target.value })}
                    rows="2"
                    className={`w-full p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#00d971]`}
                />
            </div>


              {/* Seção de Action Items */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6 space-y-4">
                <h3 className="text-xl font-bold text-gray-800 dark:text-white flex items-center gap-2">
                    <AlertCircle size={20} /> Itens de Ação
                </h3>
                {novaAta.actionItems.length > 0 && (
                    <div className="space-y-2 mb-4">
                        {novaAta.actionItems.map(item => (
                            <div key={item.id} className={`p-3 rounded-md flex justify-between items-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                <div>
                                    <p className="font-semibold">{item.description}</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-400">Responsável: {item.responsible} | Prazo: {item.deadline} | Status: <span className={clsx("px-2 py-0.5 rounded text-xs", statusStyles[item.status])}>{item.status}</span></p>
                                </div>
                                <button onClick={() => removeActionItemFromAta(item.id)} className="text-red-500 hover:text-red-700 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                        type="text"
                        placeholder="Descrição do Item de Ação"
                        value={newActionItem.description}
                        onChange={(e) => setNewActionItem({ ...newActionItem, description: e.target.value })}
                        className={`md:col-span-2 p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'}`}
                    />
                    <input
                        type="text"
                        placeholder="Responsável"
                        value={newActionItem.responsible}
                        onChange={(e) => setNewActionItem({ ...newActionItem, responsible: e.target.value })}
                        className={`p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'}`}
                    />
                    <input
                        type="date"
                        value={newActionItem.deadline}
                        onChange={(e) => setNewActionItem({ ...newActionItem, deadline: e.target.value })}
                        className={`p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'}`}
                    />
                     <select
                        value={newActionItem.status}
                        onChange={(e) => setNewActionItem({ ...newActionItem, status: e.target.value })}
                        className={`p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'}`}
                    >
                        <option value="Pendente">Pendente</option>
                        <option value="Em Progresso">Em Progresso</option>
                        <option value="Concluído">Concluído</option>
                    </select>
                </div>
                <button
                    onClick={addActionItemToAta}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                    <PlusCircle size={18} /> Adicionar Item de Ação
                </button>
              </div>

              <div className="flex gap-2 justify-end mt-4">
                <button
                  onClick={adicionarAta}
                  className="flex items-center gap-2 bg-[#00d971] hover:brightness-90 text-black font-semibold px-5 py-2.5 rounded-lg transition-transform hover:scale-105 shadow-md"
                >
                  <Save size={20} /> {editingAtaId ? "Salvar Edição" : "Salvar Ata"}
                </button>
                {editingAtaId && (
                  <button
                    onClick={() => {
                      setEditingAtaId(null);
                      setNovaAta({
                        titulo: "",
                        resumo: "",
                        participantesPresentes: "",
                        deliberacoes: "",
                        categoriaFinanceira: "",
                        tipoDecisaoFinanceira: "",
                        valorEnvolvido: "",
                        impactoEsperado: "",
                        actionItems: [],
                      });
                      setNewActionItem({ description: "", responsible: "", deadline: "", status: "Pendente" });
                    }}
                    className="flex items-center gap-2 bg-gray-400 hover:bg-gray-500 text-white font-semibold px-5 py-2.5 rounded-lg transition-transform hover:scale-105 shadow-md"
                  >
                    <XCircle size={20} /> Cancelar
                  </button>
                )}
              </div>

              {/* Lista de Atas */}
              {filteredAtas.length === 0 ? (
                <div className={`p-10 rounded-xl text-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} shadow-inner mt-8`}>
                  <FileText size={64} className="mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2">Nenhuma Ata de Reunião encontrada.</h3>
                  <p className="text-gray-500 dark:text-gray-400">Adicione uma nova ata para começar a organizar suas reuniões.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
                  <AnimatePresence>
                    {filteredAtas.map((ata) => (
                      <motion.div
                        key={ata.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className={`p-5 border rounded-lg ${theme === 'dark' ? 'border-[#3e388b] bg-gray-800' : 'border-gray-200 bg-white'} shadow-sm flex flex-col`}
                      >
                        <h3 className="font-bold text-xl text-gray-900 dark:text-white mb-2">{ata.titulo}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Data: {ata.data}</p>
                        <p className="text-gray-700 dark:text-gray-200 text-sm flex-grow mb-3">{ata.resumo}</p>

                        {ata.categoriaFinanceira && (
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1 mb-1">
                                <Tag size={16} /> Categoria: {ata.categoriaFinanceira}
                            </p>
                        )}
                        {ata.valorEnvolvido > 0 && (
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-1 mb-1">
                                <DollarSign size={16} /> Valor: R$ {parseFloat(ata.valorEnvolvido).toFixed(2)}
                            </p>
                        )}
                        {ata.actionItems && ata.actionItems.length > 0 && (
                            <div className="mt-2 text-sm">
                                <h4 className="font-semibold text-gray-800 dark:text-gray-100 mb-1">Itens de Ação:</h4>
                                <ul className="list-disc list-inside text-gray-600 dark:text-gray-300">
                                    {ata.actionItems.map(item => (
                                        <li key={item.id}>
                                            {item.description} (Resp: {item.responsible || 'N/A'}, Prazo: {item.deadline || 'N/A'}) <span className={clsx("px-2 py-0.5 rounded text-xs", statusStyles[item.status])}>{item.status}</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => iniciarEdicaoAta(ata)}
                            className="text-blue-500 hover:text-blue-700 transition-colors flex items-center gap-1 text-sm"
                          >
                            <Edit size={16} /> Editar
                          </button>
                          <button
                            onClick={() => deletarAta(ata.id)}
                            className="text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 text-sm"
                          >
                            <Trash2 size={16} /> Excluir
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="agenda" className="p-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-4">
                {editingEventoId ? "Editar Compromisso" : "Novo Compromisso"}
              </h2>
              <input
                type="text"
                placeholder="Título do Compromisso"
                value={novoEvento.titulo}
                onChange={(e) => setNovoEvento({ ...novoEvento, titulo: e.target.value })}
                className={`w-full p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#00d971]`}
              />
              <input
                type="datetime-local"
                value={novoEvento.data}
                onChange={(e) => setNovoEvento({ ...novoEvento, data: e.target.value })}
                className={`w-full p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#00d971]`}
              />
              <input
                type="text"
                placeholder="Local (Ex: Sala 101, Online via Zoom)"
                value={novoEvento.local}
                onChange={(e) => setNovoEvento({ ...novoEvento, local: e.target.value })}
                className={`w-full p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#00d971]`}
              />
              <input
                type="text"
                placeholder="Participantes (nomes separados por vírgula)"
                value={novoEvento.participantes}
                onChange={(e) => setNovoEvento({ ...novoEvento, participantes: e.target.value })}
                className={`w-full p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#00d971]`}
              />
              <input
                type="url"
                placeholder="Link da Reunião (para reuniões online)"
                value={novoEvento.linkReuniao}
                onChange={(e) => setNovoEvento({ ...novoEvento, linkReuniao: e.target.value })}
                className={`w-full p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#00d971]`}
              />
              <textarea
                placeholder="Descrição Detalhada / Pauta da Reunião"
                value={novoEvento.descricaoDetalhada}
                onChange={(e) => setNovoEvento({ ...novoEvento, descricaoDetalhada: e.target.value })}
                rows="3"
                className={`w-full p-3 rounded-md border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-gray-100 text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#00d971]`}
              />

              <div className="flex gap-2 justify-end mt-4">
                <button
                  onClick={adicionarEvento}
                  className="flex items-center gap-2 bg-[#201b5d] hover:bg-[#3e388b] text-white font-semibold px-5 py-2.5 rounded-lg transition-transform hover:scale-105 shadow-md"
                >
                  <Save size={20} /> {editingEventoId ? "Salvar Edição" : "Adicionar Compromisso"}
                </button>
                {editingEventoId && (
                  <button
                    onClick={() => {
                      setEditingEventoId(null);
                      setNovoEvento({
                        titulo: "",
                        data: "",
                        local: "",
                        participantes: "",
                        linkReuniao: "",
                        descricaoDetalhada: "",
                        status: "Marcado",
                      });
                    }}
                    className="flex items-center gap-2 bg-gray-400 hover:bg-gray-500 text-white font-semibold px-5 py-2.5 rounded-lg transition-transform hover:scale-105 shadow-md"
                  >
                    <XCircle size={20} /> Cancelar
                  </button>
                )}
              </div>

              {/* Lista de Compromissos */}
              {filteredAgenda.length === 0 ? (
                <div className={`p-10 rounded-xl text-center ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'} shadow-inner mt-8`}>
                  <Calendar size={64} className="mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2">Nenhum Compromisso agendado.</h3>
                  <p className="text-gray-500 dark:text-gray-400">Adicione seu primeiro compromisso e organize sua agenda.</p>
                </div>
              ) : (
                <div className="space-y-4 pt-6">
                  <AnimatePresence>
                    {filteredAgenda.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        transition={{ duration: 0.2 }}
                        className={`p-5 border rounded-lg ${theme === 'dark' ? 'border-[#3e388b] bg-gray-800' : 'border-gray-200 bg-white'} shadow-sm flex flex-col`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-xl text-gray-900 dark:text-white">{item.titulo}</h3>
                          <div className="flex gap-1">
                            {["Marcado", "Realizado", "Cancelado"].map((status) => (
                              <button
                                key={status}
                                onClick={() => atualizarStatusEvento(item.id, status)}
                                className={clsx(
                                  "px-3 py-1 text-xs rounded-full font-semibold transition-colors",
                                  item.status === status
                                    ? statusStyles[status]
                                    : "bg-gray-300 dark:bg-gray-600 text-black dark:text-white hover:opacity-80"
                                )}
                              >
                                {status}
                              </button>
                            ))}
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                          <Calendar size={14} className="inline mr-1" />
                          {new Date(item.data).toLocaleString()}
                        </p>
                        {item.local && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                            Local: {item.local}
                          </p>
                        )}
                        {item.participantes && (
                          <p className="text-sm text-gray-600 dark:text-gray-300 mb-1">
                            Participantes: {item.participantes}
                          </p>
                        )}
                        {item.linkReuniao && (
                          <p className="text-sm text-blue-500 hover:underline mb-1">
                            <a href={item.linkReuniao} target="_blank" rel="noopener noreferrer">
                              Link da Reunião
                            </a>
                          </p>
                        )}
                        {item.descricaoDetalhada && (
                          <p className="text-gray-700 dark:text-gray-200 text-sm flex-grow mt-2">
                            {item.descricaoDetalhada}
                          </p>
                        )}
                        <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => iniciarEdicaoEvento(item)}
                            className="text-blue-500 hover:text-blue-700 transition-colors flex items-center gap-1 text-sm"
                          >
                            <Edit size={16} /> Editar
                          </button>
                          <button
                            onClick={() => deletarEvento(item.id)}
                            className="text-red-500 hover:text-red-700 transition-colors flex items-center gap-1 text-sm"
                          >
                            <Trash2 size={16} /> Excluir
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                  {/* Calendário Semanal Visual */}
              <CalendarioSemanal compromissos={filteredAgenda} />
                </div>
              )}
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
      {showToast && <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />}
    </div>
  );
}

// Novo componente: Calendário semanal visual
function CalendarioSemanal({ compromissos }) {
  const diasSemana = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];
  const horas = Array.from({ length: 12 }, (_, i) => 8 + i);

  const compromissosPorDia = {};
  diasSemana.forEach(dia => compromissosPorDia[dia] = []);

  compromissos.forEach(evento => {
    const data = new Date(evento.data);
    const dia = data.toLocaleDateString('pt-BR', { weekday: 'short' }).replace('.', '');
    const hora = data.getHours();

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
    <div className="overflow-auto border rounded-lg shadow mt-10">
      <div className="grid grid-cols-8 min-w-[1000px]">
        <div className="bg-gray-100 dark:bg-gray-800 p-2 font-bold border-r">Horário</div>
        {diasSemana.map(dia => (
          <div key={dia} className="bg-gray-100 dark:bg-gray-800 p-2 text-center font-bold border-r">
            {dia}
          </div>
        ))}
      </div>
      {horas.map(hora => (
        <div key={hora} className="grid grid-cols-8 border-t min-h-[60px]">
          <div className="border-r bg-gray-50 dark:bg-gray-900 p-2 text-sm text-right pr-3">{hora}:00</div>
          {diasSemana.map(dia => (
            <div key={dia + hora} className="border-r relative">
              {compromissosPorDia[dia].filter(ev => ev.hora === hora).map(ev => (
                <div
                  key={ev.id}
                  className={`absolute top-1 left-1 right-1 text-xs p-1 rounded shadow 
                    ${ev.status === 'Marcado' ? 'bg-[#201b5d] text-white' : 
                      ev.status === 'Realizado' ? 'bg-green-600 text-white' : 
                      ev.status === 'Cancelado' ? 'bg-red-500 text-white' : 
                      'bg-gray-300 text-black'}`}
                  title={ev.descricaoDetalhada || ev.titulo}
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
