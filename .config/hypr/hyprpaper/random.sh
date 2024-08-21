#!/bin/bash
random=$(find /home/ayman/wallpapers/normal -type f | shuf -n 1) # get random wallpaper
hyprDir=/home/ayman/.config/hypr                                 # hypr directory
config=$hyprDir/hyprpaper/config/defaults.conf                   # config file

current_workspace=$(hyprctl monitors | grep active | awk '{print $3}') # get current workspace

#############################################

killall "w.sh" # kill w.sh

#############################################

if [ -z "$1" ]; then
    echo "Usage: random.sh <workspace_id>"
    workspace_id=$current_workspace
else
    echo "Setting random wallpaper for workspace $1"
    workspace_id=$1
fi

#############################################

if [ "$workspace_id" = "$current_workspace" ]; then
    $hyprDir/hyprpaper/w.sh "$random" & # set wallpaper
fi

#############################################

old_wallpaper=$(grep "w-${workspace_id}" $config | cut -d'=' -f2)

hyprctl hyprpaper preload "$random" # preload wallpaper

hyprctl hyprpaper unload "$old_wallpaper" # unload old wallpaper

#############################################

sed -i "s|w-${workspace_id}=.*|w-${workspace_id}=${random}|" $config # set wallpaper in config
