import { useState } from "react";

export default function TelaConfiguracoesPerfil({ usuario, setUsuario }) {
  const [nome, setNome] = useState(usuario.nome);
  const [email, setEmail] = useState(usuario.email);
  const [senha, setSenha] = useState('');
  const [imagem, setImagem] = useState(null);
  const [imagemPreview, setImagemPreview] = useState(usuario.imagem || null);

  const [original, setOriginal] = useState({
    nome: usuario.nome,
    email: usuario.email
  });

  const handleImagemChange = (e) => {
    const file = e.target.files[0];
    setImagem(file);
    setImagemPreview(URL.createObjectURL(file));
  };

  const houveMudancas = () =>
    (nome !== original.nome || email !== original.email || imagem) && senha.length > 0;

  const handleSalvar = () => {
    if (!houveMudancas()) return;

    const novaImagem = imagemPreview; // imagem convertida em URL local (poderia ser base64 ou upload futuro)
    setUsuario({
      nome,
      email,
      imagem: novaImagem
    });

    setOriginal({ nome, email });
    setSenha('');
    alert('Dados atualizados!');
  };

  return (
    <div className="max-w-auto mx-auto mt-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow">
      <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">Configurações de Perfil</h2>

      <div className="mb-4">
        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Imagem de Perfil</label>
        <div className="flex items-center gap-4">
          <img
            src={imagemPreview || '/default-avatar.png'}
            alt="avatar"
            className="w-16 h-16 rounded-full object-cover border"
          />
          <input type="file" accept="image/*" onChange={handleImagemChange} />
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Nome</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">E-mail</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm text-gray-600 dark:text-gray-300 mb-1">Confirme sua senha</label>
        <input
          type="password"
          value={senha}
          onChange={(e) => setSenha(e.target.value)}
          className="w-full p-2 border rounded-md dark:bg-gray-700 dark:text-white"
        />
      </div>

      <button
        onClick={handleSalvar}
        disabled={!houveMudancas()}
        className={`w-full py-2 px-4 rounded-md font-bold text-white ${
          houveMudancas() ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-400 cursor-not-allowed'
        }`}
      >
        Salvar Alterações
      </button>
    </div>
  );
}
