FROM node:16.4-alpine as be-runner

WORKDIR /usr/src/hls-app

COPY . .

RUN yarn install --production

EXPOSE 8000

CMD ["yarn", "start:prod"]
