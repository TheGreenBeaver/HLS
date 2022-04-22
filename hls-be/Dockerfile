FROM node:16.4-alpine as be-runner

RUN apk update && apk add ffmpeg

WORKDIR /usr/src/insight-app

COPY . .

RUN yarn install --production

EXPOSE 8000

CMD ["yarn", "start:prod"]
