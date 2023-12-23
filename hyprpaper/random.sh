#!/bin/bash
random=$(find /home/ayman/.config/hypr/wallpapers/normal -type f | shuf -n 1) # get random wallpaper
hyprDir=/home/ayman/.config/hypr
config=$hyprDir/hyprpaper/config/defaults.conf

####

killall "w.sh"

#############################################

workspace_id=$(hyprctl monitors | grep active | awk '{print $3}') # get workspace id
old_wallpaper=$(grep "^w-$workspace_id=" $config | cut -d= -f2)   # get wallpaper from config

#############################################

sed -i "s|w-${workspace_id}=.*|w-${workspace_id}=${random}|" $config # set wallpaper in config

#############################################

hyprctl hyprpaper unload "$old_wallpaper" # preload wallpaper
hyprctl hyprpaper preload "$random"       # preload wallpaper
$hyprDir/hyprpaper/w.sh "$random" &       # set wallpaper
