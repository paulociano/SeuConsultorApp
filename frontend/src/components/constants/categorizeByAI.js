export const categorizeByAI = (description) => {
    if (!description || typeof description !== 'string') {
        console.warn('⚠️ Descrição inválida passada para categorizeByAI:', description);
        return null;
    }

    const desc = description.toLowerCase();

    if (desc.includes('ifood') || desc.includes('restaurante')) return 'alimentacao';
    if (desc.includes('uber') || desc.includes('99') || desc.includes('posto')) return 'transporte';
    if (desc.includes('supermercado') || desc.includes('mercado')) return 'alimentacao';
    if (desc.includes('cinema') || desc.includes('show') || desc.includes('bar')) return 'lazer';
    if (desc.includes('amazon') || desc.includes('livraria') || desc.includes('loja')) return 'compras';
    if (desc.includes('farmácia') || desc.includes('droga')) return 'saude';
    if (desc.includes('net') || desc.includes('claro') || desc.includes('taxa')) return 'servicos';

    return 'outros';
};
