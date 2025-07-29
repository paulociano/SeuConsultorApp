import { create } from 'zustand';
import { toast } from 'sonner';
import { apiRequest } from '../services/apiClient';

export const useAposentadoriaStore = create((set) => ({
  aposentadoriaData: null,
  simuladorPgblData: null,
  isLoading: true,

  fetchAposentadoria: async () => {
    set({ isLoading: true });
    try {
      const [aposentadoriaRes, simuladorRes] = await Promise.all([
        apiRequest('/aposentadoria'),
        apiRequest('/simulador-pgbl')
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
    const savedData = await apiRequest('/aposentadoria', 'POST', data);
    if (savedData) {
      set({ aposentadoriaData: savedData });
      toast.success("Plano de aposentadoria salvo com sucesso!");
    }
    return savedData;
  },

  saveSimuladorPgbl: async (data) => {
    const savedData = await apiRequest('/simulador-pgbl', 'POST', data);
    if (savedData) {
      set({ simuladorPgblData: savedData });
      toast.success("Simulação PGBL/VGBL salva com sucesso!");
    }
    return savedData;
  },
}));
