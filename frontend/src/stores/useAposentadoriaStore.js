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
 * Store Zustand para gerenciar o estado e as ações da seção de Aposentadoria.
 */
export const useAposentadoriaStore = create((set) => ({
  // 1. ESTADO
  /**
   * Dados do planejamento de aportes para aposentadoria.
   * @type {object|null}
   */
  aposentadoriaData: null,
  /**
   * Dados da simulação de PGBL/VGBL.
   * @type {object|null}
   */
  simuladorPgblData: null,
  /**
   * Indica se os dados da aposentadoria estão sendo carregados.
   * @type {boolean}
   */
  isLoading: true,

  // 2. AÇÕES
  /**
   * Busca os dados de Aportes e da Simulação PGBL em paralelo.
   */
  fetchAposentadoria: async () => {
    set({ isLoading: true });
    try {
      const [aposentadoriaRes, simuladorRes] = await Promise.all([
        apiRequest('/aposentadoria'),
        apiRequest('/simulador-pgbl')
      ]);
      
      set({
        aposentadoriaData: aposentadoriaRes,
        simuladorPgblData: simuladorRes
      });

    } catch (error) {
      console.error("Falha ao buscar dados de aposentadoria", error);
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Salva os dados do planejamento de aportes da aposentadoria.
   * @param {object} data - Os dados a serem salvos.
   */
  saveAposentadoria: async (data) => {
    const savedData = await apiRequest('/aposentadoria', 'POST', data);
    if (savedData) {
      set({ aposentadoriaData: savedData });
      toast.success("Plano de aposentadoria salvo com sucesso!");
    }
    return savedData;
  },

  /**
   * Salva os dados da simulação PGBL/VGBL.
   * @param {object} data - Os dados da simulação a serem salvos.
   */
  saveSimuladorPgbl: async (data) => {
    const savedData = await apiRequest('/simulador-pgbl', 'POST', data);
    if (savedData) {
      set({ simuladorPgblData: savedData });
      toast.success("Simulação PGBL/VGBL salva com sucesso!");
    }
    return savedData;
  },
}));