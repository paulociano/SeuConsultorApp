class MessageParser {
  constructor(actionProvider) {
    this.actionProvider = actionProvider;
  }

  parse(message) {
    const lowerCaseMessage = message.toLowerCase();

    // Se o usuário pedir uma análise, chama a função específica de análise
    if (
      lowerCaseMessage.includes('analise') ||
      lowerCaseMessage.includes('analisar') ||
      lowerCaseMessage.includes('conselho')
    ) {
      this.actionProvider.handleAnalysisRequest();
    } else {
      // Para qualquer outra mensagem, chama o manipulador geral
      this.actionProvider.handleMessage(lowerCaseMessage);
    }
  }
}

export default MessageParser;
