FROM node:20-alpine

WORKDIR /usr/src/app

# Установить зависимости (копируем package.json отдельно для кеша)
COPY package*.json ./
RUN npm ci --silent

# Копируем всё
COPY . .

# Генерация Prisma client при билде
RUN npx prisma generate

# Build (если используешь сборку TS -> JS)
RUN npm run build

EXPOSE 3000

# Для dev: можно использовать `npm run start:dev`, но в image используем prod startup
CMD ["node", "dist/main.js"]
