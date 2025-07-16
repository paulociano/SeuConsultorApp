import { formatCurrency } from "../../utils/formatters";

const CardDeComparacao = ({ cartao }) => {
    // Se nenhum cartão for selecionado, mostra o placeholder
    if (!cartao) {
        return (
            <div className="border border-dashed border-slate-300 dark:border-slate-700 rounded-lg h-[200px] flex items-center justify-center">
                <p className="text-slate-500 dark:text-gray-400">Selecione um cartão acima</p>
            </div>
        );
    }

    // Lógica para processar os dados do JSON
    const anuidadeNumerica = parseFloat(cartao.anuidade?.replace('R$', '').replace('.', '').replace(',', '.')) || 0;
    const beneficiosLista = cartao.outros_beneficios?.split('|').map(b => b.trim()) || [];
    const temSalaVip = cartao.salas_vip && cartao.salas_vip.toLowerCase() !== 'não tem';

    return (
        // O componente agora começa diretamente com os detalhes
        <div className="space-y-4">
            {cartao.matchScore && (
                <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Seu Match Score</p>
                    <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                            <div key={i} className={`h-2 flex-1 rounded-full ${i < cartao.matchScore ? 'bg-green-500' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
                        ))}
                    </div>
                </div>
            )}

            <div className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg space-y-3 text-sm">
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Pontuação:</span><span className="font-semibold text-slate-800 dark:text-white text-right">{cartao.acúmulo_de_pontos}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Anuidade:</span><span className="font-semibold text-slate-800 dark:text-white">{formatCurrency(anuidadeNumerica)}</span></div>
                <div className="flex justify-between"><span className="text-gray-500 dark:text-gray-400">Sala VIP:</span><span className={`font-semibold ${temSalaVip ? 'text-green-500' : 'text-red-500'}`}>{temSalaVip ? 'Sim' : 'Não'}</span></div>
                
                {beneficiosLista.length > 0 && (
                    <div className="pt-2">
                        <p className="font-medium text-gray-500 dark:text-gray-400 mb-1">Outros Benefícios:</p>
                        <ul className="list-disc list-inside text-slate-800 dark:text-white space-y-1">
                            {beneficiosLista.map((b, i) => <li key={i}>{b}</li>)}
                        </ul>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CardDeComparacao;