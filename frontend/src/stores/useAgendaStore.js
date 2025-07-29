import { create } from 'zustand';
import { toast } from 'sonner';
import { apiRequest } from '../services/apiClient';

export const useAgendaStore = create((set) => ({
  atas: [],
  agenda: [],
  isLoading: true,

  fetchAgenda: async () => {
    set({ isLoading: true });
    try {
      const [atasRes, agendaRes] = await Promise.all([
        apiRequest('/atas'),
        apiRequest('/agenda')
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
    const endpoint = isEditing ? `/atas/${ata.id}` : '/atas';
    const method = isEditing ? 'PUT' : 'POST';

    const savedAta = await apiRequest(endpoint, method, ata);
    
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
    
    if (await apiRequest(`/atas/${ataId}`, 'DELETE')) {
      set((state) => ({ atas: state.atas.filter(a => a.id !== ataId) }));
      toast.success("Ata apagada com sucesso!");
    }
  },

  saveCompromisso: async (compromisso) => {
    const isEditing = !!compromisso.id;
    const endpoint = isEditing ? `/agenda/${compromisso.id}` : '/agenda';
    const method = isEditing ? 'PUT' : 'POST';

    const savedCompromisso = await apiRequest(endpoint, method, compromisso);
    
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

    if (await apiRequest(`/agenda/${compromissoId}`, 'DELETE')) {
      set((state) => ({ agenda: state.agenda.filter(c => c.id !== compromissoId) }));
      toast.success("Compromisso apagado com sucesso!");
    }
  },
}));
