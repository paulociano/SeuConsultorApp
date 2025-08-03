import { create } from 'zustand';
import { toast } from 'sonner';
// 1. CORREÇÃO: Importar a função correta
import { apiPrivateRequest } from '../services/apiClient';

export const useObjetivosStore = create((set) => ({
  objetivos: [],
  isLoading: true,

  fetchObjetivos: async () => {
    set({ isLoading: true });
    // 2. CORREÇÃO: Usar apiPrivateRequest para buscar os dados
    const data = await apiPrivateRequest('/api/objetivos');
    if (data) {
      set({ objetivos: data });
    }
    set({ isLoading: false });
  },

  saveObjetivo: async (objetivo) => {
    const isEditing = !!objetivo.id;
    // 3. CORREÇÃO: Adicionar o prefixo /api ao endpoint
    const endpoint = isEditing ? `/api/objetivos/${objetivo.id}` : '/api/objetivos';
    const method = isEditing ? 'PUT' : 'POST';

    // 4. CORREÇÃO: Usar apiPrivateRequest para salvar
    const savedObjetivo = await apiPrivateRequest(endpoint, method, objetivo);
    
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

    // 5. CORREÇÃO: Adicionar prefixo /api e usar apiPrivateRequest para apagar
    if (await apiPrivateRequest(`/api/objetivos/${objetivoId}`, 'DELETE')) {
      set((state) => ({
        objetivos: state.objetivos.filter(o => o.id !== objetivoId)
      }));
      toast.success("Objetivo apagado!");
    }
  },
}));