FROM node:16.4-alpine as fe-builder

WORKDIR /usr/src/fe

COPY . .

RUN yarn install --production

RUN yarn build

FROM nginx

COPY nginx/default.conf.template /etc/nginx/conf.d/default.conf.template

COPY --from=fe-builder /usr/src/fe/build/ /usr/share/nginx/fe