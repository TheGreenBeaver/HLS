FROM certbot/certbot as dummy-cert-provider

ARG SRV_NAME

WORKDIR /etc/letsencrypt/live/${SRV_NAME}

RUN openssl req -x509 -nodes -newkey rsa:4096 \
    -days 1 \
    -keyout /etc/letsencrypt/live/${SRV_NAME}/privkey.pem \
    -out /etc/letsencrypt/live/${SRV_NAME}/fullchain.pem \
    -subj /CN=localhost

WORKDIR /etc/letsencrypt/live/www.${SRV_NAME}

RUN openssl req -x509 -nodes -newkey rsa:4096 \
    -days 1 \
    -keyout /etc/letsencrypt/live/www.${SRV_NAME}/privkey.pem \
    -out /etc/letsencrypt/live/www.${SRV_NAME}/fullchain.pem \
    -subj /CN=localhost

FROM nginx

ARG SRV_NAME

WORKDIR /etc/letsencrypt/live/${SRV_NAME}

COPY --from=dummy-cert-provider /etc/letsencrypt/live/${SRV_NAME}/ /etc/letsencrypt/live/${SRV_NAME}

WORKDIR /etc/letsencrypt/live/www.${SRV_NAME}

COPY --from=dummy-cert-provider /etc/letsencrypt/live/www.${SRV_NAME}/ /etc/letsencrypt/live/www.${SRV_NAME}

COPY nginx/default.conf.template /etc/nginx/templates/default.conf.template