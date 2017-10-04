#! /bin/bash -e

# This is intended to run on REMOTEHOST
ROOT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
echo $ROOT_DIR
cd $ROOT_DIR
cd ../node/server-nodejs/uploads
mkdir bsmtp || true
#tar vzxf FROM*.tar.gz
mv *.gz ./bsmtp/.
cd bsmtp
ls *.gz |xargs -n1 tar -xzf 
mv *.gz ../finished
#rm -f bsmtp*.tar.gz
for i in *; do
  /usr/sbin/exim4 -bS < $i
  echo "Sent message $i"
  rm -f "$i"
done
exit 0
