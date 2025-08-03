import { createChatBotMessage } from 'react-chatbot-kit';
import logo from '../../assets/logo.svg'; // Certifique-se de que o caminho está correto

const config = {
  initialMessages: [createChatBotMessage('Olá! Como posso ajudar hoje?')],
  botName: 'SeuConsultor',
  customStyles: {
    botMessageBox: {
      backgroundColor: '#2563eb', // Cor primária do seu app
    },
    chatButton: {
      backgroundColor: '#2563eb',
    },
    header: {
      backgroundColor: '#1d4ed8', // Uma variação da cor primária
    },
  },
  customComponents: {
    header: () => (
      <div
        style={{
          backgroundColor: '#1d4ed8',
          color: 'white',
          padding: '10px',
          borderRadius: '8px 8px 0 0',
          textAlign: 'center',
        }}
      >
        Converse com o SeuConsultor
      </div>
    ),
    botAvatar: (props) => (
      <div
        style={{
          backgroundColor: 'transparent',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          overflow: 'hidden',
        }}
      >
        <img
          src={logo}
          alt="Logo do Chatbot"
          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        />
      </div>
    ),
  },
};

export default config;
