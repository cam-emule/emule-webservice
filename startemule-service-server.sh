forever start /usr/bin/http-server /opt/emulewebservice/http/out -d false 
cd ./node/server-nodejs
forever start index.js
cd /opt/emule-admin/
forever start keystone.js
