import TelaAquisicaoGenerica from './TelaAquisicaoGenerica';

// O componente não recebe mais props, pois a tela genérica agora busca seus próprios dados.
const TelaAquisicaoImoveis = () => {
  return (
    <TelaAquisicaoGenerica
      titulo="Simulador de Aquisição de Imóveis"
      descricaoBem="Apartamento na Praia"
      permitirFGTS={true}
      tipo="imoveis" // Informa o tipo para a lógica de buscar e salvar na store
    />
  );
};

export default TelaAquisicaoImoveis;
