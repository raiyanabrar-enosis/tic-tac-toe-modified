FROM node:20-alpine

WORKDIR /usr/src/app

COPY package.json ./
COPY jsconfig.json ./
COPY vite.config.js ./
COPY ./index.html ./

ENV VITE_BASE_URL=http://localhost:8080

COPY ./src ./src
COPY ./public ./public

RUN npm install


CMD [ "npm", "run", "dev" ]
