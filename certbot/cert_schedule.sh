crontab -l > cron.temp
echo "0 0 1 */3 * certonly --webroot --webroot-path /var/www/certbot/ -d greenbeaver-insight.duckdns.org" >> cron.temp
crontab cron.temp
rm cron.temp