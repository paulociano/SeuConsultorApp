import { create } from 'zustand';
import { toast } from 'sonner';
import { apiRequest } from '../services/apiClient';

export const useTransacoesStore = create((set) => ({
  transacoes: [],
  isLoading: true,

  fetchTransacoes: async () => {
    set({ isLoading: true });
    const data = await apiRequest('/transacoes');
    if (data) {
      const transacoesOrdenadas = data.sort((a, b) => new Date(b.data) - new Date(a.data));
      set({ transacoes: transacoesOrdenadas });
    }
    set({ isLoading: false });
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
        
        const transacoesOrdenadas = transacoesAtualizadas.sort((a, b) => new Date(b.data) - new Date(a.data));
        return { transacoes: transacoesOrdenadas };
      });
      toast.success('Transação salva com sucesso!');
      return savedTransacao;
    }
    return null;
  },

  deleteTransacao: async (transacaoId) => {
    if (!window.confirm("Tem certeza que deseja apagar esta transação?")) return null;

    if (await apiRequest(`/transacoes/${transacaoId}`, 'DELETE')) {
      set((state) => ({
        transacoes: state.transacoes.filter(t => t.id !== transacaoId)
      }));
      toast.success("Transação apagada!");
      return true;
    }
    return null;
  },
}));
