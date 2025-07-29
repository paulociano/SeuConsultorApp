import { create } from 'zustand';
import { toast } from 'sonner';
import { apiPublicRequest } from '../services/apiClient'; // Importa a função para rotas públicas

export const useUserStore = create((set) => ({
  isAuthenticated: !!localStorage.getItem('authToken'),
  usuario: JSON.parse(localStorage.getItem('usuario')) || null,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const data = await apiPublicRequest('/login', 'POST', { email, senha: password });
      if (data && data.success) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        set({ isAuthenticated: true, usuario: data.usuario });
        toast.success(`Bem-vindo, ${data.usuario.nome}!`);
        return true;
      }
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  cadastro: async (userData) => {
    set({ isLoading: true });
    try {
        const data = await apiPublicRequest('/cadastro', 'POST', userData);
        if (data && data.success) {
            toast.success("Cadastro realizado com sucesso! Faça o login para continuar.");
        }
        return data;
    } finally {
        set({ isLoading: false });
    }
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('usuario');
    set({ isAuthenticated: false, usuario: null });
    toast.info("Você foi desconectado.");
    // Força o recarregamento da página para limpar o estado de outros componentes
    window.location.reload();
  },
}));
