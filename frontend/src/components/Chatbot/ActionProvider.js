import { apiPrivateRequest } from '../../services/apiClient';

class ActionProvider {
  /**
   * O construtor é chamado pelo react-chatbot-kit e recebe as ferramentas necessárias.
   * @param {function} createChatBotMessage - Função para criar um novo balão de mensagem do bot.
   * @param {function} setStateFunc - Função para atualizar o estado interno do chatbot.
   */
  constructor(createChatBotMessage, setStateFunc) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
  }

  /**
   * Manipula mensagens gerais do usuário, enviando-as para a rota de perguntas simples.
   * @param {string} userMessage - A mensagem do usuário em letras minúsculas.
   */
  async handleMessage(userMessage) {
    try {
      const response = await apiPrivateRequest('/api/chatbot/query', 'POST', {
        message: userMessage,
      });
      const botMessage = this.createChatBotMessage(response.reply);
      this.addMessageToState(botMessage);
    } catch (error) {
      console.error('Erro na query do chatbot:', error);
      const errorMessage = this.createChatBotMessage(
        'Desculpe, estou com problemas para me conectar. Tente novamente mais tarde.'
      );
      this.addMessageToState(errorMessage);
    }
  }

  /**
   * Manipula um pedido de análise, mostrando uma mensagem de "pensando" e chamando a rota de IA.
   */
  async handleAnalysisRequest() {
    // Envia uma mensagem de feedback imediato para o usuário
    const thinkingMessage = this.createChatBotMessage(
      'Ok, um momento enquanto analiso seus dados financeiros...'
    );
    this.addMessageToState(thinkingMessage);

    try {
      const response = await apiPrivateRequest('/api/chatbot/analyze', 'POST');
      const botMessage = this.createChatBotMessage(response.reply);
      this.addMessageToState(botMessage);
    } catch (error) {
      console.error('Erro na análise do chatbot:', error);
      const errorMessage = this.createChatBotMessage(
        'Não foi possível completar a análise. Por favor, tente novamente mais tarde.'
      );
      this.addMessageToState(errorMessage);
    }
  }

  /**
   * Função auxiliar para adicionar uma nova mensagem ao estado do chat.
   * @param {object} message - O objeto de mensagem criado com createChatBotMessage.
   */
  addMessageToState = (message) => {
    this.setState((prevState) => ({
      ...prevState,
      messages: [...prevState.messages, message],
    }));
  };
}

export default ActionProvider;
