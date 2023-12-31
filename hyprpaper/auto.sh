#!/bin/bash
hyprDir=$HOME/.config/hypr
config=$hyprDir/hyprpaper/config/defaults.conf

previous_workspace_id=0

change_wallpaper() {
    workspace_id=$(hyprctl monitors | grep active | awk '{print $3}') # get workspace id
    if [ "$workspace_id" != "$previous_workspace_id" ]; then          # if workspace id changed

        killall "w.sh"

        wallpaper=$(grep "^w-$workspace_id=" $config | cut -d= -f2) # get wallpaper from config

        if [ "$wallpaper" ]; then                  # kill previous wallpaper script
            $hyprDir/hyprpaper/w.sh "$wallpaper" & # set wallpaper
            previous_workspace_id=$workspace_id    # update previous workspace id
        fi
    fi
}

change_wallpaper

socat -u UNIX-CONNECT:/tmp/hypr/$HYPRLAND_INSTANCE_SIGNATURE/.socket2.sock - | while read -r line; do
    change_wallpaper
done
