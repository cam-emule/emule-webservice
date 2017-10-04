#! /bin/bash -e

# fergus@fleetingmeeting.com for the cs.cam.ac.uk emule project

DOMAIN=$1
SUBDOMAIN=${1%%.*}
BSMTP_FN="TO_"$SUBDOMAIN"_$(date +%s).tar.gz"
SPOOL_DIR="/var/spool/mail/"
OUT_DIR="/opt/emulewebservice/http/out"
PUBLICIP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)

cd $SPOOL_DIR
rm -rf $OUT_DIR/TO_$SUBDOMAIN*
tar zcf $OUT_DIR/$BSMTP_FN $DOMAIN
FILESIZE=$(wc -c < $OUT_DIR/$BSMTP_FN)
#REMOVE MAIL SPOOL FILE:- Temporary, need to keep for ACK
rm -f $DOMAIN
echo "[{ \"vapname\":\"$DOMAIN\","
echo  "\"url\":\"http://$PUBLICIP:8080/$BSMTP_FN\","
echo  "\"size\":\"$FILESIZE\""
echo "}]"



exit 0
