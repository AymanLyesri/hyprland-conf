#!/bin/bash

#loop to notify user to fix posture using notify-send
while true; do
    #urgency level: high
    notify-send -u critical " Fix your posture" "Sit up straight and look at the screen at eye level "
    sleep 60
done
