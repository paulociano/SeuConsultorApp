import { Utensils, Car, Home, Film, ShoppingCart, Stethoscope, HandCoins, Package } from 'lucide-react';

export const CATEGORIAS_FLUXO = {
    alimentacao: { label: 'Alimentação', icon: Utensils, color: '#f97316' },
    transporte: { label: 'Transporte', icon: Car, color: '#3b82f6' },
    moradia: { label: 'Moradia', icon: Home, color: '#ef4444' },
    lazer: { label: 'Lazer', icon: Film, color: '#14b8a6' },
    compras: { label: 'Compras', icon: ShoppingCart, color: '#8b5cf6' },
    saude: { label: 'Saúde', icon: Stethoscope, color: '#ec4899' },
    servicos: { label: 'Serviços e Taxas', icon: HandCoins, color: '#6b7280' },
    outros: { label: 'Outros', icon: Package, color: '#facc15' }
};