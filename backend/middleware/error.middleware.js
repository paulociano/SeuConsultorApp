// backend/middleware/error.middleware.js
const errorMiddleware = (err, req, res, next) => {
  console.error(err.stack); // Loga o erro completo no console do servidor

  // Define um status code e mensagem padrão
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Ocorreu um erro interno no servidor.';

  // Envia uma resposta de erro padronizada
  res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: message,
  });
};

module.exports = errorMiddleware;
