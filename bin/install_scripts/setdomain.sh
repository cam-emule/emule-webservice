#!/bin/bash
read  -p "Please enter chosen subdomain (e.g. camgb) " subdomain
#read  -p "Please enter domain (e.g. mule.global)" domain
domain="mule.global"
read -n1 -r -p "Press any key to continue..." key
echo $subdomain.$domain

echo "Setting roundcube host"
sed -i "s/^\(\$rcmail_config\['default_host'\] =\).*/\1'$subdomain.$domain';/g" "../config/roundcube/main.inc.php"

echo "Setting emuleserver subdomain"
cp ../node/server-nodejs/config.js.dist ../node/server-nodejs/config.js
sed -i "s/^\(config.servicename=\).*/\1'$subdomain';/" ../node/server-nodejs/config.js

echo "Setting exim4 mail server domain"
sed -i "s/^\(dc_other_hostnames=\).*/\1'$subdomain.$domain;$subdomain'/g" ../config/exim4-conf/remote/update-exim4.conf.conf 

#edit hosts aliases
echo "updating /etc/hosts."
sed -i "2i127.0.0.1  $subdomain.$domain $subdomain" /etc/hosts
exit 0

