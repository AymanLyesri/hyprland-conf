#!/bin/bash

get_special() {
    echo $(hyprctl workspaces | grep "ID " | awk '$3 < 0 {print $3}')
}

get_special
socat -u UNIX-CONNECT:/tmp/hypr/"$HYPRLAND_INSTANCE_SIGNATURE"/.socket2.sock - | while read -r event; do
    get_special
done
