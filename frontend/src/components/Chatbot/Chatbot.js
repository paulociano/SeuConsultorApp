import React, { useState } from 'react';
import Chatbot from 'react-chatbot-kit';
import 'react-chatbot-kit/build/main.css';
import { MessageSquare, X } from 'lucide-react';

// Arquivos de configuração que criaremos a seguir
import config from './chatbotConfig';
import MessageParser from './MessageParser';
import ActionProvider from './ActionProvider';

const ChatbotAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-br from-[#201b5d] to-[#3e388b] text-white p-4 rounded-full shadow-lg hover:scale-110 transition-transform z-40"
        aria-label="Abrir chat de ajuda"
      >
        <MessageSquare size={24} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 shadow-2xl rounded-lg">
      <Chatbot config={config} messageParser={MessageParser} actionProvider={ActionProvider} />
      <button
        onClick={() => setIsOpen(false)}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-800"
        aria-label="Fechar chat"
      >
        <X size={20} />
      </button>
    </div>
  );
};

export default ChatbotAssistant;
