#!/bin/bash
sudo bash -c 'echo "www-data ALL=NOPASSWD: /usr/sbin/chpasswd" | (EDITOR="tee -a" visudo)'
sudo bash -c 'echo "Defaults:www-data !requiretty" | (EDITOR="tee -a" visudo)'


