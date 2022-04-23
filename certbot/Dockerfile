FROM certbot/certbot:v1.7.0

COPY . .

RUN certbot certonly --webroot --webroot-path /var/www/certbot/ -d ${HOST}

RUN cert_schedule