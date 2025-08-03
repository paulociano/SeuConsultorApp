import { create } from 'zustand';
import { toast } from 'sonner';
// Use a função correta que envia o token
import { apiPrivateRequest } from '../services/apiClient';

export const useTransacoesStore = create((set) => ({
  transacoes: [],
  isLoading: true,

  fetchTransacoes: async () => {
    set({ isLoading: true });
    // Usar a função privada para buscar dados
    const data = await apiPrivateRequest('/api/transacoes');
    if (data) {
      const transacoesOrdenadas = data.sort((a, b) => new Date(b.data) - new Date(a.data));
      set({ transacoes: transacoesOrdenadas });
    }
    set({ isLoading: false });
  },

  saveTransacao: async (transacao) => {
    const isEditing = !!transacao.id;
    const endpoint = isEditing ? `/api/transacoes/${transacao.id}` : '/api/transacoes';
    const method = isEditing ? 'PUT' : 'POST';

    // Usar a função privada para salvar
    const savedTransacao = await apiPrivateRequest(endpoint, method, transacao);
    
    if (savedTransacao) {
      // --- ESTA É A LÓGICA CRÍTICA ---
      // O set() atualiza o estado da store, fazendo a tela re-renderizar
      set((state) => {
        const transacoesAtualizadas = isEditing
          // Se estiver editando, substitui o item antigo pelo novo
          ? state.transacoes.map(t => t.id === savedTransacao.id ? savedTransacao : t)
          // Se for um item novo, adiciona ele ao início da lista
          : [savedTransacao, ...state.transacoes];
        
        // Reordena a lista para garantir que a data mais recente fique no topo
        const transacoesOrdenadas = transacoesAtualizadas.sort((a, b) => new Date(b.data) - new Date(a.data));
        
        // Retorna o novo estado
        return { transacoes: transacoesOrdenadas };
      });
      
      toast.success('Transação salva com sucesso!');
      return savedTransacao;
    }
    return null;
  },

  deleteTransacao: async (transacaoId) => {
    if (!window.confirm("Tem certeza que deseja apagar esta transação?")) return null;

    // Usar a função privada para apagar
    if (await apiPrivateRequest(`/api/transacoes/${transacaoId}`, 'DELETE')) {
      set((state) => ({
        transacoes: state.transacoes.filter(t => t.id !== transacaoId)
      }));
      toast.success("Transação apagada!");
      return true;
    }
    return null;
  },
}));