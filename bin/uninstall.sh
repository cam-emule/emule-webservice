#!
service apache2 stop
service exim4 stop
service dovecot stop
apt-get remove -y --purge exim4-base exim4-config roundcube-core roundcube roundcube-mysql dovecot-imapd exim4
apt-get remove -y --purge nodejs npm
sudo apt-get purge -y apache2 apache2-utils apache2.2-bin apache2-common
sudo apt-get autoremove -y
