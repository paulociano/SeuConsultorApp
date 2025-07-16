import { Home, Plane, Car, Shield, Briefcase, School } from 'lucide-react';

export const mockObjetivos = [
    { id: 1, nome: 'Casa na Praia', icon: Home, valorAlvo: 800000, valorAtual: 350000, investimentosLinkados: ['inv1', 'inv3'] },
    { id: 2, nome: 'Viagem ao Japão', icon: Plane, valorAlvo: 40000, valorAtual: 15000, investimentosLinkados: ['inv2'] },
    { id: 3, nome: 'Carro Novo', icon: Car, valorAlvo: 120000, valorAtual: 95000, investimentosLinkados: ['inv1'] },
    { id: 4, nome: 'Fundo de Emergência', icon: Shield, valorAlvo: 50000, valorAtual: 50000, investimentosLinkados: ['inv1', 'inv2'] },
    { id: 5, nome: 'Aposentadoria', icon: Briefcase, valorAlvo: 2000000, valorAtual: 450000, investimentosLinkados: ['inv3'] },
    { id: 6, nome: 'Educação dos Filhos', icon: School, valorAlvo: 250000, valorAtual: 80000, investimentosLinkados: ['inv1'] },
];