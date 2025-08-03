import { create } from 'zustand';
import { toast } from 'sonner';
// 1. CORREÇÃO: Importar a função correta
import { apiPrivateRequest } from '../services/apiClient';

export const useProtecaoStore = create((set) => ({
  invalidez: [],
  despesasFuturas: [],
  patrimonial: [],
  isLoading: true,

  fetchProtecao: async () => {
    set({ isLoading: true });
    // 2. CORREÇÃO: Usar apiPrivateRequest
    const perfilData = await apiPrivateRequest('/api/perfil');
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
    // 3. CORREÇÃO: Adicionar prefixo /api
    const endpoint = isEditing ? `/api/protecao/${tipo}/${item.id}` : `/api/protecao/${tipo}`;
    const method = isEditing ? 'PUT' : 'POST';

    // 4. CORREÇÃO: Usar apiPrivateRequest
    const itemSalvo = await apiPrivateRequest(endpoint, method, item);
    
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
    
    // 5. CORREÇÃO: Adicionar prefixo /api e usar apiPrivateRequest
    if (await apiPrivateRequest(`/api/protecao/${tipo}/${itemId}`, 'DELETE')) {
      const stateKey = tipo === 'despesas' ? 'despesasFuturas' : tipo;
      
      set((state) => ({
        [stateKey]: state[stateKey].filter(i => i.id !== itemId)
      }));
      toast.success("Item apagado com sucesso!");
    }
  },
}));