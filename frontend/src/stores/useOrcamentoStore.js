import { create } from 'zustand';
import { toast } from 'sonner';

/**
 * Função auxiliar para realizar requisições à API.
 * Garante que o token de autenticação seja enviado e trata as respostas e erros de forma padronizada.
 * @param {string} endpoint - O endpoint da API a ser chamado (ex: '/orcamento').
 * @param {string} [method='GET'] - O método HTTP a ser utilizado.
 * @param {object|null} [body=null] - O corpo da requisição para métodos como POST ou PUT.
 * @returns {Promise<object|boolean|null>} O resultado da requisição ou null em caso de falha.
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
        
        if (response.status === 204) return true; // Para respostas 'No Content' (ex: DELETE)

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
 * Store Zustand para gerenciar o estado e as ações relacionadas ao Orçamento.
 */
export const useOrcamentoStore = create((set, get) => ({
  // 1. ESTADO
  /**
   * Lista de categorias do orçamento, incluindo seus sub-itens.
   * @type {Array}
   */
  categorias: [],
  /**
   * Indica se os dados do orçamento estão sendo carregados.
   * @type {boolean}
   */
  isLoading: true,

  // 2. AÇÕES (FUNÇÕES)
  /**
   * Busca os dados completos do orçamento (categorias e sub-itens) na API.
   */
  fetchOrcamento: async () => {
    set({ isLoading: true });
    try {
      const data = await apiRequest('/orcamento'); //
      if (data) {
        set({ categorias: data, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error("Falha ao buscar dados do orçamento", error);
      set({ isLoading: false });
    }
  },

  /**
   * Salva um item do orçamento (cria um novo ou atualiza um existente).
   * @param {object} itemData - Os dados do item a ser salvo.
   * @param {number} categoriaPaiId - O ID da categoria à qual o novo item pertence (necessário apenas na criação).
   */
  saveOrcamentoItem: async (itemData, categoriaPaiId) => {
    const isEditing = !!itemData.id; //
    const endpoint = isEditing ? `/orcamento/itens/${itemData.id}` : '/orcamento/itens'; //
    const method = isEditing ? 'PUT' : 'POST'; //
    
    // Constrói o payload com os nomes de campo esperados pela API
    const payload = {
        nome: itemData.nome,
        valor_planejado: itemData.sugerido,
        valor_atual: itemData.atual,
        categoria_planejamento: itemData.categoria_planejamento
    };

    if (!isEditing) {
        payload.categoria_id = categoriaPaiId; //
    }

    const itemSalvo = await apiRequest(endpoint, method, payload);
    
    if (itemSalvo) {
      // Atualiza o estado local de forma imutável para refletir a mudança
      const novasCategorias = JSON.parse(JSON.stringify(get().categorias));
      const categoriaAlvoId = isEditing ? itemSalvo.categoria_id : categoriaPaiId;
      const categoriaAlvo = novasCategorias.find(cat => cat.id === categoriaAlvoId);

      if (categoriaAlvo) {
          if (isEditing) {
              const itemIndex = categoriaAlvo.subItens.findIndex(i => i.id === itemSalvo.id);
              if (itemIndex > -1) {
                  // Mapeia os dados de volta para o formato do estado do frontend
                  categoriaAlvo.subItens[itemIndex] = { ...categoriaAlvo.subItens[itemIndex], id: itemSalvo.id, nome: itemSalvo.nome, sugerido: parseFloat(itemSalvo.valor_planejado), atual: parseFloat(itemSalvo.valor_atual), categoria_planejamento: itemSalvo.categoria_planejamento };
              }
          } else {
              // Adiciona o novo item
              categoriaAlvo.subItens.push({ id: itemSalvo.id, nome: itemSalvo.nome, sugerido: parseFloat(itemSalvo.valor_planejado), atual: parseFloat(itemSalvo.valor_atual), categoria_planejamento: itemSalvo.categoria_planejamento });
          }
          set({ categorias: novasCategorias });
      }

      toast.success('Item do orçamento salvo com sucesso!');
      return itemSalvo;
    }
    return null;
  },

  /**
   * Apaga um item do orçamento.
   * @param {number} itemId - O ID do item a ser apagado.
   */
  deleteOrcamentoItem: async (itemId) => {
    if (!window.confirm("Tem certeza que deseja apagar este item do orçamento?")) return; //

    if (await apiRequest(`/orcamento/itens/${itemId}`, 'DELETE')) { //
      // Atualiza o estado filtrando o item removido de sua categoria
      set(state => ({
        categorias: state.categorias.map(cat => ({
          ...cat,
          subItens: cat.subItens.filter(i => i.id !== itemId)
        }))
      }));
      toast.success("Item do orçamento apagado!");
    }
  },
}));