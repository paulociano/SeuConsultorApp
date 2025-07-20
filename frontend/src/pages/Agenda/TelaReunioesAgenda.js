import { useState } from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@radix-ui/react-tabs";
import { motion } from "framer-motion";
import { Calendar, FileText } from "lucide-react";
import clsx from "clsx";

export default function TelaReunioesAgenda() {
  const [atas, setAtas] = useState([]);
  const [agenda, setAgenda] = useState([]);
  const [novaAta, setNovaAta] = useState({ titulo: "", resumo: "" });
  const [novoEvento, setNovoEvento] = useState({ titulo: "", data: "", status: "Marcado" });

  const adicionarAta = () => {
    if (!novaAta.titulo) return;
    setAtas((prev) => [...prev, { ...novaAta, data: new Date().toLocaleDateString() }]);
    setNovaAta({ titulo: "", resumo: "" });
  };

  const adicionarEvento = () => {
    if (!novoEvento.titulo || !novoEvento.data) return;
    setAgenda((prev) => [...prev, { ...novoEvento }]);
    setNovoEvento({ titulo: "", data: "", status: "Marcado" });
  };

  const atualizarStatus = (index, status) => {
    setAgenda((prev) => prev.map((item, i) => (i === index ? { ...item, status } : item)));
  };

  const statusStyles = {
    Marcado: "bg-[#00d971] text-black",
    Realizado: "bg-[#201b5d] text-white",
    Cancelado: "bg-red-500 text-white",
  };

  return (
    <div className="max-w-5xl mx-auto mt-10 px-4">
      <Tabs defaultValue="atas">
        <TabsList className="flex gap-2 mb-6 border-b pb-2 border-slate-200 dark:border-slate-700">
          <TabsTrigger
            value="atas"
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 data-[state=active]:text-black data-[state=active]:dark:text-white data-[state=active]:border-b-2 data-[state=active]:border-[#00d971]"
          >
            <FileText className="inline mr-1" size={16} />
            Atas de Reuniões
          </TabsTrigger>
          <TabsTrigger
            value="agenda"
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 data-[state=active]:text-black data-[state=active]:dark:text-white data-[state=active]:border-b-2 data-[state=active]:border-[#201b5d]"
          >
            <Calendar className="inline mr-1" size={16} />
            Agenda
          </TabsTrigger>
        </TabsList>

        <TabsContent value="atas">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white dark:bg-[#201b5d] p-6 rounded-xl shadow space-y-4"
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Nova Ata</h2>
            <input
              type="text"
              placeholder="Título"
              value={novaAta.titulo}
              onChange={(e) => setNovaAta({ ...novaAta, titulo: e.target.value })}
              className="w-full p-2 rounded-md border dark:bg-gray-700 dark:text-white"
            />
            <textarea
              placeholder="Resumo"
              value={novaAta.resumo}
              onChange={(e) => setNovaAta({ ...novaAta, resumo: e.target.value })}
              className="w-full p-2 rounded-md border dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={adicionarAta}
              className="bg-[#00d971] hover:bg-[#00c761] text-black font-semibold px-4 py-2 rounded"
            >
              Salvar Ata
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-6">
              {atas.map((ata, idx) => (
                <div key={idx} className="p-4 border rounded-lg dark:border-[#3e388b] bg-white dark:bg-[#201b5d]">
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{ata.titulo}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{ata.data}</p>
                  <p className="text-gray-700 dark:text-gray-200 text-sm">{ata.resumo}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </TabsContent>

        <TabsContent value="agenda">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="bg-white dark:bg-[#201b5d] p-6 rounded-xl shadow space-y-4"
          >
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Novo Compromisso</h2>
            <input
              type="text"
              placeholder="Título"
              value={novoEvento.titulo}
              onChange={(e) => setNovoEvento({ ...novoEvento, titulo: e.target.value })}
              className="w-full p-2 rounded-md border dark:bg-gray-700 dark:text-white"
            />
            <input
              type="datetime-local"
              value={novoEvento.data}
              onChange={(e) => setNovoEvento({ ...novoEvento, data: e.target.value })}
              className="w-full p-2 rounded-md border dark:bg-gray-700 dark:text-white"
            />
            <button
              onClick={adicionarEvento}
              className="bg-[#201b5d] hover:bg-[#3e388b] text-white font-semibold px-4 py-2 rounded"
            >
              Adicionar Compromisso
            </button>

            <div className="space-y-4 pt-6">
              {agenda.map((item, idx) => (
                <div key={idx} className="p-4 border rounded-lg dark:border-[#3e388b] bg-white dark:bg-[#201b5d]">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white">{item.titulo}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {new Date(item.data).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {["Marcado", "Realizado", "Cancelado"].map((status) => (
                        <button
                          key={status}
                          onClick={() => atualizarStatus(idx, status)}
                          className={clsx(
                            "px-2 py-1 text-xs rounded",
                            item.status === status
                              ? statusStyles[status]
                              : "bg-gray-300 dark:bg-gray-600 text-black dark:text-white"
                          )}
                        >
                          {status}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}