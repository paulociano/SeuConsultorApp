import { useState, useCallback } from 'react';

/**
 * Hook customizado para gerenciar o estado de um tour de onboarding.
 * @param {string} tourKey - Uma chave única para identificar o tour (ex: 'objetivos_tour').
 */
export const useOnboarding = (tourKey) => {
  const [runTour, setRunTour] = useState(false);
  const completedTourKey = `onboarding_${tourKey}_completed`;

  /**
   * Função para iniciar o tour.
   * Ela verifica o localStorage e só inicia o tour se ele nunca foi concluído.
   */
  const startTour = useCallback(() => {
    const hasCompletedTour = localStorage.getItem(completedTourKey);
    if (!hasCompletedTour) {
      // Adiciona um pequeno delay para garantir que a UI tenha tempo de renderizar
      setTimeout(() => {
        setRunTour(true);
      }, 500);
    }
  }, [completedTourKey]);

  /**
   * Função chamada quando o tour termina ou é pulado.
   */
  const handleTourEnd = useCallback((data) => {
    const { status } = data;
    const finishedStatuses = ['finished', 'skipped']; // Status que indicam o fim do tour.

    if (finishedStatuses.includes(status)) {
      setRunTour(false);
      localStorage.setItem(completedTourKey, 'true');
    }
  }, [completedTourKey]);

  // O hook agora retorna a função 'startTour' também.
  return { runTour, startTour, handleTourEnd };
};