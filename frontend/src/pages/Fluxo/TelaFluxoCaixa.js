import { useState, useMemo, useEffect } from 'react';
import { useTransacoesStore } from '../../stores/useTransacoesStore';
import Card from '../../components/Card/Card';
import { CATEGORIAS_FLUXO } from '../../components/constants/Categorias';
import { formatCurrency } from '../../utils/formatters';
import { PlusCircle, Eye, EyeOff, Edit, Trash2 } from 'lucide-react';
import FlipCardCategoria from '../../components/Card/FlipCardCategoria';
import { toast } from 'sonner';
import ModalNovaTransacao from '../../components/Modals/ModalNovaTransacao';

// --- INÍCIO DAS ADIÇÕES PARA O ONBOARDING ---
import Joyride from 'react-joyride';
import { useOnboarding } from '../../hooks/useOnboarding';
// --- FIM DAS ADIÇÕES PARA O ONBOARDING ---

const TelaFluxoDeCaixa = () => {
  // Conecta-se à store para obter o estado e as ações
  const { transacoes, isLoading, fetchTransacoes, saveTransacao, deleteTransacao } =
    useTransacoesStore();

  // --- LÓGICA DO ONBOARDING (CORRIGIDA) ---
  const TOUR_KEY = 'fluxo_caixa_tour';
  // 1. Obtenha a nova função 'startTour' do hook
  const { runTour, startTour, handleTourEnd } = useOnboarding(TOUR_KEY);

  // 2. Este useEffect agora controla o início do tour
  useEffect(() => {
    // O tour só será iniciado se:
    // - O carregamento de dados tiver terminado (isLoading for false)
    // - Existirem transações para serem exibidas
    if (!isLoading && transacoes && transacoes.length > 0) {
      startTour();
    }
  }, [isLoading, transacoes, startTour]); // Dependências corretas

  const tourSteps = [
    {
      target: 'body',
      content:
        'Bem-vindo ao Fluxo de Caixa! Aqui você pode registrar e visualizar todas as suas movimentações financeiras.',
      placement: 'center',
      disableBeacon: true,
    },
    {
      target: '#resumo-categorias-card',
      content:
        'Este painel mostra um resumo visual dos seus gastos por categoria no período que você filtrar.',
    },
    {
      target: '#filtros-transacoes-card',
      content:
        'Use estes filtros para encontrar transações específicas por descrição, categoria, mês ou ano.',
    },
    {
      target: '#lista-transacoes-card',
      content:
        'Esta é a sua lista de transações. Você pode editar, apagar ou ignorar uma transação usando as ações à direita de cada item.',
    },
    {
      target: '#adicionar-transacao-btn',
      content: 'E o mais importante: clique aqui para adicionar uma nova receita ou despesa!',
    },
  ];
  // --- FIM DA LÓGICA DO ONBOARDING ---

  // --- NOVOS ESTADOS PARA O MODAL ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTransacao, setEditingTransacao] = useState(null); // Guarda a transação em edição

  // Busca as transações na montagem do componente
  useEffect(() => {
    fetchTransacoes();
  }, [fetchTransacoes]);

  // Estado local para filtros e itens selecionados
  const [filtros, setFiltros] = useState(() => {
    const saved = localStorage.getItem('filtros_fluxo');
    return saved
      ? JSON.parse(saved)
      : { mes: 'todos', ano: 'todos', categoria: 'todas', busca: '' };
  });
  const [selecionadas, setSelecionadas] = useState([]);

  useEffect(() => {
    localStorage.setItem('filtros_fluxo', JSON.stringify(filtros));
  }, [filtros]);

  // Cálculos de useMemo para filtros e sumários (mantidos como estavam)
  const opcoesFiltro = useMemo(() => {
    const datas = transacoes.map((t) => new Date(t.data));
    const anos = [...new Set(datas.map((d) => d.getFullYear()))]
      .filter((ano) => !isNaN(ano))
      .sort((a, b) => b - a);
    const meses = [
      { v: 1, n: 'Janeiro' },
      { v: 2, n: 'Fevereiro' },
      { v: 3, n: 'Março' },
      { v: 4, n: 'Abril' },
      { v: 5, n: 'Maio' },
      { v: 6, n: 'Junho' },
      { v: 7, n: 'Julho' },
      { v: 8, n: 'Agosto' },
      { v: 9, n: 'Setembro' },
      { v: 10, n: 'Outubro' },
      { v: 11, n: 'Novembro' },
      { v: 12, n: 'Dezembro' },
    ];
    return { anos, meses };
  }, [transacoes]);

  const transacoesFiltradas = useMemo(() => {
    return transacoes.filter((t) => {
      const dataTransacao = new Date(t.data);
      if (isNaN(dataTransacao.getTime())) return false;

      const anoTransacao = dataTransacao.getFullYear();
      const mesTransacao = dataTransacao.getMonth() + 1;
      const filtroAnoOk = filtros.ano === 'todos' || anoTransacao === parseInt(filtros.ano);
      const filtroMesOk = filtros.mes === 'todos' || mesTransacao === parseInt(filtros.mes);
      const filtroCategoriaOk =
        filtros.categoria === 'todas' ||
        (filtros.categoria === 'nao-categorizadas'
          ? t.categoria === null
          : t.categoria === filtros.categoria);
      const filtroBuscaOk =
        filtros.busca === '' || t.descricao.toLowerCase().includes(filtros.busca.toLowerCase());
      return filtroAnoOk && filtroMesOk && filtroCategoriaOk && filtroBuscaOk;
    });
  }, [transacoes, filtros]);

  const sumarioPorCategoria = useMemo(() => {
    const gastosAtuais = transacoesFiltradas.filter((t) => t.tipo === 'despesa' && !t.ignorada);
    const totaisAtuais = gastosAtuais.reduce((acc, t) => {
      if (t.categoria) {
        if (!acc[t.categoria]) acc[t.categoria] = 0;
        acc[t.categoria] += parseFloat(t.valor);
      }
      return acc;
    }, {});

    let totaisAnteriores = {};
    if (filtros.ano !== 'todos' && filtros.mes !== 'todos') {
      const anoAtualNum = parseInt(filtros.ano);
      const mesAtualNum = parseInt(filtros.mes);

      let anoAnterior = anoAtualNum;
      let mesAnterior = mesAtualNum - 1;
      if (mesAnterior === 0) {
        mesAnterior = 12;
        anoAnterior = anoAtualNum - 1;
      }

      const gastosMesAnterior = transacoes.filter((t) => {
        const dataTransacao = new Date(t.data);
        return (
          !isNaN(dataTransacao.getTime()) &&
          dataTransacao.getFullYear() === anoAnterior &&
          dataTransacao.getMonth() + 1 === mesAnterior &&
          t.tipo === 'despesa' &&
          !t.ignorada
        );
      });

      totaisAnteriores = gastosMesAnterior.reduce((acc, t) => {
        if (t.categoria) {
          if (!acc[t.categoria]) acc[t.categoria] = 0;
          acc[t.categoria] += parseFloat(t.valor);
        }
        return acc;
      }, {});
    }

    return Object.entries(totaisAtuais)
      .map(([key, totalAtual]) => {
        const totalAnterior = totaisAnteriores[key] || 0;
        let textoVerso = 'Selecione um mês e ano para ver a comparação.';

        if (filtros.mes !== 'todos' && filtros.ano !== 'todos') {
          if (totalAnterior > 0) {
            const diferenca = ((totalAtual - totalAnterior) / totalAnterior) * 100;
            textoVerso = `Variação de ${diferenca >= 0 ? '+' : ''}${diferenca.toFixed(1)}% em relação ao mês anterior.`;
          } else if (totalAtual > 0) {
            textoVerso = 'Gasto novo este mês. Sem registro no mês anterior.';
          }
        }

        return {
          id: key,
          ...CATEGORIAS_FLUXO[key],
          total: totalAtual,
          verso: textoVerso,
        };
      })
      .sort((a, b) => b.total - a.total);
  }, [transacoes, filtros, transacoesFiltradas]);

  // --- FUNÇÕES DE MANIPULAÇÃO DO MODAL ---
  const handleAdicionarClick = () => {
    setEditingTransacao(null); // Garante que é um formulário de adição
    setIsModalOpen(true);
  };

  const handleEditClick = (transacao) => {
    // Traduz o tipo do backend para o que o modal espera ('debit'/'credit')
    const transacaoParaModal = {
      ...transacao,
      tipo: transacao.tipo === 'receita' ? 'credit' : 'debit',
    };
    setEditingTransacao(transacaoParaModal); // Define a transação a ser editada
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingTransacao(null); // Limpa o estado de edição ao fechar
  };

  const handleSaveModal = async (dadosDoModal) => {
    // **CORREÇÃO APLICADA AQUI**
    // Traduz o 'tipo' do frontend ('credit'/'debit') para o que o backend espera ('receita'/'despesa')
    const dadosParaBackend = {
      ...dadosDoModal,
      tipo: dadosDoModal.tipo === 'credit' ? 'receita' : 'despesa',
    };

    const success = await saveTransacao(dadosParaBackend);
    if (success) {
      handleCloseModal(); // Fecha o modal se o salvamento for bem-sucedido
    }
  };

  // Funções de manipulação da tabela (ignorar, deletar)
  const handleIgnoreToggle = async (transacaoId) => {
    const transacao = transacoes.find((t) => t.id === transacaoId);
    if (transacao) {
      const success = await saveTransacao({ ...transacao, ignorada: !transacao.ignorada });
      if (success) {
        toast.info(`Transação ${!transacao.ignorada ? 'ignorada' : 'restaurada'} com sucesso.`);
      }
    }
  };

  const handleDeleteClick = (transacaoId) => {
    deleteTransacao(transacaoId);
  };

  const deletarSelecionadas = async () => {
    if (selecionadas.length === 0) return;
    if (
      window.confirm(
        `Você está prestes a apagar ${selecionadas.length} transações. A confirmação será pedida para cada uma. Deseja continuar?`
      )
    ) {
      await Promise.all(selecionadas.map((id) => deleteTransacao(id)));
      setSelecionadas([]);
    }
  };

  // Funções de manipulação de filtros
  const handleFiltroChange = (e) => {
    const { name, value } = e.target;
    setFiltros((prev) => ({ ...prev, [name]: value }));
  };

  const toggleSelecionada = (id) => {
    setSelecionadas((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  };

  const limparFiltros = () => {
    setFiltros({ mes: 'todos', ano: 'todos', categoria: 'todas', busca: '' });
    toast('Filtros limpos');
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <Joyride
        steps={tourSteps}
        run={runTour}
        callback={handleTourEnd}
        continuous={true}
        showProgress={true}
        showSkipButton={true}
        locale={{
          back: 'Voltar',
          close: 'Fechar',
          last: 'Fim',
          next: 'Próximo',
          skip: 'Pular',
        }}
        styles={{
          options: {
            arrowColor: '#fff',
            backgroundColor: '#fff',
            primaryColor: '#00d971',
            textColor: '#333',
            zIndex: 1000,
          },
        }}
      />
      {isModalOpen && (
        <ModalNovaTransacao
          transacao={editingTransacao}
          onClose={handleCloseModal}
          onSave={handleSaveModal}
        />
      )}
      <Card id="resumo-categorias-card">
        <h2 className="text-lg font-bold text-slate-800 dark:text-white mb-4">
          Resumo por Categoria (Gastos)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {sumarioPorCategoria.map((cat) => (
            <FlipCardCategoria
              key={cat.id}
              icon={cat.icon}
              label={cat.label}
              total={cat.total}
              color={cat.color}
              verso={cat.verso}
            />
          ))}
        </div>
      </Card>

      <Card id="filtros-transacoes-card">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <input
              name="busca"
              value={filtros.busca}
              onChange={handleFiltroChange}
              placeholder="Buscar descrição..."
              className="bg-white dark:bg-[#200b5d] text-slate-800 dark:text-white rounded-md px-3 py-2 border border-[#3e388b] focus:ring-1 focus:ring-[#00d971]"
            />
            <select
              name="categoria"
              value={filtros.categoria}
              onChange={handleFiltroChange}
              className="text-sm rounded-md p-2 border bg-white dark:bg-[#200b5d] border-[#3e388b] text-slate-800 dark:text-white"
            >
              <option value="todas">Todas as Categorias</option>
              {Object.entries(CATEGORIAS_FLUXO).map(([key, { label }]) => (
                <option key={key} value={key}>
                  {label}
                </option>
              ))}
              <option value="nao-categorizadas">Não Categorizadas</option>
            </select>
            <select
              name="mes"
              value={filtros.mes}
              onChange={handleFiltroChange}
              className="text-sm rounded-md p-2 border bg-white dark:bg-[#200b5d] border-[#3e388b] text-slate-800 dark:text-white"
            >
              <option value="todos">Mês</option>
              {opcoesFiltro.meses.map((m) => (
                <option key={m.v} value={m.v}>
                  {m.n}
                </option>
              ))}
            </select>
            <select
              name="ano"
              value={filtros.ano}
              onChange={handleFiltroChange}
              className="text-sm rounded-md p-2 border bg-white dark:bg-[#200b5d] border-[#3e388b] text-slate-800 dark:text-white"
            >
              <option value="todos">Ano</option>
              {opcoesFiltro.anos.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button onClick={limparFiltros} className="text-xs text-yellow-400 hover:underline">
              Limpar Filtros
            </button>
            <button
              onClick={deletarSelecionadas}
              disabled={selecionadas.length === 0}
              className="text-xs text-red-400 hover:underline disabled:opacity-50"
            >
              Apagar Selecionadas
            </button>
          </div>
        </div>
      </Card>

      <Card id="lista-transacoes-card">
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-4 mb-4">
          <h2 className="text-lg font-bold text-slate-800 dark:text-white">
            Transações ({transacoesFiltradas.length})
          </h2>
          <button
            id="adicionar-transacao-btn"
            onClick={handleAdicionarClick}
            className="text-xs flex items-center gap-1 text-[#00d971] hover:brightness-90 font-semibold"
          >
            <PlusCircle size={14} /> Adicionar Transação
          </button>
        </div>
        {isLoading ? (
          <p className="text-center text-slate-500 dark:text-gray-400">Carregando transações...</p>
        ) : (
          <div className="space-y-2">
            <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-bold text-slate-500 dark:text-slate-400 px-4 py-2">
              <div className="col-span-1"></div>
              <div className="col-span-1">Data</div>
              <div className="col-span-4">Descrição</div>
              <div className="col-span-2">Categoria</div>
              <div className="col-span-2 text-right">Valor</div>
              <div className="col-span-2 text-center">Ações</div>
            </div>
            {transacoesFiltradas.map((t) => {
              const isCredit = t.tipo === 'receita';
              const selecionada = selecionadas.includes(t.id);
              return (
                <div
                  key={t.id}
                  className={`grid grid-cols-12 gap-4 items-center p-3 rounded-lg transition-colors text-sm text-slate-700 dark:text-slate-300 ${selecionada ? 'bg-yellow-400/20 dark:bg-yellow-600/20' : t.ignorada ? 'bg-slate-200/50 dark:bg-slate-800/50 opacity-60' : 'bg-white dark:bg-[#201b5d]'}`}
                >
                  <div className="col-span-1 flex justify-center items-center">
                    <input
                      type="checkbox"
                      checked={selecionada}
                      onChange={() => toggleSelecionada(t.id)}
                      className="rounded text-[#00d971] focus:ring-0"
                    />
                  </div>
                  <div className="col-span-1">
                    {new Date(t.data).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}
                  </div>
                  <div className="col-span-4 font-medium text-slate-800 dark:text-white">
                    {t.descricao}
                  </div>
                  <div className="col-span-2">
                    {isCredit ? (
                      <span className="text-xs font-bold bg-green-500/20 text-green-400 px-2 py-1 rounded-full">
                        Receita
                      </span>
                    ) : (
                      <span>
                        {t.categoria ? CATEGORIAS_FLUXO[t.categoria]?.label || t.categoria : '—'}
                      </span>
                    )}
                  </div>
                  <div
                    className={`col-span-2 text-right font-semibold ${isCredit ? 'text-green-400' : 'text-red-400'}`}
                  >
                    {isCredit ? '+' : '-'} {formatCurrency(t.valor)}
                  </div>
                  <div className="col-span-2 flex justify-center gap-3">
                    <button
                      onClick={() => handleEditClick(t)}
                      title="Editar"
                      className="text-blue-500 hover:text-blue-400"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(t.id)}
                      title="Apagar"
                      className="text-red-500 hover:text-red-400"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => handleIgnoreToggle(t.id)}
                      title={t.ignorada ? 'Restaurar' : 'Ignorar'}
                      className="text-slate-500 hover:text-slate-400"
                    >
                      {t.ignorada ? <Eye size={16} /> : <EyeOff size={16} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
};

export default TelaFluxoDeCaixa;
