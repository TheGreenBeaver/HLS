FROM node:16.4-alpine as fe-builder

WORKDIR /usr/src/fe

COPY . .

RUN yarn install --production

RUN yarn build

FROM scratch as fe-locator

COPY --from=fe-builder /usr/src/fe/build/ /usr/share/nginx/fe

CMD ["echo", "Frontend built successfully!"]