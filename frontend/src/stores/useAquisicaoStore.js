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
 * Store Zustand para gerenciar o estado e as ações da seção de Aquisição de Bens.
 */
export const useAquisicaoStore = create((set) => ({
  // 1. ESTADO
  /**
   * Array com as simulações de aquisição de imóveis.
   * @type {Array}
   */
  imoveis: [],
  /**
   * Array com as simulações de aquisição de automóveis.
   * @type {Array}
   */
  automoveis: [],
  /**
   * Indica se os dados de aquisição estão sendo carregados.
   * @type {boolean}
   */
  isLoading: true,

  // 2. AÇÕES
  /**
   * Busca os dados de simulação de imóveis e automóveis em paralelo.
   */
  fetchAquisicoes: async () => {
    set({ isLoading: true });
    try {
      const [imoveisRes, automoveisRes] = await Promise.all([
        apiRequest('/aquisicoes/imoveis'),
        apiRequest('/aquisicoes/automoveis')
      ]);
      
      set({
        imoveis: imoveisRes || [],
        automoveis: automoveisRes || []
      });

    } catch (error) {
      console.error("Falha ao buscar dados de aquisições", error);
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Salva um conjunto de simulações para um determinado tipo de bem.
   * @param {'imoveis'|'automoveis'} tipo - O tipo de bem a ser salvo.
   * @param {Array} data - O array de simulações a ser salvo.
   */
  saveAquisicao: async (tipo, data) => {
    // O backend espera um array no corpo da requisição
    const savedData = await apiRequest(`/aquisicoes/${tipo}`, 'POST', data);
    if (savedData) {
      // Atualiza a parte correspondente do estado com os dados retornados
      set({ [tipo]: savedData });
      toast.success(`Simulações de ${tipo} salvas com sucesso!`);
    }
    return savedData;
  },
}));