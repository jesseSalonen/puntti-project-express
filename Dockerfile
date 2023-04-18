FROM node:19-alpine

ENV NODE_ENV production
ENV PORT 5000

WORKDIR /usr/src/app

COPY ./package*.json ./

RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm", "start"]