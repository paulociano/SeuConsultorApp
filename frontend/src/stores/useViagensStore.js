import { create } from 'zustand';
import { toast } from 'sonner';
// 1. CORREÇÃO: Importar a função correta
import { apiPrivateRequest } from '../services/apiClient';

export const useViagensStore = create((set) => ({
  carteiras: [],
  metas: [],
  isLoading: false,
  error: null,

  fetchViagens: async () => {
    set({ isLoading: true, error: null });
    try {
      // 2. CORREÇÃO: Usar apiPrivateRequest
      const [carteirasRes, metasRes] = await Promise.all([
        apiPrivateRequest('/api/milhas/carteiras'),
        apiPrivateRequest('/api/milhas/metas')
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
        // 3. CORREÇÃO: Adicionar prefixo /api
        const endpoint = isEditing ? `/api/milhas/${tipo}/${item.id}` : `/api/milhas/${tipo}`;
        const method = isEditing ? 'PUT' : 'POST';

        // 4. CORREÇÃO: Usar apiPrivateRequest
        const savedItem = await apiPrivateRequest(endpoint, method, item);
        
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
        // 5. CORREÇÃO: Adicionar prefixo /api e usar apiPrivateRequest
        if (await apiPrivateRequest(`/api/milhas/${tipo}/${itemId}`, 'DELETE')) {
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