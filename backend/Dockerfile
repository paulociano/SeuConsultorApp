# Usa uma imagem oficial do Node.js leve e segura
FROM node:18-alpine

# Define o diretório de trabalho dentro do contêiner
WORKDIR /usr/src/app

# Copia os arquivos de definição de dependências
# Isso aproveita o cache do Docker, acelerando builds futuros
COPY package*.json ./

# Instala TODAS as dependências (incluindo devDependencies como nodemon)
# para o ambiente de desenvolvimento local
RUN npm install

# Copia todo o resto do código do backend para o diretório de trabalho
COPY . .

# Expõe a porta 3001, que seu index.js utiliza
EXPOSE 3001

# O comando padrão para iniciar a aplicação.
# Vamos sobrepor isso no docker-compose para usar o nodemon em desenvolvimento.
CMD [ "node", "index.js" ]