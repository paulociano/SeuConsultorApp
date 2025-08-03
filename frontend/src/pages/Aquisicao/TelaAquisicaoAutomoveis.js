import TelaAquisicaoGenerica from './TelaAquisicaoGenerica';

// O componente não recebe mais props.
const TelaAquisicaoAutomoveis = () => {
  return (
    <TelaAquisicaoGenerica
      titulo="Simulador de Aquisição de Automóveis"
      descricaoBem="Carro 0km"
      permitirFGTS={false}
      tipo="automoveis" // Informa o tipo para a lógica de buscar e salvar na store
    />
  );
};

export default TelaAquisicaoAutomoveis;
