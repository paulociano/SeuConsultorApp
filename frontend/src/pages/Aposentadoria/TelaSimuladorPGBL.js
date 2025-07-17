import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { formatCurrency } from '../../utils/formatters';

const TETO_SIMPLIFICADO = 16754.34;
const TETO_PGBL_PORCENTAGEM = 0.12;
const DEDUCAO_DEPENDENTE_MENSAL = 189.59;
const TETO_INSS_MENSAL = 908.85;

const calcularIR = (base) => {
  const faixas = [
    { limite: 2428.80, aliquota: 0, deducao: 0 },
    { limite: 2826.65, aliquota: 0.075, deducao: 182.16 },
    { limite: 3751.05, aliquota: 0.15, deducao: 394.16 },
    { limite: 4664.68, aliquota: 0.225, deducao: 675.49 },
    { limite: Infinity, aliquota: 0.275, deducao: 908.73 },
  ];
  const baseMensal = base / 12;
  const faixa = faixas.find(f => baseMensal <= f.limite);
  const irMensal = Math.max(0, baseMensal * faixa.aliquota - faixa.deducao);
  return parseFloat((irMensal * 12).toFixed(2));
};

const calcularINSSMensal = (salario) => {
  const faixas = [
    { teto: 1412.00, aliquota: 0.075 },
    { teto: 2666.68, aliquota: 0.09 },
    { teto: 4000.03, aliquota: 0.12 },
    { teto: 7786.02, aliquota: 0.14 },
  ];
  let inss = 0;
  let anterior = 0;

  for (let i = 0; i < faixas.length; i++) {
    const faixa = faixas[i];
    if (salario > faixa.teto) {
      inss += (faixa.teto - anterior) * faixa.aliquota;
      anterior = faixa.teto;
    } else {
      inss += (salario - anterior) * faixa.aliquota;
      break;
    }
  }

  if (salario > 7786.02) {
    return TETO_INSS_MENSAL;
  }

  return parseFloat(inss.toFixed(2));
};

const calcularIRRF = (salarioMensal, inssMensal, numDependentes) => {
  const baseMensal = salarioMensal - inssMensal - (DEDUCAO_DEPENDENTE_MENSAL * numDependentes);
  const faixas = [
    { limite: 2259.20, aliquota: 0, deducao: 0 },
    { limite: 2826.65, aliquota: 0.075, deducao: 169.44 },
    { limite: 3751.05, aliquota: 0.15, deducao: 381.44 },
    { limite: 4664.68, aliquota: 0.225, deducao: 662.77 },
    { limite: Infinity, aliquota: 0.275, deducao: 896.00 },
  ];
  const faixa = faixas.find(f => baseMensal <= f.limite);
  const irrfMensal = Math.max(0, baseMensal * faixa.aliquota - faixa.deducao);
  return parseFloat((irrfMensal * 12).toFixed(2));
};

const AnimatedCard = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
    className="bg-white dark:bg-[#201b5d] p-4 rounded-xl shadow-lg border border-slate-200 dark:border-transparent"
  >
    {children}
  </motion.div>
);

const Input = ({ label, value, setValue, disabled = false }) => (
  <div className="flex flex-col">
    <label className="text-slate-800 dark:text-white text-sm mb-1 font-medium">{label}</label>
    <input
      type="number"
      value={value}
      onChange={(e) => !disabled && setValue(parseFloat(e.target.value) || 0)}
      className="rounded-lg px-3 py-2 border border-slate-300 bg-white dark:bg-[#1f1f3a] text-slate-800 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
      disabled={disabled}
    />
  </div>
);

const TabButton = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-t-lg font-medium transition-colors duration-300 ${
      active ? 'bg-[#00d971] text-white' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'
    }`}
  >
    {label}
  </button>
);

const TelaSimuladorIR = () => {
  const [activeTab, setActiveTab] = useState('Entradas');

  const [rendaBruta, setRendaBruta] = useState(80000);
  const [inss, setInss] = useState(0);
  const [irrf, setIrrf] = useState(0);
  const [educacao, setEducacao] = useState(3000);
  const [saude, setSaude] = useState(2000);
  const [numDependentes, setNumDependentes] = useState(2);
  const [outras, setOutras] = useState(1000);
  const [pgbl, setPgbl] = useState(9600);

  useEffect(() => {
  const rendaMensal = rendaBruta / 12;
  const inssMensal = calcularINSSMensal(rendaMensal);
  const inssAnual = parseFloat((inssMensal * 12).toFixed(2));
  const irrfAnual = calcularIRRF(rendaMensal, inssMensal, numDependentes);

  setInss(inssAnual);
  setIrrf(irrfAnual);

  const limitePgbl = parseFloat((rendaBruta * TETO_PGBL_PORCENTAGEM).toFixed(2));
  if (pgbl > limitePgbl) {
    setPgbl(limitePgbl);
  }
  }, [rendaBruta, numDependentes, pgbl]);

  const resultado = useMemo(() => {
    const totalDeducoes = inss + educacao + saude + outras;
    const pgblMaxPermitido = rendaBruta * TETO_PGBL_PORCENTAGEM;
    const pgblDedutivel = Math.min(pgbl, pgblMaxPermitido);

    const baseCompleta = rendaBruta - totalDeducoes - pgblDedutivel;
    const irCompleta = calcularIR(baseCompleta);
    const resultadoFinalCompleta = irCompleta - irrf;

    const descontoSimplificado = Math.min(rendaBruta * 0.2, TETO_SIMPLIFICADO);
    const baseSimplificada = rendaBruta - descontoSimplificado;
    const irSimplificada = calcularIR(baseSimplificada);
    const resultadoFinalSimplificada = irSimplificada - irrf;

    const melhorProduto = resultadoFinalCompleta < resultadoFinalSimplificada ? 'PGBL' : 'VGBL';
    const economiaFinal = Math.abs(resultadoFinalCompleta - resultadoFinalSimplificada);

    return {
      baseCompleta,
      baseSimplificada,
      irCompleta,
      irSimplificada,
      resultadoFinalCompleta,
      resultadoFinalSimplificada,
      economiaFinal,
      melhorProduto,
      pgblMaxPermitido
    };
  }, [rendaBruta, inss, irrf, educacao, saude, outras, pgbl]);

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      <div className="flex space-x-2 mb-4">
        <TabButton label="Entradas" active={activeTab === 'Entradas'} onClick={() => setActiveTab('Entradas')} />
        <TabButton label="Resultados" active={activeTab === 'Resultados'} onClick={() => setActiveTab('Resultados')} />
      </div>

      {activeTab === 'Entradas' && (
        <AnimatedCard>
          <h2 className="text-xl font-bold mb-4 text-slate-800 dark:text-white">Parâmetros de Simulação</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 text-sm">
            <Input label="Renda Bruta Anual" value={rendaBruta} setValue={setRendaBruta} />
            <Input label="Educação" value={educacao} setValue={setEducacao} />
            <Input label="Saúde" value={saude} setValue={setSaude} />
            <Input label="Nº de Dependentes" value={numDependentes} setValue={setNumDependentes} />
            <Input label="Outras Deduções" value={outras} setValue={setOutras} />
            <Input label="PGBL" value={pgbl} setValue={setPgbl} />
            <Input label="INSS Anual" value={inss} setValue={() => {}} disabled />
            <Input label="IRRF Anual" value={irrf} setValue={() => {}} disabled />
          </div>
        </AnimatedCard>
      )}

      {activeTab === 'Resultados' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-center">
          <AnimatedCard>
            <h3 className="font-bold text-slate-800 dark:text-white mb-2">Modelo Completo</h3>
            <p>Base: {formatCurrency(resultado.baseCompleta)}</p>
            <p>IR: {formatCurrency(resultado.irCompleta)}</p>
            <p>{resultado.resultadoFinalCompleta > 0 ? `A pagar: ${formatCurrency(resultado.resultadoFinalCompleta)}` : `Restituir: ${formatCurrency(-resultado.resultadoFinalCompleta)}`}</p>
          </AnimatedCard>
          <AnimatedCard>
            <h3 className="font-bold text-slate-800 dark:text-white mb-2">Modelo Simplificado</h3>
            <p>Base: {formatCurrency(resultado.baseSimplificada)}</p>
            <p>IR: {formatCurrency(resultado.irSimplificada)}</p>
            <p>{resultado.resultadoFinalSimplificada > 0 ? `A pagar: ${formatCurrency(resultado.resultadoFinalSimplificada)}` : `Restituir: ${formatCurrency(-resultado.resultadoFinalSimplificada)}`}</p>
          </AnimatedCard>
          <AnimatedCard>
            <h3 className="font-bold text-slate-800 dark:text-white mb-2">Comparativo</h3>
            <p>Melhor Produto: <strong>{resultado.melhorProduto}</strong></p>
            <p>Economia: <strong className="text-blue-500">{formatCurrency(resultado.economiaFinal)}</strong></p>
            <p>Limite PGBL: <strong className="text-green-600">{formatCurrency(resultado.pgblMaxPermitido)}</strong></p>
          </AnimatedCard>
        </div>
      )}
    </div>
  );
};

export default TelaSimuladorIR;