FROM node:14-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Expose port 4200 for "ng serve"
EXPOSE 4200

ENV CHOKIDAR_USEPOLLING=true

CMD ["npm", "run", "start"]
