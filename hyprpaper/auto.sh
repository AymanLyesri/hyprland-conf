#!/bin/bash
hyprDir=$HOME/.config/hypr
config=$hyprDir/hyprpaper/config/defaults.conf

previous_workspace_id=0

# Set the directory of the random wallpaper script
change_wallpaper(){
    workspace_id=$(hyprctl monitors | grep active | awk '{print $3}')
    if [ "$workspace_id" != "$previous_workspace_id" ]; then
        echo $workspace_id
        wallpaper=$(grep "^w-$workspace_id=" $config | cut -d= -f2)
        echo "$wallpaper"
        
        source $hyprDir/hyprpaper/w.sh "$wallpaper"         # set wallpaper
    fi
    previous_workspace_id=$workspace_id
}

change_wallpaper

socat -u UNIX-CONNECT:/tmp/hypr/$HYPRLAND_INSTANCE_SIGNATURE/.socket2.sock - | while read -r line; do
    change_wallpaper
done



