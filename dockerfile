FROM node:alpine

WORKDIR /usr/src/server

COPY package.json .

RUN npm install

EXPOSE 1217

RUN npm install pm2 -g

CMD ["pm2-runtime", "src/index.js"]


COPY . .