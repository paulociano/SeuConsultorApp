import { toast } from 'sonner';

// A URL base da sua API. O ideal é que venha de uma variável de ambiente.
const API_BASE_URL = 'http://localhost:3001';

/**
 * Realiza requisições para endpoints públicos da API (que não exigem token).
 * @param {string} endpoint - O endpoint da API (ex: '/login').
 * @param {string} method - O método HTTP.
 * @param {object|null} body - O corpo da requisição.
 * @returns {Promise<object|null>} O resultado da requisição ou null em caso de falha.
 */
export const apiPublicRequest = async (endpoint, method = 'GET', body = null) => {
    try {
        const options = {
            method,
            headers: {}
        };
        if (body) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }
        const response = await fetch(`${API_BASE_URL}${endpoint}`, options);
        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.message || `Erro ${response.status}`);
        }
        return data;
    } catch (error) {
        toast.error(error.message);
        return null;
    }
};

/**
 * Realiza requisições para endpoints protegidos da API (que exigem token).
 * @param {string} endpoint - O endpoint da API (ex: '/transacoes').
 * @param {string} method - O método HTTP.
 * @param {object|null} body - O corpo da requisição.
 * @returns {Promise<object|boolean|null>} O resultado da requisição ou null em caso de falha.
 */
export const apiRequest = async (endpoint, method = 'GET', body = null) => {
    const token = localStorage.getItem('authToken');
    if (!token) {
        toast.error("Usuário não autenticado. Por favor, faça o login novamente.");
        // Ação futura: Deslogar o usuário globalmente.
        return null;
    }
    try {
        const options = {
            method,
            headers: { 'Authorization': `Bearer ${token}` }
        };
        if (body) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(body);
        }
        const response = await fetch(`${API_BASE_URL}/api${endpoint}`, options);

        if (response.status === 204) return true; // Para respostas 'No Content' (ex: DELETE)

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: `Erro ${response.status}` }));
            throw new Error(errorData.message || `Falha na requisição ${method} ${endpoint}`);
        }
        return response.json();
    } catch (error) {
        toast.error(error.message);
        return null;
    }
};