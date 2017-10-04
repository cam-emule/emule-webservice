#! /bin/bash -e

# fergus@fleetingmeeting.com for the cl.cam.ac.uk emule project


# ROOT_DIR="/opt/emulewebservice"
ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
source $ROOT_DIR/config.sh
SERVICENAME=$1
BSMTP_FN="FROM_${SERVICENAME}_$(date +%s).tar.gz"
BSMTP_TGZ="/var/spool/exim4/$BSMTP_FN"
WEB_ROOT="/var/www"
WEB_FOLDER=""
WEB_PORT="8002"
OUT_DIR="$WEB_ROOT/$WEB_FOLDER"
#PUBLICIP=$(curl -s http://169.254.169.254/latest/meta-data/public-ipv4)
PUBLICIP=$(hostname -I| cut -f1 -d' ')
SPOOLDIR="/var/spool/exim4/bsmtp"


if [ $(ls $SPOOLDIR | wc -l) -eq 0 ]; then exit 0; fi
cd $SPOOLDIR
tar zcf $BSMTP_TGZ *
rm  $OUT_DIR/*.tar.gz || true
mv $BSMTP_TGZ $OUT_DIR/.
#We are deleting sent messages here - These messages are sent without guarantee
rm -f $SPOOLDIR/*

echo "[{ \"vapname\":\"${SERVICENAME}\","
echo  "\"url\":\"http://$PUBLICIP:$WEB_PORT/$WEB_FOLDER$BSMTP_FN\""
echo "}]"


exit 0
