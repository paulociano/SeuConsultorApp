import ModalNovaViagem from "../../components/Modals/ModalNovaViagem";
import { mockViagens } from "../../components/mocks/mockViagens";
import { TicketDeViagem } from "../../components/constants/TicketViagem";
import { useState } from "react";
import { PlusCircle, FileText } from "lucide-react"; // Added Share2 and FileText icons
import { v4 as uuidv4 } from 'uuid';
import html2canvas from 'html2canvas'; // For PDF export
import jsPDF from 'jspdf'; // For PDF export

const TelaMilhas = () => {
    const [viagens, setViagens] = useState(mockViagens);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viagemParaEditar, setViagemParaEditar] = useState(null);

    // Conversion rate: R$ to Miles (e.g., 1.4 milhas for 1 real)
    const MILES_PER_REAL = 1.4;
    // Simple cashback rate (e.g., 1% cashback)
    const CASHBACK_RATE = 0.01;

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

    const calculateMilesAndCashback = (flightCostBRL) => {
        const estimatedMiles = flightCostBRL * MILES_PER_REAL;
        const estimatedCashback = flightCostBRL * CASHBACK_RATE;

        let recommendation = "";
        if (estimatedMiles * (1/MILES_PER_REAL) > estimatedCashback) { // Rough estimation of miles value
            recommendation = "Acumular milhas parece ser mais vantajoso para esta viagem.";
        } else {
            recommendation = "O cashback pode ser mais interessante para esta viagem.";
        }

        return { estimatedMiles, estimatedCashback, recommendation };
    };

    const handleSaveViagem = (dadosViagem) => {
        const { flightCostBRL } = dadosViagem;
        const { estimatedMiles, estimatedCashback, recommendation } = calculateMilesAndCashback(flightCostBRL);

        const newViagemData = {
            ...dadosViagem,
            id: uuidv4(),
            estimatedMiles,
            estimatedCashback,
            comparisonRecommendation: recommendation,
            // Add suggestions for programs based on common knowledge
            programSuggestions: ["Smiles", "TudoAzul", "Latam Pass"]
        };

        if (viagemParaEditar) {
            // Edita uma viagem existente
            setViagens(prev => prev.map(v => v.id === viagemParaEditar.id ? { ...newViagemData, id: viagemParaEditar.id } : v));
        } else {
            // Adiciona uma nova viagem
            setViagens(prev => [...prev, newViagemData]);
        }
        handleCloseModal();
    };

    const handleDeleteViagem = (id) => {
        if (window.confirm("Tem certeza que deseja excluir esta meta de viagem?")) {
            setViagens(prev => prev.filter(v => v.id !== id));
        }
    };

    const handleExportPdf = () => {
        const input = document.getElementById('viagens-list'); // Assuming an ID for the list container
        html2canvas(input)
            .then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF();
                const imgProps= pdf.getImageProperties(imgData);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
                pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
                pdf.save("minhas_viagens.pdf");
            });
    };

    const handleShare = (platform, viagem) => {
        const shareText = `Confira minha meta de viagem para ${viagem.destino}! Preço estimado em R$${viagem.flightCostBRL?.toFixed(2)}, equivalendo a aproximadamente ${viagem.estimatedMiles?.toFixed(0)} milhas. ${viagem.comparisonRecommendation}. Planeje sua viagem com ${viagem.programSuggestions?.join(', ')}. #viagem #milhas #cashback`;

        if (platform === 'facebook') {
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}&quote=${encodeURIComponent(shareText)}`, '_blank');
        } else if (platform === 'twitter') {
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`, '_blank');
        } else if (platform === 'copy') {
            navigator.clipboard.writeText(shareText)
                .then(() => alert('Texto da meta copiado para a área de transferência!'))
                .catch(err => console.error('Erro ao copiar: ', err));
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-6">
            <div className="flex justify-between items-center">
                <button onClick={handleOpenModalParaCriar} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-[#00d971] text-black rounded-lg hover:brightness-90 transition-transform hover:scale-105">
                    <PlusCircle size={18} />
                    Adicionar Viagem
                </button>
                <div className="flex gap-4">
                    <button onClick={handleExportPdf} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-blue-500 text-white rounded-lg hover:brightness-90 transition-transform hover:scale-105">
                        <FileText size={18} />
                        Exportar PDF
                    </button>
                </div>
            </div>

            <div id="viagens-list" className="space-y-6"> {/* Added ID for PDF export */}
                {viagens.map(viagem => (
                    <TicketDeViagem
                        key={viagem.id}
                        viagem={viagem}
                        onEdit={() => handleOpenModalParaEditar(viagem)}
                        onDelete={() => handleDeleteViagem(viagem.id)}
                        onShare={handleShare} // Pass handleShare to TicketDeViagem
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