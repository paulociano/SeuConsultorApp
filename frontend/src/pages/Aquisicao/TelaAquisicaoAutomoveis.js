import TelaAquisicaoGenerica from "./TelaAquisicaoGenerica";

const TelaAquisicaoAutomoveis = ({ dadosIniciais, onSave }) => {
    return (
        <TelaAquisicaoGenerica
            titulo="Simulador de Aquisição de Automóveis"
            descricaoBem="Carro 0km"
            permitirFGTS={false}
            tipo="automoveis" // Informa o tipo para a lógica de salvar
            dadosIniciais={dadosIniciais}
            onSave={onSave}
        />
    );
};

export default TelaAquisicaoAutomoveis;