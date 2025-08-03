import { create } from 'zustand';
import { toast } from 'sonner';
// 1. CORREÇÃO: Importar a função correta
import { apiPrivateRequest } from '../services/apiClient';

export const usePatrimonioStore = create((set) => ({
  ativos: [],
  dividas: [],
  isLoading: true,

  fetchPatrimonio: async () => {
    set({ isLoading: true });
    try {
      // 2. CORREÇÃO: Usar apiPrivateRequest para buscar os dados
      const [ativosData, dividasData] = await Promise.all([
        apiPrivateRequest('/api/ativos'),
        apiPrivateRequest('/api/dividas')
      ]);
      set({ ativos: ativosData || [], dividas: dividasData || [] });
    } finally {
      set({ isLoading: false });
    }
  },

  savePatrimonioItem: async (item, tipoItem) => { // tipoItem será 'ativos' ou 'dividas'
    const isEditing = !!item.id;
    // 3. CORREÇÃO: Adicionar o prefixo /api ao endpoint
    const endpoint = isEditing ? `/api/${tipoItem}/${item.id}` : `/api/${tipoItem}`;
    const method = isEditing ? 'PUT' : 'POST';

    // 4. CORREÇÃO: Usar apiPrivateRequest para salvar
    const savedItem = await apiPrivateRequest(endpoint, method, item);
    
    if (savedItem) {
      set((state) => ({
        [tipoItem]: isEditing
          ? state[tipoItem].map(i => i.id === savedItem.id ? savedItem : i)
          : [...state[tipoItem], savedItem]
      }));
      toast.success('Item de patrimônio salvo com sucesso!');
      return savedItem;
    }
    return null;
  },

  deletePatrimonioItem: async (itemId, tipoItem) => {
    if (!window.confirm("Tem certeza que deseja apagar este item?")) return;

    // 5. CORREÇÃO: Adicionar prefixo /api e usar apiPrivateRequest para apagar
    if (await apiPrivateRequest(`/api/${tipoItem}/${itemId}`, 'DELETE')) {
      set((state) => ({
        [tipoItem]: state[tipoItem].filter(i => i.id !== itemId)
      }));
      toast.success("Item de patrimônio apagado!");
    }
  },
}));