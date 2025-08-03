// src/pages/TelaReunioesAgenda.js

import React, { useState, useContext, useMemo, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FileText, Calendar, Plus, Search } from 'lucide-react';
import clsx from 'clsx';
import { toast } from 'sonner';
import { ThemeContext } from '../../ThemeContext';
import { useAgendaStore } from '../../stores/useAgendaStore';
import LoaderLogo from '../../components/Loader/loaderlogo';

import { DashboardWidgets } from '../../components/Agenda/DashboardWidgets';
import { AtaCard } from '../../components/Agenda/AtaCard';
import { CompromissoCard } from '../../components/Agenda/CompromissoCard';
import { FormModal } from '../../components/Agenda/FormModal';

export default function TelaReunioesAgenda() {
  const { theme } = useContext(ThemeContext);
  const {
    atas,
    agenda,
    isLoading,
    fetchAgenda,
    saveAta,
    saveCompromisso,
    deleteAta,
    deleteCompromisso,
  } = useAgendaStore();

  useEffect(() => {
    fetchAgenda();
  }, [fetchAgenda]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({
    type: null,
    data: null,
    title: '',
    initialData: null,
  });
  const [view, setView] = useState('atas');
  const [searchTerm, setSearchTerm] = useState('');

  const openModal = (type, data = null, initialData = null) => {
    setModalContent({
      type,
      data,
      title: `${data ? 'Editar' : 'Novo'} ${type === 'ata' ? 'Ata de Reunião' : 'Compromisso'}`,
      initialData,
    });
    setIsModalOpen(true);
  };

  const handleConvertToAta = (compromisso) => {
    const initialAtaData = {
      titulo: `Ata da Reunião: ${compromisso.titulo}`,
      resumo: `Resumo da reunião realizada em ${new Date(compromisso.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}.`,
      participantesPresentes: Array.isArray(compromisso.participantes)
        ? compromisso.participantes.join(', ')
        : compromisso.participantes || '',
      deliberacoes: '',
      categoriaFinanceira: '',
      tipoDecisaoFinanceira: '',
      valorEnvolvido: '',
      impactoEsperado: '',
      actionItems: [],
    };
    openModal('ata', null, initialAtaData);
  };

  const handleSave = async (type, data) => {
    let savedItem = null;
    if (type === 'ata') {
      // ** VALIDAÇÃO FRONTAL PARA ATAS **
      if (!data.titulo || data.titulo.trim() === '') {
        toast.error("O 'Título' da ata é obrigatório.");
        return;
      }
      if (!data.resumo || data.resumo.trim() === '') {
        toast.error("O 'Resumo' da ata é obrigatório.");
        return;
      }

      const valorFloat = parseFloat(data.valorEnvolvido);
      const ataToSave = {
        id: data.id,
        titulo: data.titulo,
        resumo: data.resumo,
        participantesPresentes:
          typeof data.participantesPresentes === 'string'
            ? data.participantesPresentes
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            : data.participantesPresentes || [],
        deliberacoes: data.deliberacoes || '',
        categoriaFinanceira: data.categoriaFinanceira || '',
        tipoDecisaoFinanceira: data.tipoDecisaoFinanceira || '',
        valorEnvolvido: isNaN(valorFloat) ? null : valorFloat,
        impactoEsperado: data.impactoEsperado || '',
        actionItems: data.actionItems || [],
      };
      savedItem = await saveAta(ataToSave);
    } else {
      const isUrlValid = (urlString) => {
        // Garante que a string não seja vazia antes de tentar validar
        if (!urlString) return false;
        try {
          // Tenta criar um objeto URL. Se falhar, o link é inválido.
          new URL(urlString);
          return true;
        } catch (e) {
          return false;
        }
      };
      // 1. Valida o link da reunião ANTES de fazer qualquer outra coisa
      if (data.linkReuniao && data.linkReuniao.trim() !== '' && !isUrlValid(data.linkReuniao)) {
        toast.error(
          "O 'Link da Reunião' não é uma URL válida. Por favor, inclua http:// ou https://"
        );
        return; // Para a execução aqui mesmo se o link for inválido
      }

      // 1. Validação do Título
      if (!data.titulo || data.titulo.trim() === '') {
        toast.error("O 'Título' do compromisso é obrigatório.");
        return;
      }

      // 2. Validação da Data
      const dateObject = new Date(data.data);
      if (isNaN(dateObject.getTime())) {
        toast.error("O valor fornecido para 'Data e Hora' é inválido.");
        return;
      }

      // 3. Construção do objeto base para salvar
      const eventoToSave = {
        id: data.id,
        titulo: data.titulo,
        data: dateObject.toISOString(),
        local: data.local || '',
        participantes:
          typeof data.participantes === 'string'
            ? data.participantes
                .split(',')
                .map((s) => s.trim())
                .filter(Boolean)
            : data.participantes || [],
        descricaoDetalhada: data.descricaoDetalhada || '',
        status: data.status || 'Pendente',
      };

      // 4. Tratamento do campo opcional 'linkReuniao'
      // Só adiciona a propriedade ao objeto se ela não for vazia.
      // Isso impede o envio de "" que falha na validação isURL().

      savedItem = await saveCompromisso(eventoToSave);
    }

    if (savedItem) {
      setIsModalOpen(false);
    }
  };

  const handleDelete = (type, id) => {
    if (type === 'ata') {
      deleteAta(id);
    } else {
      deleteCompromisso(id);
    }
  };

  const filteredAtas = useMemo(
    () =>
      (atas || []).filter((ata) =>
        searchTerm ? ata.titulo.toLowerCase().includes(searchTerm.toLowerCase()) : true
      ),
    [atas, searchTerm]
  );

  const filteredAgenda = useMemo(
    () =>
      (agenda || [])
        .filter((evento) =>
          searchTerm ? evento.titulo.toLowerCase().includes(searchTerm.toLowerCase()) : true
        )
        .sort((a, b) => new Date(a.data) - new Date(b.data)),
    [agenda, searchTerm]
  );

  const upcomingCompromissos = useMemo(
    () =>
      filteredAgenda
        .filter((c) => new Date(c.data) >= new Date() && c.status !== 'Cancelado')
        .slice(0, 3),
    [filteredAgenda]
  );
  const pendingActionItems = useMemo(
    () =>
      atas.flatMap((ata) =>
        (ata.action_items || [])
          .filter((item) => item.status === 'Pendente')
          .map((item) => ({ ...item, ataTitle: ata.titulo, id: `${ata.id}-${item.id}` }))
      ),
    [atas]
  );

  if (isLoading) {
    return <LoaderLogo />;
  }

  return (
    <div
      className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-slate-50 text-gray-900'} p-4 sm:p-6 transition-colors duration-300`}
    >
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Seu Workspace</h1>
              <p className="text-gray-600 dark:text-gray-400">
                Organize suas atas e compromissos em um só lugar.
              </p>
            </div>
            <div className="relative w-full md:w-auto">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={20}
              />
              <input
                type="text"
                placeholder="Buscar em tudo..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full md:w-64 pl-10 pr-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-800 text-white border-gray-700' : 'bg-white text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#201b5d]`}
              />
            </div>
          </div>
        </header>

        <DashboardWidgets
          upcomingCompromissos={upcomingCompromissos}
          pendingActionItems={pendingActionItems}
        />

        <div className="flex items-center justify-between mb-6">
          <div className="flex gap-2 p-1 rounded-lg bg-gray-200 dark:bg-gray-800">
            <button
              onClick={() => setView('atas')}
              className={clsx(
                'px-4 py-2 text-sm font-semibold rounded-md transition-colors',
                view === 'atas'
                  ? 'bg-white dark:bg-gray-700 shadow'
                  : 'text-gray-600 dark:text-gray-400'
              )}
            >
              <FileText className="inline mr-2" size={16} /> Atas ({filteredAtas.length})
            </button>
            <button
              onClick={() => setView('agenda')}
              className={clsx(
                'px-4 py-2 text-sm font-semibold rounded-md transition-colors',
                view === 'agenda'
                  ? 'bg-white dark:bg-gray-700 shadow'
                  : 'text-gray-600 dark:text-gray-400'
              )}
            >
              <Calendar className="inline mr-2" size={16} /> Compromissos ({filteredAgenda.length})
            </button>
          </div>
        </div>

        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {view === 'atas' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAtas.length > 0 ? (
                    filteredAtas.map((ata) => (
                      <AtaCard
                        key={ata.id}
                        ata={ata}
                        onEdit={() => openModal('ata', ata)}
                        onDelete={() => handleDelete('ata', ata.id)}
                        theme={theme}
                      />
                    ))
                  ) : (
                    <p className="col-span-full text-center text-gray-500 py-10">
                      Nenhuma ata encontrada.
                    </p>
                  )}
                </div>
              )}
              {view === 'agenda' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredAgenda.length > 0 ? (
                    filteredAgenda.map((item) => (
                      <CompromissoCard
                        key={item.id}
                        compromisso={item}
                        onEdit={() => openModal('compromisso', item)}
                        onDelete={() => handleDelete('compromisso', item.id)}
                        onConvertToAta={handleConvertToAta}
                        theme={theme}
                      />
                    ))
                  ) : (
                    <p className="col-span-full text-center text-gray-500 py-10">
                      Nenhum compromisso encontrado.
                    </p>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        <button
          onClick={() => openModal(view === 'atas' ? 'ata' : 'compromisso')}
          className="fixed bottom-6 right-6 bg-gradient-to-br from-[#201b5d] to-[#3e388b] text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform z-40"
        >
          <Plus size={24} />
        </button>

        <FormModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          content={modalContent}
          onSave={handleSave}
          theme={theme}
        />
      </div>
    </div>
  );
}
