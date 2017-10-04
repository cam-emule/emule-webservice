echo "Send as a test" | mail -s "Test from rachel" fergus@fleetingmeeting.com
echo "Testing server up"
curl http://127.0.0.1:3000
curl http://192.168.1.108:3000/get-bundle-list 
