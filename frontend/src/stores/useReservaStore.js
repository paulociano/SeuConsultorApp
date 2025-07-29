import { create } from 'zustand';

/**
 * Store Zustand para gerenciar o estado da Reserva de Emergência.
 *
 * Esta store é responsável por manter o controle de quais investimentos
 * (da lista de ativos do patrimônio) estão sendo alocados para a
 * reserva de emergência.
 *
 * Nota: Atualmente, esta seleção é mantida apenas no estado do cliente.
 * Se fosse necessário persistir essa escolha no banco de dados,
 * esta store seria expandida com chamadas de API, similar às outras.
 */
export const useReservaStore = create((set) => ({
  /**
   * Um objeto que mapeia os IDs dos investimentos selecionados.
   * Ex: { 101: true, 105: true }
   */
  investimentosSelecionados: {},

  /**
   * Alterna a seleção de um investimento para a reserva de emergência.
   * @param {number} investimentoId - O ID do ativo/investimento.
   */
  toggleInvestimento: (investimentoId) =>
    set((state) => ({
      investimentosSelecionados: {
        ...state.investimentosSelecionados,
        [investimentoId]: !state.investimentosSelecionados[investimentoId],
      },
    })),
  
  /**
   * Limpa todas as seleções, resetando o estado.
   */
  limparSelecao: () => set({ investimentosSelecionados: {} }),
}));
