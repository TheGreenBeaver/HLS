FROM node:16.4-alpine as fe-builder

WORKDIR /usr/src/fe

COPY ./hls-fe/ .

RUN yarn install --production

RUN yarn build

FROM scratch as fe-locator

COPY --from=fe-builder /usr/src/fe/build/ /usr/share/nginx/fe

FROM node:16.4-alpine as be-runner

RUN apk update && apk add ffmpeg

WORKDIR /usr/src/insight-app

COPY ./hls-be/ .

RUN yarn install --production

CMD ["yarn", "start:prod"]