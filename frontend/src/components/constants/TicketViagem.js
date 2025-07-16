import Card from "../Card/Card";
import { useContext } from "react";
import { Plane, Pencil, Trash2 } from "lucide-react";
import { ThemeContext } from "../../ThemeContext";

export const TicketDeViagem = ({ viagem, onEdit, onDelete }) => {
    const { theme } = useContext(ThemeContext);
    const progresso = viagem.valorAlvo > 0 ? (viagem.milhasAtuais / viagem.milhasNecessarias) * 100 : 0;
    
    return (
        <Card className="flex flex-col md:flex-row overflow-hidden p-0">
            {/* Seção Esquerda - Informações do Voo */}
            <div className="p-4 md:p-6 flex-grow">
                <div className="flex justify-between items-start">
                    <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{viagem.companhia}</p>
                        <h3 className="text-xl font-bold text-slate-800 dark:text-white">{viagem.nomeDestino}</h3>
                    </div>
                    <Plane size={24} className="text-[#00d971]" />
                </div>
                <div className="flex items-end justify-between mt-4">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Origem</p>
                        <p className="text-2xl font-mono text-slate-800 dark:text-white">{viagem.origem}</p>
                    </div>
                    <div className="flex-grow flex items-center mx-4">
                        <div className="w-full border-t border-dashed border-slate-400 dark:border-slate-600"></div>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 text-right">Destino</p>
                        <p className="text-2xl font-mono text-slate-800 dark:text-white">{viagem.destino}</p>
                    </div>
                </div>
            </div>

            {/* Seção Direita - Progresso e Ações */}
            <div className="bg-slate-100 dark:bg-[#2a246f] p-4 md:p-6 md:border-l-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col justify-between md:w-1/3">
                <div>
                    <p className="text-sm font-medium text-slate-600 dark:text-gray-300">Progresso da Meta</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-white">{viagem.milhasAtuais.toLocaleString('pt-BR')} / <span className="text-lg text-gray-500 dark:text-gray-400">{viagem.milhasNecessarias.toLocaleString('pt-BR')}</span></p>
                    <div className="w-full bg-slate-300 dark:bg-slate-700 rounded-full h-2 mt-1">
                        <div className="bg-green-500 h-2 rounded-full" style={{ width: `${Math.min(progresso, 100)}%` }}></div>
                    </div>
                </div>
                <div className="flex justify-end gap-4 mt-4">
                    <button onClick={onEdit} className="text-gray-500 dark:text-gray-400 hover:text-blue-500"><Pencil size={18}/></button>
                    <button onClick={onDelete} className="text-gray-500 dark:text-gray-400 hover:text-red-500"><Trash2 size={18}/></button>
                </div>
            </div>
        </Card>
    );
};