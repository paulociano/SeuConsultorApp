import ModalNovaViagem from "../../components/Modals/ModalNovaViagem";
import { mockViagens } from "../../components/mocks/mockViagens";
import { TicketDeViagem } from "../../components/constants/TicketViagem";
import React, { useState, useEffect, useContext, useMemo } from "react";
import { PlusCircle, FileText, TrendingUp, DollarSign, Plane, AlertCircle, Sparkles, Gift, Wallet } from "lucide-react"; // Novos ícones para a nova seção
import { v4 as uuidv4 } from 'uuid';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ThemeContext } from "../../ThemeContext";

// Componente Toast básico para feedback visual
const Toast = ({ message, type, onClose }) => {
    const bgColor = type === 'success' ? 'bg-green-500' : 'bg-red-500';
    return (
        <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg text-white ${bgColor} flex items-center justify-between z-50`}>
            <span>{message}</span>
            <button onClick={onClose} className="ml-4 font-bold">&times;</button>
        </div>
    );
};

const TelaMilhas = () => {
    const { theme } = useContext(ThemeContext);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [viagemParaEditar, setViagemParaEditar] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [toastType, setToastType] = useState("success");
    const [filterType, setFilterType] = useState("all"); // 'all', 'miles', 'cashback'
    const [sortBy, setSortBy] = useState("recent"); // 'recent', 'cost-asc', 'cost-desc'
    const [valuePerMile, setValuePerMile] = useState(0.02); // Valor padrão da milha em BRL

    // Estados para a nova seção de cálculo de conversão/venda
    const [pointsToConvert, setPointsToConvert] = useState(0);
    const [bonusPercentage, setBonusPercentage] = useState(0);
    const [conversionRate, setConversionRate] = useState(1); // Ex: 1 ponto = 1 milha
    const [milesToSell, setMilesToSell] = useState(0);
    const [saleValuePerThousandMiles, setSaleValuePerThousandMiles] = useState(20); // Ex: R$20 por 1000 milhas

    // Conversion rate: R$ to Miles (e.g., 1.4 milhas for 1 real)
    const MILES_PER_REAL = 1.4;
    // Simple cashback rate (e.g., 1% cashback)
    const CASHBACK_RATE = 0.01;

    const calculateMilesAndCashback = (flightCostBRL, customValuePerMile) => {
        const estimatedMiles = flightCostBRL * MILES_PER_REAL;
        const estimatedCashback = flightCostBRL * CASHBACK_RATE;

        let recommendation = "";
        // Usar o valor customizado da milha para a recomendação
        if ((estimatedMiles * customValuePerMile) > estimatedCashback) {
            recommendation = "Acumular milhas parece ser mais vantajoso para esta viagem.";
        } else if ((estimatedMiles * customValuePerMile) < estimatedCashback) {
            recommendation = "O cashback pode ser mais interessante para esta viagem.";
        } else {
            recommendation = "Milhas e cashback oferecem valor similar para esta viagem.";
        }

        return { estimatedMiles, estimatedCashback, recommendation };
    };


    const [viagens, setViagens] = useState(() => {
        // Calculate estimatedMiles and estimatedCashback for mock data on initial load
        return mockViagens.map(v => {
            const { estimatedMiles, estimatedCashback, recommendation } = calculateMilesAndCashback(v.flightCostBRL, 0.02); // Use default valuePerMile for initial mock calculation
            return {
                ...v,
                estimatedMiles,
                estimatedCashback,
                comparisonRecommendation: v.comparisonRecommendation || recommendation, // Use calculated recommendation if not present
                mileExpirationDate: v.mileExpirationDate || (Math.random() > 0.7 ? `2025-${Math.floor(Math.random() * 12) + 1}-01` : null),
                programBalances: v.programBalances || [
                    { name: "Smiles", miles: Math.floor(Math.random() * 50000) + 10000 },
                    { name: "TudoAzul", miles: Math.floor(Math.random() * 50000) + 10000 },
                    { name: "Latam Pass", miles: Math.floor(Math.random() * 50000) + 10000 },
                ],
            };
        });
    });


    useEffect(() => {
        if (showToast) {
            const timer = setTimeout(() => {
                setShowToast(false);
                setToastMessage("");
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [showToast]);

    const displayToast = (message, type = "success") => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
    };

    // Funções de cálculo para a nova seção
    const calculateBonusConversion = useMemo(() => {
        if (pointsToConvert <= 0 || conversionRate <= 0) return 0;
        const milesWithoutBonus = pointsToConvert / conversionRate;
        const totalMiles = milesWithoutBonus * (1 + bonusPercentage / 100);
        return totalMiles;
    }, [pointsToConvert, bonusPercentage, conversionRate]);

    const calculateMileSaleValue = useMemo(() => {
        if (milesToSell <= 0 || saleValuePerThousandMiles <= 0) return 0;
        const value = (milesToSell / 1000) * saleValuePerThousandMiles;
        return value;
    }, [milesToSell, saleValuePerThousandMiles]);

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
        const { flightCostBRL } = dadosViagem;
        const { estimatedMiles, estimatedCashback, recommendation } = calculateMilesAndCashback(flightCostBRL, valuePerMile);

        const newViagemData = {
            ...dadosViagem,
            id: uuidv4(),
            estimatedMiles,
            estimatedCashback,
            comparisonRecommendation: recommendation,
            programSuggestions: ["Smiles", "TudoAzul", "Latam Pass"],
            // Adicionando um exemplo de data de expiração e saldos de programas (para o mock)
            mileExpirationDate: `2025-${Math.floor(Math.random() * 12) + 1}-01`, // Exemplo: uma data em 2025
            programBalances: [
                { name: "Smiles", miles: Math.floor(Math.random() * 50000) + 10000 },
                { name: "TudoAzul", miles: Math.floor(Math.random() * 50000) + 10000 },
                { name: "Latam Pass", miles: Math.floor(Math.random() * 50000) + 10000 },
            ]
        };

        if (viagemParaEditar) {
            setViagens(prev => prev.map(v => v.id === viagemParaEditar.id ? { ...newViagemData, id: viagemParaEditar.id } : v));
            displayToast("Viagem atualizada com sucesso!");
        } else {
            setViagens(prev => [...prev, newViagemData]);
            displayToast("Nova viagem adicionada!");
        }
        handleCloseModal();
    };

    const handleDeleteViagem = (id) => {
        if (window.confirm("Tem certeza que deseja excluir esta meta de viagem?")) {
            setViagens(prev => prev.filter(v => v.id !== id));
            displayToast("Viagem excluída.", "error");
        }
    };

    const handleExportPdf = () => {
        const input = document.getElementById('viagens-list');
        if (!input) {
            displayToast("Não foi possível encontrar a lista de viagens para exportar.", "error");
            return;
        }

        // Adiciona um estilo temporário para garantir que o PDF seja gerado corretamente
        const originalBg = input.style.backgroundColor;
        const originalColor = input.style.color;
        input.style.backgroundColor = theme === 'dark' ? '#1a202c' : '#ffffff'; // Fundo branco para o PDF
        input.style.color = theme === 'dark' ? '#e2e8f0' : '#1a202c'; // Cor do texto para o PDF

        html2canvas(input, {
            useCORS: true,
            scale: 2, // Aumenta a escala para melhor qualidade no PDF
            logging: true
        })
            .then((canvas) => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF('p', 'mm', 'a4');
                const imgProps = pdf.getImageProperties(imgData);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

                let position = 0;
                const pageHeight = pdf.internal.pageSize.getHeight();

                if (pdfHeight > pageHeight) {
                    let heightLeft = imgProps.height;
                    let nextY = 0;

                    while (heightLeft >= 0) {
                        nextY = -(imgProps.height - heightLeft);
                        pdf.addImage(imgData, 'PNG', 0, nextY * pdfWidth / imgProps.width, pdfWidth, pdfHeight);
                        heightLeft -= pageHeight * imgProps.width / pdfWidth;
                        if (heightLeft > 0) {
                            pdf.addPage();
                        }
                    }
                } else {
                    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
                }

                pdf.save("minhas_viagens.pdf");
                displayToast("PDF exportado com sucesso!");
            })
            .catch(err => {
                console.error("Erro ao exportar PDF:", err);
                displayToast("Erro ao exportar PDF.", "error");
            })
            .finally(() => {
                // Remove os estilos temporários
                input.style.backgroundColor = originalBg;
                input.style.color = originalColor;
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
                .then(() => displayToast('Texto da meta copiado para a área de transferência!'))
                .catch(err => {
                    console.error('Erro ao copiar: ', err);
                    displayToast('Falha ao copiar texto.', 'error');
                });
        }
    };

    const totalEstimatedMiles = useMemo(() =>
        viagens.reduce((sum, v) => sum + (v.estimatedMiles || 0), 0), [viagens]
    );

    const totalEstimatedCashback = useMemo(() =>
        viagens.reduce((sum, v) => sum + (v.estimatedCashback || 0), 0), [viagens]
    );

    const filteredAndSortedViagens = useMemo(() => {
        let filtered = [...viagens];

        // Filtering
        if (filterType === 'miles') {
            // FIX: Ensure comparisonRecommendation is a string before calling includes
            filtered = filtered.filter(v => (v.comparisonRecommendation || "").includes("milhas"));
        } else if (filterType === 'cashback') {
            // FIX: Ensure comparisonRecommendation is a string before calling includes
            filtered = filtered.filter(v => (v.comparisonRecommendation || "").includes("cashback"));
        }

        // Sorting
        if (sortBy === 'cost-asc') {
            filtered.sort((a, b) => (a.flightCostBRL || 0) - (b.flightCostBRL || 0));
        } else if (sortBy === 'cost-desc') {
            filtered.sort((a, b) => (b.flightCostBRL || 0) - (a.flightCostBRL || 0));
        } else { // 'recent' by default or if not specified
            filtered.sort((a, b) => new Date(b.dataIda) - new Date(a.dataIda));
        }

        return filtered;
    }, [viagens, filterType, sortBy]);


    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} p-6 transition-colors duration-300`}>
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Dashboard de Resumo */}
                <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-[#2a246f]' : 'bg-white'}`}>
                    <div className="flex flex-col items-center p-4 rounded-lg bg-slate-50 dark:bg-gray-800">
                        <Plane size={28} className="text-[#00d971] mb-2" />
                        <span className="text-xl font-semibold">{totalEstimatedMiles.toFixed(0)}</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Milhas Estimadas Totais</p>
                    </div>
                    <div className="flex flex-col items-center p-4 rounded-lg bg-slate-50 dark:bg-gray-800">
                        <DollarSign size={28} className="text-blue-500 mb-2" />
                        <span className="text-xl font-semibold">R${totalEstimatedCashback.toFixed(2)}</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Cashback Estimado Total</p>
                    </div>
                    <div className="flex flex-col items-center p-4 rounded-lg bg-slate-50 dark:bg-gray-800">
                        <Sparkles size={28} className="text-yellow-500 mb-2" />
                        <span className="text-xl font-semibold">R${valuePerMile.toFixed(2)}</span>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Valor p/ Milha (Seu Custo)</p>
                        <input
                            type="number"
                            step="0.001"
                            value={valuePerMile}
                            onChange={(e) => setValuePerMile(parseFloat(e.target.value) || 0)}
                            className={`w-24 mt-2 p-1 text-sm text-center rounded ${theme === 'dark' ? 'bg-gray-700 text-white' : 'bg-white text-gray-900'} border border-gray-300 dark:border-gray-600`}
                            aria-label="Definir valor por milha"
                        />
                    </div>
                </div>

                {/* Controles de Ação e Filtro/Ordenação */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                    <button onClick={handleOpenModalParaCriar} className="flex items-center gap-2 px-6 py-3 text-base font-semibold bg-[#00d971] text-white rounded-lg hover:brightness-90 transition-transform hover:scale-105 shadow-md">
                        <PlusCircle size={20} />
                        Adicionar Nova Viagem
                    </button>

                    <div className="flex gap-4 items-center">
                        {/* Filtros */}
                        <select
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value)}
                            className={`px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#00d971]`}
                            aria-label="Filtrar viagens"
                        >
                            <option value="all">Todas as Recomendações</option>
                            <option value="miles">Milhas Vantajosas</option>
                            <option value="cashback">Cashback Vantajoso</option>
                        </select>

                        {/* Ordenação */}
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className={`px-4 py-2 rounded-lg border ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'} focus:outline-none focus:ring-2 focus:ring-[#00d971]`}
                            aria-label="Ordenar viagens"
                        >
                            <option value="recent">Mais Recentes</option>
                            <option value="cost-asc">Custo (Menor p/ Maior)</option>
                            <option value="cost-desc">Custo (Maior p/ Menor)</option>
                        </select>

                        <button onClick={handleExportPdf} className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:brightness-90 transition-transform hover:scale-105 shadow-md">
                            <FileText size={18} />
                            Exportar PDF
                        </button>
                    </div>
                </div>

                {/* Nova Seção: Calculadora de Conversão e Venda de Milhas */}
                <div className={`p-6 rounded-xl shadow-lg ${theme === 'dark' ? 'bg-[#2a246f]' : 'bg-white'} space-y-6`}>
                    <h2 className="text-2xl font-bold text-center mb-4">Calculadora de Pontos e Milhas</h2>

                    {/* Conversão de Pontos para Milhas com Bonificação */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 md:gap-y-0 gap-x-8 items-center">
                        <div className="flex items-center gap-3 md:col-span-2">
                            <Gift size={24} className="text-purple-500" />
                            <h3 className="text-xl font-semibold">Conversão de Pontos com Bônus</h3>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <label htmlFor="pointsToConvert" className="text-sm font-medium text-gray-700 dark:text-gray-300">Pontos a Converter:</label>
                            <input
                                id="pointsToConvert"
                                type="number"
                                placeholder="0"
                                value={pointsToConvert}
                                onChange={(e) => setPointsToConvert(parseFloat(e.target.value) || 0)}
                                className={`p-2 rounded-lg border w-full ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="bonusPercentage" className="text-sm font-medium text-gray-700 dark:text-gray-300">Bônus (%):</label>
                            <input
                                id="bonusPercentage"
                                type="number"
                                placeholder="0"
                                value={bonusPercentage}
                                onChange={(e) => setBonusPercentage(parseFloat(e.target.value) || 0)}
                                className={`p-2 rounded-lg border w-full ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="conversionRate" className="text-sm font-medium text-gray-700 dark:text-gray-300">Taxa de Conversão (Ex: 1 para 1:1):</label>
                            <input
                                id="conversionRate"
                                type="number"
                                placeholder="1"
                                value={conversionRate}
                                onChange={(e) => setConversionRate(parseFloat(e.target.value) || 1)}
                                className={`p-2 rounded-lg border w-full ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                            />
                        </div>
                        
                        <div className="md:col-span-2 text-center text-lg font-medium pt-2">
                            Total de Milhas: <span className="text-[#00d971]">{calculateBonusConversion.toFixed(0)} milhas</span>
                            {calculateBonusConversion > 0 && (
                                <p className="text-sm text-gray-500 dark:text-gray-300">
                                    Considerando a bonificação, essa conversão pode ser muito vantajosa!
                                </p>
                            )}
                        </div>
                    </div>

                    <hr className={`border-t ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`} />

                    {/* Venda de Milhas em Dinheiro */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 md:gap-y-0 gap-x-8 items-center">
                        <div className="flex items-center gap-3 md:col-span-2">
                            <Wallet size={24} className="text-green-500" />
                            <h3 className="text-xl font-semibold">Venda de Milhas em Dinheiro</h3>
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="milesToSell" className="text-sm font-medium text-gray-700 dark:text-gray-300">Milhas a Vender:</label>
                            <input
                                id="milesToSell"
                                type="number"
                                placeholder="0"
                                value={milesToSell}
                                onChange={(e) => setMilesToSell(parseFloat(e.target.value) || 0)}
                                className={`p-2 rounded-lg border w-full ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="saleValuePerThousandMiles" className="text-sm font-medium text-gray-700 dark:text-gray-300">Valor por 1000 milhas (R$):</label>
                            <input
                                id="saleValuePerThousandMiles"
                                type="number"
                                step="0.01"
                                placeholder="20"
                                value={saleValuePerThousandMiles}
                                onChange={(e) => setSaleValuePerThousandMiles(parseFloat(e.target.value) || 0)}
                                className={`p-2 rounded-lg border w-full ${theme === 'dark' ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-900 border-gray-300'}`}
                            />
                        </div>
                        <div className="md:col-span-2 text-center text-lg font-medium pt-2">
                            Valor Estimado de Venda: <span className="text-blue-500">R${calculateMileSaleValue.toFixed(2)}</span>
                            {calculateMileSaleValue > 0 && (
                                <p className="text-sm text-gray-500 dark:text-gray-300">
                                    Compare este valor com outras formas de resgate para decidir o melhor uso.
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Lista de Viagens */}
                {filteredAndSortedViagens.length === 0 ? (
                    <div className={`p-10 rounded-xl text-center ${theme === 'dark' ? 'bg-[#2a246f]' : 'bg-white'} shadow-lg`}>
                        <TrendingUp size={64} className="mx-auto mb-4 text-[#00d971]" />
                        <h2 className="text-2xl font-semibold mb-2">Nenhuma viagem encontrada.</h2>
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                            Comece a planejar sua próxima aventura e veja como suas milhas e cashback podem te ajudar!
                        </p>
                        <button onClick={handleOpenModalParaCriar} className="flex items-center gap-2 mx-auto px-6 py-3 text-base font-semibold bg-[#00d971] text-white rounded-lg hover:brightness-90 transition-transform hover:scale-105 shadow-md">
                            <PlusCircle size={20} />
                            Adicionar Minha Primeira Viagem
                        </button>
                    </div>
                ) : (
                    <div id="viagens-list" className="space-y-6">
                        {filteredAndSortedViagens.map(viagem => (
                            <TicketDeViagem
                                key={viagem.id}
                                viagem={{
                                    ...viagem,
                                    // Passando o valor da milha para que o TicketDeViagem possa usá-lo se necessário
                                    valuePerMile: valuePerMile,
                                    // Adicionando o progresso para a viagem (exemplo, precisa de lógica real de milhas acumuladas)
                                    progressMiles: (viagem.estimatedMiles / (Math.random() * 100000 + 50000)) * 100 // Exemplo de progresso
                                }}
                                onEdit={() => handleOpenModalParaEditar(viagem)}
                                onDelete={() => handleDeleteViagem(viagem.id)}
                                onShare={handleShare}
                            >
                                {/* Exibição de alerta de expiração de milhas dentro do TicketDeViagem */}
                                {viagem.mileExpirationDate && new Date(viagem.mileExpirationDate) < new Date(new Date().setMonth(new Date().getMonth() + 3)) && (
                                    <div className="flex items-center text-orange-500 text-sm mt-2">
                                        <AlertCircle size={16} className="mr-1" />
                                        Milhas expiram em breve ({new Date(viagem.mileExpirationDate).toLocaleDateString()})!
                                    </div>
                                )}
                            </TicketDeViagem>
                        ))}
                    </div>
                )}

                <ModalNovaViagem
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                    onSave={handleSaveViagem}
                    viagemExistente={viagemParaEditar}
                />
            </div>
            {showToast && <Toast message={toastMessage} type={toastType} onClose={() => setShowToast(false)} />}
        </div>
    );
};

export default TelaMilhas;