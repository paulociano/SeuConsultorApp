import { useState, useEffect } from "react";
// 1. Importar a store do usuário e o toast para notificações
import { useUserStore } from "../../stores/useUserStore";
import LoaderLogo from "../../components/Loader/loaderlogo";

// 2. Remover as props da assinatura do componente
export default function TelaConfiguracoesPerfil() {
  // 3. Obter o usuário e a função de atualização da store
  const { usuario, updateUser, isLoading } = useUserStore();

  // 4. Inicializar os estados locais com valores padrão ou vazios
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [imagem, setImagem] = useState(null); // Para o arquivo da nova imagem
  const [imagemPreview, setImagemPreview] = useState(null); // Para a pré-visualização

  // 5. Usar useEffect para popular os estados quando o 'usuario' da store estiver disponível
  useEffect(() => {
    if (usuario) {
      setNome(usuario.nome || '');
      setEmail(usuario.email || '');
      setImagemPreview(usuario.imagem_url || null);
    }
  }, [usuario]);


  const handleImagemChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagem(file);
      setImagemPreview(URL.createObjectURL(file));
    }
  };

  // A lógica de 'houveMudancas' compara os estados locais com o 'usuario' da store
  const houveMudancas = () => {
    if (!usuario) return false;
    return (nome !== usuario.nome || email !== usuario.email || !!imagem);
  };

  const handleSalvar = async () => {
    if (!houveMudancas()) return;

    // TODO: Adicionar validação de senha se for um requisito para salvar.
    // Ex: Se o usuário digitou algo no campo senha, exigir confirmação.

    const dadosAtualizados = {
        id: usuario.id,
        nome,
        email,
        // A senha só deve ser enviada se for alterada
        ...(senha && { senha }),
    };

    // 6. Chamar a ação da store para atualizar o perfil, passando o arquivo de imagem separadamente
    // A sua store precisará saber como lidar com o upload da imagem.
    const success = await updateUser(dadosAtualizados, imagem); 
    
    if (success) {
        setSenha(''); // Limpa o campo de senha após o sucesso
        setImagem(null); // Limpa o estado do arquivo de imagem para indicar que não há mais mudança pendente
    }
  };
  
  // Adiciona um estado de carregamento para evitar o erro inicial
  if (isLoading) {
        return (
            <LoaderLogo />
        )
    }

  return (
    <div className="max-w-xl mx-auto mt-8 bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Configurações de Perfil</h2>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Imagem de Perfil</label>
        <div className="flex items-center gap-4">
          <img
            src={imagemPreview || `https://ui-avatars.com/api/?name=${nome}&background=00d971&color=000`}
            alt="avatar"
            className="w-16 h-16 rounded-full object-cover border-2 border-slate-300"
          />
          <label className="cursor-pointer bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-white font-bold py-2 px-4 rounded-lg">
            Trocar Imagem
            <input type="file" accept="image/*" onChange={handleImagemChange} className="hidden"/>
          </label>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Nome</label>
          <input
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-white dark:border-slate-600 focus:ring-2 focus:ring-[#00d971] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">E-mail</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-white dark:border-slate-600 focus:ring-2 focus:ring-[#00d971] focus:border-transparent"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">Alterar Senha (deixe em branco para não mudar)</label>
          <input
            type="password"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="Nova senha"
            className="w-full p-3 border rounded-md dark:bg-gray-700 dark:text-white dark:border-slate-600 focus:ring-2 focus:ring-[#00d971] focus:border-transparent"
          />
        </div>
      </div>

      <button
        onClick={handleSalvar}
        disabled={!houveMudancas() || isLoading}
        className={`w-full mt-8 py-3 px-4 rounded-lg font-bold text-black transition-all duration-300 ${
          houveMudancas() ? 'bg-[#00d971] hover:brightness-90' : 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed'
        } ${isLoading ? 'opacity-50' : ''}`}
      >
        {isLoading ? 'Salvando...' : 'Salvar Alterações'}
      </button>
    </div>
  );
}