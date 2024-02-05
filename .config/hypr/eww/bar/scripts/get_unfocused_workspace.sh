#!/bin/bash

socat -u UNIX-CONNECT:/tmp/hypr/"$HYPRLAND_INSTANCE_SIGNATURE"/.socket2.sock - | while read -r line; do
    sleep 0.5
    echo $(hyprctl monitors | grep active | awk '{print $3}')
done
