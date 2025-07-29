import { create } from 'zustand';
import { toast } from 'sonner';

/**
 * Função auxiliar para realizar requisições à API.
 * @param {string} endpoint - O endpoint da API.
 * @param {string} [method='GET'] - O método HTTP.
 * @param {object|null} [body=null] - O corpo da requisição.
 * @returns {Promise<object|boolean|null>} O resultado da requisição.
 */
const apiRequest = async (endpoint, method = 'GET', body = null) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        toast.error("Utilizador não autenticado.");
        return null;
    }
    try {
        const options = {
            method,
            headers: { 'Authorization': `Bearer ${token}` }
        };
        if (body) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }
        const response = await fetch(`http://localhost:3001/api${endpoint}`, options);
        
        if (response.status === 204) return true;

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `Erro ${response.status}` }));
            throw new Error(errorData.message || `Falha na requisição ${method} ${endpoint}`);
        }
        return response.json();
    } catch (error) {
        toast.error(error.message);
        return null;
    }
};

/**
 * Store Zustand para gerir o estado e as ações da secção de Agenda e Reuniões.
 */
export const useAgendaStore = create((set) => ({
  // 1. ESTADO
  /**
   * Array com as atas de reunião do utilizador.
   * @type {Array}
   */
  atas: [],
  /**
   * Array com os compromissos da agenda do utilizador.
   * @type {Array}
   */
  agenda: [],
  /**
   * Indica se os dados da agenda estão a ser carregados.
   * @type {boolean}
   */
  isLoading: true,

  // 2. AÇÕES
  /**
   * Busca os dados de atas e compromissos da agenda em paralelo.
   */
  fetchAgenda: async () => {
    set({ isLoading: true });
    try {
      const [atasRes, agendaRes] = await Promise.all([
        apiRequest('/atas'),
        apiRequest('/agenda')
      ]);
      
      set({
        atas: atasRes || [],
        agenda: (agendaRes || []).sort((a, b) => new Date(a.data) - new Date(b.data)) // Ordena por data
      });

    } catch (error) {
      console.error("Falha ao buscar dados da agenda", error);
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Guarda uma ata de reunião (cria uma nova ou atualiza uma existente).
   * @param {object} ata - O objeto da ata a ser guardado.
   */
  saveAta: async (ata) => {
    const isEditing = !!ata.id;
    const endpoint = isEditing ? `/atas/${ata.id}` : '/atas';
    const method = isEditing ? 'PUT' : 'POST';

    const savedAta = await apiRequest(endpoint, method, ata);
    
    if (savedAta) {
      set((state) => {
        const listaAtualizada = isEditing
          ? state.atas.map(a => (a.id === savedAta.id ? savedAta : a))
          : [savedAta, ...state.atas];
        
        return { atas: listaAtualizada };
      });
      toast.success(`Ata ${isEditing ? 'atualizada' : 'guardada'} com sucesso!`);
      return savedAta;
    }
    return null;
  },

  /**
   * Apaga uma ata de reunião.
   * @param {number} ataId - O ID da ata a ser apagada.
   */
  deleteAta: async (ataId) => {
    if (!window.confirm("Tem a certeza de que deseja apagar esta ata?")) {
      return;
    }
    
    if (await apiRequest(`/atas/${ataId}`, 'DELETE')) {
      set((state) => ({
        atas: state.atas.filter(a => a.id !== ataId)
      }));
      toast.success("Ata apagada com sucesso!");
    }
  },

  /**
   * Guarda um compromisso na agenda.
   * @param {object} compromisso - O objeto do compromisso a ser guardado.
   */
  saveCompromisso: async (compromisso) => {
    const isEditing = !!compromisso.id;
    const endpoint = isEditing ? `/agenda/${compromisso.id}` : '/agenda';
    const method = isEditing ? 'PUT' : 'POST';

    const savedCompromisso = await apiRequest(endpoint, method, compromisso);
    
    if (savedCompromisso) {
      set((state) => {
        const listaAtualizada = isEditing
          ? state.agenda.map(c => (c.id === savedCompromisso.id ? savedCompromisso : c))
          : [savedCompromisso, ...state.agenda];
        
        // Reordena a agenda por data após cada alteração
        return { agenda: listaAtualizada.sort((a, b) => new Date(a.data) - new Date(b.data)) };
      });
      toast.success(`Compromisso ${isEditing ? 'atualizado' : 'guardado'} com sucesso!`);
      return savedCompromisso;
    }
    return null;
  },

  /**
   * Apaga um compromisso da agenda.
   * @param {number} compromissoId - O ID do compromisso a ser apagado.
   */
  deleteCompromisso: async (compromissoId) => {
    if (!window.confirm("Tem a certeza de que deseja apagar este compromisso?")) {
      return;
    }

    if (await apiRequest(`/agenda/${compromissoId}`, 'DELETE')) {
      set((state) => ({
        agenda: state.agenda.filter(c => c.id !== compromissoId)
      }));
      toast.success("Compromisso apagado com sucesso!");
    }
  },
}));