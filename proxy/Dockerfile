FROM nginx

ARG PROXY_KIND

COPY ${PROXY_KIND}/default.conf.template /etc/nginx/templates/default.conf.template

EXPOSE 443