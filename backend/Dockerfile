FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build
RUN npx prisma generate

EXPOSE 3000

# Önce migrate, sonra uygulamayı başlat
CMD ["sh", "-c", "npx prisma migrate deploy && npm run start:prod"]
