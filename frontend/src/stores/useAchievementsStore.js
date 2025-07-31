import { create } from 'zustand';
import {
    Award, BarChart, TrendingUp, ShieldCheck, Star, Target, PiggyBank
} from 'lucide-react';

const allAchievements = [
  {
    id: 'OBJ_1',
    name: 'Iniciante',
    description: 'Criar o 1º objetivo.',
    icon: Star,
    unlocked: false,
    check: (objetivos) => objetivos.length >= 1,
  },
  {
    id: 'OBJ_3',
    name: 'Planejador',
    description: 'Criar 3 objetivos.',
    icon: BarChart,
    unlocked: false,
    check: (objetivos) => objetivos.length >= 3,
  },
  {
    id: 'OBJ_5',
    name: 'Visionário',
    description: 'Criar 5 objetivos.',
    icon: Target,
    unlocked: false,
    check: (objetivos) => objetivos.length >= 5,
  },
  {
    id: 'PROGRESS_25',
    name: 'Primeiros Passos',
    description: 'Alcançar 25% de um objetivo.',
    icon: TrendingUp,
    unlocked: false,
    check: (objetivos) => objetivos.some(o => o.valorAlvo > 0 && (o.valorAtual / o.valorAlvo) * 100 >= 25),
  },
  {
    id: 'COMPLETE_1',
    name: 'Conquistador',
    description: 'Completar o 1º objetivo.',
    icon: Award,
    unlocked: false,
    check: (objetivos) => objetivos.some(o => o.valorAlvo > 0 && o.valorAtual >= o.valorAlvo),
  },
  {
    id: 'RESERVA_EMERGENCIA',
    name: 'Protetor',
    description: 'Criar Reserva de Emergência.',
    icon: ShieldCheck,
    unlocked: false,
    check: (objetivos) => objetivos.some(o => o.nome.toLowerCase().includes('reserva de emergência')),
  },
  {
    id: 'APORTE_MENSAL',
    name: 'Investidor Consistente',
    description: 'Definir um aporte mensal.',
    icon: PiggyBank,
    unlocked: false,
    check: (objetivos) => objetivos.some(o => o.aporteMensal > 0),
  },
];

export const useAchievementsStore = create((set, get) => ({
  achievements: allAchievements,

  updateAchievements: (objetivos) => {
    const { achievements } = get();
    const updatedAchievements = achievements.map(ach => {
      if (ach.unlocked) return ach;
      const isUnlocked = ach.check(objetivos);
      return { ...ach, unlocked: isUnlocked };
    });
    
    if (JSON.stringify(updatedAchievements) !== JSON.stringify(achievements)) {
        set({ achievements: updatedAchievements });
    }
  },
}));