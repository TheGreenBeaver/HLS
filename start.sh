#!/bin/bash

mkdir -p "proxy/certbot/data"
mkdir -p "proxy/dhparam"
mkdir -p "proxy/certbot/conf"
mkdir -p "proxy/certbot/logs"

openssl dhparam -out proxy/dhparam/dhapram-2048.pem 2048

cat proxy/nginx/drafts/http.template > proxy/nginx/templates/default.conf.template

docker-compose up -d

cat proxy/nginx/drafts/https.template > proxy/nginx/templates/default.conf.template

docker-compose restart