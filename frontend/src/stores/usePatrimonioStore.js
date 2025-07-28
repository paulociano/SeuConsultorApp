import { create } from 'zustand';
import { toast } from 'sonner';

// A mesma função auxiliar de API que usámos antes
// No futuro, podemos mover isto para um ficheiro partilhado `src/services/api.js`
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

// Criação da store de Património com Zustand
export const usePatrimonioStore = create((set) => ({
  // 1. O ESTADO
  ativos: [],
  dividas: [],
  isLoading: true,

  // 2. AS AÇÕES (FUNÇÕES)
  fetchPatrimonio: async () => {
    set({ isLoading: true });
    try {
      // Fazemos os dois pedidos em paralelo para maior eficiência
      const [ativosData, dividasData] = await Promise.all([
        apiRequest('/ativos'),
        apiRequest('/dividas')
      ]);
      
      if (ativosData && dividasData) {
        set({ ativos: ativosData, dividas: dividasData });
      }
    } catch (error) {
      console.error("Falha ao buscar dados de património", error);
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
      toast.success('Item de património salvo com sucesso!');
    }
  },

  deletePatrimonioItem: async (itemId, tipoItem) => {
    if (!window.confirm("Tem certeza que deseja apagar este item?")) return;

    if (await apiRequest(`/${tipoItem}/${itemId}`, 'DELETE')) {
      set((state) => ({
        [tipoItem]: state[tipoItem].filter(i => i.id !== itemId)
      }));
      toast.success("Item de património apagado!");
    }
  },
}));
