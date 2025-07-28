import { create } from 'zustand';
import { toast } from 'sonner';

// Função auxiliar de API (pode ser movida para um ficheiro partilhado mais tarde)
const apiRequest = async (endpoint, method = 'GET', body = null) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        toast.error("Utilizador não autenticado.");
        // Idealmente, isto deveria deslogar o utilizador globalmente
        return null; 
    }
    try {
        const options = {
            method,
            headers: { 'Authorization': `Bearer ${token}` }
        };
        if (body) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }
        const response = await fetch(`http://localhost:3001/api${endpoint}`, options);
        if (response.status === 204) return true;
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `Erro ${response.status}` }));
            throw new Error(errorData.message || `Falha na requisição ${method} ${endpoint}`);
        }
        return response.json();
    } catch (error) {
        toast.error(error.message);
        return null;
    }
};


// Criação da store com Zustand
export const useObjetivosStore = create((set) => ({
  // 1. O ESTADO
  objetivos: [],
  isLoading: true,

  // 2. AS AÇÕES (FUNÇÕES)
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
      // A função 'set' permite-nos atualizar o estado.
      // Ela recebe o estado anterior (prev) e retorna o novo estado.
      set((state) => ({
        objetivos: isEditing
          ? state.objetivos.map(o => o.id === savedObjetivo.id ? savedObjetivo : o)
          : [...state.objetivos, savedObjetivo]
      }));
      toast.success('Objetivo salvo com sucesso!');
    }
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
