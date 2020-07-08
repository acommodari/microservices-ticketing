FROM node:lts-alpine

WORKDIR /app
COPY package*.json .
RUN npm ci --only=prod
COPY . .

CMD ["npm", "start"]