FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN rm -rf node_modules && npm install --force
COPY . .
CMD ["npm", "run", "start:dev"]
