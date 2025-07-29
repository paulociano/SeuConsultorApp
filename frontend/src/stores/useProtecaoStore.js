import { create } from 'zustand';
import { toast } from 'sonner';
import { apiRequest } from '../services/apiClient';

export const useProtecaoStore = create((set) => ({
  invalidez: [],
  despesasFuturas: [],
  patrimonial: [],
  isLoading: true,

  fetchProtecao: async () => {
    set({ isLoading: true });
    const perfilData = await apiRequest('/perfil');
    if (perfilData && perfilData.protecao) {
      set({
        invalidez: perfilData.protecao.invalidez || [],
        despesasFuturas: perfilData.protecao.despesasFuturas || [],
        patrimonial: perfilData.protecao.patrimonial || [],
      });
    }
    set({ isLoading: false });
  },

  saveProtecaoItem: async (item, tipo) => {
    const isEditing = !!item.id;
    const endpoint = isEditing ? `/protecao/${tipo}/${item.id}` : `/protecao/${tipo}`;
    const method = isEditing ? 'PUT' : 'POST';

    const itemSalvo = await apiRequest(endpoint, method, item);
    
    if (itemSalvo) {
      const stateKey = tipo === 'despesas' ? 'despesasFuturas' : tipo;
      
      set((state) => {
        const listaAtualizada = isEditing
          ? state[stateKey].map(i => (i.id === itemSalvo.id ? itemSalvo : i))
          : [itemSalvo, ...state[stateKey]];
        
        return { [stateKey]: listaAtualizada };
      });
      toast.success("Item de proteção salvo com sucesso!");
      return itemSalvo;
    }
    return null;
  },

  deleteProtecaoItem: async (itemId, tipo) => {
    if (!window.confirm("Tem certeza que deseja apagar este item?")) return;
    
    if (await apiRequest(`/protecao/${tipo}/${itemId}`, 'DELETE')) {
      const stateKey = tipo === 'despesas' ? 'despesasFuturas' : tipo;
      
      set((state) => ({
        [stateKey]: state[stateKey].filter(i => i.id !== itemId)
      }));
      toast.success("Item apagado com sucesso!");
    }
  },
}));
