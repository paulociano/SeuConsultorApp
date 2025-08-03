const express = require('express');
const router = express.Router();
const perfilController = require('../controllers/perfil.controller');
const multer = require('multer');

// --- Configuração do Multer ---
// Define onde salvar as imagens e como nomear os arquivos
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // IMPORTANTE: Crie uma pasta chamada 'uploads' na raiz do seu projeto backend
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    // Gera um nome único para o arquivo para evitar conflitos
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.' + file.mimetype.split('/')[1]);
  },
});
const upload = multer({ storage: storage });
// --- Fim da Configuração do Multer ---

// Rota para buscar os dados do perfil (você já deve ter algo parecido)
router.get('/perfil', perfilController.getPerfil);

// --- NOVA ROTA para atualizar o perfil ---
// O 'upload.single('imagem')' é o middleware do multer.
// Ele procura por um arquivo no campo 'imagem' do FormData.
router.put('/perfil/:id', upload.single('imagem'), perfilController.updatePerfil);

module.exports = router;
