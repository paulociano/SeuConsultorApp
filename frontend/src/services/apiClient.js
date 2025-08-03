// Define a URL base da sua API. Usar uma variável de ambiente é a melhor prática.
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * Função genérica para fazer requisições à API.
 * @param {string} endpoint - O endpoint da API (ex: '/login').
 * @param {string} method - O método HTTP (ex: 'GET', 'POST').
 * @param {object|FormData} body - O corpo da requisição.
 * @param {object} headers - Cabeçalhos adicionais.
 * @returns {Promise<any>} - A resposta da API em JSON.
 */
export const apiRequest = async (endpoint, method = 'GET', body = null, headers = {}) => {
  const config = {
    method,
    headers: {
      ...headers,
    },
  };

  // Se o corpo não for FormData, definimos o Content-Type como JSON.
  // O navegador define o Content-Type correto automaticamente para FormData.
  if (body) {
    if (body instanceof FormData) {
      config.body = body;
    } else {
      config.body = JSON.stringify(body);
      config.headers['Content-Type'] = 'application/json';
    }
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

    // Se a resposta não tiver conteúdo (ex: 204 No Content), retorna sucesso.
    if (response.status === 204) {
      return { success: true };
    }

    const data = await response.json();

    if (!response.ok) {
      // Se a resposta da API já contém uma mensagem de erro, usa ela.
      // Senão, usa uma mensagem padrão.
      const errorMessage = data.message || `Erro ${response.status}: ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return data;
  } catch (error) {
    console.error(`Erro na requisição para ${endpoint}:`, error);
    // Re-lança o erro para que a store (ou quem chamou) possa tratá-lo.
    throw error;
  }
};

/**
 * Wrapper para requisições a rotas públicas (não precisa de token).
 */
export const apiPublicRequest = (endpoint, method, body) => {
  return apiRequest(endpoint, method, body);
};

/**
 * Wrapper para requisições a rotas privadas (precisa de token de autenticação).
 */
export const apiPrivateRequest = (endpoint, method, body) => {
  const token = localStorage.getItem('authToken');
  if (!token) {
    // Se não houver token, rejeita a promessa imediatamente.
    return Promise.reject(new Error('Token de autenticação não encontrado.'));
  }

  const headers = {
    'Authorization': `Bearer ${token}`,
  };

  return apiRequest(endpoint, method, body, headers);
};