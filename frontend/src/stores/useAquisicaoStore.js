import { create } from 'zustand';
import { toast } from 'sonner';
// 1. CORREÇÃO: Importar a função correta
import { apiPrivateRequest } from '../services/apiClient';

export const useAquisicaoStore = create((set) => ({
  imoveis: [],
  automoveis: [],
  isLoading: true,

  fetchAquisicoes: async () => {
    set({ isLoading: true });
    try {
      // 2. CORREÇÃO: Usar apiPrivateRequest
      const [imoveisRes, automoveisRes] = await Promise.all([
        apiPrivateRequest('/api/aquisicoes/imoveis'),
        apiPrivateRequest('/api/aquisicoes/automoveis')
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
    // 3. CORREÇÃO: Adicionar prefixo /api e usar apiPrivateRequest
    const savedData = await apiPrivateRequest(`/api/aquisicoes/${tipo}`, 'POST', data);
    if (savedData) {
      set({ [tipo]: savedData });
      toast.success(`Simulações de ${tipo} salvas com sucesso!`);
    }
    return savedData;
  },
}));