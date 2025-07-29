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
 * Store Zustand para gerenciar o estado e as ações da seção de Viagens (Milhas).
 */
export const useViagensStore = create((set) => ({
  // 1. ESTADO
  /**
   * Array com as carteiras de milhas do usuário.
   * @type {Array}
   */
  carteiras: [],
  /**
   * Array com as metas de viagem do usuário.
   * @type {Array}
   */
  metas: [],
  /**
   * Indica se os dados de viagens estão sendo carregados.
   * @type {boolean}
   */
  isLoading: true,

  // 2. AÇÕES
  /**
   * Busca os dados de carteiras e metas de milhas em paralelo.
   */
  fetchViagens: async () => {
    set({ isLoading: true });
    try {
      const [carteirasRes, metasRes] = await Promise.all([
        apiRequest('/milhas/carteiras'),
        apiRequest('/milhas/metas')
      ]);
      
      set({
        carteiras: carteirasRes || [],
        metas: metasRes || []
      });

    } catch (error) {
      console.error("Falha ao buscar dados de viagens", error);
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Salva um item (carteira ou meta).
   * @param {object} item - O objeto do item a ser salvo.
   * @param {'carteiras'|'metas'} tipo - O tipo de item a ser salvo.
   */
  saveViagensItem: async (item, tipo) => {
    const isEditing = !!item.id;
    const endpoint = isEditing ? `/milhas/${tipo}/${item.id}` : `/milhas/${tipo}`;
    const method = isEditing ? 'PUT' : 'POST';

    const savedItem = await apiRequest(endpoint, method, item);
    
    if (savedItem) {
      set((state) => {
        const listaAtualizada = isEditing
          ? state[tipo].map(i => (i.id === savedItem.id ? savedItem : i))
          : [savedItem, ...state[tipo]]; // Adiciona novos itens no início
        
        return { [tipo]: listaAtualizada };
      });
      toast.success(`Item de ${tipo === 'carteiras' ? 'carteira' : 'meta'} salvo com sucesso!`);
      return savedItem;
    }
    return null;
  },

  /**
   * Apaga um item (carteira ou meta).
   * @param {number} itemId - O ID do item a ser apagado.
   * @param {'carteiras'|'metas'} tipo - O tipo de item.
   */
  deleteViagensItem: async (itemId, tipo) => {
    if (!window.confirm("Tem certeza que deseja apagar este item?")) {
      return;
    }
    
    if (await apiRequest(`/milhas/${tipo}/${itemId}`, 'DELETE')) {
      set((state) => ({
        [tipo]: state[tipo].filter(i => i.id !== itemId)
      }));
      toast.success("Item apagado com sucesso!");
    }
  },
}));