#!/bin/bash
sudo nmcli device wifi hotspot con-name emule-hotspot ssid emule band bg password emule
sudo nmcli connection modify emule-hotspot ipv4.addresses 192.168.88.1
sudo service network-manager restart
sudo nmcli connection up my-hotspot
