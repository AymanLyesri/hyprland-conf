#!/bin/bash
random=$(find /home/ayman/.config/hypr/wallpapers/normal -type f | shuf -n 1) # get random wallpaper
hyprDir=/home/ayman/.config/hypr
config=$hyprDir/hyprpaper/config/defaults.conf

#############################################

workspace_id=$(hyprctl monitors | grep active | awk '{print $3}')

sed -i "s|w-${workspace_id}=.*|w-${workspace_id}=${random}|" $config

source $hyprDir/hyprpaper/w.sh "$random"         # set wallpaper


