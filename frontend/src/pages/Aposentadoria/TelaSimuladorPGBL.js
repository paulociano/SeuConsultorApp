import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/formatters';
import { Save } from 'lucide-react';
// 1. Importar a store de aposentadoria
import { useAposentadoriaStore } from '../../stores/useAposentadoriaStore';

// --- Constantes e Funções de Cálculo (sem alterações) ---
const TETO_SIMPLIFICADO = 16754.34;
const TETO_PGBL_PORCENTAGEM = 0.12;
const DEDUCAO_DEPENDENTE_MENSAL = 189.59;
const TETO_INSS_MENSAL = 908.85;

const calcularINSSMensal = (salario) => {
  const faixas = [
    { teto: 1412.00, aliquota: 0.075 }, { teto: 2666.68, aliquota: 0.09 },
    { teto: 4000.03, aliquota: 0.12 }, { teto: 7786.02, aliquota: 0.14 },
  ];
  let inss = 0; let anterior = 0;
  for (let i = 0; i < faixas.length; i++) {
    const faixa = faixas[i];
    if (salario > faixa.teto) {
      inss += (faixa.teto - anterior) * faixa.aliquota; anterior = faixa.teto;
    } else {
      inss += (salario - anterior) * faixa.aliquota; break;
    }
  }
  if (salario > 7786.02) return TETO_INSS_MENSAL;
  return parseFloat(inss.toFixed(2));
};

const calcularIRRF = (salarioMensal, inssMensal, numDependentes) => {
  const baseMensal = salarioMensal - inssMensal - (DEDUCAO_DEPENDENTE_MENSAL * numDependentes);
  const faixas = [
    { limite: 2259.20, aliquota: 0, deducao: 0 }, { limite: 2826.65, aliquota: 0.075, deducao: 169.44 },
    { limite: 3751.05, aliquota: 0.15, deducao: 381.44 }, { limite: 4664.68, aliquota: 0.225, deducao: 662.77 },
    { limite: Infinity, aliquota: 0.275, deducao: 896.00 },
  ];
  const faixa = faixas.find(f => baseMensal <= f.limite);
  return parseFloat(((Math.max(0, baseMensal * faixa.aliquota - faixa.deducao)) * 12).toFixed(2));
};

const calcularIRAnual = (baseAnual) => {
    const baseMensal = baseAnual / 12;
    const faixas = [
      { limite: 2259.20, aliquota: 0, deducao: 0 }, { limite: 2826.65, aliquota: 0.075, deducao: 169.44 },
      { limite: 3751.05, aliquota: 0.15, deducao: 381.44 }, { limite: 4664.68, aliquota: 0.225, deducao: 662.77 },
      { limite: Infinity, aliquota: 0.275, deducao: 896.00 },
    ];
    const faixa = faixas.find(f => baseMensal <= f.limite);
    return parseFloat(((Math.max(0, baseMensal * faixa.aliquota - faixa.deducao)) * 12).toFixed(2));
};

// --- Componentes de UI (sem alterações) ---
const AnimatedCard = ({ children }) => ( <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-white dark:bg-[#201b5d] p-6 rounded-xl shadow-lg border border-slate-200 dark:border-transparent">{children}</motion.div> );
const Input = ({ label, value, setValue, disabled = false }) => ( <div className="flex flex-col"><label className="text-slate-600 dark:text-white text-sm mb-1 font-medium">{label}</label><input type="number" value={value} onChange={(e) => !disabled && setValue(parseFloat(e.target.value) || 0)} className="rounded-lg px-3 py-2 border border-slate-300 dark:border-[#3e388b] bg-white dark:bg-[#2a246f] text-slate-800 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-[#00d971]" disabled={disabled}/></div> );
const TabButton = ({ label, active, onClick }) => ( <button onClick={onClick} className={`px-4 py-2 rounded-t-lg font-medium transition-colors duration-300 ${ active ? 'bg-[#201b5d] text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600'}`}>{label}</button> );

// --- Componente Principal (Refatorado) ---
// 2. As props 'dadosIniciais' e 'onSave' foram removidas
const TelaSimuladorPGBL = () => {
  // 3. Conectar ao estado e às ações da store
  const { simuladorPgblData, isLoading, fetchAposentadoria, saveSimuladorPgbl } = useAposentadoriaStore();
  
  const [activeTab, setActiveTab] = useState('Entradas');
  const [rendaBruta, setRendaBruta] = useState(80000);
  const [educacao, setEducacao] = useState(3000);
  const [saude, setSaude] = useState(2000);
  const [numDependentes, setNumDependentes] = useState(2);
  const [outras, setOutras] = useState(1000);
  const [pgbl, setPgbl] = useState(9600);
  const [inss, setInss] = useState(0);
  const [irrf, setIrrf] = useState(0);

  // 4. Chamar a ação para buscar os dados na montagem do componente
  useEffect(() => {
    fetchAposentadoria();
  }, [fetchAposentadoria]);
  
  // 5. Este useEffect agora sincroniza o estado com os dados da store
  useEffect(() => {
    if (simuladorPgblData) {
        setRendaBruta(simuladorPgblData.rendaBruta || 80000);
        setEducacao(simuladorPgblData.educacao || 3000);
        setSaude(simuladorPgblData.saude || 2000);
        setNumDependentes(simuladorPgblData.numDependentes || 2);
        setOutras(simuladorPgblData.outras || 1000);
        setPgbl(simuladorPgblData.pgbl || 9600);
    }
  }, [simuladorPgblData]);

  useEffect(() => {
    const rendaMensal = rendaBruta / 12;
    const inssMensal = calcularINSSMensal(rendaMensal);
    const inssAnual = parseFloat((inssMensal * 12).toFixed(2));
    const irrfAnual = calcularIRRF(rendaMensal, inssMensal, numDependentes);
    setInss(inssAnual); setIrrf(irrfAnual);
    const limitePgbl = parseFloat((rendaBruta * TETO_PGBL_PORCENTAGEM).toFixed(2));
    if (pgbl > limitePgbl) { setPgbl(limitePgbl); }
  }, [rendaBruta, numDependentes, pgbl]);

  const resultado = useMemo(() => {
    const totalDeducoes = inss + educacao + saude + outras + (numDependentes * DEDUCAO_DEPENDENTE_MENSAL * 12);
    const pgblMaxPermitido = rendaBruta * TETO_PGBL_PORCENTAGEM;
    const pgblDedutivel = Math.min(pgbl, pgblMaxPermitido);
    const baseCompleta = rendaBruta - totalDeducoes - pgblDedutivel;
    const irCompleta = calcularIRAnual(baseCompleta);
    const resultadoFinalCompleta = irCompleta - irrf;
    const descontoSimplificado = Math.min(rendaBruta * 0.2, TETO_SIMPLIFICADO);
    const baseSimplificada = rendaBruta - descontoSimplificado;
    const irSimplificada = calcularIRAnual(baseSimplificada);
    const resultadoFinalSimplificada = irSimplificada - irrf;
    const melhorProduto = resultadoFinalCompleta < resultadoFinalSimplificada ? 'PGBL' : 'VGBL';
    const economiaFinal = Math.abs(resultadoFinalCompleta - resultadoFinalSimplificada);
    return { baseCompleta, baseSimplificada, irCompleta, irSimplificada, resultadoFinalCompleta, resultadoFinalSimplificada, economiaFinal, melhorProduto, pgblMaxPermitido };
  }, [rendaBruta, inss, irrf, educacao, saude, outras, pgbl, numDependentes]);

  // 6. O botão de salvar agora chama a ação da store
  const handleSaveClick = () => {
    const dadosParaSalvar = { rendaBruta, educacao, saude, numDependentes, outras, pgbl };
    saveSimuladorPgbl(dadosParaSalvar);
  };

  // 7. Adicionado um estado de carregamento
  if (isLoading) {
    return (
        <div className="flex justify-center items-center h-[calc(100vh-8rem)]">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-[#00d971]"></div>
        </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-2">
            <TabButton label="Entradas" active={activeTab === 'Entradas'} onClick={() => setActiveTab('Entradas')} />
            <TabButton label="Resultados" active={activeTab === 'Resultados'} onClick={() => setActiveTab('Resultados')} />
        </div>
        <button onClick={handleSaveClick} className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-black bg-[#00d971] rounded-lg hover:brightness-90 transition-colors">
            <Save size={16} /> Salvar Dados
        </button>
      </div>

      {activeTab === 'Entradas' && (
        <AnimatedCard>
          <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">Parâmetros de Simulação</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <Input label="Renda Bruta Anual" value={rendaBruta} setValue={setRendaBruta} />
            <Input label="Despesas com Educação" value={educacao} setValue={setEducacao} />
            <Input label="Despesas com Saúde" value={saude} setValue={setSaude} />
            <Input label="Nº de Dependentes" value={numDependentes} setValue={setNumDependentes} />
            <Input label="Outras Deduções (Ex: Pensão)" value={outras} setValue={setOutras} />
            <Input label="Contribuição PGBL" value={pgbl} setValue={setPgbl} />
            <Input label="INSS Anual (Calculado)" value={inss} setValue={() => {}} disabled />
            <Input label="IRRF Anual (Calculado)" value={irrf} setValue={() => {}} disabled />
          </div>
        </AnimatedCard>
      )}

      {activeTab === 'Resultados' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center">
          <AnimatedCard>
            <h3 className="font-bold text-slate-800 dark:text-white mb-2">Modelo Completo</h3>
            <p className="text-slate-600 dark:text-slate-300">Base de Cálculo: {formatCurrency(resultado.baseCompleta)}</p>
            <p className="text-slate-600 dark:text-slate-300">IR Devido: {formatCurrency(resultado.irCompleta)}</p>
            <p className={`mt-2 font-bold ${resultado.resultadoFinalCompleta > 0 ? 'text-red-500' : 'text-green-500'}`}>{resultado.resultadoFinalCompleta > 0 ? `A Pagar: ${formatCurrency(resultado.resultadoFinalCompleta)}` : `A Restituir: ${formatCurrency(-resultado.resultadoFinalCompleta)}`}</p>
          </AnimatedCard>
          <AnimatedCard>
            <h3 className="font-bold text-slate-800 dark:text-white mb-2">Modelo Simplificado</h3>
            <p className="text-slate-600 dark:text-slate-300">Base de Cálculo: {formatCurrency(resultado.baseSimplificada)}</p>
            <p className="text-slate-600 dark:text-slate-300">IR Devido: {formatCurrency(resultado.irSimplificada)}</p>
            <p className={`mt-2 font-bold ${resultado.resultadoFinalSimplificada > 0 ? 'text-red-500' : 'text-green-500'}`}>{resultado.resultadoFinalSimplificada > 0 ? `A Pagar: ${formatCurrency(resultado.resultadoFinalSimplificada)}` : `A Restituir: ${formatCurrency(-resultado.resultadoFinalSimplificada)}`}</p>
          </AnimatedCard>
          <AnimatedCard>
            <h3 className="font-bold text-slate-800 dark:text-white mb-2">Comparativo e Sugestão</h3>
            <p className="text-slate-600 dark:text-slate-300">Melhor Produto: <strong className="text-[#00d971]">{resultado.melhorProduto}</strong></p>
            <p className="text-slate-600 dark:text-slate-300">Economia de Imposto: <strong className="text-blue-400">{formatCurrency(resultado.economiaFinal)}</strong></p>
            <p className="text-slate-600 dark:text-slate-300">Limite PGBL (12%): <strong className="text-yellow-400">{formatCurrency(resultado.pgblMaxPermitido)}</strong></p>
          </AnimatedCard>
        </div>
      )}
    </div>
  );
};

export default TelaSimuladorPGBL;