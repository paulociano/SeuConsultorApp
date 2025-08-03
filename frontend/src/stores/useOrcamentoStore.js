import { create } from 'zustand';
import { toast } from 'sonner';
// 1. CORREÇÃO: Importar a função correta
import { apiPrivateRequest } from '../services/apiClient';

export const useOrcamentoStore = create((set, get) => ({
  categorias: [],
  isLoading: true,

  fetchOrcamento: async () => {
    set({ isLoading: true });
    // Usar apiPrivateRequest para buscar dados
    const data = await apiPrivateRequest('/api/orcamento');
    if (data) {
      set({ categorias: data });
    }
    set({ isLoading: false });
  },

  saveOrcamentoItem: async (itemData, categoriaPaiId) => {
    const isEditing = !!itemData.id;
    const endpoint = isEditing ? `/api/orcamento/itens/${itemData.id}` : '/api/orcamento/itens';
    const method = isEditing ? 'PUT' : 'POST';
    
    const payload = {
        nome: itemData.nome,
        valor_planejado: itemData.sugerido,
        valor_atual: itemData.atual,
        categoria_planejamento: itemData.categoria_planejamento,
        // --- CORREÇÃO PRINCIPAL AQUI ---
        // O categoria_id é necessário tanto para criar quanto para editar.
        // Removemos a condição "if (!isEditing)" e passamos o ID da categoria pai em ambos os casos.
        categoria_id: categoriaPaiId
    };

    const itemSalvo = await apiPrivateRequest(endpoint, method, payload);
    
    if (itemSalvo) {
      const novasCategorias = JSON.parse(JSON.stringify(get().categorias));
      const categoriaAlvoId = isEditing ? itemSalvo.categoria_id : categoriaPaiId;
      const categoriaAlvo = novasCategorias.find(cat => cat.id === categoriaAlvoId);

      if (categoriaAlvo) {
          if (isEditing) {
              const itemIndex = categoriaAlvo.subItens.findIndex(i => i.id === itemSalvo.id);
              if (itemIndex > -1) {
                  categoriaAlvo.subItens[itemIndex] = { ...categoriaAlvo.subItens[itemIndex], id: itemSalvo.id, nome: itemSalvo.nome, sugerido: parseFloat(itemSalvo.valor_planejado), atual: parseFloat(itemSalvo.valor_atual), categoria_planejamento: itemSalvo.categoria_planejamento };
              }
          } else {
              categoriaAlvo.subItens.push({ id: itemSalvo.id, nome: itemSalvo.nome, sugerido: parseFloat(itemSalvo.valor_planejado), atual: parseFloat(itemSalvo.valor_atual), categoria_planejamento: itemSalvo.categoria_planejamento });
          }
          set({ categorias: novasCategorias });
      }

      toast.success('Item do orçamento salvo com sucesso!');
      return itemSalvo;
    }
    return null;
  },

  deleteOrcamentoItem: async (itemId) => {
    if (!window.confirm("Tem certeza que deseja apagar este item do orçamento?")) return;

    if (await apiPrivateRequest(`/api/orcamento/itens/${itemId}`, 'DELETE')) {
      set(state => ({
        categorias: state.categorias.map(cat => ({
          ...cat,
          subItens: cat.subItens.filter(i => i.id !== itemId)
        }))
      }));
      toast.success("Item do orçamento apagado!");
    }
  },
}));