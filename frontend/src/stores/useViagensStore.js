import { create } from 'zustand';
import { toast } from 'sonner';
// 1. Importar o apiClient centralizado
import { apiRequest } from '../services/apiClient';

export const useViagensStore = create((set) => ({
  // 2. Adicionar o estado de 'error'
  carteiras: [],
  metas: [],
  isLoading: false,
  error: null,

  fetchViagens: async () => {
    // 3. Gerenciar o estado de loading e limpar erros antigos
    set({ isLoading: true, error: null });
    try {
      const [carteirasRes, metasRes] = await Promise.all([
        apiRequest('/milhas/carteiras'),
        apiRequest('/milhas/metas')
      ]);
      
      set({
        carteiras: carteirasRes || [],
        metas: metasRes || []
      });

    } catch (err) {
      set({ error: 'Falha ao buscar dados de viagens.' });
    } finally {
      set({ isLoading: false });
    }
  },

  saveViagensItem: async (item, tipo) => {
    set({ isLoading: true, error: null });
    try {
        const isEditing = !!item.id;
        const endpoint = isEditing ? `/milhas/${tipo}/${item.id}` : `/milhas/${tipo}`;
        const method = isEditing ? 'PUT' : 'POST';

        const savedItem = await apiRequest(endpoint, method, item);
        
        if (savedItem) {
          set((state) => {
            const listaAtualizada = isEditing
              ? state[tipo].map(i => (i.id === savedItem.id ? savedItem : i))
              : [savedItem, ...state[tipo]];
            
            return { [tipo]: listaAtualizada };
          });
          toast.success(`Item de ${tipo === 'carteiras' ? 'carteira' : 'meta'} salvo com sucesso!`);
          return savedItem;
        }
        return null;
    } catch (err) {
        set({ error: `Falha ao salvar item de ${tipo}.` });
        return null;
    } finally {
        set({ isLoading: false });
    }
  },

  deleteViagensItem: async (itemId, tipo) => {
    if (!window.confirm("Tem certeza que deseja apagar este item?")) {
      return;
    }
    
    set({ isLoading: true, error: null });
    try {
        if (await apiRequest(`/milhas/${tipo}/${itemId}`, 'DELETE')) {
          set((state) => ({
            [tipo]: state[tipo].filter(i => i.id !== itemId)
          }));
          toast.success("Item apagado com sucesso!");
        }
    } catch (err) {
        set({ error: `Falha ao apagar item de ${tipo}.` });
    } finally {
        set({ isLoading: false });
    }
  },
}));