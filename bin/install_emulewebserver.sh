#!/bin/bash
PURPLE='\033[0;35m'
RED='\033[0;31m'
NC='\033[0m' # No Color

cd /opt/emulewebservice/bin
clear
echo -e "${PURPLE}Install Script for emule-webserver for Rachel-Plus."
echo -e "${NC}Run as root. Please accept defaults for dovecot certificates and other popups.${NC}"
echo -e "emulewebservice should be installed in /opt."
#echo -e "Configure logcheck email in config/logcheck/etc/logcheck/logcheck.log."
read -n1 -r -p "Press any key to continue..." key

echo -e "${PURPLE}Installing dovecot apache2${NC}"

apt-get update

apt-get install -y exim4
apt-get install -y dovecot-imapd
apt-get install -y apache2 
apt-get install -y logwatch
apt-get install -y php5 libapache2-mod-php5 php5-mcrypt

echo -e "${PURPLE}installing roundcube. Use sqlite for database when asked.  For help:https://help.ubuntu.com/community/Roundcube${NC}" 
read -n1 -r -p "Press any key to continue..." key
apt-get install -y roundcube roundcube-core 
#roundcube-mysql
apt-get install -y roundcube-plugins-extra roundcube-plugins

echo -e "${PURPLE}Installing exim4 mail server.${NC}"
read -n1 -r -p "Press any key to continue..." key
mkdir /var/spool/exim4/bsmtp
chown Debian-exim:Debian-exim /var/spool/exim4/bsmtp
./install_scripts/setdomain.sh
./install_scripts/configsudo.sh
cp  ../config/roundcube/main.inc.php /etc/roundcube/.
cp ../config/roundcube/apache.conf /etc/roundcube/.
cp ../config/roundcube/emule_logo_roundcube_invert.png /var/lib/roundcube/skins/larry/images/roundcube_logo.png
cp ../config/roundcube/plugins/password/config.inc.php /var/lib/roundcube/plugins/password/.
cp -r ../config/apache2/* /etc/apache2/.
cp -r /opt/emulewebservice/config/exim4-conf/remote/* /etc/exim4/.
cp -r ../config/logwatch/logwatch.conf /usr/share/logwatch/default.conf/.
cp  /opt/emulewebservice/config/dovecot/dovecot.conf /etc/dovecot/dovecot.conf
php5enmod mcrypt
echo "ServerName localhost" | sudo tee /etc/apache2/conf-available/fqdn.conf
sudo a2enconf fqdn
service apache2 reload
service apache2 restart
service dovecot restart
update-exim4.conf
service exim4 restart
curl -sL https://deb.nodesource.com/setup_6.x | sudo -E bash -
apt-get install nodejs
echo -e "${PURPLE}Adding to upstart startup${NC}"
cp ../config/emule.conf /etc/init/.
service emule restart
echo
echo -e "${PURPLE}Adding WEBMAIL link to /media/Rachel/rachel/index.php${NC}"
echo
sed -i '/if (show_local_content_link()) {/i echo "<li><a href=\\"http://$_SERVER[SERVER_ADDR]:8002/roundcube\\" target=\\"_self\\">WEBMAIL</a></li>";' /media/RACHEL/rachel/index.php
echo "Creating users - Create more users by editing create_users.sh"
./install_scripts/createusers.sh
echo "Installation Complete"
