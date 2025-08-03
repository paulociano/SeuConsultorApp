import { create } from 'zustand';
import { toast } from 'sonner';
// 1. CORREÇÃO: Importar a função correta
import { apiPrivateRequest } from '../services/apiClient';

export const useAposentadoriaStore = create((set) => ({
  aposentadoriaData: null,
  simuladorPgblData: null,
  isLoading: true,

  fetchAposentadoria: async () => {
    set({ isLoading: true });
    try {
      // 2. CORREÇÃO: Usar apiPrivateRequest
      const [aposentadoriaRes, simuladorRes] = await Promise.all([
        apiPrivateRequest('/api/aposentadoria'),
        apiPrivateRequest('/api/simulador-pgbl')
      ]);
      
      set({
        aposentadoriaData: aposentadoriaRes,
        simuladorPgblData: simuladorRes
      });
    } finally {
      set({ isLoading: false });
    }
  },

  saveAposentadoria: async (data) => {
    // 3. CORREÇÃO: Adicionar prefixo /api e usar apiPrivateRequest
    const savedData = await apiPrivateRequest('/api/aposentadoria', 'POST', data);
    if (savedData) {
      set({ aposentadoriaData: savedData });
      toast.success("Plano de aposentadoria salvo com sucesso!");
    }
    return savedData;
  },

  saveSimuladorPgbl: async (data) => {
    // 4. CORREÇÃO: Adicionar prefixo /api e usar apiPrivateRequest
    const savedData = await apiPrivateRequest('/api/simulador-pgbl', 'POST', data);
    if (savedData) {
      set({ simuladorPgblData: savedData });
      toast.success("Simulação PGBL/VGBL salva com sucesso!");
    }
    return savedData;
  },
}));