import { create } from 'zustand';
import { toast } from 'sonner';
import { apiRequest } from '../services/apiClient';

export const useAquisicaoStore = create((set) => ({
  imoveis: [],
  automoveis: [],
  isLoading: true,

  fetchAquisicoes: async () => {
    set({ isLoading: true });
    try {
      const [imoveisRes, automoveisRes] = await Promise.all([
        apiRequest('/aquisicoes/imoveis'),
        apiRequest('/aquisicoes/automoveis')
      ]);
      
      set({
        imoveis: imoveisRes || [],
        automoveis: automoveisRes || []
      });

    } finally {
      set({ isLoading: false });
    }
  },

  saveAquisicao: async (tipo, data) => {
    const savedData = await apiRequest(`/aquisicoes/${tipo}`, 'POST', data);
    if (savedData) {
      set({ [tipo]: savedData });
      toast.success(`Simulações de ${tipo} salvas com sucesso!`);
    }
    return savedData;
  },
}));
