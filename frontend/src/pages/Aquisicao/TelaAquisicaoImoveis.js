import TelaAquisicaoGenerica from "./TelaAquisicaoGenerica";

const TelaAquisicaoImoveis = () => {
    return (
        <TelaAquisicaoGenerica
            descricaoBem="Apartamento na Praia"
            permitirFGTS={true}
        />
    );
};

export default TelaAquisicaoImoveis;