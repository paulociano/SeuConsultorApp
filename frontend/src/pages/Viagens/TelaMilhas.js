import ModalNovaViagem from "../../components/Modals/ModalNovaViagem";
import { mockViagens } from "../../components/mocks/mockViagens";
import { TicketDeViagem } from "../../components/constants/TicketViagem";
import { useState } from "react";
import { PlusCircle } from "lucide-react";
import { v4 as uuidv4 } from 'uuid';

const TelaMilhas = () => {
    const [viagens, setViagens] = useState(mockViagens);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viagemParaEditar, setViagemParaEditar] = useState(null);

    const handleOpenModalParaCriar = () => {
        setViagemParaEditar(null);
        setIsModalOpen(true);
    };

    const handleOpenModalParaEditar = (viagem) => {
        setViagemParaEditar(viagem);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setViagemParaEditar(null);
    };

    const handleSaveViagem = (dadosViagem) => {
        if (viagemParaEditar) {
            // Edita uma viagem existente
            setViagens(prev => prev.map(v => v.id === viagemParaEditar.id ? { ...v, ...dadosViagem } : v));
        } else {
            // Adiciona uma nova viagem
            setViagens(prev => [...prev, { ...dadosViagem, id: uuidv4() }]);
        }
    };
    
    const handleDeleteViagem = (id) => {
        if (window.confirm("Tem certeza que deseja excluir esta meta de viagem?")) {
            setViagens(prev => prev.filter(v => v.id !== id));
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <button onClick={handleOpenModalParaCriar} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#00d971] text-black rounded-lg hover:brightness-90 transition-transform hover:scale-105">
                    <PlusCircle size={18} />
                    Adicionar Viagem
                </button>
            </div>

            <div className="space-y-6">
                {viagens.map(viagem => (
                    <TicketDeViagem 
                        key={viagem.id} 
                        viagem={viagem}
                        onEdit={() => handleOpenModalParaEditar(viagem)}
                        onDelete={() => handleDeleteViagem(viagem.id)}
                    />
                ))}
            </div>

            <ModalNovaViagem
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSave={handleSaveViagem}
                viagemExistente={viagemParaEditar}
            />
        </div>
    );
};

export default TelaMilhas;