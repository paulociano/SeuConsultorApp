import { create } from 'zustand';
import { toast } from 'sonner';

// Função auxiliar de API (pode ser movida para um ficheiro partilhado mais tarde)
const apiRequest = async (endpoint, method = 'GET', body = null) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        toast.error("Utilizador não autenticado.");
        // Idealmente, isto deveria deslogar o utilizador globalmente
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

// Criação da store de Transações com Zustand
export const useTransacoesStore = create((set) => ({
  // 1. O ESTADO
  transacoes: [],
  isLoading: true,

  // 2. AS AÇÕES (FUNÇÕES)
  fetchTransacoes: async () => {
    set({ isLoading: true });
    try {
      const data = await apiRequest('/transacoes');
      if (data) {
        // Ordena as transações por data, da mais recente para a mais antiga
        const transacoesOrdenadas = data.sort((a, b) => new Date(b.data) - new Date(a.data));
        set({ transacoes: transacoesOrdenadas });
      }
    } catch (error) {
      console.error("Falha ao buscar transações", error);
    } finally {
      set({ isLoading: false });
    }
  },

  saveTransacao: async (transacao) => {
    const isEditing = !!transacao.id;
    const endpoint = isEditing ? `/transacoes/${transacao.id}` : '/transacoes';
    const method = isEditing ? 'PUT' : 'POST';

    const savedTransacao = await apiRequest(endpoint, method, transacao);
    
    if (savedTransacao) {
      set((state) => {
        const transacoesAtualizadas = isEditing
          ? state.transacoes.map(t => t.id === savedTransacao.id ? savedTransacao : t)
          : [savedTransacao, ...state.transacoes];
        
        // Reordena a lista após a atualização/inserção
        const transacoesOrdenadas = transacoesAtualizadas.sort((a, b) => new Date(b.data) - new Date(a.data));

        return { transacoes: transacoesOrdenadas };
      });
      toast.success('Transação salva com sucesso!');
    }
    return savedTransacao; // Retorna a transação salva para fechar o modal, etc.
  },

  deleteTransacao: async (transacaoId) => {
    if (!window.confirm("Tem certeza que deseja apagar esta transação?")) return;

    if (await apiRequest(`/transacoes/${transacaoId}`, 'DELETE')) {
      set((state) => ({
        transacoes: state.transacoes.filter(t => t.id !== transacaoId)
      }));
      toast.success("Transação apagada!");
    }
  },
}));
