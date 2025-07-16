import TelaAquisicaoGenerica from "./TelaAquisicaoGenerica";

const TelaAquisicaoAutomoveis = () => {
    return (
        <TelaAquisicaoGenerica
            descricaoBem="Carro 0km"
            permitirFGTS={false}
        />
    );
};

export default TelaAquisicaoAutomoveis;