FROM node:19-alpine

ENV NODE_ENV production

WORKDIR /usr/src/app

COPY ./package*.json ./

RUN npm install

COPY . .

EXPOSE 8000

CMD ["npm", "start"]