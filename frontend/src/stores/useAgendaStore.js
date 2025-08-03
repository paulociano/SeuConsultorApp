import { create } from 'zustand';
import { toast } from 'sonner';
// 1. CORREÇÃO: Importar a função correta
import { apiPrivateRequest } from '../services/apiClient';

export const useAgendaStore = create((set) => ({
  atas: [],
  agenda: [],
  isLoading: true,

  fetchAgenda: async () => {
    set({ isLoading: true });
    try {
      // 2. CORREÇÃO: Usar apiPrivateRequest
      const [atasRes, agendaRes] = await Promise.all([
        apiPrivateRequest('/api/atas'),
        apiPrivateRequest('/api/agenda')
      ]);
      
      set({
        atas: atasRes || [],
        agenda: (agendaRes || []).sort((a, b) => new Date(a.data) - new Date(b.data))
      });

    } finally {
      set({ isLoading: false });
    }
  },

  saveAta: async (ata) => {
    const isEditing = !!ata.id;
    // 3. CORREÇÃO: Adicionar prefixo /api
    const endpoint = isEditing ? `/api/atas/${ata.id}` : '/api/atas';
    const method = isEditing ? 'PUT' : 'POST';

    // 4. CORREÇÃO: Usar apiPrivateRequest
    const savedAta = await apiPrivateRequest(endpoint, method, ata);
    
    if (savedAta) {
      set((state) => {
        const listaAtualizada = isEditing
          ? state.atas.map(a => (a.id === savedAta.id ? savedAta : a))
          : [savedAta, ...state.atas];
        
        return { atas: listaAtualizada };
      });
      toast.success(`Ata ${isEditing ? 'atualizada' : 'salva'} com sucesso!`);
      return savedAta;
    }
    return null;
  },

  deleteAta: async (ataId) => {
    if (!window.confirm("Tem certeza que deseja apagar esta ata?")) return;
    
    // 5. CORREÇÃO: Adicionar prefixo /api e usar apiPrivateRequest
    if (await apiPrivateRequest(`/api/atas/${ataId}`, 'DELETE')) {
      set((state) => ({ atas: state.atas.filter(a => a.id !== ataId) }));
      toast.success("Ata apagada com sucesso!");
    }
  },

  saveCompromisso: async (compromisso) => {
    const isEditing = !!compromisso.id;
    // 6. CORREÇÃO: Adicionar prefixo /api
    const endpoint = isEditing ? `/api/agenda/${compromisso.id}` : '/api/agenda';
    const method = isEditing ? 'PUT' : 'POST';

    // 7. CORREÇÃO: Usar apiPrivateRequest
    const savedCompromisso = await apiPrivateRequest(endpoint, method, compromisso);
    
    if (savedCompromisso) {
      set((state) => {
        const listaAtualizada = isEditing
          ? state.agenda.map(c => (c.id === savedCompromisso.id ? savedCompromisso : c))
          : [savedCompromisso, ...state.agenda];
        
        return { agenda: listaAtualizada.sort((a, b) => new Date(a.data) - new Date(b.data)) };
      });
      toast.success(`Compromisso ${isEditing ? 'atualizado' : 'salvo'} com sucesso!`);
      return savedCompromisso;
    }
    return null;
  },

  deleteCompromisso: async (compromissoId) => {
    if (!window.confirm("Tem certeza que deseja apagar este compromisso?")) return;

    // 8. CORREÇÃO: Adicionar prefixo /api e usar apiPrivateRequest
    if (await apiPrivateRequest(`/api/agenda/${compromissoId}`, 'DELETE')) {
      set((state) => ({ agenda: state.agenda.filter(c => c.id !== compromissoId) }));
      toast.success("Compromisso apagado com sucesso!");
    }
  },
}));