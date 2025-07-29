import { create } from 'zustand';
import { toast } from 'sonner';
import { apiRequest } from '../services/apiClient';

export const useObjetivosStore = create((set) => ({
  objetivos: [],
  isLoading: true,

  fetchObjetivos: async () => {
    set({ isLoading: true });
    const data = await apiRequest('/objetivos');
    if (data) {
      set({ objetivos: data });
    }
    set({ isLoading: false });
  },

  saveObjetivo: async (objetivo) => {
    const isEditing = !!objetivo.id;
    const endpoint = isEditing ? `/objetivos/${objetivo.id}` : '/objetivos';
    const method = isEditing ? 'PUT' : 'POST';

    const savedObjetivo = await apiRequest(endpoint, method, objetivo);
    
    if (savedObjetivo) {
      set((state) => ({
        objetivos: isEditing
          ? state.objetivos.map(o => o.id === savedObjetivo.id ? savedObjetivo : o)
          : [...state.objetivos, savedObjetivo]
      }));
      toast.success('Objetivo salvo com sucesso!');
      return savedObjetivo;
    }
    return null;
  },

  deleteObjetivo: async (objetivoId) => {
    if (!window.confirm("Tem certeza que deseja apagar este objetivo?")) return;

    if (await apiRequest(`/objetivos/${objetivoId}`, 'DELETE')) {
      set((state) => ({
        objetivos: state.objetivos.filter(o => o.id !== objetivoId)
      }));
      toast.success("Objetivo apagado!");
    }
  },
}));
