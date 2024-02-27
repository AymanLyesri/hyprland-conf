#!/bin/bash

get_focused() {
    echo $(hyprctl monitors | grep active | awk '{print $3}')
}

get_focused
socat -u UNIX-CONNECT:/tmp/hypr/$HYPRLAND_INSTANCE_SIGNATURE/.socket2.sock - | while read -r line; do
    get_focused
done
