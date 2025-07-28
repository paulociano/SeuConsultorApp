import { create } from 'zustand';
import { toast } from 'sonner';

/**
 * Função auxiliar para realizar requisições à API.
 * @param {string} endpoint - O endpoint da API a ser chamado.
 * @param {string} [method='GET'] - O método HTTP.
 * @param {object|null} [body=null] - O corpo da requisição.
 * @returns {Promise<object|boolean|null>} O resultado da requisição.
 */
const apiRequest = async (endpoint, method = 'GET', body = null) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        toast.error("Usuário não autenticado.");
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
 * Store Zustand para gerenciar o estado e as ações da seção de Proteção.
 */
export const useProtecaoStore = create((set) => ({
  // 1. ESTADO
  invalidez: [],
  despesasFuturas: [],
  patrimonial: [],
  isLoading: true,

  // 2. AÇÕES
  /**
   * Busca os dados de proteção.
   * Nota: Estes dados vêm aninhados na resposta do endpoint '/perfil'.
   */
  fetchProtecao: async () => {
    set({ isLoading: true });
    try {
      const perfilData = await apiRequest('/perfil');
      if (perfilData && perfilData.protecao) {
        set({
          invalidez: perfilData.protecao.invalidez || [],
          despesasFuturas: perfilData.protecao.despesasFuturas || [],
          patrimonial: perfilData.protecao.patrimonial || [],
        });
      }
    } catch (error) {
      console.error("Falha ao buscar dados de proteção", error);
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Salva um item de proteção (cria um novo ou atualiza um existente).
   * @param {object} item - Os dados do item a ser salvo.
   * @param {'invalidez'|'despesas'|'patrimonial'} tipo - O tipo de item.
   */
  saveProtecaoItem: async (item, tipo) => {
    const isEditing = !!item.id;
    const endpoint = isEditing ? `/protecao/${tipo}/${item.id}` : `/protecao/${tipo}`;
    const method = isEditing ? 'PUT' : 'POST';

    const itemSalvo = await apiRequest(endpoint, method, item);
    
    if (itemSalvo) {
      const stateKey = tipo === 'despesas' ? 'despesasFuturas' : tipo;
      
      set((state) => {
        const listaAtualizada = isEditing
          ? state[stateKey].map(i => (i.id === itemSalvo.id ? itemSalvo : i))
          : [itemSalvo, ...state[stateKey]]; // Adiciona novos itens no início
        
        return { [stateKey]: listaAtualizada };
      });
      toast.success("Item de proteção salvo com sucesso!");
      return itemSalvo;
    }
    return null;
  },

  /**
   * Apaga um item de proteção.
   * @param {number} itemId - O ID do item a ser apagado.
   * @param {'invalidez'|'despesas'|'patrimonial'} tipo - O tipo de item.
   */
  deleteProtecaoItem: async (itemId, tipo) => {
    if (!window.confirm("Tem certeza que deseja apagar este item?")) {
      return;
    }
    
    if (await apiRequest(`/protecao/${tipo}/${itemId}`, 'DELETE')) {
      const stateKey = tipo === 'despesas' ? 'despesasFuturas' : tipo;
      
      set((state) => ({
        [stateKey]: state[stateKey].filter(i => i.id !== itemId)
      }));
      toast.success("Item apagado com sucesso!");
    }
  },
}));