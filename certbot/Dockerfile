FROM certbot/certbot:v1.7.0

COPY . .

RUN mkdir -p /var/www/certbot/

RUN certbot certonly --webroot --webroot-path /var/www/certbot/ -d greenbeaver-insight.duckdns.org

RUN cert_schedule