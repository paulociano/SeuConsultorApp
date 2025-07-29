import { create } from 'zustand';
import { toast } from 'sonner';

/**
 * Função auxiliar para realizar requisições à API.
 * @param {string} endpoint - O endpoint da API.
 * @param {string} [method='GET'] - O método HTTP.
 * @param {object|null} [body=null] - O corpo da requisição.
 * @returns {Promise<object|null>} O resultado da requisição ou null em caso de falha.
 */
const apiRequest = async (endpoint, method = 'GET', body = null) => {
    try {
        const options = {
            method,
            headers: {}
        };
        if (body) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }
        const response = await fetch(`http://localhost:3001${endpoint}`, options);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || `Erro ${response.status}`);
        }
        return data;
    } catch (error) {
        toast.error(error.message);
        return null;
    }
};

/**
 * Store Zustand para gerenciar o estado de autenticação e os dados do usuário.
 */
export const useUserStore = create((set, get) => ({
  // 1. ESTADO
  /**
   * Indica se o usuário está autenticado.
   * Tenta inicializar a partir do localStorage.
   * @type {boolean}
   */
  isAuthenticated: !!localStorage.getItem('authToken'),
  /**
   * Objeto com os dados do usuário logado.
   * Tenta inicializar a partir do localStorage.
   * @type {object|null}
   */
  usuario: JSON.parse(localStorage.getItem('usuario')) || null,
  /**
   * Indica se uma operação de autenticação está em andamento.
   * @type {boolean}
   */
  isLoading: false,

  // 2. AÇÕES
  /**
   * Realiza o login do usuário.
   * @param {string} email - O email do usuário.
   * @param {string} password - A senha do usuário.
   * @returns {Promise<boolean>} Retorna true em caso de sucesso, false em caso de falha.
   */
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const data = await apiRequest('/login', 'POST', { email, senha: password });
      if (data && data.success) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        set({ isAuthenticated: true, usuario: data.usuario });
        toast.success(`Bem-vindo, ${data.usuario.nome}!`);
        return true;
      }
      return false;
    } catch (error) {
      // O apiRequest já exibe o toast de erro.
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  /**
   * Realiza o cadastro de um novo usuário.
   * @param {object} userData - Dados do usuário { nome, email, senha }.
   * @returns {Promise<object|null>} Retorna os dados da resposta ou null.
   */
  cadastro: async (userData) => {
    set({ isLoading: true });
    try {
        const data = await apiRequest('/cadastro', 'POST', userData);
        if (data && data.success) {
            toast.success("Cadastro realizado com sucesso! Faça o login para continuar.");
        }
        return data;
    } finally {
        set({ isLoading: false });
    }
  },

  /**
   * Realiza o logout do usuário.
   */
  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('usuario');
    set({ isAuthenticated: false, usuario: null });
    // Idealmente, aqui também limparíamos o estado de outras stores se necessário.
    toast.info("Você foi desconectado.");
  },
}));