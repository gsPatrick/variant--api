# ---- Variant API (Node.js + Express + Sequelize/PostgreSQL) ----
FROM node:20-alpine

WORKDIR /app

# Instala dependencias (inclui sequelize-cli para rodar migrations no boot).
COPY package*.json ./
RUN npm ci

# Codigo da aplicacao.
COPY . .

# Diretorio de uploads (montar volume em producao para persistir).
RUN mkdir -p uploads

EXPOSE 3000

# Aplica migrations pendentes e sobe a API.
CMD ["sh", "-c", "npm run migrate && node app.js"]
