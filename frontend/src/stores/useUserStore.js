// useUserStore.js

import { create } from 'zustand';
import { toast } from 'sonner';
// Importe também o cliente de API para rotas autenticadas
import { apiPublicRequest, apiPrivateRequest } from '../services/apiClient';

export const useUserStore = create((set, get) => ({ // Adicione 'get' para acessar o estado atual
  isAuthenticated: !!localStorage.getItem('authToken'),
  usuario: JSON.parse(localStorage.getItem('usuario')) || null,
  isLoading: false,

  login: async (email, password) => {
    // ... (código existente, sem alterações)
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
    // ... (código existente, sem alterações)
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

  // NOVA FUNÇÃO updateUser
  updateUser: async (dadosAtualizados, imagemFile) => {
    set({ isLoading: true });
    try {
      const { usuario } = get(); // Obtém o usuário atual da store
      if (!usuario) throw new Error("Usuário não autenticado.");

      // Para enviar arquivos, precisamos usar FormData
      const formData = new FormData();
      formData.append('nome', dadosAtualizados.nome);
      formData.append('email', dadosAtualizados.email);
      
      // Adiciona a senha apenas se ela foi fornecida
      if (dadosAtualizados.senha) {
        formData.append('senha', dadosAtualizados.senha);
      }
      // Adiciona a imagem apenas se um novo arquivo foi selecionado
      if (imagemFile) {
        formData.append('imagem', imagemFile);
      }

      // Faz a chamada para a API usando um método para rotas privadas (que envia o token)
      // Usaremos o método PUT para atualização, em um endpoint como /perfil/:id
      const data = await apiPrivateRequest(`/perfil/${usuario.id}`, 'PUT', formData);

      if (data && data.success) {
        // Atualiza o localStorage e o estado da store com o novo usuário
        localStorage.setItem('usuario', JSON.stringify(data.usuario));
        set({ usuario: data.usuario });
        toast.success("Perfil atualizado com sucesso!");
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      toast.error(error.message || "Não foi possível atualizar o perfil.");
      return false;
    } finally {
      set({ isLoading: false });
    }
  },

  logout: () => {
    // ... (código existente, sem alterações)
    localStorage.removeItem('authToken');
    localStorage.removeItem('usuario');
    set({ isAuthenticated: false, usuario: null });
    toast.info("Você foi desconectado.");
    window.location.reload();
  },
}));