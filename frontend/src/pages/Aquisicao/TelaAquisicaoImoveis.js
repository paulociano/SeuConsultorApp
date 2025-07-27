import TelaAquisicaoGenerica from "./TelaAquisicaoGenerica";

const TelaAquisicaoImoveis = ({ dadosIniciais, onSave }) => {
    return (
        <TelaAquisicaoGenerica
            titulo="Simulador de Aquisição de Imóveis"
            descricaoBem="Apartamento na Praia"
            permitirFGTS={true}
            tipo="imoveis" // Informa o tipo para a lógica de salvar
            dadosIniciais={dadosIniciais}
            onSave={onSave}
        />
    );
};

export default TelaAquisicaoImoveis;