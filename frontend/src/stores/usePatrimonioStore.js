import { create } from 'zustand';
import { toast } from 'sonner';
import { apiRequest } from '../services/apiClient';

export const usePatrimonioStore = create((set) => ({
  ativos: [],
  dividas: [],
  isLoading: true,

  fetchPatrimonio: async () => {
    set({ isLoading: true });
    try {
      const [ativosData, dividasData] = await Promise.all([
        apiRequest('/ativos'),
        apiRequest('/dividas')
      ]);
      set({ ativos: ativosData || [], dividas: dividasData || [] });
    } finally {
      set({ isLoading: false });
    }
  },

  savePatrimonioItem: async (item, tipoItem) => { // tipoItem será 'ativos' ou 'dividas'
    const isEditing = !!item.id;
    const endpoint = isEditing ? `/${tipoItem}/${item.id}` : `/${tipoItem}`;
    const method = isEditing ? 'PUT' : 'POST';

    const savedItem = await apiRequest(endpoint, method, item);
    
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

    if (await apiRequest(`/${tipoItem}/${itemId}`, 'DELETE')) {
      set((state) => ({
        [tipoItem]: state[tipoItem].filter(i => i.id !== itemId)
      }));
      toast.success("Item de patrimônio apagado!");
    }
  },
}));
