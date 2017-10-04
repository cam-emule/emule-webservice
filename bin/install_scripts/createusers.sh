#!/bin/bash
#Create mail users
for i in {1..20}
do
 #userdel user$i
 useradd -m -p papAq5PwY/QQM -G mail -s /bin/false user$i
done

