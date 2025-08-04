# SeuConsultor App - Plataforma de Planeamento Financeiro Pessoal

![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![GitHub Actions](https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=github-actions&logoColor=white)


## 🎯 Sobre o Projeto

O **SeuConsultor App** é uma plataforma full-stack de planeamento financeiro pessoal, projetada para oferecer uma visão 360° da vida financeira do utilizador. A aplicação permite o controlo de orçamentos, o acompanhamento de transações, a definição de objetivos, a simulação de aquisições, proteção financeira e o planeajmento de aposentadoria, tudo dentro de um ambiente seguro e interativo.

Este projeto foi totalmente containerizado com Docker e possui um pipeline de CI/CD configurado com GitHub Actions para automação de builds e deploy.

## ✨ Funcionalidades Principais

* **Autenticação de Utilizador:** Sistema de registo e login seguro com tokens JWT.
* **Dashboard de Objetivos:** Criação e acompanhamento visual do progresso de metas financeiras (ex: comprar um carro, fazer uma viagem).
* **Gestão de Orçamento:** Definição de categorias de receitas e despesas com acompanhamento de valores planeados vs. realizados.
* **Fluxo de Caixa:** Registo e categorização de todas as transações, com filtros por data, descrição e categoria.
* **Análise de Património:** Registo e visualização de ativos e passivos para cálculo do património líquido.
* **Planeamento de Proteção:** Simulador para calcular as necessidades de cobertura para invalidez, morte e doenças graves.
* **Simuladores Avançados:**
    * Projeção de Reforma.
    * Análise de benefício fiscal PGBL vs. VGBL.
    * Simulador de aquisição de imóveis e automóveis, comparando compra à vista, financiamento e consórcio.
* **Centro de Milhas e Cartões:**
    * Gestão de carteiras de milhas e pontos.
    * Wizard para recomendação do cartão de crédito ideal com base no perfil de gastos.
* **Onboarding Guiado:** Tour interativo em cada tela para guiar o utilizador na sua primeira visita, implementado com `react-joyride`.
* **Chatbot Assistente:** Um chatbot com IA (Google Gemini) para responder a dúvidas e fornecer insights financeiros com base nos dados do utilizador.

## 🛠️ Tecnologias Utilizadas

#### **Frontend**
* **Framework:** React
* **Gestão de Estado:** Zustand
* **Roteamento:** React Router
* **Estilização:** Tailwind CSS
* **Gráficos:** Recharts, ECharts for React
* **UI/UX:** Framer Motion, `react-joyride`, `react-chatbot-kit`, `sonner` (notificações)

#### **Backend**
* **Framework:** Node.js com Express.js
* **Autenticação:** JSON Web Tokens (JWT), Bcrypt
* **Base de Dados:** PostgreSQL com o driver `pg`
* **Validação:** `express-validator`
* **Upload de Ficheiros:** Multer

#### **Base de Dados**
* PostgreSQL

#### **DevOps & Infraestrutura**
* **Containerização:** Docker, Docker Compose
* **Servidor Web (Frontend):** Nginx
* **CI/CD:** GitHub Actions para build e push automático das imagens para o Docker Hub.
* **Hospedagem (Cloud):** Render (Web Services + Managed PostgreSQL)
* **Qualidade de Código:** ESLint e Prettier

## 🚀 Como Executar o Projeto Localmente

O ambiente foi projetado para ser executado com Docker, garantindo consistência e facilidade na configuração.

### Pré-requisitos
* [Node.js](https://nodejs.org/) (v20+)
* [Docker](https://www.docker.com/products/docker-desktop/)
* [Git](https://git-scm.com/)

### Passos para a Configuração

1.  **Clone o repositório:**
    ```bash
    git clone [https://github.com/seu-usuario/seu-repositorio.git](https://github.com/seu-usuario/seu-repositorio.git)
    cd seu-repositorio
    ```

2.  **Configure as Variáveis de Ambiente do Backend:**
    * Navegue até a pasta `backend`.
    * Renomeie o ficheiro `.env.example` para `.env`.
    * Preencha as variáveis, como a `JWT_SECRET`.

3.  **Configure as Variáveis de Ambiente do Docker Compose:**
    * Na **raiz do projeto**, crie um ficheiro `.env`.
    * Adicione as seguintes variáveis para o banco de dados:
        ```env
        POSTGRES_USER=devuser
        POSTGRES_PASSWORD=devpassword
        POSTGRES_DB=meudb
        ```

4.  **Suba os Contêineres:**
    * Na **raiz do projeto**, execute o comando:
        ```bash
        docker compose up --build
        ```
    * Aguarde todos os serviços (banco, backend, frontend) iniciarem.

5.  **Acesse a Aplicação:**
    * Frontend estará disponível em: `http://localhost:3000`
    * Backend (API) estará disponível em: `http://localhost:3001`

## 📁 Estrutura do Projeto
```
/
├── .github/workflows/      # Configuração do pipeline de CI/CD com GitHub Actions
├── backend/                # Projeto Node.js/Express (API)
│   ├── src/
│   ├── middleware/
│   ├── controllers/
│   ├── routes/
│   ├── Dockerfile
│   └── Dockerfile.prod     # Dockerfile otimizado para produção
├── frontend/               # Projeto React
│   ├── src/
│   ├── components/
│   ├── pages/
│   ├── stores/             # Lógica de estado com Zustand
│   └── Dockerfile          # Dockerfile multi-stage com Nginx para produção
├── docker-compose.yml      # Orquestração dos serviços para desenvolvimento
└── docker-compose.prod.yml # Sobrescreve configurações para um build de produção
```
