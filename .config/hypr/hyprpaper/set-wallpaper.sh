#!/bin/bash
hyprDir=$HOME/.config/hypr                                 # hypr directory
current_config=$hyprDir/hyprpaper/config/defaults.conf           # config file
previous_config=$hyprDir/hyprpaper/config/previous.conf          # previous config file
current_workspace=$(hyprctl monitors | grep active | awk '{print $3}') # get current workspace

new_wallpaper=""

#############################################

if [ -z "$1" ]; then
    echo "Usage: set-wallpaper.sh <workspace_id>"
    workspace_id=$current_workspace
else
    echo "Setting random wallpaper for workspace $1"
    workspace_id=$1
fi

# check for $2
if [ -z "$2" ]; then
    echo "Setting random wallpaper for workspace $workspace_id"
    new_wallpaper=$(find $HOME/.config/wallpapers/normal -type f | shuf -n 1 | sed "s|$HOME|\\\$HOME|") # get random wallpaper
else
    echo "Setting wallpaper $2 for workspace $workspace_id"
    new_wallpaper=$(echo $2 | sed "s|$HOME|\\\$HOME|") # get wallpaper
fi


#############################################

old_wallpaper=$(grep "^w-${workspace_id}=" "$current_config" | cut -d'=' -f2 | head -n 1)

#check if wallpaper is the same
if [ "$old_wallpaper" = "$new_wallpaper" ]; then
    echo "Wallpaper is already set to $new_wallpaper"
    exit 0
fi

hyprctl hyprpaper preload "$new_wallpaper" # preload wallpaper

hyprctl hyprpaper unload "$old_wallpaper" # unload old wallpaper

#############################################

if [ "$workspace_id" = "$current_workspace" ]; then
    $hyprDir/hyprpaper/w.sh "$new_wallpaper" & # set wallpaper
fi

#############################################

sed -i "s|w-${workspace_id}=.*|w-${workspace_id}=${old_wallpaper}|" $previous_config # set wallpaper in previous config

sed -i "s|w-${workspace_id}=.*|w-${workspace_id}=${new_wallpaper}|" $current_config # set wallpaper in config
