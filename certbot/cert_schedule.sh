crontab -l > cron.temp
echo "0 0 1 */3 * certbot certonly" >> cron.temp
crontab cron.temp
rm cron.temp