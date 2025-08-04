# Usa uma imagem oficial do Node.js
FROM node:18-alpine

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia os arquivos de definição de dependências
# Isso acelera builds futuros ao usar o cache do Docker
COPY package*.json ./

# Instala todas as dependências
RUN npm install

# Copia o restante do código. O volume do docker-compose irá sobrepor esta pasta,
# mas este comando é útil para garantir que a imagem possa ser construída de forma independente.
COPY . .

# Expõe a porta 3000, que é a padrão do servidor de desenvolvimento do React
EXPOSE 3000

# Comando para iniciar o servidor de desenvolvimento com hot-reload
CMD ["npm", "start"]